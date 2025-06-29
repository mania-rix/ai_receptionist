/**
 * Secure storage utilities for encrypting and decrypting sensitive data
 */
import CryptoJS from 'crypto-js';

// Constants
const ENCRYPTION_KEY_PREFIX = 'blvckwall_encryption_key_';
const STORAGE_PREFIX = 'blvckwall_secure_';

/**
 * Generate or retrieve encryption key for a user
 */
function getEncryptionKey(userId: string): string {
  const keyName = `${ENCRYPTION_KEY_PREFIX}${userId}`;
  let key = localStorage.getItem(keyName);
  
  if (!key) {
    // Generate a random key if none exists
    key = CryptoJS.lib.WordArray.random(16).toString();
    localStorage.setItem(keyName, key);
  }
  
  return key;
}

/**
 * Encrypt data
 */
export function encryptData(data: any, userId: string): string {
  try {
    const key = getEncryptionKey(userId);
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encrypted;
  } catch (error) {
    console.error('[SecureStorage] Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data
 */
export function decryptData(encryptedData: string, userId: string): any {
  try {
    const key = getEncryptionKey(userId);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('[SecureStorage] Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Securely store data
 */
export function secureSet(key: string, data: any, userId: string): void {
  try {
    const storageKey = `${STORAGE_PREFIX}${userId}_${key}`;
    const encrypted = encryptData(data, userId);
    localStorage.setItem(storageKey, encrypted);
  } catch (error) {
    console.error(`[SecureStorage] Error storing data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Retrieve securely stored data
 */
export function secureGet(key: string, userId: string): any {
  try {
    const storageKey = `${STORAGE_PREFIX}${userId}_${key}`;
    const encrypted = localStorage.getItem(storageKey);
    
    if (!encrypted) {
      return null;
    }
    
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error(`[SecureStorage] Error retrieving data for key ${key}:`, error);
    return null;
  }
}

/**
 * Remove securely stored data
 */
export function secureRemove(key: string, userId: string): void {
  try {
    const storageKey = `${STORAGE_PREFIX}${userId}_${key}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`[SecureStorage] Error removing data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Clear all securely stored data for a user
 */
export function secureClear(userId: string): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${STORAGE_PREFIX}${userId}_`)) {
        localStorage.removeItem(key);
      }
    });
    
    // Also remove encryption key
    localStorage.removeItem(`${ENCRYPTION_KEY_PREFIX}${userId}`);
  } catch (error) {
    console.error('[SecureStorage] Error clearing secure storage:', error);
    throw error;
  }
}