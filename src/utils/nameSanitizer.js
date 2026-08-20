// List of disallowed / offensive terms across languages (EN/FR/AR/DE)
const DISALLOWED_WORDS = [
  'admin', 'moderator', 'system', 'official', 'ronda_team', 'support',
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'nigger', 'nigga', 'cunt', 'pussy', 'whore',
  'merde', 'connard', 'salope', 'encule', 'pute',
  'zbi', 'zamel', 'qahba', 'zebi', 'nik', 'tabon', 'mok',
  'hurensohn', 'arschloch', 'fotze', 'schlampe', 'bastard'
];

/**
 * Strips zero-width and invisible control characters.
 */
export const sanitizeDisplayName = (rawName) => {
  if (typeof rawName !== 'string') return '';
  
  // Normalize unicode
  let cleaned = rawName.normalize('NFKC');

  // Strip zero-width spaces, invisible formatting chars, control chars
  // \u200B-\u200D (zero-width space/joiners), \uFEFF (zero-width non-breaking space), control chars 0x00-0x1F, 0x7F-0x9F
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u0000-\u001F\u007F-\u009F\u2028\u2029]/g, '');

  // Collapse multiple spaces into single space and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
};

/**
 * Validates a display name.
 * Returns { valid: boolean, error?: string, sanitized: string }
 */
export const validateDisplayName = (rawName) => {
  const sanitized = sanitizeDisplayName(rawName);

  if (sanitized.length < 3 || sanitized.length > 20) {
    return {
      valid: false,
      error: 'NAME_LENGTH_INVALID',
      sanitized
    };
  }

  // Must contain at least one alphanumeric or Arabic letter
  const hasValidLetter = /[\p{L}\p{N}]/u.test(sanitized);
  if (!hasValidLetter) {
    return {
      valid: false,
      error: 'NAME_INVALID_CHARACTERS',
      sanitized
    };
  }

  // Profanity check
  const lower = sanitized.toLowerCase();
  const hasProfanity = DISALLOWED_WORDS.some(badWord => {
    // Check exact word or substring
    return lower.includes(badWord);
  });

  if (hasProfanity) {
    return {
      valid: false,
      error: 'NAME_PROFANITY_DETECTED',
      sanitized
    };
  }

  return {
    valid: true,
    sanitized
  };
};
