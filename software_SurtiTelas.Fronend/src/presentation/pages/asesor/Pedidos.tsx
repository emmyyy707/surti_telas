import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Archive,
  CreditCard,
  Package,
  AlertTriangle,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import s from "../admin/Pedidos.module.css";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { DetailModal } from "@/shared/ui/DetailModal";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import { Tooltip } from "@/shared/components/Tooltip";
import { ordersApi } from "@/infrastructure/api/ordersApi";
import { ESTADOS_PEDIDO_PERMITIDOS } from "@/shared/constants/options";
import { useAuthStore } from "@/core/stores/authStore";
import { useClientes } from "@/core/stores";
import type { Pedido } from "@/core/types";

const orderStatuses: Record<string, "success" | "warning" | "danger" | "info" | "default" | null> = {
  Pendiente: "warning",
  Aceptado: "info",
  "En proceso": "info",
  Enviado: "default",
  Entregado: "success",
  Rechazado: "danger",
};

const emptyPedidoForm: Omit<Pedido, "id"> = {
  cliente: "",
  asesor: "",
  fecha: new Date().toISOString().slice(0, 10),
  items: 1,
  total: "0",
  estado: "Pendiente",
  prioridad: "Estándar",
  observaciones: "",
  itemsList: [],
};

import { parseCurrency } from "@/shared/utils/number";

