/**
 * ClausePulse Preload Bridge (v2.0)
 *
 * 1. Initializes the official `@smartspectra/node-sdk/preload` MessagePort bridge
 *    (`window.__smartspectraBridge`) so `@smartspectra/node-sdk/renderer` works natively.
 * 2. Exposes a strictly typed `window.clausePulseHost` API via `contextBridge` for
 *    API key vault operations, device readiness checks, local file & Git diff ingestion,
 *    webcam take recording persistence, native video file processing, and Read Receipt export.
 */

// 1. Load official SmartSpectra preload bridge
require('@smartspectra/node-sdk/preload');

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('clausePulseHost', {
  getConfig: () => ipcRenderer.invoke('clausepulse:get-config'),
  getSessionApiKey: () => ipcRenderer.invoke('clausepulse:get-session-api-key'),
  saveApiKey: (key: string) => ipcRenderer.invoke('clausepulse:save-api-key', key),
  forgetApiKey: () => ipcRenderer.invoke('clausepulse:forget-api-key'),
  setTelemetryPreference: (enabled: boolean) =>
    ipcRenderer.invoke('clausepulse:set-telemetry', enabled),
  checkDeviceReadiness: () => ipcRenderer.invoke('clausepulse:check-device-readiness'),
  openLocalFile: (explicitFilePath?: string) =>
    ipcRenderer.invoke('clausepulse:open-local-file', explicitFilePath),
  scanGitDiff: (chooseDirectory?: boolean) =>
    ipcRenderer.invoke('clausepulse:scan-git-diff', chooseDirectory),
  saveRecordedVideo: (bytes: Uint8Array, clauseId: string) =>
    ipcRenderer.invoke('clausepulse:save-recorded-video', { bytes, clauseId }),
  runVideoFileSession: (videoPath?: string) =>
    ipcRenderer.invoke('clausepulse:run-video-file', videoPath),
  stopVideoFileSession: () => ipcRenderer.invoke('clausepulse:stop-video-file'),
  onVideoFileEvent: (callback: (payload: unknown) => void) => {
    const handler = (_event: unknown, payload: unknown) => callback(payload);
    ipcRenderer.on('clausepulse:video-file-event', handler);
    return () => ipcRenderer.removeListener('clausepulse:video-file-event', handler);
  },
  saveReceipt: (receipt: unknown) => ipcRenderer.invoke('clausepulse:save-receipt', receipt),
  getReceipts: () => ipcRenderer.invoke('clausepulse:get-receipts'),
  exportReceiptFile: (markdown: string, jsonStr: string, defaultName: string) =>
    ipcRenderer.invoke('clausepulse:export-receipt-file', { markdown, jsonStr, defaultName }),
  wipeAllLocalData: () => ipcRenderer.invoke('clausepulse:wipe-local-data'),
});
