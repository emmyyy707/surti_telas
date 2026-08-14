import React from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { BarChart3, DollarSign, Users2, Factory, Package } from 'lucide-react';
import s from './AdminReportesLayout.module.css';

const tabs = [
  { path: '/admin/reportes/ventas', label: 'Ventas', icon: BarChart3, end: true },
  { path: '/admin/reportes/finanzas', label: 'Finanzas', icon: DollarSign, end: true },
  { path: '/admin/reportes/usuarios', label: 'Usuarios', icon: Users2, end: true },
  { path: '/admin/reportes/produccion', label: 'Producción', icon: Factory, end: true },
  { path: '/admin/reportes/inventario', label: 'Inventario', icon: Package, end: true },
];

export const AdminReportesLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Dashboard de Reportes</h1>
          <p className={s.pageSubtitle}>Analítica y reportes consolidados</p>
        </div>
      </div>

      <div className={s.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.end
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive: active }) => `${s.tab} ${active ? s.tabActive : ''}`}
              end={tab.end}
            >
              <Icon size={16} />
              {tab.label}
            </NavLink>
          );
        })}
      </div>

      <div className={s.content}>
        <Outlet />
      </div>
    </div>
  );
};
