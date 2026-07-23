import { useState } from 'react';
import { CreditCard, Download, Eye, CheckCircle, XCircle, Clock, Search, Filter, Calendar, User, DollarSign, FileText, AlertCircle, ImageIcon } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { TablePagination } from '../ui/table-pagination';

interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentProofImage: string;
  uploadDate: string;
  status: 'en_verificacion' | 'aprobado' | 'denegado';
  reviewedBy?: string;
  reviewedDate?: string;
  denialReason?: string;
  bankAccount?: string;
}

interface HistorialPagosModuleProps {
  orders?: any[];
}

export function HistorialPagosModule({ orders = [] }: HistorialPagosModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');
  const [viewImageDialog, setViewImageDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Convertir orders a formato de Payment
  const paymentsHistory: Payment[] = orders
    .filter(order => order.paymentProof)
    .map(order => ({
      id: order.id,
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.email,
      total: order.total,
      paymentProofImage: order.paymentProof?.url || '',
      uploadDate: order.paymentProof?.uploadDate || '',
      status: order.paymentProof?.validationStatus || 'en_verificacion',
      reviewedBy: order.paymentProof?.validatedBy,
      reviewedDate: order.paymentProof?.validatedDate,
      denialReason: order.paymentProof?.rejectionReason,
      bankAccount: 'Bancolombia', // Por defecto
    }));

  // Filtrar pagos
  const filteredPayments = paymentsHistory.filter(payment => {
    const matchesSearch =
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: paymentsHistory.length,
    pendientes: paymentsHistory.filter(p => p.status === 'en_verificacion').length,
    aprobados: paymentsHistory.filter(p => p.status === 'aprobado').length,
    denegados: paymentsHistory.filter(p => p.status === 'denegado').length,
    montoTotal: paymentsHistory.filter(p => p.status === 'aprobado').reduce((sum, p) => sum + p.total, 0),
    montoPendiente: paymentsHistory.filter(p => p.status === 'en_verificacion').reduce((sum, p) => sum + p.total, 0),
  };

  const exportToCSV = () => {
    const headers = ['ID Pago', 'ID Pedido', 'Cliente', 'Email', 'Monto', 'Banco', 'Estado', 'Fecha Subida', 'Revisado Por', 'Fecha Revisión', 'Motivo Denegación'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.orderId,
      p.customerName,
      p.customerEmail,
      p.total,
      p.bankAccount || 'N/A',
      p.status === 'en_verificacion' ? 'En Verificación' : p.status === 'aprobado' ? 'Aprobado' : 'Denegado',
      p.uploadDate,
      p.reviewedBy || 'N/A',
      p.reviewedDate || 'N/A',
      p.denialReason || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial-pagos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Historial exportado correctamente');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Historial de Pagos</h1>
          <p className="text-gray-500">
            Registro completo de todas las transacciones y verificaciones de pago
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">Total de Pagos</p>
              <p className="text-3xl text-blue-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1">En Verificación</p>
              <p className="text-3xl text-yellow-900">{stats.pendientes}</p>
              <p className="text-xs text-yellow-600 mt-1">${(stats.montoPendiente / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">Aprobados</p>
              <p className="text-3xl text-green-900">{stats.aprobados}</p>
              <p className="text-xs text-green-600 mt-1">${(stats.montoTotal / 1000000).toFixed(2)}M</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 mb-1">Denegados</p>
              <p className="text-3xl text-red-900">{stats.denegados}</p>
              <p className="text-xs text-red-600 mt-1">Requieren atención</p>
            </div>
            <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alerta de seguridad */}
      <Card className="p-5 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-purple-900 mb-1">ðŸ”’ Sistema de Auditoría Completo</h3>
            <p className="text-sm text-purple-700">
              Este historial registra <strong>todas las transacciones</strong> con información del asesor que aprobó/denegó cada pago,
              fecha y hora exacta, y comprobantes adjuntos. Los datos son inmutables y sirven como respaldo ante cualquier discrepancia.
            </p>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card className="p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ID, cliente, pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block">Estado</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="en_verificacion">En Verificación</SelectItem>
                <SelectItem value="aprobado">Aprobados</SelectItem>
                <SelectItem value="denegado">Denegados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block">Período</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabla de Historial */}
      <Card className="bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ID Pago</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Subida</TableHead>
                <TableHead>Revisado Por</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (filteredPayments.length === 0) return (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron pagos</p>
                  </TableCell>
                </TableRow>
                );
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginated = filteredPayments.slice(startIndex, endIndex);
                return paginated.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                    <TableCell className="font-mono text-sm">{payment.orderId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{payment.customerName}</p>
                        <p className="text-xs text-gray-500">{payment.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">{payment.bankAccount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-base text-gray-900">${payment.total.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          payment.status === 'en_verificacion'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : payment.status === 'aprobado'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                        }
                      >
                        {payment.status === 'en_verificacion' && 'â³ En Verificación'}
                        {payment.status === 'aprobado' && 'âœ… Aprobado'}
                        {payment.status === 'denegado' && 'âŒ Denegado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{payment.uploadDate}</TableCell>
                    <TableCell>
                      {payment.reviewedBy ? (
                        <div>
                          <p className="text-sm text-gray-900">{payment.reviewedBy}</p>
                          <p className="text-xs text-gray-500">{payment.reviewedDate}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Pendiente</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setViewImageDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredPayments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Modal Ver Detalles */}
      <Dialog open={viewImageDialog} onOpenChange={setViewImageDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalles del Pago</DialogTitle>
            <DialogDescription>
              Información completa de la transacción
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6 py-4">
              {/* Información del Cliente */}
              <Card className="p-5 bg-gray-50 border-gray-200">
                <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Cliente</p>
                    <p className="text-gray-900">{selectedPayment.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="text-gray-900">{selectedPayment.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ID Pedido</p>
                    <p className="text-gray-900 font-mono">{selectedPayment.orderId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ID Pago</p>
                    <p className="text-gray-900 font-mono">{selectedPayment.id}</p>
                  </div>
                </div>
              </Card>

              {/* Información del Pago */}
              <Card className="p-5 bg-blue-50 border-blue-200">
                <h3 className="text-base text-blue-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Información del Pago
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Banco</p>
                    <p className="text-blue-900">{selectedPayment.bankAccount}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Monto Total</p>
                    <p className="text-2xl text-blue-900">${selectedPayment.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Fecha de Subida</p>
                    <p className="text-blue-900">{selectedPayment.uploadDate}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Estado</p>
                    <Badge
                      className={
                        selectedPayment.status === 'en_verificacion'
                          ? 'bg-yellow-600 text-white border-0'
                          : selectedPayment.status === 'aprobado'
                          ? 'bg-green-600 text-white border-0'
                          : 'bg-red-600 text-white border-0'
                      }
                    >
                      {selectedPayment.status === 'en_verificacion' && 'â³ En Verificación'}
                      {selectedPayment.status === 'aprobado' && 'âœ… Aprobado'}
                      {selectedPayment.status === 'denegado' && 'âŒ Denegado'}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Información de Revisión */}
              {(selectedPayment.status === 'aprobado' || selectedPayment.status === 'denegado') && (
                <Card className={`p-5 ${selectedPayment.status === 'aprobado' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <h3 className={`text-base mb-4 flex items-center gap-2 ${selectedPayment.status === 'aprobado' ? 'text-green-900' : 'text-red-900'}`}>
                    <CheckCircle className="w-5 h-5" />
                    Información de Revisión
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className={selectedPayment.status === 'aprobado' ? 'text-green-700' : 'text-red-700'}>Revisado Por</p>
                      <p className={selectedPayment.status === 'aprobado' ? 'text-green-900' : 'text-red-900'}>{selectedPayment.reviewedBy}</p>
                    </div>
                    <div>
                      <p className={selectedPayment.status === 'aprobado' ? 'text-green-700' : 'text-red-700'}>Fecha de Revisión</p>
                      <p className={selectedPayment.status === 'aprobado' ? 'text-green-900' : 'text-red-900'}>{selectedPayment.reviewedDate}</p>
                    </div>
                    {selectedPayment.denialReason && (
                      <div className="pt-3 border-t border-red-200">
                        <p className="text-red-700 mb-2">Motivo de Denegación</p>
                        <p className="text-red-900 bg-red-100 p-3 rounded-lg">{selectedPayment.denialReason}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Comprobante de Pago */}
              <div>
                <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Comprobante de Pago
                </h3>
                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedPayment.paymentProofImage}
                    alt="Comprobante"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



