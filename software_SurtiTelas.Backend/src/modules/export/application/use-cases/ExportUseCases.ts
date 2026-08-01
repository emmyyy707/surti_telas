export interface ExportOptions {
  format: 'csv' | 'xlsx';
  data: Record<string, unknown>[];
  filename: string;
  columns?: Array<{ key: string; header: string }>;
}

export interface ExportResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  extension: string;
}

export class ExportToCSV {
  execute(options: ExportOptions): ExportResult {
    if (options.data.length === 0) {
      return { buffer: Buffer.from(''), mimeType: 'text/csv', filename: options.filename, extension: 'csv' };
    }
    const headers = options.columns ?? Object.keys(options.data[0]).map(k => ({ key: k, header: k }));
    const csvLines = [headers.map(h => '"' + h.header + '"').join(',')];
    for (const row of options.data) {
      csvLines.push(headers.map(h => {
        const val = row[h.key];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n') ? '"' + str.replace(/"/g, '""') + '"' : str;
      }).join(','));
    }
    return { buffer: Buffer.from(csvLines.join('\n')), mimeType: 'text/csv', filename: options.filename + '.csv', extension: 'csv' };
  }
}
