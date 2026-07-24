import type { ContactMessage } from '../entities/ContactMessage';

export interface CreateContactInput {
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

export interface ContactFilters {
  leida?: boolean;
}

export interface ContactMessageRepository {
  list(filters: ContactFilters): Promise<ContactMessage[]>;
  getById(id: string): Promise<ContactMessage | null>;
  create(input: CreateContactInput): Promise<ContactMessage>;
  markAsRead(id: string): Promise<ContactMessage>;
  update(id: string, changes: Partial<ContactMessage>): Promise<ContactMessage>;
  reply(id: string, respuesta: string, respondidoPor: string): Promise<ContactMessage>;
  close(id: string): Promise<ContactMessage>;
}
