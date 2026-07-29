import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Building } from 'lucide-react';
import s from './AdminConfiguracion.module.css';
import { companyApi } from '@/infrastructure/api/companyApi';
import { adminContent } from '@/shared/config/adminContent';

interface ConfigSection {
  id: string;
  title: string;
  icon: React.ElementType;
  fields: { label: string; value: string; type: 'text' | 'email' | 'tel' | 'number' | 'select'; options?: string[] }[];
}

export const AdminConfiguracion: React.FC = () => {
  const [configSections, setConfigSections] = useState<ConfigSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const configContent = adminContent.configuration;

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const company = await companyApi.get();
        if (!active) return;
        const empresa: ConfigSection = {
          id: 'empresa',
          title: configContent.sectionTitle,
          icon: Building,
          fields: [
            { label: configContent.fields.nombre, value: company.nombre || configContent.fallbacks.unavailable, type: 'text' },
            { label: configContent.fields.email, value: company.email || configContent.fallbacks.unavailable, type: 'email' },
            { label: configContent.fields.telefono, value: company.telefono || configContent.fallbacks.unavailable, type: 'tel' },
            { label: configContent.fields.direccion, value: company.direccion || configContent.fallbacks.unavailable, type: 'text' },
            { label: configContent.fields.ciudad, value: company.ciudad || configContent.fallbacks.unavailable, type: 'text' },
            { label: configContent.fields.nit, value: company.nit || configContent.fallbacks.unavailable, type: 'text' },
            { label: configContent.fields.moneda, value: company.moneda || configContent.fallbacks.currency, type: 'text' },
          ],
        };
        setConfigSections([empresa]);
        const initialValues: Record<string, string> = {};
        empresa.fields.forEach(f => {
          initialValues[f.label.toLowerCase()] = f.value;
        });
        setFormValues(initialValues);
      } catch {
        if (active) setConfigSections([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [configContent]);

  const handleChange = (label: string, value: string) => {
    setFormValues(prev => ({ ...prev, [label.toLowerCase()]: value }));
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>{configContent.title}</h1>
          <p className={s.pageSubtitle}>{configContent.subtitle}</p>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 24, color: 'var(--color-text-muted)' }}>
          {configContent.loading}
        </div>
      )}

      {!loading && configSections.length === 0 && (
        <div style={{ padding: 24, color: 'var(--color-text-muted)' }}>
          {configContent.empty}
        </div>
      )}

      <div className={s.configGrid}>
        {configSections.map(section => (
          <div key={section.id} className={s.configCard}>
            <div className={s.configCardHeader}>
              <section.icon size={18} className={s.configCardIcon} />
              <h3 className={s.configCardTitle}>{section.title}</h3>
            </div>
            <div className={s.configCardBody}>
              {section.fields.map((field, i) => (
                <div key={i} className={s.field}>
                  <label className={s.label}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      className={s.select}
                      value={formValues[field.label.toLowerCase()] ?? field.value}
                      onChange={e => handleChange(field.label, e.target.value)}
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`${section.id}-field-${i}`}
                      type={field.type}
                      className={s.input}
                      value={formValues[field.label.toLowerCase()] ?? field.value}
                      onChange={e => handleChange(field.label, e.target.value)}
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={s.actionsBar}>
        <button className={s.saveBtn} onClick={async () => {
          try {
            await companyApi.update({
              nombre: formValues['nombre'] || undefined,
              email: formValues['email'] || undefined,
              telefono: formValues['teléfono'] || formValues['telefono'] || undefined,
              direccion: formValues['dirección'] || formValues['direccion'] || undefined,
              ciudad: formValues['ciudad'] || undefined,
              nit: formValues['nit'] || undefined,
              moneda: formValues['moneda'] || undefined,
            });
            toast.success(configContent.success);
          } catch {
            toast.error(configContent.error);
          }
        }}>
          <Save size={16} />
          {configContent.save}
        </button>
      </div>
    </div>
  );
};
