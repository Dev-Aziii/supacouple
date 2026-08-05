/**
 * Utility functions for Relationship and Couple Pairing domain
 */

/**
 * Generate a secure, un-ambiguous invite code.
 * Length: 8 characters by default (8-10 characters allowed).
 * Excludes ambiguous characters: 0, O, 1, I, L.
 */
export function generateInviteCode(length = 8): string {
  const allowedChars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    result += allowedChars[bytes[i] % allowedChars.length];
  }
  return result;
}

/**
 * Calculate the number of days a couple has been together.
 */
export function calculateRelationshipDays(anniversaryDate?: string | null): number {
  if (!anniversaryDate) return 0;
  const start = new Date(anniversaryDate);
  if (isNaN(start.getTime())) return 0;

  const today = new Date();
  // Normalize dates to midnight UTC for accurate day calculations
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = todayUtc - startUtc;
  if (diffTime < 0) return 0;
  
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format anniversary date string nicely for UI display.
 */
export function formatAnniversary(anniversaryDate?: string | null): string {
  if (!anniversaryDate) return 'Not set';
  const date = new Date(anniversaryDate);
  if (isNaN(date.getTime())) return 'Not set';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Helper to verify whether target user is the partner of current user.
 */
export function isPartner(targetUserId: string, currentPartnerId?: string | null): boolean {
  if (!currentPartnerId || !targetUserId) return false;
  return currentPartnerId === targetUserId;
}
