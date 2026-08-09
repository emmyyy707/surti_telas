import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Package, CheckCircle2, Clock, CreditCard, FileText, Archive, MessageCircle } from 'lucide-react';
import s from './Catalogo.module.css';
import f from '@/styles/Form.module.css';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { DetailModal } from '@/shared/ui/DetailModal';
import { Badge } from '@/shared/ui/Badge';

interface PedidoActivo {
  id: string;
  estado: 'En Proceso' | 'Completado';
  fecha: string;
  total: string;
  items: string;
}

export const CatalogoCliente: React.FC = () => {
  const navigate = useNavigate();
  const [isPedidoModalOpen, setIsPedidoModalOpen] = useState(false);
  const [pedidoData, setPedidoData] = useState({ detalle: '', urgencia: 'Estándar' });
  const [selectedPedido, setSelectedPedido] = useState<PedidoActivo | null>(null);
  const [misPedidos] = useState<PedidoActivo[]>([]);
  const saldoPendiente = 0;

  const pedidosActivos = misPedidos;

  const handleCrearPedido = () => {
    if (!pedidoData.detalle.trim()) {
      toast.error('Debes describir tu requerimiento');
      return;
    }
    setIsPedidoModalOpen(false);
    setPedidoData({ detalle: '', urgencia: 'Estándar' });
    toast.success('Pedido solicitado, un asesor te contactará pronto');
  };

  return (
    <div className={s.container}>
      <header className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Soporte y Pedidos</h1>
          <p className={s.pageSubtitle}>Comunícate en tiempo real y gestiona tu cuenta comercial.</p>
        </div>
      </header>

      <div className={s.dashboardGrid}>
        <div className={s.sidebar}>
          <div className={s.widgetCard}>
            <div className={s.widgetHeader}>
              <h3>Resumen de Cuenta</h3>
              <CreditCard size={18} className={s.widgetIcon} />
            </div>
            <div className={s.statsGrid}>
              <div className={s.statBox}>
                <span className={s.statLabel}>Saldo Pendiente</span>
                <span className={s.statValue}>{saldoPendiente !== null ? `$${saldoPendiente.toLocaleString('es-CO')}` : '—'}</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statLabel}>Pedidos este mes</span>
                <span className={s.statValue}>{misPedidos.length}</span>
              </div>
            </div>
          </div>

          <div className={s.widgetCard}>
            <h3>Gestión Rápida</h3>
            <p className={s.widgetText}>Inicia un requerimiento formal para que sea procesado por bodega.</p>
            <Button className={s.fullWidthBtn} onClick={() => setIsPedidoModalOpen(true)}>
              <Package size={16} />
              Crear Nuevo Pedido
            </Button>
          </div>

          <div className={s.widgetCard}>
            <div className={s.widgetHeader}>
              <h3>Pedidos Activos</h3>
              <Button variant="ghost" size="sm" className={s.textBtn} onClick={() => navigate('/cliente/pedidos')}>Ver todos</Button>
            </div>
            <div className={s.orderList}>
              {pedidosActivos.map((pedido) => (
                <button type="button" key={pedido.id} className={s.orderItem} onClick={() => setSelectedPedido(pedido)}>
                  <div className={s.orderIcon}><Clock size={16} color={pedido.estado === 'Completado' ? '#10b981' : '#3b82f6'} /></div>
                  <div className={s.orderInfo}>
                    <strong>{pedido.id}</strong>
                    <span>{pedido.estado} • {pedido.fecha}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={s.widgetCard}>
            <div className={s.widgetHeader}>
              <h3>Recursos Útiles</h3>
              <FileText size={18} className={s.widgetIcon} />
            </div>
            <div className={s.resourceList}>
              <div className={s.resourceItem}>
                <div className={s.resourceIcon}><FileText size={16} /></div>
                <span className={s.resourceName}>Recursos disponibles en el catálogo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={isPedidoModalOpen} onClose={() => setIsPedidoModalOpen(false)} title="Generar Pedido Personalizado">
        <form className={f.form}>
          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Detalles del pedido</h3>
            <div className={f.field}>
              <label className={f.label}>Detalles del requerimiento</label>
              <textarea
                className={f.textarea}
                placeholder="Ej: Necesito 2 rollos de algodón peinado negro y 1 de gris jaspeado..."
                value={pedidoData.detalle}
                onChange={(e) => setPedidoData({...pedidoData, detalle: e.target.value})}
              />
            </div>
            <div className={f.field}>
              <label className={f.label}>Nivel de Urgencia</label>
              <select className={f.select} value={pedidoData.urgencia} onChange={(e) => setPedidoData({...pedidoData, urgencia: e.target.value})}>
                <option value="Estándar">Estándar (3-5 días)</option>
                <option value="Prioritario">Prioritario (48 hrs)</option>
              </select>
            </div>
          </div>
          <div className={f.formActions}>
            <Button variant="secondary" onClick={() => setIsPedidoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCrearPedido}>Confirmar Pedido</Button>
          </div>
        </form>
      </Modal>

      <DetailModal
        children={null}
        open={Boolean(selectedPedido)}
        onClose={() => setSelectedPedido(null)}
        title={selectedPedido ? `Pedido ${selectedPedido.id}` : 'Pedido'}
        subtitle={selectedPedido?.fecha}
        header={{
          icon: <Archive size={18} />,
          status: selectedPedido ? <Badge variant={selectedPedido.estado === 'Completado' ? 'success' : 'info'}>{selectedPedido.estado}</Badge> : undefined,
        }}
        sections={[
          {
            title: 'Resumen',
            fields: [
              { label: 'Estado', value: selectedPedido?.estado, icon: <CheckCircle2 size={16} /> },
              { label: 'Fecha', value: selectedPedido?.fecha, icon: <Clock size={16} /> },
              { label: 'Artículos', value: selectedPedido?.items, icon: <Package size={16} /> },
              { label: 'Total estimado', value: selectedPedido?.total, icon: <CreditCard size={16} /> },
            ],
          },
          {
            title: 'Soporte',
            children: (
              <Button onClick={() => { setSelectedPedido(null); toast.success('Asesor notificado para revisar este pedido'); }}>
                <MessageCircle size={14} />
                Notificar a mi asesor
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
};
