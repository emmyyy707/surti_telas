import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import s from './PerfilCliente.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { Tooltip } from '@/shared/components/Tooltip';
import { Edit2, Plus } from 'lucide-react';
import { authApi } from '@/infrastructure/api/authApi';
import { useAuthStore } from '@/core/stores/authStore';
import { isValidPhone } from '@/shared/utils/phone';

interface Direccion {
  id: number;
  label: string;
  texto: string;
  ciudad: string;
  barrio: string;
  indicaciones: string;
}

const DOCUMENT_TYPES = [
  'DNI',
  'Cédula',
  'Pasaporte',
  'RUC',
  'Carné de extranjería',
];

const emptyDireccion: Omit<Direccion, 'id'> = {
  label: '',
  texto: '',
  ciudad: '',
  barrio: '',
  indicaciones: '',
};

export const PerfilCliente: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccionPerfil, setDireccionPerfil] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionModal, setDireccionModal] = useState<{ open: boolean; mode: 'crear' | 'editar'; direccion?: Direccion }>({ open: false, mode: 'crear' });
  const [direccionDraft, setDireccionDraft] = useState<Omit<Direccion, 'id'>>(emptyDireccion);
  const [deleteDireccion, setDeleteDireccion] = useState<Direccion | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const profile = await authApi.me();
        setNombre(profile.nombre);
        setTelefono(profile.telefono ?? '');
        setDireccionPerfil(profile.direccion ?? '');
        setTipoDocumento(profile.tipoDocumento ?? '');
        setNumeroDocumento(profile.numeroDocumento ?? '');
        setEmail(profile.email);
      } catch {
        toast.error('No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const abrirCrearDireccion = () => {
    setDireccionDraft(emptyDireccion);
    setDireccionModal({ open: true, mode: 'crear' });
  };

  const abrirEditarDireccion = (direccion: Direccion) => {
    setDireccionDraft({
      label: direccion.label,
      texto: direccion.texto,
      ciudad: direccion.ciudad,
      barrio: direccion.barrio,
      indicaciones: direccion.indicaciones,
    });
    setDireccionModal({ open: true, mode: 'editar', direccion });
  };

  const guardarDireccion = () => {
    if (!direccionDraft.label.trim() || !direccionDraft.texto.trim() || !direccionDraft.ciudad.trim()) {
      toast.error('Label, dirección y ciudad son obligatorios.');
      return;
    }

    if (direccionModal.mode === 'editar' && direccionModal.direccion) {
      setDirecciones(prev => prev.map(item => item.id === direccionModal.direccion?.id ? { ...item, ...direccionDraft } : item));
      toast.success('Dirección actualizada');
    } else {
      const nuevaDireccion: Direccion = { id: Math.max(0, ...direcciones.map(item => item.id)) + 1, ...direccionDraft };
      setDirecciones(prev => [...prev, nuevaDireccion]);
      toast.success('Dirección agregada');
    }
    setDireccionModal({ open: false, mode: 'crear' });
    setDireccionDraft(emptyDireccion);
  };

  const confirmarEliminarDireccion = () => {
    if (!deleteDireccion) return;
    setDirecciones(prev => prev.filter(item => item.id !== deleteDireccion.id));
    toast.success('Dirección eliminada');
    setDeleteDireccion(null);
  };

  const validarPerfil = () => {
    setFormError('');
    if (!nombre.trim()) {
      setFormError('El nombre y apellido son obligatorios.');
      return false;
    }
    if (!email.trim()) {
      setFormError('El correo electrónico es obligatorio.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Ingresa un correo válido.');
      return false;
    }
    if (!tipoDocumento.trim()) {
      setFormError('El tipo de documento es obligatorio.');
      return false;
    }
    if (!numeroDocumento.trim()) {
      setFormError('El número de documento es obligatorio.');
      return false;
    }
    if (!isValidPhone(telefono)) {
      setFormError('Ingresa un teléfono válido.');
      return false;
    }
    if (password && password !== passwordConfirm) {
      setFormError('La contraseña y su confirmación deben coincidir.');
      return false;
    }
    return true;
  };

  const guardarCambios = async () => {
    if (!validarPerfil()) return;
    setSaving(true);
    try {
      const payload: Parameters<typeof authApi.updateProfile>[0] = {
        nombre,
        telefono,
        email,
        direccion: direccionPerfil,
        tipoDocumento,
        numeroDocumento,
      };
      if (password) {
        payload.password = password;
      }
      const updated = await authApi.updateProfile(payload);
      if (user) {
        useAuthStore.setState({ user: { ...user, name: updated.nombre, email: updated.email } });
      }
      toast.success('Cambios guardados correctamente');
      setPassword('');
      setPasswordConfirm('');
    } catch {
      toast.error('No fue posible guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const abrirEditarAvatar = () => {
    setAvatarDraft(avatarUrl);
    setAvatarModalOpen(true);
  };

  const guardarAvatar = () => {
    setAvatarUrl(avatarDraft.trim());
    setAvatarModalOpen(false);
    toast.success('Foto de perfil actualizada');
  };

  if (loading) {
    return <div className={s.pageTitle}>Cargando perfil...</div>;
  }

  return (
    <div className={s.pageContainer}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Mi perfil</h1>
          <p className={s.pageSubtitle}>Actualiza tu información personal y administra tus direcciones.</p>
        </div>
        <div className={s.headerBadgeRow}>
          <Badge variant="success" dot>Cliente</Badge>
        </div>
      </div>

      <div className={s.perfilLayout}>
        <aside className={s.perfilCard}>
          <div className={s.avatar}>
            {nombre ? nombre.charAt(0).toUpperCase() : 'U'}
            <Tooltip title="Cambiar foto">
              <button className={s.avatarEditBtn} type="button" onClick={abrirEditarAvatar}>
                <Edit2 size={14} />
              </button>
            </Tooltip>
          </div>
          <div className={s.perfilName}>{nombre}</div>
          <div className={s.perfilEmail}>{email}</div>
          <div className={s.rolTag}>
            <Badge variant="success" dot>Cliente</Badge>
          </div>
          <div className={s.cardSummary}>
            <div className={s.summaryItem}>
              <span>Teléfono</span>
              <strong>{telefono || '-'}</strong>
            </div>
            <div className={s.summaryItem}>
              <span>Documento</span>
              <strong>{tipoDocumento ? `${tipoDocumento} · ${numeroDocumento}` : '-'}</strong>
            </div>
            <div className={s.summaryItem}>
              <span>Dirección</span>
              <strong>{direccionPerfil || '-'}</strong>
            </div>
          </div>
        </aside>

        <section className={s.perfilForm}>
          <div className={s.perfilSection}>
            <div className={s.perfilSectionHeader}>
              <div className={s.perfilSectionTitle}>Información personal</div>
              <div className={s.sectionNote}>Tus datos se utilizan para tus pedidos y factura.</div>
            </div>
            <div className={s.perfilSectionBody}>
              <div className={s.formGrid2}>
                <div className={s.formField}>
                  <label className={s.formLabel}>Nombre completo</label>
                  <input
                    type="text"
                    className={s.formInput}
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                  />
                </div>
                <div className={s.formField}>
                  <label className={s.formLabel}>Correo electrónico</label>
                  <input
                    type="email"
                    className={s.formInput}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className={s.formGrid2}>
                <div className={s.formField}>
                  <label className={s.formLabel}>Teléfono</label>
                  <input
                    type="text"
                    className={s.formInput}
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                  />
                </div>
                <div className={s.formField}>
                  <label className={s.formLabel}>Dirección</label>
                  <input
                    type="text"
                    className={s.formInput}
                    value={direccionPerfil}
                    onChange={e => setDireccionPerfil(e.target.value)}
                  />
                </div>
              </div>
              <div className={s.formGrid2}>
                <div className={s.formField}>
                  <label className={s.formLabel}>Tipo de documento</label>
                  <select
                    className={s.formInput}
                    value={tipoDocumento}
                    onChange={e => setTipoDocumento(e.target.value)}
                  >
                    <option value="">Selecciona un documento</option>
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className={s.formField}>
                  <label className={s.formLabel}>Número de documento</label>
                  <input
                    type="text"
                    className={s.formInput}
                    value={numeroDocumento}
                    onChange={e => setNumeroDocumento(e.target.value)}
                  />
                </div>
              </div>
              <div className={s.formGrid2}>
                <div className={s.formField}>
                  <label className={s.formLabel}>Contraseña nueva</label>
                  <input
                    type="password"
                    className={s.formInput}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Dejar en blanco para no cambiar"
                  />
                </div>
                <div className={s.formField}>
                  <label className={s.formLabel}>Confirmar contraseña</label>
                  <input
                    type="password"
                    className={s.formInput}
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={s.perfilSection}>
            <div className={s.perfilSectionHeader}>
              <div className={s.perfilSectionTitle}>Direcciones</div>
              <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={abrirCrearDireccion}>
                Agregar dirección
              </Button>
            </div>
            <div className={s.perfilSectionBody}>
              {direcciones.length === 0 ? (
                <div className={s.emptyState}>No hay direcciones registradas aún.</div>
              ) : (
                <div className={s.direccionesList}>
                  {direcciones.map(direccion => (
                    <div key={direccion.id} className={s.direccionCard}>
                      <div className={s.direccionInfo}>
                        <div className={s.direccionLabel}>{direccion.label}</div>
                        <div className={s.direccionText}>{direccion.texto}</div>
                        <div className={s.direccionMeta}>{direccion.barrio} · {direccion.ciudad}</div>
                        {direccion.indicaciones && <div className={s.direccionMeta}>{direccion.indicaciones}</div>}
                      </div>
                      <div className={s.direccionActions}>
                        <Button variant="secondary" size="sm" onClick={() => abrirEditarDireccion(direccion)}>Editar</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteDireccion(direccion)}>Eliminar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {formError && (
            <div className={s.formError}>{formError}</div>
          )}

          <div className={s.formActions}>
            <Button onClick={guardarCambios} loading={saving}>
              Guardar cambios
            </Button>
          </div>
        </section>
      </div>

      <Modal open={direccionModal.open} onClose={() => setDireccionModal({ open: false, mode: 'crear' })} title={direccionModal.mode === 'editar' ? 'Editar dirección' : 'Nueva dirección'} size="md">
        <div className="grid gap-4">
          <div className={s.field}>
            <label className={s.label}>Label</label>
            <input className={s.input} value={direccionDraft.label} onChange={e => setDireccionDraft(prev => ({ ...prev, label: e.target.value }))} />
          </div>
          <div className={s.field}>
            <label className={s.label}>Dirección</label>
            <input className={s.input} value={direccionDraft.texto} onChange={e => setDireccionDraft(prev => ({ ...prev, texto: e.target.value }))} />
          </div>
          <div className={s.field}>
            <label className={s.label}>Ciudad</label>
            <input className={s.input} value={direccionDraft.ciudad} onChange={e => setDireccionDraft(prev => ({ ...prev, ciudad: e.target.value }))} />
          </div>
          <div className={s.field}>
            <label className={s.label}>Barrio</label>
            <input className={s.input} value={direccionDraft.barrio} onChange={e => setDireccionDraft(prev => ({ ...prev, barrio: e.target.value }))} />
          </div>
          <div className={s.field}>
            <label className={s.label}>Indicaciones</label>
            <textarea className={s.textarea} value={direccionDraft.indicaciones} onChange={e => setDireccionDraft(prev => ({ ...prev, indicaciones: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDireccionModal({ open: false, mode: 'crear' })}>Cancelar</Button>
            <Button onClick={guardarDireccion}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        open={!!deleteDireccion}
        onClose={() => setDeleteDireccion(null)}
        onConfirm={confirmarEliminarDireccion}
        title="Eliminar dirección"
        description={deleteDireccion ? `¿Estás seguro de eliminar la dirección "${deleteDireccion.label}"?` : ''}
      />

      <Modal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} title="Cambiar foto de perfil" size="sm">
        <div className="grid gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-3xl font-bold text-white">
              {nombre.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-[var(--color-text-primary)]">Imagen actual</div>
              <div className="text-sm text-[var(--color-text-secondary)]">{avatarUrl || 'No hay imagen cargada en esta sesión'}</div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAvatarModalOpen(false)}>Cancelar</Button>
            <Button onClick={guardarAvatar}>Aplicar foto</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
