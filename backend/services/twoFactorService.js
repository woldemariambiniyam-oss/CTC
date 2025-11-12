const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorService {
  generateSecret(userEmail, issuer = 'Coffee Training Center') {
    const secret = speakeasy.generateSecret({
      name: `${issuer} (${userEmail})`,
      issuer: issuer,
      length: 32
    });

    return {
      secret: secret.base32,
      otpAuthUrl: secret.otpauth_url
    };
  }

  async generateQRCode(otpAuthUrl) {
    try {
      const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);
      return qrCodeUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) before/after
    });
  }

  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}

module.exports = new TwoFactorService();

