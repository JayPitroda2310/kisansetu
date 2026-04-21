/**
 * ⚠️ WARNING: NEVER USE THIS FOR STORING PASSWORDS ⚠️
 * 
 * This encryption utility is ONLY for non-sensitive data like:
 * - Backup recovery codes
 * - Temporary tokens
 * - Non-critical user preferences
 * 
 * NEVER store user passwords with this or any encryption method.
 * Passwords should ONLY be hashed using one-way algorithms (bcrypt, argon2).
 * 
 * Supabase Auth already handles password hashing correctly.
 * DO NOT bypass Supabase Auth's password handling.
 */

// ⚠️ EXTREMELY INSECURE - For demonstration ONLY
// In production, use proper key management services (AWS KMS, HashiCorp Vault, etc.)
const ENCRYPTION_KEY = 'REPLACE_WITH_SECURE_RANDOM_32_BYTE_KEY_IN_ENV';

/**
 * ⚠️ DO NOT USE THIS FOR PASSWORDS ⚠️
 * 
 * Encrypts data using AES-GCM
 * This is for demonstration purposes only
 */
export async function encryptData(plaintext: string): Promise<string> {
  try {
    // Generate a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Convert key to proper format
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      new TextEncoder().encode(plaintext)
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * ⚠️ DO NOT USE THIS FOR PASSWORDS ⚠️
 * 
 * Decrypts data encrypted with encryptData
 * This is for demonstration purposes only
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Convert key to proper format
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encrypted
    );
    
    // Convert back to string
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * ⚠️ NEVER CALL THIS FUNCTION WITH PASSWORDS ⚠️
 * 
 * Example usage for NON-SENSITIVE data only:
 * 
 * // ✅ ACCEPTABLE USE (backup codes, not passwords):
 * const backupCode = 'ABC-123-XYZ';
 * const encrypted = await encryptData(backupCode);
 * // Store encrypted in database
 * 
 * // Later, retrieve:
 * const decrypted = await decryptData(encrypted);
 * 
 * // ❌ NEVER DO THIS (passwords):
 * const password = 'user_password';
 * const encrypted = await encryptData(password); // NEVER DO THIS
 */
