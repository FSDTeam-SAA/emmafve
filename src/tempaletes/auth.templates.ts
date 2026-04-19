export const forgotPasswordOtpTemplate = (
  name: string,
  otp: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #eef2ff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }

    .wrapper {
      padding: 40px 16px;
    }

    .card {
      max-width: 520px;
      margin: auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(79, 70, 229, 0.15);
      overflow: hidden;
    }

    .top-bar {
      height: 6px;
      background: linear-gradient(90deg, #6366f1, #22d3ee);
    }

    .content {
      padding: 32px 28px;
      color: #1f2937;
    }

    .logo {
      font-size: 20px;
      font-weight: 700;
      color: #4f46e5;
      margin-bottom: 20px;
      text-align: center;
    }

    .content p {
      font-size: 15px;
      line-height: 1.7;
      margin: 0 0 18px;
      color: #374151;
    }

    .otp-section {
      text-align: center;
      margin: 30px 0;
    }

    .otp-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .otp {
      display: inline-block;
      padding: 16px 36px;
      font-size: 30px;
      letter-spacing: 8px;
      font-weight: 800;
      color: #111827;
      background: linear-gradient(135deg, #eef2ff, #f8fafc);
      border-radius: 12px;
      border: 1px solid #e0e7ff;
    }

    .expiry {
      margin-top: 14px;
      font-size: 14px;
      color: #dc2626;
      font-weight: 600;
    }

    .note {
      font-size: 14px;
      color: #6b7280;
      background: #f9fafb;
      padding: 14px;
      border-radius: 10px;
      margin-top: 24px;
    }

    .footer {
      padding: 18px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      background: #f9fafb;
    }

    .brand {
      color: #4f46e5;
      font-weight: 600;
    }
  </style>
</head>

<body>
  <div class="wrapper">
    <div class="card">
      <div class="top-bar"></div>

      <div class="content">
        <div class="logo">VIRUS COMPUTER</div>

        <p>Hi <strong>${name}</strong>,</p>

        <p>
          We received a request to reset your password.  
          Please use the verification code below to continue.
        </p>

        <div class="otp-section">
          <div class="otp-label">Your One-Time Password</div>
          <div class="otp">${otp}</div>
          <div class="expiry">⏳ Valid for 10 minutes only</div>
        </div>

        <div class="note">
          If you did not request a password reset, no action is required.
          Your account remains secure.
        </div>

        <p style="margin-top: 24px;">
          Regards,<br />
          <span class="brand">VIRUS COMPUTER Team</span>
        </p>
      </div>

      <div class="footer">
        This is an automated email. Please do not reply.
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const otpEmailTemplate = (name: string, otp: string): string => {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
  <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px;">
    <h2 style="color:#2563eb; text-align:center;">Password Reset OTP</h2>

    <p>Hi <strong>${name}</strong>,</p>

    <p>We received a request to reset your password. Use the OTP below to proceed:</p>

    <div style="text-align:center; margin:30px 0;">
      <span style="font-size:28px; font-weight:bold; color:#2563eb; letter-spacing:2px;">
        ${otp}
      </span>
    </div>

    <p style="color:#dc2626; font-weight:600;">
      This OTP is valid for 1 minute only.
    </p>

    <p>If you didn’t request a password reset, please ignore this email.</p>

    <p>— SwipeLang Team</p>
  </div>
</body>
</html>
`;
};


//account verification otp template
export const accountVerificationOtpEmailTemplate = (name: string, otp: string): string => {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; padding:40px; box-shadow:0 10px 25px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td align="center">
              <h2 style="margin:0; color:#2563eb; font-size:24px; font-weight:700;">
                Verify Your Account
              </h2>
              <p style="margin:8px 0 0; color:#6b7280; font-size:14px;">
                Secure your account with the OTP below
              </p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td height="30"></td></tr>

          <!-- Greeting -->
          <tr>
            <td style="color:#111827; font-size:16px;">
              Hi <strong>${name}</strong>,
            </td>
          </tr>

          <tr><td height="15"></td></tr>

          <!-- Message -->
          <tr>
            <td style="color:#374151; font-size:15px; line-height:1.6;">
              Welcome to <strong>HESTEKA</strong> 🎉<br/>
              Use the One-Time Password (OTP) below to complete your account verification.
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <div style="
                display:inline-block;
                padding:16px 28px;
                background:#eff6ff;
                border:1px dashed #2563eb;
                border-radius:10px;
                font-size:30px;
                font-weight:700;
                letter-spacing:6px;
                color:#2563eb;
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td align="center" style="color:#dc2626; font-size:14px; font-weight:600;">
              ⏳ This OTP is valid for 10 minutes only
            </td>
          </tr>

          <tr><td height="25"></td></tr>

          <!-- Footer Text -->
          <tr>
            <td style="color:#6b7280; font-size:14px; line-height:1.6;">
              If you didn’t create this account, you can safely ignore this email.
            </td>
          </tr>

          <tr><td height="30"></td></tr>

          <!-- Divider -->
          <tr>
            <td style="border-top:1px solid #e5e7eb;"></td>
          </tr>

          <tr><td height="15"></td></tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="color:#9ca3af; font-size:13px;">
              © ${new Date().getFullYear()} HESTEKA. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
