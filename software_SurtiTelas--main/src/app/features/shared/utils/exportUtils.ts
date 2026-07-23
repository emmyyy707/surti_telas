/**
 * Utilidades para exportar datos a diferentes formatos
 */

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Convierte un array de objetos a formato CSV
 */
export function convertToCSV(data: ExportData[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Si no se proporcionan headers, usar las claves del primer objeto
  const keys = headers || Object.keys(data[0]);
  
  // Crear la fila de encabezados
  const headerRow = keys.join(',');
  
  // Crear las filas de datos
  const dataRows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      
      // Manejar valores que pueden contener comas o comillas
      if (value === null || value === undefined) {
        return '';
      }
      
      const stringValue = String(value);
      
      // Escapar comillas y envolver en comillas si contiene comas, saltos de línea o comillas
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Descarga un string CSV como archivo
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Crear un Blob con el contenido CSV
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Crear un enlace temporal para la descarga
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Liberar el objeto URL
  URL.revokeObjectURL(url);
}

/**
 * Exporta datos directamente a un archivo CSV
 */
export function exportToCSV(
  data: ExportData[],
  filename: string,
  headers?: string[]
): void {
  const csvContent = convertToCSV(data, headers);
  downloadCSV(csvContent, filename);
}

/**
 * Formatea una fecha para exportación
 */
export function formatDateForExport(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Formatea un número de moneda para exportación
 */
export function formatCurrencyForExport(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`;
}

/**
 * Formatea el estado de un pedido para exportación
 */
export function formatOrderStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pendiente': 'Pendiente',
    'en_proceso': 'En Proceso',
    'completado': 'Completado',
    'cancelado': 'Cancelado',
  };
  return statusMap[status] || status;
}

/**
 * Formatea el estado de un usuario para exportación
 */
export function formatUserStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'activo': 'Activo',
    'inactivo': 'Inactivo',
    'suspendido': 'Suspendido',
  };
  return statusMap[status] || status;
}



