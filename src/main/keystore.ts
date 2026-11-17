/**
 * Secure API Key & Local Session Store for ClausePulse
 *
 * Uses Electron's OS-backed `safeStorage` (DPAPI on Windows, Keychain on macOS, libsecret on Linux)
 * for persisting a user-supplied Presage API key, and provides one-click permanent deletion
 * of all local session history.
 */

import * as fs from 'fs';
import * as path from 'path';
import { safeStorage } from 'electron';
import { ReadReceiptPayload } from '../core/receiptExporter';

const KEY_FILENAME = 'smartspectra-key.enc';
const HISTORY_FILENAME = 'clausepulse-receipts.json';

export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return '';
  if (trimmed.length <= 8) return '••••••••';
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

export function readStoredApiKey(userDataDir: string, envKey?: string): {
  apiKey: string;
  source: 'ENV' | 'SAFE_STORAGE' | 'NONE';
} {
  if (envKey && envKey.trim().length > 5 && envKey.trim() !== 'YOUR_API_KEY_HERE') {
    return { apiKey: envKey.trim(), source: 'ENV' };
  }

  const keyFile = path.join(userDataDir, KEY_FILENAME);
  if (!fs.existsSync(keyFile)) {
    return { apiKey: '', source: 'NONE' };
  }

  try {
    const raw = fs.readFileSync(keyFile);
    if (safeStorage.isEncryptionAvailable()) {
      const decrypted = safeStorage.decryptString(raw);
      return { apiKey: decrypted.trim(), source: 'SAFE_STORAGE' };
    }
    return { apiKey: raw.toString('utf8').trim(), source: 'SAFE_STORAGE' };
  } catch {
    return { apiKey: '', source: 'NONE' };
  }
}

export function saveStoredApiKey(userDataDir: string, rawKey: string): void {
  const cleaned = rawKey.trim();
  if (!cleaned) {
    throw new Error('API key cannot be empty.');
  }
  fs.mkdirSync(userDataDir, { recursive: true });
  const keyFile = path.join(userDataDir, KEY_FILENAME);
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(cleaned);
    fs.writeFileSync(keyFile, encrypted, { mode: 0o600 });
  } else {
    fs.writeFileSync(keyFile, cleaned, { encoding: 'utf8', mode: 0o600 });
  }
}

export function deleteStoredApiKey(userDataDir: string): void {
  const keyFile = path.join(userDataDir, KEY_FILENAME);
  if (fs.existsSync(keyFile)) {
    fs.unlinkSync(keyFile);
  }
}

export function loadSavedReceipts(userDataDir: string): ReadReceiptPayload[] {
  const file = path.join(userDataDir, HISTORY_FILENAME);
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendSavedReceipt(
  userDataDir: string,
  receipt: ReadReceiptPayload
): ReadReceiptPayload[] {
  fs.mkdirSync(userDataDir, { recursive: true });
  const existing = loadSavedReceipts(userDataDir);
  const updated = [receipt, ...existing].slice(0, 25);
  const file = path.join(userDataDir, HISTORY_FILENAME);
  fs.writeFileSync(file, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

export function wipeAllLocalSessionData(userDataDir: string): {
  deletedKey: boolean;
  deletedReceipts: boolean;
} {
  let deletedKey = false;
  let deletedReceipts = false;

  const keyFile = path.join(userDataDir, KEY_FILENAME);
  if (fs.existsSync(keyFile)) {
    fs.unlinkSync(keyFile);
    deletedKey = true;
  }

  const histFile = path.join(userDataDir, HISTORY_FILENAME);
  if (fs.existsSync(histFile)) {
    fs.unlinkSync(histFile);
    deletedReceipts = true;
  }

  return { deletedKey, deletedReceipts };
}
