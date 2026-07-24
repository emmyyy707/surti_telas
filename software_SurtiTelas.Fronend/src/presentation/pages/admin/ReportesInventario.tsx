import React, { useState, useEffect } from 'react';
import { Search, TrendingDown, Package, AlertTriangle, BarChart3, Download, ChevronDown } from 'lucide-react';
import s from './ReportesInventario.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { reportsApi, type InventoryReport } from '@/infrastructure/api/reportsApi';
import { PERIODOS_REPORTE_INVENTARIO } from '@/shared/constants/options';

interface ProductoReporte {
  id: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  costoUnitario: number | null;
  precioVenta: number | null;
  rotacion: 'Alta' | 'Media' | 'Baja';
  valorInventario: number | null;
  ultimaEntrada: string;
}

const mapRotacion = (stock: number, minimo: number): 'Alta' | 'Media' | 'Baja' => {
  if (stock === 0) return 'Baja';
  if (stock < minimo) return 'Media';
  return 'Alta';
};

export const AdminReportesInventario: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [periodo, setPeriodo] = useState<string>('ultimo_mes');
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportsApi.getInventoryReport();
        setReport(data);
      } catch {
        setError('No se pudo cargar el reporte de inventario');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  type CategoriaNormalizada = { nombre: string; productos: number };
  type CategoriaApi = { categoriaId?: string | null; nombre?: string | null; categoria?: string; cantidad?: number; productos?: number };
  const categoriasSource = report?.categories ?? report?.stockByCategory ?? [];
  const categoriasReporte: CategoriaNormalizada[] = categoriasSource.map((c: CategoriaApi) => ({
    nombre: c.nombre ?? c.categoria ?? '',
    productos: c.productos ?? c.cantidad ?? 0,
  }));

  const productos: ProductoReporte[] = categoriasReporte.map((cat, index) => {
    const nombreCat = cat.nombre;
    const stockActual = Math.max(cat.productos, 0);
    const stockMinimo = Math.max(stockActual, 1);
    const stockMaximo = Math.max(stockActual, stockMinimo, 1);
    const ultimaEntrada = report?.recentMovements?.[index]?.fecha ?? '';

    return {
      id: `${nombreCat}-${index}`,
      nombre: nombreCat,
      categoria: nombreCat,
      stockActual,
      stockMinimo,
      stockMaximo,
      costoUnitario: null,
      precioVenta: null,
      rotacion: mapRotacion(stockActual, Math.max(stockMinimo, 1)),
      valorInventario: null,
      ultimaEntrada,
    };
  });

  const categorias = Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)));

  const productosFiltrados = productos.filter(p =>
    (filtroCategoria === 'Todos' || p.categoria === filtroCategoria) &&
    (p.nombre.toLowerCase().includes(search.toLowerCase()) ||
     p.categoria.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    valorTotal: null as number | null,
    productosActivos: report?.totalProducts || 0,
    productosBajos: report?.lowStockProducts ?? report?.lowStock ?? 0,
    productosSinStock: report?.outOfStockProducts ?? report?.agotado ?? 0,
  };

  const rotacionStats = {
    alta: productos.filter(p => p.rotacion === 'Alta').length,
    media: productos.filter(p => p.rotacion === 'Media').length,
    baja: productos.filter(p => p.rotacion === 'Baja').length,
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  };

  const getRotacionBadge = (rotacion: string) => {
    switch (rotacion) {
      case 'Alta': return 'success';
      case 'Media': return 'warning';
      case 'Baja': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className={s.header}><p>Cargando reporte de inventario...</p></div>;
  }

  if (error) {
    return <div className={s.header}><p className="text-red-500">{error}</p></div>;
  }

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Reportes de Inventario</h1>
          <p className={s.pageSubtitle}>Análisis de stock</p>
        </div>
        <div className={s.headerActions}>
          <div className={s.periodoSelect}>
            <select className={s.select} value={periodo} onChange={e => setPeriodo(e.target.value)}>
              {PERIODOS_REPORTE_INVENTARIO.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className={s.selectIcon} />
          </div>
          <Button variant="secondary" leftIcon={<Download size={16} />}>
            Exportar
          </Button>
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <BarChart3 size={20} className={s.statIcon} />
          <div>
            <div className={s.statValue}>{stats.valorTotal !== null ? formatCurrency(stats.valorTotal) : '—'}</div>
            <div className={s.statLabel}>Valor Total Inventario</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardSuccess}`}>
          <Package size={20} className={s.statIconSuccess} />
          <div>
            <div className={s.statValue}>{stats.productosActivos}</div>
            <div className={s.statLabel}>Productos Activos</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardWarning}`}>
          <AlertTriangle size={20} className={s.statIconWarning} />
          <div>
            <div className={s.statValue}>{stats.productosBajos}</div>
            <div className={s.statLabel}>Stock Bajo</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardDanger}`}>
          <TrendingDown size={20} className={s.statIconDanger} />
          <div>
            <div className={s.statValue}>{stats.productosSinStock}</div>
            <div className={s.statLabel}>Sin Stock</div>
          </div>
        </div>
      </div>

      <div className={s.chartsRow}>
        <div className={s.chartCard}>
          <h3 className={s.chartTitle}>Movimientos recientes</h3>
          <div className={s.barChart}>
            {report?.recentMovements && report.recentMovements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.recentMovements.slice(0, 5).map((mov, i) => (
                  <div key={mov.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--color-text-primary)' }}>
                    <span>{mov.tipo}</span>
                    <span>{mov.cantidad}</span>
                  </div>
                ))}
              </div>
            ) : report?.stockMovements && report.stockMovements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.stockMovements.slice(0, 5).map((mov, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--color-text-primary)' }}>
                    <span>{mov.tipo}</span>
                    <span>{mov.cantidad}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>No hay movimientos recientes disponibles</p>
            )}
          </div>
        </div>

        <div className={s.chartCard}>
          <h3 className={s.chartTitle}>Rotación de Inventario</h3>
          <div className={s.rotacionChart}>
            <div className={s.rotacionItem}>
              <div className={`${s.rotacionDot} ${s.rotacionDotAlta}`} />
              <div className={s.rotacionData}>
                <div className={s.rotacionValue}>{rotacionStats.alta}</div>
                <div className={s.rotacionLabel}>Alta Rotación</div>
              </div>
            </div>
            <div className={s.rotacionItem}>
              <div className={`${s.rotacionDot} ${s.rotacionDotMedia}`} />
              <div className={s.rotacionData}>
                <div className={s.rotacionValue}>{rotacionStats.media}</div>
                <div className={s.rotacionLabel}>Media Rotación</div>
              </div>
            </div>
            <div className={s.rotacionItem}>
              <div className={`${s.rotacionDot} ${s.rotacionDotBaja}`} />
              <div className={s.rotacionData}>
                <div className={s.rotacionValue}>{rotacionStats.baja}</div>
                <div className={s.rotacionLabel}>Baja Rotación</div>
              </div>
            </div>
          </div>
          <div className={s.rotacionBars}>
            <div className={s.rotacionBarRow}>
              <span className={s.rotacionBarLabel}>Alta</span>
              <div className={s.rotacionBarTrack}>
                <div className={s.rotacionBarFillAlta} style={{ width: `${productos.length > 0 ? (rotacionStats.alta / productos.length) * 100 : 0}%` }} />
              </div>
              <span className={s.rotacionBarPercent}>{productos.length > 0 ? Math.round((rotacionStats.alta / productos.length) * 100) : 0}%</span>
            </div>
            <div className={s.rotacionBarRow}>
              <span className={s.rotacionBarLabel}>Media</span>
              <div className={s.rotacionBarTrack}>
                <div className={s.rotacionBarFillMedia} style={{ width: `${productos.length > 0 ? (rotacionStats.media / productos.length) * 100 : 0}%` }} />
              </div>
              <span className={s.rotacionBarPercent}>{productos.length > 0 ? Math.round((rotacionStats.media / productos.length) * 100) : 0}%</span>
            </div>
            <div className={s.rotacionBarRow}>
              <span className={s.rotacionBarLabel}>Baja</span>
              <div className={s.rotacionBarTrack}>
                <div className={s.rotacionBarFillBaja} style={{ width: `${productos.length > 0 ? (rotacionStats.baja / productos.length) * 100 : 0}%` }} />
              </div>
              <span className={s.rotacionBarPercent}>{productos.length > 0 ? Math.round((rotacionStats.baja / productos.length) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.tableSection}>
        <div className={s.tableHeader}>
          <h3 className={s.tableTitle}>Detalle de Productos</h3>
          <div className={s.tableFilters}>
            <div className={s.filterGroup}>
              {['Todos', ...categorias].map(cat => (
                <button
                  key={cat}
                  className={`${s.filterBtn} ${filtroCategoria === cat ? s.filterBtnActive : ''}`}
                  onClick={() => setFiltroCategoria(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={s.searchBox}>
              <Search size={16} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={s.searchInput}
              />
            </div>
          </div>
        </div>

        <DataTable<ProductoReporte>
          data={productosFiltrados}
          pageSize={10}
          emptyMessage="Sin resultados"
          maxVisibleColumns={5}
          detailPanel={{
            title: (p) => p.nombre,
            render: (p) => (
              <div className={s.detailPanel}>
                <div className={s.detailSection}>
                  <h4 className={s.detailSectionTitle}>Información del producto</h4>
                  <div className={s.detailGrid}>
                    <div className={s.detailItem}><span className={s.detailLabel}>Categoría</span><span><Badge variant="default">{p.categoria}</Badge></span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Stock actual</span><span>{p.stockActual}</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Stock mínimo</span><span>{p.stockMinimo}</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Stock máximo</span><span>{p.stockMaximo}</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Costo unitario</span><span>{p.costoUnitario !== null ? formatCurrency(p.costoUnitario) : '—'}</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Precio venta</span><span>{p.precioVenta !== null ? formatCurrency(p.precioVenta) : '—'}</span></div>
                  </div>
                </div>
                <div className={s.detailSection}>
                  <h4 className={s.detailSectionTitle}>Valores y rotación</h4>
                  <div className={s.detailGrid}>
                    <div className={s.detailItem}><span className={s.detailLabel}>Valor inventario</span><span className={s.tdBold}>{p.valorInventario !== null ? formatCurrency(p.valorInventario) : '—'}</span></div>
                    <div className={s.detailItem}><span className={s.detailLabel}>Rotación</span><span><Badge variant={getRotacionBadge(p.rotacion)}>{p.rotacion}</Badge></span></div>
                    <div className={s.detailItemFull}><span className={s.detailLabel}>Última entrada</span><span>{p.ultimaEntrada || '—'}</span></div>
                  </div>
                </div>
              </div>
            ),
          }}
          columns={[
            { key: 'nombre', header: 'Producto', sortable: true, render: (p) => <span className={s.tdPrimary}>{p.nombre}</span> },
            { key: 'stockActual', header: 'Stock', width: '100px', sortable: true, align: 'center', render: (p) => {
              const porcentajeStock = Math.min((p.stockActual / p.stockMaximo) * 100, 100);
              return (
                <div className={s.tdCenter}>
                  <div className={s.stockCell}>
                    <span className={s.stockValue}>{p.stockActual}</span>
                    <div className={s.stockBar}>
                      <div
                        className={`${s.stockFill} ${porcentajeStock < 25 ? s.stockFillDanger : porcentajeStock < 50 ? s.stockFillWarning : s.stockFillSuccess}`}
                        style={{ width: `${porcentajeStock}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            }},
            { key: 'rotacion', header: 'Rotación', width: '100px', sortable: true, render: (p) => (
              <Badge variant={getRotacionBadge(p.rotacion)}>{p.rotacion}</Badge>
            )},
            { key: 'precioVenta', header: 'Precio', width: '110px', sortable: true, align: 'right', render: (p) => <span className={s.tdRight}>{p.precioVenta !== null ? formatCurrency(p.precioVenta) : '—'}</span> },
            { key: 'ultimaEntrada', header: 'Última Entrada', width: '110px', sortable: true, render: (p) => (
              <span className={s.tdMuted}>{p.ultimaEntrada || '—'}</span>
            )},
          ]}
        />
      </div>
    </div>
  );
};
