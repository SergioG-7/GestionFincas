import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import FincaForm from '../components/FincaForm';
import FincasList from '../components/FincasList';

export default function FincasPage() {
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarFincas = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/fincas');
      setFincas(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarFincas();
  }, [cargarFincas]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Gestion de fincas</h1>
      <FincaForm onFincaCreada={cargarFincas} />
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Fincas registradas</h2>
        <FincasList fincas={fincas} loading={loading} />
      </div>
    </div>
  );
}
