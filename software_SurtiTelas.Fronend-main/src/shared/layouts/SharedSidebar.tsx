import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import type { SidebarItem, SidebarUser } from './Sidebar';

export type SharedSidebarItem = SidebarItem;
export type SharedSidebarUser = SidebarUser;

export interface SharedSidebarProps {
  menu: SharedSidebarItem[];
  basePath: string;
  logo: string;
  brandName: string;
  panelLabel: string;
  user: SharedSidebarUser;
  onLogout: () => void;
  showCollapse?: boolean;
  roleBadge?: string;
  headerActions?: ReactNode;
  className?: string;
}

export { Sidebar as SharedSidebar };
