import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminReportes: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/admin/reportes-ventas', { replace: true });
  }, [navigate]);
  return null;
};
