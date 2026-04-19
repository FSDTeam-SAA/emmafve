/**
 * Base layout for all HESTEKA emails to ensure consistent branding.
 * Clean, simple design similar to the partner workflow templates.
 */
const baseLayout = (content: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px; margin:0;">
  <div style="max-width:600px; margin:auto; background:#ffffff; padding:40px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
    ${content}
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 13px; text-align: center;">
      © ${new Date().getFullYear()} HESTEKA. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

/**
 * Simple OTP Template for Account Verification
 */
export const verificationOtpEmailTemplate = (name: string, otp: string): string => {
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Welcome to <strong>HESTEKA</strong>! Please use the One-Time Password (OTP) below to complete your account verification:</p>
    
    <div style="text-align:center; margin:30px 0;">
      <div style="display:inline-block; padding:16px 28px; background:#eff6ff; border:1px dashed #2563eb; border-radius:10px; font-size:32px; font-weight:bold; letter-spacing:8px; color:#2563eb; font-family: 'Courier New', Courier, monospace;">
        ${otp}
      </div>
      <p style="margin-top:15px; color:#dc2626; font-size:14px; font-weight:bold;">
        ⏳ This code is valid for 10 minutes only
      </p>
    </div>

    <p style="color:#6b7280; font-size:14px;">
      If you didn't request for account verification, you can safely ignore this email.
    </p>
    
    <p style="margin-top:30px; font-weight:bold; color:#1e293b;">
      HESTEKA Team
    </p>
  `;
  return baseLayout(content);
};

/**
 * Simple OTP Template for Password Reset
 */
export const forgotPasswordOtpEmailTemplate = (name: string, otp: string): string => {
  const content = `
    <h2 style="color:#2563eb; margin-top:0;">Reset Your Password</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset your password. Use the verification code below to proceed:</p>
    
    <div style="text-align:center; margin:30px 0;">
      <div style="display:inline-block; padding:16px 28px; background:#eff6ff; border:1px dashed #2563eb; border-radius:10px; font-size:32px; font-weight:bold; letter-spacing:8px; color:#2563eb; font-family: 'Courier New', Courier, monospace;">
        ${otp}
      </div>
      <p style="margin-top:15px; color:#dc2626; font-size:14px; font-weight:bold;">
        ⏳ This code is valid for 10 minutes only
      </p>
    </div>

    <p style="color:#6b7280; font-size:14px;">
      If you didn't request for forget password, you can safely ignore this email.
    </p>
    
    <p style="margin-top:30px; font-weight:bold; color:#1e293b;">
      HESTEKA Team
    </p>
  `;
  return baseLayout(content);
};
