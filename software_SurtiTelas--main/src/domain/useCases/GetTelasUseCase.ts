import { Tela } from '../entities/Tela';
import { ITelaRepository } from '../repositories/ITelaRepository';

export class GetTelasUseCase {
  constructor(private telaRepository: ITelaRepository) {}

  async execute(): Promise<Tela[]> {
    return this.telaRepository.getAll();
  }
}



