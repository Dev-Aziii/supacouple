import { ExpirationOption } from '@/types/status';

export const calculateExpiresAt = (option: ExpirationOption, customIso?: string): string | null => {
  const now = new Date();
  switch (option) {
    case '30m':
      return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case '2h':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    case '4h':
      return new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
    case 'until_changed':
      return null;
    case 'custom':
      return customIso ? new Date(customIso).toISOString() : null;
    default:
      return null;
  }
};