export const AsesorPedidos: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { clientes } = useClientes();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [asesorId, setAsesorId] = useState(user?.uid || "");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [estado, setEstado] = useState<Pedido["estado"]>("Pendiente");
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState<Array<{ id: string; nombre: string; precio: number; cantidad: number }>>([
    { id: "I1", nombre: "", precio: 0, cantidad: 1 },
  ]);
  const [statusValue, setStatusValue] = useState<Pedido["estado"]>("Pendiente");
  const [saving, setSaving] = useState(false);
  const asesorInicialRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ordersResult = await ordersApi.list({ asesorId: user?.uid });
        console.log("ORDERS_RESULT_ASESOR", ordersResult);
        console.log("ORDERS_RESULT_ASESOR_JSON", JSON.stringify(ordersResult));
        setPedidos(ordersResult.pedidos ?? []);
        if (!asesorInicialRef.current) {
          setAsesorId(user?.uid || "");
          asesorInicialRef.current = true;
        }
      } catch (error) {
        console.error("ERROR_LOADING_ASESOR_PEDIDOS", error);
        toast.error("No se pudieron cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };
    if (user?.uid) {
      void load();
    }
  }, [user?.uid, user?.name]);

  const filteredPedidos = useMemo(() => {
    const base = pedidos.filter((p) => p.estado !== "Entregado" && p.estado !== "Rechazado");
    return base.filter(
      (p) =>
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.cliente.toLowerCase().includes(search.toLowerCase()),
    );
  }, [pedidos, search]);

  const resetForm = () => {
    setClienteId("");
    setAsesorId(user?.uid || "");
    setFecha(new Date().toISOString().slice(0, 10));
    setEstado("Pendiente");
    setObservaciones("");
    setItems([{ id: "I1", nombre: "", precio: 0, cantidad: 1 }]);
    setEditingId(null);
    setFormError("");
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (pedido: Pedido) => {
    setEditingId(pedido.id);
    setClienteId(pedido.clienteId || "");
    setAsesorId(pedido.asesorId || user?.uid || "");
    setFecha(pedido.fecha);
    setEstado(pedido.estado);
    setObservaciones(pedido.observaciones || "");
    setItems(
      (pedido.itemsList ?? []).map((it, idx) => ({
        id: `I${idx + 1}-${Date.now()}`,
        nombre: it.nombre,
        precio: it.precio,
        cantidad: it.cantidad,
      }))
    );
    setFormError("");
    setIsFormOpen(true);
  };

  const openDetail = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsDetailOpen(true);
  };

  const openStatus = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setStatusValue(pedido.estado);
    setIsStatusOpen(true);
  };

  const openDelete = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsDeleteOpen(true);
  };

  const savePedido = async () => {
    setFormError("");
    const itemsValidos = items.filter((it) => it.nombre.trim() && it.cantidad > 0);
    if (itemsValidos.length === 0) {
      setFormError("Debes agregar al menos un producto al pedido");
      return;
    }
    if (!clienteId) {
      setFormError("Selecciona un cliente");
      return;
    }

    setSaving(true);
    try {
      const itemsList = itemsValidos.map((it) => ({
        nombre: it.nombre,
        precio: it.precio,
        cantidad: it.cantidad,
      }));

      if (editingId) {
        const actualizado = await ordersApi.updateOrderFull(editingId, {
          clienteId,
          asesorId: asesorId || undefined,
          prioridad: undefined,
          observaciones: observaciones || undefined,
          itemsList,
        });
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...actualizado,
                  cliente: clientes.find((c) => c.id === clienteId)?.nombre || actualizado.cliente,
                  asesor: user?.name || actualizado.asesor,
                  items: itemsValidos.length,
                  total: actualizado.total,
                  fecha,
                }
              : p
          )
        );
        toast.success(`Pedido ${actualizado.id} actualizado`);
      } else {
        const resultado = await ordersApi.create({
          clienteId,
          asesorId: asesorId || undefined,
          itemsList,
          prioridad: undefined,
          observaciones: observaciones || undefined,
        });
        setPedidos((prev) => [resultado.pedido, ...prev]);
        toast.success(`Pedido ${resultado.pedido.id} creado correctamente`);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      toast.error("No fue posible guardar el pedido.");
    } finally {
      setSaving(false);
    }
  };

  const saveStatus = async () => {
    if (!selectedPedido) return;
    try {
      const actualizado = await ordersApi.updateStatus(
        selectedPedido.id,
        statusValue,
      );
      setPedidos((prev) =>
        prev.map((p) => (p.id === selectedPedido.id ? actualizado : p)),
      );
      toast.success(`Pedido ${actualizado.id} marcado como ${statusValue}`);
      setIsStatusOpen(false);
      setSelectedPedido(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('401') || message.includes('No autorizado') || message.includes('Unauthorized')) {
        toast.error('Tu sesión expiró o no es válida. Inicia sesión nuevamente.');
        useAuthStore.getState().logout();
      } else {
        toast.error('No se pudo actualizar el estado');
      }
    }
  };

  const updateItem = (id: string, field: "nombre" | "precio" | "cantidad", value: string | number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `I${prev.length + 1}-${Date.now()}`, nombre: "", precio: 0, cantidad: 1 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  };

  const subtotal = items.reduce((sum, it) => sum + it.precio * it.cantidad, 0);
  const totalItems = items.reduce((sum, it) => sum + it.cantidad, 0);

  const confirmDelete = async () => {
    if (!selectedPedido) return;
    try {
      await ordersApi.delete(selectedPedido.id);
      setPedidos((prev) => prev.filter((p) => p.id !== selectedPedido.id));
      toast.success(`Pedido ${selectedPedido.id} eliminado`);
    } catch {
      toast.error("No se pudo eliminar el pedido");
    } finally {
      setIsDeleteOpen(false);
      setSelectedPedido(null);
    }
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Pedidos</h1>
          <p className={s.pageSubtitle}>Gestión de tus pedidos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Nuevo Pedido
        </Button>
      </div>

      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={16} className={s.searchIcon} />
          <input
            type="text"
            placeholder="Buscar pedidos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {loading ? "Cargando pedidos..." : "No hay pedidos"}
                </td>
              </tr>
            ) : (
              filteredPedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className={s.tdMono}>{pedido.id}</td>
                  <td className={s.tdPrimary}>{pedido.cliente}</td>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.items}</td>
                  <td>{pedido.total}</td>
                  <td>
                    <Badge variant={orderStatuses[pedido.estado]}>
                      {pedido.estado}
                    </Badge>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <Tooltip title="Ver detalle">
                        <button
                          className={s.actionBtn}
                          onClick={() => openDetail(pedido)}
                        >
                          Ver
                        </button>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <button
                          className={s.actionBtn}
                          onClick={() => openEdit(pedido)}
                        >
                          Editar
                        </button>
                      </Tooltip>
                      <Tooltip title="Cambiar estado">
                        <button
                          className={s.actionBtn}
                          onClick={() => openStatus(pedido)}
                        >
                          Estado
                        </button>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <button
                          className={s.actionBtn}
                          onClick={() => openDelete(pedido)}
                        >
                          Eliminar
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DetailModal
        children={null}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedPedido ? `Pedido ${selectedPedido.id}` : "Pedido"}
        subtitle={selectedPedido?.fecha}
        size="xl"
        header={{
          icon: <Archive size={18} />,
          status: selectedPedido ? (
            <Badge variant={orderStatuses[selectedPedido.estado]}>
              {selectedPedido.estado}
            </Badge>
          ) : undefined,
        }}
        kpis={
          selectedPedido
            ? [
                {
                  label: "Cliente",
                  value: selectedPedido.cliente,
                  icon: <Archive size={16} />,
                },
                {
                  label: "Total",
                  value: selectedPedido.total,
                  icon: <CreditCard size={16} />,
                  monospace: true,
                },
                {
                  label: "Prioridad",
                  value: selectedPedido.prioridad || "Estándar",
                  icon: <AlertTriangle size={16} />,
                },
              ]
            : undefined
        }
        sections={[
          {
            title: "Detalle comercial",
            fields: [
              {
                label: "Asesor asignado",
                value: selectedPedido?.asesor,
                icon: <Archive size={16} />,
              },
              {
                label: "Cantidad de artículos",
                value: selectedPedido?.items,
                icon: <Package size={16} />,
              },
              {
                label: "Observaciones",
                value: selectedPedido?.observaciones || "Sin observaciones",
                fullWidth: true,
                icon: <AlertTriangle size={16} />,
              },
            ],
          },
          {
            title: "Artículos",
            children: (
              <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
                <table className="min-w-full text-sm">
                  <thead className="bg-[var(--color-bg-elevated)] text-left text-[var(--color-text-secondary)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Referencia</th>
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 font-medium text-right">
                        Precio
                      </th>
                      <th className="px-4 py-3 font-medium text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPedido?.itemsList || []).map((item, index) => (
                      <tr
                        key={`${item.nombre}-${index}`}
                        className="border-t border-[var(--color-border)]"
                      >
                        <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">
                          REF-{String(index + 1).padStart(3, "0")}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-primary)]">
                          {item.nombre}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-text-primary)]">
                          {item.cantidad}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-text-primary)]">
                          ${item.precio.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[var(--color-text-primary)]">
                          ${(item.cantidad * item.precio).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ),
          },
          ...(selectedPedido?.comprobantePagoUrl
            ? [
                {
                  title: "Comprobante de pago",
                  children: (
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
                      <a href={selectedPedido.comprobantePagoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline">
                        <Eye size={14} />
                        Ver comprobante
                      </a>
                      <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
                        <img src={selectedPedido.comprobantePagoUrl} alt="Comprobante de pago" className="max-h-64 w-full object-contain" />
                      </div>
                    </div>
                  ),
                }
              ]
            : []),
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
              Cerrar
            </Button>
            {selectedPedido && (
              <Button
                onClick={() => {
                  setIsDetailOpen(false);
                  openStatus(selectedPedido);
                }}
              >
                Cambiar estado
              </Button>
            )}
          </div>
        }
      />

      <DetailModal
        children={null}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        title={editingId ? "Editar Pedido" : "Crear Nuevo Pedido"}
        subtitle={
          editingId
            ? "Actualiza los datos del pedido"
            : "Registra un pedido para tus clientes"
        }
        size="xl"
        sections={[
          {
            title: "Información general",
            children: (
              <div className="grid gap-4">
                {formError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {formError}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Cliente *
                    <select
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                      value={clienteId}
                      onChange={(e) => setClienteId(e.target.value)}
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Asesor *
                    <select
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                      value={asesorId}
                      onChange={(e) => setAsesorId(e.target.value)}
                    >
                      <option value="">Selecciona un asesor</option>
                      <option value={user?.uid || ""}>{user?.name || "Yo"}</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Fecha *
                    <input
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Estado *
                    <select
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                      value={estado}
                      onChange={(e) =>
                        setEstado(e.target.value as Pedido["estado"])
                      }
                    >
                      {(
                        [
                          "Pendiente",
                          "Aceptado",
                          "En proceso",
                          "Enviado",
                          "Entregado",
                          "Rechazado",
                        ] as Pedido["estado"][]
                      ).map((es) => (
                        <option key={es} value={es}>
                          {es}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ),
          },
          {
            title: "Productos del pedido",
            children: (
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                  Productos del pedido
                </label>
                <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[var(--color-bg-elevated)] text-left text-[var(--color-text-secondary)]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Descripción</th>
                        <th className="px-4 py-3 font-medium text-right">Cant.</th>
                        <th className="px-4 py-3 font-medium text-right">Precio unit.</th>
                        <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => {
                        const sub = it.precio * it.cantidad;
                        return (
                          <tr key={it.id} className="border-t border-[var(--color-border)]">
                            <td>
                              <input
                                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                                value={it.nombre}
                                onChange={(e) =>
                                  updateItem(it.id, "nombre", e.target.value)
                                }
                                placeholder="Producto"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                                type="number"
                                min="1"
                                value={it.cantidad}
                                onChange={(e) =>
                                  updateItem(it.id, "cantidad", Number(e.target.value))
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                                type="number"
                                min="0"
                                value={it.precio}
                                onChange={(e) =>
                                  updateItem(it.id, "precio", Number(e.target.value))
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-[var(--color-text-primary)]">
                              ${sub.toLocaleString()}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                                onClick={() => removeItem(it.id)}
                                aria-label="Eliminar producto"
                                disabled={items.length === 1}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  onClick={addItem}
                >
                  <Plus size={14} />
                  Agregar producto
                </button>
                <div className="flex justify-end gap-4 text-sm">
                  <span className="text-[var(--color-text-secondary)]">Total de items: <strong>{totalItems}</strong></span>
                  <span className="font-semibold text-[var(--color-text-primary)]">Total pedido: <strong>${subtotal.toLocaleString()}</strong></span>
                </div>
              </div>
            ),
          },
          {
            title: "Observaciones",
            children: (
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                Observaciones
                <textarea
                  className="min-h-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas del pedido..."
                  rows={2}
                />
              </label>
            ),
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={savePedido}>
              {editingId ? "Guardar cambios" : "Crear pedido"}
            </Button>
          </div>
        }
      />

      <DetailModal
        children={null}
        open={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        title="Cambiar estado del pedido"
        subtitle={selectedPedido ? `Pedido ${selectedPedido.id}` : undefined}
        sections={[
          {
            title: "Nuevo estado",
            children: (
              <label className="grid gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                Estado
                <select
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--border-focus)]"
                  value={statusValue}
                  onChange={(e) =>
                    setStatusValue(e.target.value as Pedido["estado"])
                  }
                >
                  <option value="">Selecciona un estado</option>
                  {(ESTADOS_PEDIDO_PERMITIDOS[statusValue] ?? []).map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
                {(ESTADOS_PEDIDO_PERMITIDOS[statusValue] ?? []).length === 0 && (
                  <span className="text-xs text-red-400">Este pedido no puede cambiar de estado.</span>
                )}
              </label>
            ),
          },
        ]}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsStatusOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveStatus} disabled={(ESTADOS_PEDIDO_PERMITIDOS[statusValue] ?? []).length === 0}>Aplicar cambio</Button>
          </div>
        }
      />

      <ConfirmationModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar pedido"
        description={`¿Estás seguro de eliminar el pedido ${selectedPedido?.id}? Esta acción no se puede deshacer.`}
        variant="danger"
        confirmLabel="Eliminar pedido"
      />
    </div>
  );
};
