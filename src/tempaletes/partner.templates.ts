export const partnerApprovalEmailTemplate = (name: string): string => {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
  <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px; position: relative; overflow: hidden;">
    <p>Hi <strong>${name}</strong>,</p>

    <p>Congratulations! Your partner account application for HESTEKA has been approved.</p>

    <p>You can now log in to your account and start managing your collection points and missions.</p>

    <p style="padding-top: 20px;">Welcome to the community!</p>

    <p>HESTEKA Team</p>

    <div style="position: absolute; bottom: 40px; right: 20px; border: 5px solid #22c55e; color: #22c55e; padding: 10px 20px; font-weight: 900; font-size: 32px; transform: rotate(-15deg); opacity: 0.4; border-radius: 12px; text-transform: uppercase; font-family: 'Courier New', Courier, monospace; pointer-events: none;">
      Approved
    </div>
  </div>
</body>
</html>
`;
};

export const partnerRejectionEmailTemplate = (name: string): string => {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
  <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px; position: relative; overflow: hidden;">
    <p>Hi <strong>${name}</strong>,</p>

    <p>Thank you for your interest in joining HESTEKA as a partner.</p>

    <p>After reviewing your application, we regret to inform you that we cannot approve your partner account at this time.</p>

    <p>If you have any questions or believe this is an error, please feel free to reach out to our support team.</p>

    <p style="padding-top: 20px;">Best regards,</p>
    <p>HESTEKA Team</p>

    <div style="position: absolute; bottom: 40px; right: 20px; border: 5px solid #ef4444; color: #ef4444; padding: 10px 20px; font-weight: 900; font-size: 32px; transform: rotate(-15deg); opacity: 0.4; border-radius: 12px; text-transform: uppercase; font-family: 'Courier New', Courier, monospace; pointer-events: none;">
      Rejected
    </div>
  </div>
</body>
</html>
`;
};
