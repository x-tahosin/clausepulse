/**
 * ClausePulse Electron Main Process (v2.0)
 *
 * - Ensures ASCII-safe native runtime resolution on Windows for `smartspectra_capi.dll`.
 * - Binds the official SmartSpectra IPC channel (`bindSmartSpectraIpc`).
 * - Enforces strict video-only camera permissions scoped to the local `file://` origin.
 * - Provides main-process Device Readiness checks (`checkDeviceReadiness()`), camera
 *   discovery (`availableCameras()`), native video-file analysis (`useFile()`),
 *   real Local File ingestion (`open-local-file`), real Local Git Repository Diff
 *   auditing (`scan-git-diff`), recorded webcam take persistence (`save-recorded-video`),
 *   and OS-encrypted API key management (`safeStorage`).
 */

import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
import {
  appendSavedReceipt,
  deleteStoredApiKey,
  loadSavedReceipts,
  maskApiKey,
  readStoredApiKey,
  saveStoredApiKey,
  wipeAllLocalSessionData,
} from './keystore';
import { attachE2eVerificationRunner } from './e2eRunner';

const execFileAsync = promisify(execFile);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ASCII_ONLY = /^[\x00-\x7F]*$/;

/**
 * Ensures `smartspectra_capi.dll` loads from an ASCII-only file path on Windows
 * (handles user profile directories containing non-ASCII characters).
 */
function ensureAsciiSmartSpectraRuntime(): void {
  if (process.platform !== 'win32' || process.env.SMARTSPECTRA_CAPI_PATH) return;
  try {
    const pkgJsonPath = require.resolve('@smartspectra/node-sdk-win32-x64/package.json');
    const srcDir = path.dirname(pkgJsonPath);
    if (ASCII_ONLY.test(srcDir)) return;

    const fallbackDir = path.join(os.tmpdir(), 'clausepulse-smartspectra-runtime');
    if (ASCII_ONLY.test(fallbackDir)) {
      const dllTarget = path.join(fallbackDir, 'smartspectra_capi.dll');
      if (!fs.existsSync(dllTarget)) {
        fs.cpSync(srcDir, fallbackDir, { recursive: true });
      }
      process.env.SMARTSPECTRA_CAPI_PATH = dllTarget;
    }
  } catch {
    // Standard resolver will handle package resolution
  }
}

ensureAsciiSmartSpectraRuntime();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { bindSmartSpectraIpc } = require('@smartspectra/node-sdk/main');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  SmartSpectraSDK,
  breathingMetrics,
  cardioMetrics,
  faceMetrics,
  decodeMetrics,
} = require('@smartspectra/node-sdk');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { decodeMetrics: decodeProtoMetrics } = require('@smartspectra/node-sdk/messages');

let mainWindow: BrowserWindow | null = null;
let telemetryEnabled = process.env.SMARTSPECTRA_ENABLE_TELEMETRY === '1';
let activeFileSdk: any = null;

function getUserDataPath(): string {
  return path.join(app.getPath('userData'), 'clausepulse-storage');
}

function getActiveApiKey(): { apiKey: string; source: 'ENV' | 'SAFE_STORAGE' | 'NONE' } {
  return readStoredApiKey(getUserDataPath(), process.env.SMARTSPECTRA_API_KEY);
}

function createMainWindow(): void {
  const isHeadlessSmoke = process.argv.includes('--smoke-test');
  const isE2eVerify = process.argv.includes('--e2e-verify');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1120,
    minHeight: 740,
    show: !isHeadlessSmoke && !isE2eVerify,
    paintWhenInitiallyHidden: true,
    backgroundColor: '#090b0e',
    title: 'ClausePulse v2.0 — Physiological Reading, Git-Diff & Contract Auditor (Presage SmartSpectra SDK)',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  bindSmartSpectraIpc(mainWindow);

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());

  const htmlPath = path.join(__dirname, '..', 'index.html');
  mainWindow.loadFile(htmlPath);

  if (process.env.SMARTSPECTRA_DIAGNOSTICS === '1') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  if (isHeadlessSmoke) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        console.log('[ClausePulse Smoke Test] Window loaded and IPC bound cleanly.');
        app.quit();
      }, 1500);
    });
  } else if (isE2eVerify) {
    attachE2eVerificationRunner(mainWindow);
  }
}

