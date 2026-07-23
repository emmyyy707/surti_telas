import { GetTelasUseCase } from '../../domain/useCases/GetTelasUseCase';
import { ITelaRepository } from '../../domain/repositories/ITelaRepository';

export class TelaService {
  private getTelasUseCase: GetTelasUseCase;

  constructor(telaRepository: ITelaRepository) {
    this.getTelasUseCase = new GetTelasUseCase(telaRepository);
  }

  async getTelas() {
    return this.getTelasUseCase.execute();
  }
}



