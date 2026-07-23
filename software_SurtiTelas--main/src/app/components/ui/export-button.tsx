import { Download, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from './button';
import { exportToCSV, ExportData } from '../utils/exportUtils';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: ExportData[];
  filename: string;
  headers?: string[];
  label?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: 'download' | 'file' | 'spreadsheet';
  className?: string;
  disabled?: boolean;
}

export function ExportButton({
  data,
  filename,
  headers,
  label = 'Exportar CSV',
  variant = 'outline',
  size = 'default',
  icon = 'download',
  className = '',
  disabled = false,
}: ExportButtonProps) {
  const handleExport = () => {
    try {
      if (data.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      // Asegurar que el filename tenga extensión .csv
      const csvFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
      
      exportToCSV(data, csvFilename, headers);
      
      toast.success(`Archivo ${csvFilename} descargado exitosamente`);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar el archivo');
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'file':
        return <FileDown className="h-4 w-4" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || data.length === 0}
    >
      {getIcon()}
      <span className="ml-2">{label}</span>
    </Button>
  );
}



