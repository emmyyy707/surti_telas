import { describe, it, expect } from 'vitest';
import { Workshop } from '@/modules/production/domain/entities/Workshop';

describe('Workshop', () => {
  it('should create a valid workshop', () => {
    const workshop = new Workshop({
      nombre: 'Taller Central',
      estado: 'ACTIVO',
      capacidad: 50,
    });

    expect(workshop.nombre).toBe('Taller Central');
    expect(workshop.estado).toBe('ACTIVO');
    expect(workshop.capacidad).toBe(50);
  });

  it('should throw error if nombre is empty', () => {
    expect(() => {
      new Workshop({
        nombre: '',
        estado: 'ACTIVO',
      });
    }).toThrow('El taller debe tener un nombre');
  });

  it('should activate workshop', () => {
    const workshop = new Workshop({
      nombre: 'Taller Test',
      estado: 'INACTIVO',
    });

    const activated = workshop.activate();
    expect(activated.estado).toBe('ACTIVO');
  });

  it('should deactivate workshop', () => {
    const workshop = new Workshop({
      nombre: 'Taller Test',
      estado: 'ACTIVO',
    });

    const deactivated = workshop.deactivate();
    expect(deactivated.estado).toBe('INACTIVO');
  });
});
