import { api } from './httpClient';

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  data: Record<string, unknown>[];
  filename: string;
  columns?: Array<{ key: string; header: string }>;
}

export const exportApi = {
  exportData: (options: ExportOptions) =>
    api.post<Blob>('/admin/export', { ...options }, { auth: true }),

  downloadReport: (type: string, query?: Record<string, string>) =>
    api.get<Blob>(`/admin/export/${type}`, { query, auth: true }),
};
