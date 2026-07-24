import { suppliersApi, type SupplierDTO } from './suppliersApi';
import { rawMaterialsApi, type RawMaterialDTO, type RawMaterial } from './rawMaterialsApi';
import { inventoryApi, type InventoryMovement, type StockAlert } from './inventoryApi';

export const stockApi = {
  suppliers: {
    list: suppliersApi.list,
    create: suppliersApi.create,
    update: suppliersApi.update,
    remove: suppliersApi.remove,
  },
  rawMaterials: {
    list: rawMaterialsApi.list,
    create: rawMaterialsApi.create,
    update: rawMaterialsApi.update,
    remove: rawMaterialsApi.remove,
  },
  movements: {
    list: inventoryApi.list,
    create: inventoryApi.create,
  },
  alerts: {
    list: inventoryApi.listAlerts,
  },
};

export type { SupplierDTO, RawMaterialDTO, RawMaterial, InventoryMovement, StockAlert };
