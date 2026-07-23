import { Tela } from '../../domain/entities/Tela';
import { ITelaRepository } from '../../domain/repositories/ITelaRepository';

export class TelaRepository implements ITelaRepository {
  private telas: Tela[] = [
    { id: '1', nombre: 'Algodón', tipo: 'Natural', color: 'Blanco', precio: 10 },
    { id: '2', nombre: 'Poliéster', tipo: 'Sintético', color: 'Azul', precio: 15 },
  ];

  async getAll(): Promise<Tela[]> {
    return this.telas;
  }

  async getById(id: string): Promise<Tela | null> {
    return this.telas.find(t => t.id === id) || null;
  }

  async create(tela: Tela): Promise<void> {
    this.telas.push(tela);
  }

  async update(tela: Tela): Promise<void> {
    const index = this.telas.findIndex(t => t.id === tela.id);
    if (index !== -1) {
      this.telas[index] = tela;
    }
  }

  async delete(id: string): Promise<void> {
    this.telas = this.telas.filter(t => t.id !== id);
  }
}



