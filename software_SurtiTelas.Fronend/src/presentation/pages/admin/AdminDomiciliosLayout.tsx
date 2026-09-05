import React from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import s from './AdminDomiciliosLayout.module.css';

const tabs = [
  { path: '/admin/ruta-del-dia', label: 'Ruta del Día', icon: MapPin, end: true },
];

export const AdminDomiciliosLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Ruta del Día</h1>
          <p className={s.pageSubtitle}>Gestión de rutas de entrega</p>
        </div>
      </div>

      <div className={s.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const _isActive = tab.end
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
