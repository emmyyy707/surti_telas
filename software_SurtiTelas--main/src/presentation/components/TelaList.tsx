import React from 'react';
import { useTelas } from '../hooks/useTelas';

const TelaList: React.FC = () => {
  const { telas, loading } = useTelas();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Lista de Telas</h2>
      <ul>
        {telas.map(tela => (
          <li key={tela.id}>
            {tela.nombre} - {tela.tipo} - {tela.color} - ${tela.precio}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TelaList;



