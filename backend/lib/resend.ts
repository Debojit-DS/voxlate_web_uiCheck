import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build");

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.RESEND_FROM_EMAIL || "Voxlate <no-reply@voxlatesn.in>";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
      <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">Reset your Voxlate password</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        We received a request to reset your password. Click the button below to choose a new one.
      </p>
      <p style="margin-top: 20px;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 6px; background: #001b44; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">
          Reset Password
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">
        If you didn’t request this, you can safely ignore this email. This link will expire in 1 hour.
      </p>
    </div>
  `;

  const result = await resend.emails.send({
    from,
    to,
    subject: "Reset your Voxlate password",
    html,
  });

  return result;
}
