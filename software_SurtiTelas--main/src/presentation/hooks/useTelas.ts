import { useState, useEffect } from 'react';
import { TelaService } from '../../application/services/TelaService';
import { TelaRepository } from '../../infrastructure/repositories/TelaRepository';
import { Tela } from '../../domain/entities/Tela';

const telaService = new TelaService(new TelaRepository());

export const useTelas = () => {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTelas = async () => {
      const data = await telaService.getTelas();
      setTelas(data);
      setLoading(false);
    };
    fetchTelas();
  }, []);

  return { telas, loading };
};



