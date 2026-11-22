export const config = {
  debug:
    process.env.DEBUG !== undefined
      ? process.env.DEBUG === 'true'
      : process.env.NODE_ENV !== 'production',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};