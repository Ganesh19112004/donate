export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiry = () => {
  return new Date(Date.now() + 2 * 60 * 1000).toISOString();
};