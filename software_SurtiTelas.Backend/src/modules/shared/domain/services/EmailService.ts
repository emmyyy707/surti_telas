export interface EmailService {
  sendPasswordReset(email: string, token: string): Promise<{ previewUrl?: string }>;
}
