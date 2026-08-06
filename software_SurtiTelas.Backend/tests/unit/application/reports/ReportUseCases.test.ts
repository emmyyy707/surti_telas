import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSalesReport } from '@/modules/reports/application/use-cases/GetSalesReport';
import { GetInventoryReport } from '@/modules/reports/application/use-cases/GetInventoryReport';
import { GetProductionReport } from '@/modules/reports/application/use-cases/GetProductionReport';
import { GetUsersReport } from '@/modules/reports/application/use-cases/GetUsersReport';

const mockReportRepository = {
  getSalesReport: vi.fn(),
  getInventoryReport: vi.fn(),
  getProductionReport: vi.fn(),
  getUsersReport: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GetSalesReport', () => {
  it('should return sales report from repository', async () => {
    const fakeReport = {
      totalSales: 1000000,
      totalOrders: 10,
      ordersByStatus: [{ estado: 'Pendiente', cantidad: 5 }],
      topProducts: [{ productId: 'p1', nombre: 'Camiseta', cantidad: 10, total: 500000 }],
      salesByAsesor: [{ asesorId: 'a1', asesorNombre: 'Juan', total: 500000, ordenes: 5 }],
    };

    mockReportRepository.getSalesReport.mockResolvedValue(fakeReport);

    const useCase = new GetSalesReport(mockReportRepository as any);
    const result = await useCase.execute({ from: '2024-01-01', to: '2024-01-31' });

    expect(result).toEqual(fakeReport);
    expect(mockReportRepository.getSalesReport).toHaveBeenCalledWith({ from: '2024-01-01', to: '2024-01-31' });
  });

  it('should return sales report without filters', async () => {
    const fakeReport = {
      totalSales: 0,
      totalOrders: 0,
      ordersByStatus: [],
      topProducts: [],
      salesByAsesor: [],
    };

    mockReportRepository.getSalesReport.mockResolvedValue(fakeReport);

    const useCase = new GetSalesReport(mockReportRepository as any);
    const result = await useCase.execute();

    expect(result).toEqual(fakeReport);
    expect(mockReportRepository.getSalesReport).toHaveBeenCalledWith(undefined);
  });
});

describe('GetInventoryReport', () => {
  it('should return inventory report from repository', async () => {
    const fakeReport = {
      totalProducts: 50,
      lowStock: 5,
      agotado: 2,
      stockMovements: [{ tipo: 'ENTRADA', cantidad: 100, movimientos: 10 }],
      categories: [{ categoriaId: 'c1', nombre: 'Camisetas', productos: 20 }],
    };

    mockReportRepository.getInventoryReport.mockResolvedValue(fakeReport);

    const useCase = new GetInventoryReport(mockReportRepository as any);
    const result = await useCase.execute();

    expect(result).toEqual(fakeReport);
    expect(mockReportRepository.getInventoryReport).toHaveBeenCalled();
  });
});

describe('GetProductionReport', () => {
  it('should return production report from repository', async () => {
    const fakeReport = {
      totalOrders: 15,
      ordersByEstado: [{ estado: 'EN_PROCESO', cantidad: 8 }],
      avancePromedio: 65,
      tardios: 2,
      porTaller: [{ tallerId: 't1', nombre: 'Taller Norte', ordenes: 8, avancePromedio: 70 }],
    };

    mockReportRepository.getProductionReport.mockResolvedValue(fakeReport);

    const useCase = new GetProductionReport(mockReportRepository as any);
    const result = await useCase.execute();

    expect(result).toEqual(fakeReport);
    expect(mockReportRepository.getProductionReport).toHaveBeenCalled();
  });
});

describe('GetUsersReport', () => {
  it('should return users report from repository with date range', async () => {
    const fakeReport = {
      totalUsers: 100,
      byRole: [{ role: 'CLIENTE', cantidad: 80 }],
      active: 90,
      inactive: 10,
      recentRegistrations: [],
    };

    mockReportRepository.getUsersReport.mockResolvedValue(fakeReport);

    const useCase = new GetUsersReport(mockReportRepository as any);
    const result = await useCase.execute({ from: '2024-01-01', to: '2024-01-31' });

    expect(result).toEqual(fakeReport);
    expect(mockReportRepository.getUsersReport).toHaveBeenCalledWith({ from: '2024-01-01', to: '2024-01-31' });
  });

  it('should return users report without filters', async () => {
    const fakeReport = {
      totalUsers: 100,
      byRole: [],
      active: 90,
      inactive: 10,
      recentRegistrations: [],
    };

    mockReportRepository.getUsersReport.mockResolvedValue(fakeReport);

    const useCase = new GetUsersReport(mockReportRepository as any);
    const result = await useCase.execute();

    expect(result).toEqual(fakeReport);
    expect(mockReportRepository.getUsersReport).toHaveBeenCalledWith(undefined);
  });
});