app.whenReady().then(() => {
  // Scope media permission strictly to video-only (no microphone) and local file:// origin
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback, details) => {
    const reqUrl = details?.requestingUrl || wc?.getURL() || '';
    const mediaTypes = (details as any)?.mediaTypes || [];
    const isVideoOnly = mediaTypes.length === 0 || (mediaTypes.length === 1 && mediaTypes[0] === 'video');
    callback(permission === 'media' && isVideoOnly && reqUrl.startsWith('file://'));
  });

  ipcMain.handle('clausepulse:get-config', () => {
    const { apiKey, source } = getActiveApiKey();
    let cameras: Array<{ id: string; name: string | null; facing: string }> = [];
    try {
      cameras = SmartSpectraSDK.availableCameras() || [];
    } catch {
      cameras = [];
    }

    return {
      hasApiKey: Boolean(apiKey),
      maskedKey: maskApiKey(apiKey),
      keySource: source,
      sdkVersion: SmartSpectraSDK.version || '3.5.0',
      telemetryEnabled,
      availableCameras: cameras,
      platform: `${process.platform}-${process.arch}`,
    };
  });

  ipcMain.handle('clausepulse:get-session-api-key', (event) => {
    const senderUrl = event.sender.getURL() || '';
    if (!senderUrl.startsWith('file://')) {
      throw new Error('Unauthorized origin requesting session API key.');
    }
    const { apiKey } = getActiveApiKey();
    return apiKey;
  });

  ipcMain.handle('clausepulse:save-api-key', (_event, rawKey: string) => {
    saveStoredApiKey(getUserDataPath(), rawKey);
    const { apiKey, source } = getActiveApiKey();
    return {
      ok: true,
      hasApiKey: Boolean(apiKey),
      maskedKey: maskApiKey(apiKey),
      keySource: source,
    };
  });

  ipcMain.handle('clausepulse:forget-api-key', () => {
    deleteStoredApiKey(getUserDataPath());
    const { apiKey, source } = getActiveApiKey();
    return {
      ok: true,
      hasApiKey: Boolean(apiKey),
      maskedKey: maskApiKey(apiKey),
      keySource: source,
    };
  });

  ipcMain.handle('clausepulse:set-telemetry', (_event, enabled: boolean) => {
    telemetryEnabled = Boolean(enabled);
    return { telemetryEnabled };
  });

  ipcMain.handle('clausepulse:check-device-readiness', async () => {
    const { apiKey } = getActiveApiKey();
    if (!apiKey) {
      return {
        verdict: 'local_optical_ready',
        reason:
          'No Presage cloud API key configured yet. Live Webcam Optical Mode & Deterministic Benchmark are ready immediately; add a Presage API key in the Vault to enable C++ SmartSpectra SDK licensing.',
      };
    }

    let tempSdk: any = null;
    try {
      tempSdk = new SmartSpectraSDK({
        apiKey,
        requestedMetrics: [...breathingMetrics, ...faceMetrics],
        enableTelemetry: telemetryEnabled,
      });
      const result = await tempSdk.checkDeviceReadiness();
      return {
        verdict: result?.verdict || 'ready',
        reason: result?.reason || 'Device readiness check completed via SmartSpectraSDK.',
      };
    } catch (err: any) {
      return {
        verdict: 'limited',
        reason: err?.message || 'Device readiness check encountered an error.',
      };
    } finally {
      if (tempSdk) {
        try {
          await tempSdk.destroy();
        } catch {
          // ignore
        }
      }
    }
  });

  /**
   * Opens any real local file from disk (.md, .txt, .sql, .ts, .json, .yaml, .diff, .py)
   * for clause/hunk physiological auditing.
   */
  ipcMain.handle('clausepulse:open-local-file', async (_event, explicitFilePath?: string) => {
    let targetPath = explicitFilePath;
    if (!targetPath && mainWindow) {
      const picked = await dialog.showOpenDialog(mainWindow, {
        title: 'Open Local Contract, Migration SQL, Runbook, or Code File for ClausePulse Audit',
        filters: [
          {
            name: 'Auditable Documents & Code',
            extensions: ['md', 'txt', 'sql', 'json', 'yaml', 'yml', 'ts', 'js', 'py', 'diff', 'patch', 'html'],
          },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });
      if (picked.canceled || picked.filePaths.length === 0) {
        return { ok: false, canceled: true };
      }
      targetPath = picked.filePaths[0];
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      return { ok: false, error: 'Selected file does not exist on disk.' };
    }

    try {
      const stats = fs.statSync(targetPath);
      if (stats.size > 2 * 1024 * 1024) {
        return { ok: false, error: 'File exceeds 2 MB safety limit for interactive clause auditing.' };
      }
      const content = fs.readFileSync(targetPath, 'utf8');
      return {
        ok: true,
        filePath: targetPath,
        fileName: path.basename(targetPath),
        content,
      };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to read file.' };
    }
  });

  /**
   * Audits a real local Git repository's working tree diff (or latest commit patch if clean).
   */
  ipcMain.handle('clausepulse:scan-git-diff', async (_event, chooseDirectory?: boolean) => {
    let repoDir = path.resolve(__dirname, '..', '..', '..');
    if (chooseDirectory && mainWindow) {
      const picked = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Local Git Repository Folder to Audit Diff Hunks',
        properties: ['openDirectory'],
      });
      if (picked.canceled || picked.filePaths.length === 0) {
        return { ok: false, canceled: true };
      }
      repoDir = picked.filePaths[0];
    }

    try {
      const { stdout: topLevelOut } = await execFileAsync(
        'git',
        ['rev-parse', '--show-toplevel'],
        { cwd: repoDir, timeout: 6000 }
      );
      const gitRoot = topLevelOut.trim() || repoDir;
      const repoName = path.basename(gitRoot);

      let branchName = 'HEAD';
      try {
        const { stdout: branchOut } = await execFileAsync(
          'git',
          ['rev-parse', '--abbrev-ref', 'HEAD'],
          { cwd: gitRoot, timeout: 4000 }
        );
        branchName = branchOut.trim() || 'HEAD';
      } catch {
        // keep HEAD
      }

      let rawDiff = '';
      try {
        const { stdout: diffOut } = await execFileAsync(
          'git',
          ['diff', 'HEAD', '--unified=3'],
          { cwd: gitRoot, timeout: 8000, maxBuffer: 2 * 1024 * 1024 }
        );
        rawDiff = diffOut.trim();
      } catch {
        // fallback if HEAD doesn't exist or unstaged diff
      }

      if (!rawDiff) {
        const { stdout: lastCommitDiff } = await execFileAsync(
          'git',
          ['log', '-n', '1', '-p', '--unified=3'],
          { cwd: gitRoot, timeout: 8000, maxBuffer: 2 * 1024 * 1024 }
        );
        rawDiff = lastCommitDiff.trim();
      }

      return {
        ok: true,
        repoName,
        repoPath: gitRoot,
        branchName,
        rawDiff,
      };
    } catch (err: any) {
      return {
        ok: false,
        error:
          err?.message ||
          'Selected directory is not a Git repository or git CLI is not in PATH.',
      };
    }
  });

  /**
   * Saves a recorded webcam video take (.webm) to local storage so the user can replay it
   * or pass it directly to `SmartSpectraSDK.useFile(savedFilePath)`.
   */
  ipcMain.handle(
    'clausepulse:save-recorded-video',
    async (_event, payload: { bytes: Uint8Array; clauseId: string }) => {
      try {
        const recDir = path.join(getUserDataPath(), 'recorded-takes');
        fs.mkdirSync(recDir, { recursive: true });
        const fileName = `take-${payload.clauseId || 'session'}-${Date.now()}.webm`;
        const filePath = path.join(recDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(payload.bytes));
        return { ok: true, filePath, fileName };
      } catch (err: any) {
        return { ok: false, error: err?.message || 'Failed to save recorded video take.' };
      }
    }
  );

  ipcMain.handle('clausepulse:run-video-file', async (_event, providedPath?: string) => {
    const { apiKey } = getActiveApiKey();
    let videoPath = providedPath;
    if (!videoPath && mainWindow) {
      const picked = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Face/Upper-Chest Video File (.mp4, .webm, .mov) for Analysis',
        filters: [{ name: 'Video Files', extensions: ['mp4', 'mov', 'webm', 'mkv', 'avi'] }],
        properties: ['openFile'],
      });
      if (picked.canceled || picked.filePaths.length === 0) {
        return { ok: false, canceled: true };
      }
      videoPath = picked.filePaths[0];
    }

    if (!videoPath || !fs.existsSync(videoPath)) {
      return { ok: false, error: 'Selected video file does not exist.' };
    }

    // If no Presage API key is set yet, return the selected file path so the renderer can
    // play the video directly in `<video id="cameraPreview">` and analyze it with LiveWebcamOpticalProcessor!
    if (!apiKey) {
      return {
        ok: true,
        localOpticalPlayback: true,
        fullPath: videoPath,
        videoPath: path.basename(videoPath),
      };
    }

    if (activeFileSdk) {
      try {
        await activeFileSdk.stopAsync();
        await activeFileSdk.destroy();
      } catch {
        // ignore
      }
      activeFileSdk = null;
    }

    try {
      activeFileSdk = new SmartSpectraSDK({
        apiKey,
        requestedMetrics: [...breathingMetrics, ...faceMetrics],
        enableTelemetry: telemetryEnabled,
      });

      activeFileSdk.on('processingStatus', (status: number) => {
        mainWindow?.webContents.send('clausepulse:video-file-event', {
          kind: 'processingStatus',
          status,
        });
      });

      activeFileSdk.on('validationStatus', (code: number, timestampUs: number, hint: string) => {
        mainWindow?.webContents.send('clausepulse:video-file-event', {
          kind: 'validationStatus',
          code,
          timestampUs,
          hint,
        });
      });

      activeFileSdk.on('metrics', (buf: Buffer, timestampUs: number) => {
        try {
          const decoded = decodeProtoMetrics ? decodeProtoMetrics(buf) : decodeMetrics(buf);
          mainWindow?.webContents.send('clausepulse:video-file-event', {
            kind: 'metrics',
            decoded,
            timestampUs,
          });
        } catch {
          // ignore malformed packet
        }
      });

      activeFileSdk.on('error', (code: number, message: string, retryable: boolean) => {
        mainWindow?.webContents.send('clausepulse:video-file-event', {
          kind: 'error',
          code,
          message,
          retryable,
        });
      });

      activeFileSdk.useFile(videoPath, { interframeDelayMs: 33 });
      activeFileSdk.start();

      return {
        ok: true,
        localOpticalPlayback: false,
        fullPath: videoPath,
        videoPath: path.basename(videoPath),
      };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err) };
    }
  });

  ipcMain.handle('clausepulse:stop-video-file', async () => {
    if (activeFileSdk) {
      try {
        await activeFileSdk.stopAsync();
        await activeFileSdk.destroy();
      } catch {
        // ignore
      }
      activeFileSdk = null;
    }
    return { ok: true };
  });

  ipcMain.handle('clausepulse:save-receipt', (_event, receipt: any) => {
    const saved = appendSavedReceipt(getUserDataPath(), receipt);
    return { ok: true, count: saved.length, receipts: saved };
  });

  ipcMain.handle('clausepulse:get-receipts', () => {
    return loadSavedReceipts(getUserDataPath());
  });

  ipcMain.handle(
    'clausepulse:export-receipt-file',
    async (_event, payload: { markdown: string; jsonStr: string; defaultName: string }) => {
      if (!mainWindow) return { ok: false };
      const res = await dialog.showSaveDialog(mainWindow, {
        title: 'Export ClausePulse Physiological Read Receipt',
        defaultPath: payload.defaultName || 'ClausePulse-Read-Receipt.md',
        filters: [
          { name: 'Markdown Document (.md)', extensions: ['md'] },
          { name: 'JSON Audit Log (.json)', extensions: ['json'] },
        ],
      });
      if (res.canceled || !res.filePath) {
        return { ok: false, canceled: true };
      }
      const isJson = res.filePath.toLowerCase().endsWith('.json');
      fs.writeFileSync(res.filePath, isJson ? payload.jsonStr : payload.markdown, 'utf8');
      return { ok: true, filePath: res.filePath };
    }
  );

  ipcMain.handle('clausepulse:wipe-local-data', async () => {
    if (activeFileSdk) {
      try {
        await activeFileSdk.stopAsync();
        await activeFileSdk.destroy();
      } catch {
        // ignore
      }
      activeFileSdk = null;
    }
    const recDir = path.join(getUserDataPath(), 'recorded-takes');
    if (fs.existsSync(recDir)) {
      try {
        fs.rmSync(recDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
    const res = wipeAllLocalSessionData(getUserDataPath());
    return { ok: true, ...res };
  });

  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
