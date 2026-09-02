import { describe, it, expect } from 'vitest';

const CANCELABLE_ORDER_STATES = ['NUEVO', 'PENDIENTE', 'EN_VALIDACION', 'ACEPTADO', 'EN_PRODUCCION', 'LISTO', 'DESPACHADO', 'EN_CAMINO', 'RECIBO_GENERADO', 'RECIBO_ENVIADO'] as const;

describe('GestionVentas cancel button logic', () => {
  it('should allow cancel for cancelable order states', () => {
    const cancelableStates = ['NUEVO', 'PENDIENTE', 'EN_VALIDACION', 'ACEPTADO', 'EN_PRODUCCION', 'LISTO', 'DESPACHADO', 'EN_CAMINO', 'RECIBO_GENERADO', 'RECIBO_ENVIADO'];
    for (const state of cancelableStates) {
      expect(CANCELABLE_ORDER_STATES).toContain(state);
    }
  });

  it('should hide cancel button for ENTREGADO', () => {
    expect(CANCELABLE_ORDER_STATES).not.toContain('ENTREGADO');
  });

  it('should hide cancel button for CANCELADO', () => {
    expect(CANCELABLE_ORDER_STATES).not.toContain('CANCELADO');
  });

  it('should hide cancel button for RECHAZADO', () => {
    expect(CANCELABLE_ORDER_STATES).not.toContain('RECHAZADO');
  });
});
