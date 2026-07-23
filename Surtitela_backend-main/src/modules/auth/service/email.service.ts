import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"SurtiTelas" <${process.env.SMTP_USER || "noreply@surtitelas.com"}>`,
      to: email,
      subject: "Bienvenido a SurtiTelas",
      html: `
        <h2>Hola, ${name}.</h2>
        <p>Tu cuenta ha sido creada correctamente.</p>
        <p>Ya puedes iniciar sesión en la plataforma.</p>
        <p>Gracias por registrarte.</p>
        <p>Equipo SurtiTelas.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}