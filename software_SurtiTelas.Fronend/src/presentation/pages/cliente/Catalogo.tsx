import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Send, Package, User, Paperclip, CheckCircle2, Clock, CreditCard, FileText, Archive, MessageCircle } from 'lucide-react';
import s from './Catalogo.module.css';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { DetailModal } from '@/shared/ui/DetailModal';
import { Badge } from '@/shared/ui/Badge';
import { Tooltip } from '@/shared/components/Tooltip';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { customersApi } from '@/infrastructure/api/customersApi';
import { useAuthStore } from '@/core/stores/authStore';

interface Mensaje {
  id: number;
  texto: string;
  remitente: 'asesor' | 'cliente';
  hora: string;
}

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
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [selectedPedido, setSelectedPedido] = useState<PedidoActivo | null>(null);
  const [misPedidos, setMisPedidos] = useState<PedidoActivo[]>([]);
  const [saldoPendiente, setSaldoPendiente] = useState<number | null>(null);
  const [asesorNombre, setAsesorNombre] = useState<string>('Tu asesora de cuenta');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  useEffect(() => {
    const load = async () => {
      try {
        const ordersData = await ordersApi.list();
        setMisPedidos(ordersData.pedidos.slice(0, 2).map((p) => ({
          id: p.id,
          estado: p.estado === 'Entregado' ? 'Completado' : 'En Proceso',
          fecha: p.fecha,
          total: p.total,
          items: `${p.items} artículos`,
        })));
        const asesorPedido = ordersData.pedidos.find((p) => p.asesor)?.asesor;
        if (asesorPedido) setAsesorNombre(asesorPedido);
        try {
          const clientsResult = await customersApi.list();
          const currentUser = useAuthStore.getState().user;
          const myClient = clientsResult.data.find((c) => c.email === currentUser?.email || c.nombre === currentUser?.name);
          if (myClient) {
            setSaldoPendiente((myClient.cupoTotal ?? 0) - (myClient.cupoUsado ?? 0) + (myClient.deudaVencida ?? 0));
          }
        } catch {
          setSaldoPendiente(null);
        }
      } catch {
        toast.error('No se pudieron cargar los datos');
      }
    };
    void load();
  }, []);

  const enviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    const mensaje: Mensaje = {
      id: Date.now(),
      texto: nuevoMensaje,
      remitente: 'cliente',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes([...mensajes, mensaje]);
    setNuevoMensaje('');
    toast.success('Mensaje enviado a tu asesor');
  };

  const handleCrearPedido = async () => {
    if (!pedidoData.detalle.trim()) {
      toast.error('Describe tu requerimiento');
      return;
    }

    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser?.email) {
        toast.error('No se pudo identificar tu cuenta para crear el pedido');
        return;
      }

      const clientsResult = await customersApi.list();
      const myClient = clientsResult.data.find((c) => c.email === currentUser.email || c.nombre === currentUser.name || currentUser.email.includes(c.nombre));
      const clienteId = myClient?.id || currentUser.uid;

      await ordersApi.create({
        clienteId,
        asesorId: myClient?.asesor || undefined,
        itemsList: [],
        prioridad: pedidoData.urgencia === 'Prioritario' ? 'ALTA' : 'MEDIA',
        observaciones: pedidoData.detalle,
      });

      toast.success('Pedido enviado a tu asesor para cotización');
      setIsPedidoModalOpen(false);
      setPedidoData({ detalle: '', urgencia: 'Estándar' });

      const ordersData = await ordersApi.list();
      setMisPedidos(ordersData.pedidos.slice(0, 2).map((p) => ({
        id: p.id,
        estado: p.estado === 'Entregado' ? 'Completado' : 'En Proceso',
        fecha: p.fecha,
        total: p.total,
        items: `${p.items} artículos`,
      })));
    } catch {
      toast.error('No se pudo crear el pedido. Intenta nuevamente.');
    }
  };

  const handleAttach = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) toast.success(`Archivo adjunto: ${file.name}`);
    e.target.value = '';
  };

  const pedidosActivos = misPedidos;

  return (
    <div className={s.container}>
      <header className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Soporte y Pedidos</h1>
          <p className={s.pageSubtitle}>Comunícate en tiempo real y gestiona tu cuenta comercial.</p>
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
                <h3>{asesorNombre}</h3>
                <span>Asesor de Cuenta • En línea</span>
              </div>
            </div>
          </div>

          <div className={s.chatBody}>
            {mensajes.map((msg) => (
              <div key={msg.id} className={`${s.messageWrapper} ${msg.remitente === 'cliente' ? s.messageRight : s.messageLeft}`}>
                <div className={s.messageBubble}>
                  <p>{msg.texto}</p>
                  <span className={s.messageTime}>{msg.hora}</span>
                </div>
              </div>
            ))}
            <div ref={mensajesEndRef} />
          </div>

            <form className={s.chatInputArea} onSubmit={enviarMensaje}>
              <Tooltip title="Adjuntar archivo"><button type="button" className={s.attachBtn} onClick={handleAttach}>
                <Paperclip size={20} />
              </button></Tooltip>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            <input
              type="text"
              className={s.chatInput}
              placeholder="Escribe tu mensaje aquí..."
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
        <div className={s.form}>
          <div className={s.field}>
            <label className={s.label}>Detalles del requerimiento</label>
            <textarea
              className={s.textarea}
              placeholder="Ej: Necesito 2 rollos de algodón peinado negro y 1 de gris jaspeado..."
              value={pedidoData.detalle}
              onChange={(e) => setPedidoData({...pedidoData, detalle: e.target.value})}
            />
          </div>
          <div className={s.field}>
            <label className={s.label}>Nivel de Urgencia</label>
            <select className={s.select} value={pedidoData.urgencia} onChange={(e) => setPedidoData({...pedidoData, urgencia: e.target.value})}>
              <option value="Estándar">Estándar (3-5 días)</option>
              <option value="Prioritario">Prioritario (48 hrs)</option>
            </select>
          </div>
          <div className={s.modalActions}>
            <Button variant="secondary" onClick={() => setIsPedidoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCrearPedido}>Confirmar Pedido</Button>
          </div>
        </div>
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
