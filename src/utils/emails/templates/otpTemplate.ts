export function otpTemplate({
  otp,
  appName,
  expiresInMinutes,
  logoUrl,
  supportEmail,
  type = "new"
}: {
  otp: string;
  appName: string;
  expiresInMinutes: number;
  logoUrl: string;
  supportEmail: string;
  type?: "new" | "resend" | "passwordReset";
}) {
  const brand = {
    bg: "#f6f9fb",
    card: "#ffffff",
    primary: "#0a7f5a",
    primaryDark: "#066548",
    text: "#0f172a",
    subtext: "#475569",
    border: "#e2e8f0",
  };

  let heading = "Your verification code";
  let description = `Use this One-Time Password (OTP) to continue. It expires in <strong>${expiresInMinutes} minutes</strong>.`;

  if (type === "resend") {
    heading = "Your re-issued verification code";
    description = `We’ve re-sent your One-Time Password (OTP). The previous code is no longer valid. This code will expire in <strong>${expiresInMinutes} minutes</strong>.`;
  }

  if (type === "passwordReset") {
    heading = "Reset your password";
    description = `Use the following One-Time Password (OTP) to reset your password. This code will expire in <strong>${expiresInMinutes} minutes</strong>. If you didn’t request a reset, please ignore this email.`;
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${appName} OTP</title>
  <style>
    .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    @media (prefers-color-scheme: dark) {
      .card { background: #0b1220 !important; }
      .text { color: #e5e7eb !important; }
      .muted { color: #9ca3af !important; }
      .border { border-color: #1f2937 !important; }
      .btn { background: ${brand.primary} !important; color:#ffffff !important; }
    }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .card { padding: 20px !important; }
      .otp { font-size: 24px !important; letter-spacing: 3px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:${brand.bg};">
  <div class="preheader">Your OTP is ${otp}. Expires in ${expiresInMinutes} minutes.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${brand.bg};">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom: 16px; text-align:center;">
              <img src="${logoUrl}" width="64" height="64" alt="${appName} logo" style="border-radius:12px; display:block; margin:0 auto;" />
              <div style="font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial; font-size:18px; font-weight:600; color:${brand.text}; margin-top:10px;">${appName}</div>
            </td>
          </tr>
          <tr>
            <td class="card border" style="background:${brand.card}; border:1px solid ${brand.border}; border-radius:16px; padding:28px; box-shadow: 0 2px 8px rgba(2,6,23,0.04);">
              <h1 class="text" style="margin:0 0 8px; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial; font-size:22px; line-height:1.3; color:${brand.text};">${heading}</h1>
              <p class="muted" style="margin:0 0 20px; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial; font-size:14px; color:${brand.subtext};">${description}</p>

              <div style="text-align:center; margin: 22px 0;">
                <div class="otp" style="display:inline-block; font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace; font-size:28px; letter-spacing:6px; padding:14px 18px; border:1px dashed ${brand.border}; border-radius:12px; background:${brand.bg}; color:${brand.text};">${otp}</div>
              </div>

              <p class="muted" style="margin:0 0 10px; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial; font-size:13px; color:${brand.subtext};">If you didn’t request this, you can safely ignore this email.</p>

              <table role="presentation" width="100%" style="margin-top:18px;">
                <tr>
                  <td style="padding:12px 0; border-top:1px solid ${brand.border};">
                    <p class="muted" style="margin:8px 0 0; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial; font-size:12px; color:${brand.subtext}; line-height:1.6;">
                      Having trouble? Contact us at <a href="mailto:${supportEmail}" style="color:${brand.primary}; text-decoration:none;">${supportEmail}</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="text-align:center; padding: 18px 8px;">
              <p class="muted" style="margin:0; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial; font-size:12px; color:${brand.subtext};">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
