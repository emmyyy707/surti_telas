const DASHBOARD_ROUTES = ['/admin', '/asesor', '/cliente', '/domiciliario'];

export const isDashboardRoute = (pathname: string) =>
  DASHBOARD_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));