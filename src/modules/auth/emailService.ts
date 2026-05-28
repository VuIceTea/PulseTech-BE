import nodemailer from "nodemailer";

const smtpHost =
  process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 465);
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || "";
const smtpPassword =
  process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || "";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
  secure: smtpPort === 465,
  port: smtpPort,
});

export async function sendVerificationEmail(email: string, link: string) {
  if (!smtpUser || !smtpPassword) {
    throw new Error("SMTP credentials are missing (SMTP_USER/SMTP_PASSWORD)");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to: email,
    subject: "Xác thực tài khoản PulseTech",
    html: `
      <h2>Xác thực tài khoản</h2>
      <p>Cảm ơn bạn đã đăng ký tài khoản trên PulseTech! Vui lòng bấm vào nút bên dưới để xác thực email của bạn và kích hoạt tài khoản.</p>
      <a href="${link}">
        Bấm vào đây để xác thực tài khoản của bạn trên PulseTech</a>
      <p>Nếu bạn không đăng ký tài khoản trên PulseTech, vui lòng bỏ qua email này.</p>
      <a href="${process.env.CLIENT_URL}">Truy cập PulseTech</a>
      </a>
    `,
  });
}
