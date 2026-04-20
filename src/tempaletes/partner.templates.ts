type PartnerTemplateStatus = "approved" | "rejected";

interface PartnerTemplateOptions {
  body: string;
  buttonHref?: string;
  buttonLabel?: string;
  closing: string;
  name: string;
  status: PartnerTemplateStatus;
  supportText: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const palette = {
  approved: {
    accent: "#16a34a",
    stampBackground: "#dcfce7",
    stampBorder: "#16a34a",
    stampText: "APPROVED",
  },
  rejected: {
    accent: "#dc2626",
    stampBackground: "#fee2e2",
    stampBorder: "#dc2626",
    stampText: "REJECTED",
  },
};

const partnerEmailLayout = ({
  body,
  buttonHref,
  buttonLabel,
  closing,
  name,
  status,
  supportText,
}: PartnerTemplateOptions): string => {
  const colors = palette[status];
  const safeName = escapeHtml(name);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>HESTEKA Partner Application</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f6f8; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    Your HESTEKA partner application status has been updated.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f6f8; margin:0; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background-color:#ffffff; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 18px 32px; border-bottom:1px solid #eef2f7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size:22px; font-weight:700; letter-spacing:0.5px; color:#111827;">
                    HESTEKA<span style="color:${colors.accent};">.</span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block; padding:9px 14px; background-color:${colors.stampBackground}; border:2px solid ${colors.stampBorder}; border-radius:8px; color:${colors.accent}; font-size:13px; line-height:1; font-weight:800; letter-spacing:1.4px; text-transform:uppercase;">
                      ${colors.stampText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px 0; font-size:16px; line-height:1.7; color:#4b5563;">
                Hi <strong style="color:#111827;">${safeName}</strong>,
              </p>

              <p style="margin:0 0 24px 0; font-size:16px; line-height:1.7; color:#4b5563;">
                ${body}
              </p>

              <p style="margin:0 0 28px 0; padding-left:16px; font-size:15px; line-height:1.7; color:#4b5563;">
                ${supportText}
              </p>

              ${
                buttonHref && buttonLabel
                  ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 30px 0;">
                <tr>
                  <td bgcolor="#111827" style="border-radius:8px;">
                    <a href="${buttonHref}" style="display:inline-block; padding:14px 24px; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; border-radius:8px;">
                      ${buttonLabel}
                    </a>
                  </td>
                </tr>
              </table>`
                  : ""
              }

              <p style="margin:0; font-size:15px; line-height:1.7; color:#4b5563;">
                ${closing}<br />
                <strong style="color:#111827;">HESTEKA Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 32px; background-color:#f9fafb; border-top:1px solid #eef2f7; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:13px; line-height:1.6; color:#6b7280;">
                You are receiving this email because you submitted a partner application to HESTEKA.
              </p>
              <p style="margin:0; font-size:12px; line-height:1.6; color:#9ca3af;">
                &copy; ${new Date().getFullYear()} HESTEKA. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const partnerApprovalEmailTemplate = (name: string): string =>
  partnerEmailLayout({
    body: "Congratulations. Your partner account application has been reviewed and approved. You can now access your partner account and begin managing your collection points and local missions.",
    closing: "Welcome to the HESTEKA partner network.",
    name,
    status: "approved",
    supportText:
      "Your account is now active. Please sign in to complete your profile details and begin using the partner tools available to your organization.",
  });

export const partnerRejectionEmailTemplate = (name: string): string =>
  partnerEmailLayout({
    body: "Thank you for your interest in joining HESTEKA as a partner. After reviewing your application, we are unable to approve your partner account at this time.",
    buttonHref: "mailto:support@hesteka.com",
    buttonLabel: "Contact Support",
    closing: "Thank you for your understanding.",
    name,
    status: "rejected",
    supportText:
      "If you believe this decision was made in error, or if you would like more information about your application, please contact our support team.",
  });
