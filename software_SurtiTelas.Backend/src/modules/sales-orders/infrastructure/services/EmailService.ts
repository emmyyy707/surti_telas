import nodemailer, { type SendMailOptions } from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export class EmailService {
  private readonly config: EmailConfig;
  private transporter: nodemailer.Transporter<SendMailOptions> | null = null;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  private async getTransporter(): Promise<nodemailer.Transporter<SendMailOptions>> {
    if (!this.transporter) {
      const hasAuth = Boolean(this.config.user && this.config.pass);
      const looksLikeLocalMailhog = this.config.host === 'localhost' || this.config.host === '127.0.0.1';
      const allowInsecure = ['1025', '25'].includes(String(this.config.port));

      if (hasAuth || !looksLikeLocalMailhog || !allowInsecure) {
        this.transporter = nodemailer.createTransport({
          host: this.config.host,
          port: this.config.port,
          secure: this.config.secure,
          auth: {
            user: this.config.user,
            pass: this.config.pass,
          },
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: this.config.host,
          port: this.config.port,
          secure: false,
        });
      }
    }
    return this.transporter;
  }

  async sendReceipt(to: { email: string; nombre: string }, receiptUrl: string, orderNumero: string, total: number): Promise<void> {
    const transporter = await this.getTransporter();

    const mailOptions: SendMailOptions = {
      from: {
        name: this.config.fromName,
        address: this.config.fromEmail,
      },
      to: to.email,
      subject: `Recibo de compra ${orderNumero}`,
      text: `Hola ${to.nombre},

Adjunto encontrarás el recibo de tu pedido ${orderNumero} por un valor de $${total.toLocaleString('es-CO')}.

Puedes verlo en: ${receiptUrl}

Gracias por tu compra.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Recibo de compra ${orderNumero}</h2>
          <p>Hola <strong>${to.nombre}</strong>,</p>
          <p>Adjunto encontrarás el recibo de tu pedido <strong>${orderNumero}</strong> por un valor de <strong>$${total.toLocaleString('es-CO')}</strong>.</p>
          <p style="margin: 24px 0;">
            <a href="${receiptUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Ver recibo
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
