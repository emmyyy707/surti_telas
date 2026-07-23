import React, { useEffect, useRef, useState } from 'react';
import { Send, Package, User, Paperclip, CheckCircle2, Clock, FileText, UserCheck, Archive, CreditCard, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import s from './Atencion-cliente.module.css';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { DetailModal } from '@/shared/ui/DetailModal';
import { useAppStore, useClientes, usePedidos } from '@/core/stores';
import { Badge } from '@/shared/ui/Badge';
import { Tooltip } from '@/shared/components/Tooltip';
import { useAuthStore } from '@/core/stores/authStore';
import type { Pedido } from '@/core/types';

interface Mensaje {
  id: number;
  texto: string;
  remitente: 'asesor' | 'cliente';
  hora: string;
}

export const AtencionCliente: React.FC = () => {
  const asesorActual = useAuthStore((st) => st.user?.name) || 'Sin asesor';
  const clientesStore = useClientes();
  const pedidosStore = usePedidos();
  const [isPedidoModalOpen, setIsPedidoModalOpen] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [pedidoData, setPedidoData] = useState({ detalle: '', urgencia: 'Estándar' as 'Estándar' | 'Prioritario' });
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [clienteActualId, setClienteActualId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clientes = clientesStore.clientes;
  const pedidos = pedidosStore.pedidos;

  const clienteInicial = clientes.find(c => c.asesor === asesorActual) || clientes[0];
  const clienteActual = clientes.find(c => c.id === clienteActualId) || clienteInicial || null;

  useEffect(() => {
    if (!clienteActualId && clienteInicial) {
      setClienteActualId(clienteInicial.id);
    }
  }, [clienteActualId, clienteInicial]);

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: 1, texto: '¡Hola! Tengo una duda sobre los tiempos de entrega para un pedido de 50 metros de lino.', remitente: 'cliente', hora: '09:05 AM' },
    { id: 2, texto: '¡Hola! Claro que sí. Los pedidos estándar toman de 3 a 5 días hábiles. Si lo marco como prioritario en el sistema, lo despachamos en 48 horas.', remitente: 'asesor', hora: '09:06 AM' },
    { id: 3, texto: 'Perfecto, ¿me ayudas generando la solicitud de una vez?', remitente: 'cliente', hora: '09:08 AM' },
  ]);

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const historialCliente = pedidos.filter(p => p.cliente === clienteActual?.nombre).slice(0, 8);

  const enviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    const mensaje: Mensaje = {
      id: Date.now(),
      texto: nuevoMensaje,
      remitente: 'asesor',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMensajes([...mensajes, mensaje]);
    setNuevoMensaje('');
  };

  const handleGenerarPedido = async () => {
    if (!clienteActual) {
      toast.error('Selecciona un cliente antes de generar el pedido.');
      return;
    }
    if (!pedidoData.detalle.trim()) {
      toast.error('Describe las cantidades y referencias del pedido.');
      return;
    }

    try {
      const pedido = await useAppStore.getState().createPedido({
        cliente: clienteActual.nombre,
        asesor: asesorActual,
        fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
        items: 1,
        total: '0',
        estado: 'Nuevo',
        prioridad: pedidoData.urgencia,
        observaciones: pedidoData.detalle,
        itemsList: [],
      });

      useAppStore.getState().addNotificacion({
        tipo: 'success',
        titulo: 'Pedido generado',
        mensaje: `Pedido ${pedido.id} enviado a bodega para ${clienteActual.nombre}`,
      });
      toast.success(`Pedido ${pedido.id} enviado a bodega`);
      setIsPedidoModalOpen(false);
      setPedidoData({ detalle: '', urgencia: 'Estándar' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No fue posible generar el pedido.');
    }
  };

  const handleAttach = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Archivo adjunto: ${file.name}`);
    }
    e.target.value = '';
  };

  const openPedidoDetail = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsHistorialOpen(true);
  };

  return (
    <div className={s.container}>
      <header className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Centro de Atención</h1>
          <p className={s.pageSubtitle}>Gestiona las consultas, cotizaciones y pedidos de tus clientes asignados.</p>
        </div>
      </header>

      <div className={s.dashboardGrid}>
        <div className={s.chatContainer}>
          <div className={s.chatHeader}>
            <div className={s.asesorProfile}>
              <div className={s.avatarWrapper}>
                <User size={20} />
                <span className={s.statusDot}></span>
              </div>
              <div className={s.asesorMeta}>
                <h3>{clienteActual?.nombre || 'Cliente'}</h3>
                <span>{clienteActual?.ciudad || 'Sin ciudad'} • {clienteActual?.asesor || 'Sin asesor'}</span>
              </div>
            </div>
            <select className={s.select} value={clienteActualId} onChange={e => setClienteActualId(e.target.value)}>
              {clientes.filter(c => c.asesor === asesorActual).map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
              ))}
            </select>
          </div>

          <div className={s.chatBody}>
            {mensajes.map((msg) => (
              <div key={msg.id} className={`${s.messageWrapper} ${msg.remitente === 'asesor' ? s.messageRight : s.messageLeft}`}>
                <div className={s.messageBubble}>
                  <p>{msg.texto}</p>
                  <span className={s.messageTime}>{msg.hora}</span>
                </div>
              </div>
            ))}
            <div ref={mensajesEndRef} />
          </div>

          <form className={s.chatInputArea} onSubmit={enviarMensaje}>
            <Tooltip title="Adjuntar catálogo o cotización"><button type="button" className={s.attachBtn} onClick={handleAttach}>
              <Paperclip size={20} />
            </button></Tooltip>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            <input
              type="text"
              className={s.chatInput}
              placeholder="Escribe tu respuesta al cliente..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
            />
            <Button type="submit" className={s.sendBtn}>
              <Send size={18} />
            </Button>
          </form>
        </div>

        <div className={s.sidebar}>
          <div className={s.widgetCard}>
            <div className={s.widgetHeader}>
              <h3>Perfil del Cliente</h3>
              <UserCheck size={18} className={s.widgetIcon} />
            </div>
            <div className={s.statsGrid}>
              <div className={s.statBox}>
                <span className={s.statLabel}>Cartera Pendiente</span>
                <span className={s.statValue} style={{ color: '#ef4444' }}>${(clienteActual?.deudaVencida || 0).toLocaleString()}</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statLabel}>Cupo Disponible</span>
                <span className={s.statValue}>${Math.max((clienteActual?.cupoTotal || 0) - (clienteActual?.cupoUsado || 0), 0).toLocaleString()}</span>
              </div>
              <div className={s.statBox} style={{ gridColumn: '1 / -1' }}>
                <span className={s.statLabel}>Tipo de Cliente</span>
                <Badge variant={clienteActual?.isTrustedCustomer ? 'success' : 'outline'} dot={clienteActual?.isTrustedCustomer}>
                  {clienteActual?.isTrustedCustomer ? 'Cliente de Confianza' : 'Cliente Estándar'}
                </Badge>
              </div>
              <div className={s.statBox} style={{ gridColumn: '1 / -1' }}>
                <span className={s.statLabel}>Contacto</span>
                <span className={s.statValue}>{clienteActual?.tel || '-'}</span>
              </div>
            </div>
          </div>

          <div className={s.widgetCard}>
            <h3>Acciones Rápidas</h3>
            <p className={s.widgetText}>Inicia un requerimiento formal en nombre de este cliente.</p>
            <Button className={s.fullWidthBtn} onClick={() => setIsPedidoModalOpen(true)}>
              <Package size={16} />
              Generar Pedido al Cliente
            </Button>
          </div>

          <div className={s.widgetCard}>
            <div className={s.widgetHeader}>
              <h3>Historial del Cliente</h3>
              <Button variant="ghost" size="sm" className={s.textBtn} onClick={() => setIsHistorialOpen(true)}>Ver todos</Button>
            </div>
            <div className={s.orderList}>
              {historialCliente.map(p => (
                <button key={p.id} type="button" className={s.orderItem} onClick={() => openPedidoDetail(p)}>
                  <div className={s.orderIcon}>
                    {p.estado === 'Entregado' ? <CheckCircle2 size={16} color="#10b981" /> : <Clock size={16} color="#3b82f6" />}
                  </div>
                  <div className={s.orderInfo}>
                    <strong>{p.id}</strong>
                    <span>{p.estado} • {p.fecha}</span>
                  </div>
                </button>
              ))}
              {historialCliente.length === 0 && (
                <div className={s.orderItem}>
                  <div className={s.orderIcon}><Clock size={16} color="#3b82f6" /></div>
                  <div className={s.orderInfo}>
                    <strong>Sin pedidos</strong>
                    <span>Este cliente aún no registra compras</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={s.widgetCard}>
            <div className={s.widgetHeader}>
              <h3>Herramientas de Venta</h3>
              <FileText size={18} className={s.widgetIcon} />
            </div>
            <div className={s.resourceList}>
              <div className={s.resourceItem}>
                <div className={s.resourceIcon}><FileText size={16} /></div>
                <span className={s.resourceName}>Recursos disponibles desde el panel de administración</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={isPedidoModalOpen} onClose={() => setIsPedidoModalOpen(false)} title={`Generar Pedido para ${clienteActual?.nombre || 'Cliente'}`}>
        <div className={s.form}>
          <div className={s.field}>
            <label className={s.label}>Detalles del requerimiento (Cantidades y Referencias)</label>
            <textarea
              className={s.textarea}
              placeholder="Ej: 50 metros de lino blanco (REF-002)..."
              value={pedidoData.detalle}
              onChange={(e) => setPedidoData({ ...pedidoData, detalle: e.target.value })}
            />
          </div>
          <div className={s.field}>
            <label className={s.label}>Prioridad de Despacho</label>
            <select className={s.select} value={pedidoData.urgencia} onChange={(e) => setPedidoData({ ...pedidoData, urgencia: e.target.value as 'Estándar' | 'Prioritario' })}>
              <option value="Estándar">Estándar (3-5 días hábiles)</option>
              <option value="Prioritario">Prioritario (48 hrs - Requiere aprobación)</option>
            </select>
          </div>
          <div className={s.modalActions}>
            <Button variant="secondary" onClick={() => setIsPedidoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleGenerarPedido}>Enviar a Bodega</Button>
          </div>
        </div>
      </Modal>

      <DetailModal
        children={null}
        open={isHistorialOpen}
        onClose={() => { setIsHistorialOpen(false); setSelectedPedido(null); }}
        title={selectedPedido ? `Pedido ${selectedPedido.id}` : 'Historial'}
        subtitle={selectedPedido?.fecha}
        size="xl"
        header={{
          icon: <Archive size={18} />,
          status: selectedPedido ? <Badge variant={selectedPedido.estado === 'Entregado' ? 'success' : selectedPedido.estado === 'Cancelado' ? 'danger' : 'info'}>{selectedPedido.estado}</Badge> : undefined,
        }}
        sections={[
          {
            title: 'Información del pedido',
            fields: [
              { label: 'Cliente', value: selectedPedido?.cliente, icon: <User size={16} /> },
              { label: 'Asesor', value: selectedPedido?.asesor, icon: <User size={16} /> },
              { label: 'Total', value: selectedPedido?.total, icon: <CreditCard size={16} /> },
              { label: 'Prioridad', value: selectedPedido?.prioridad || 'Estándar', icon: <Clock size={16} /> },
              { label: 'Observaciones', value: selectedPedido?.observaciones || 'Sin observaciones', fullWidth: true, icon: <FileText size={16} /> },
            ],
          },
          {
            title: 'Ubicación y contacto',
            fields: [
              { label: 'Ciudad cliente', value: clienteActual?.ciudad || 'No registrada', icon: <MapPin size={16} /> },
              { label: 'Teléfono cliente', value: clienteActual?.tel || 'No registrado', icon: <Phone size={16} /> },
            ],
          },
        ]}
      />
    </div>
  );
};
