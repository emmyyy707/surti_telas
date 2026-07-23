import { Tela } from '../entities/Tela';

export interface ITelaRepository {
  getAll(): Promise<Tela[]>;
  getById(id: string): Promise<Tela | null>;
  create(tela: Tela): Promise<void>;
  update(tela: Tela): Promise<void>;
  delete(id: string): Promise<void>;
}



