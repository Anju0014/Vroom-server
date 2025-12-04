// utils/cookieOptions.ts

export const getCookieOptions = (isRefresh: boolean) => ({
  httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
  maxAge: isRefresh
    ? Number(process.env.COOKIE_REFRESH_MAX_AGE)
    : Number(process.env.COOKIE_ACCESS_MAX_AGE),
});
