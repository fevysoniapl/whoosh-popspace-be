export function baseCookieOptions() {
  return {
    path: '/',
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    secure:
      process.env.NODE_ENV === 'production' ||
      process.env.COOKIE_SECURE === 'true',
  };
}