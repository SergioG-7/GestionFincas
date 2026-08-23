import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import FincaForm from '../components/FincaForm';
import FincasList from '../components/FincasList';

export default function FincasPage() {
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarFincas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/fincas');
      setFincas(data);
    } catch {
      setError('No se pudieron cargar las fincas. Comprueba tu conexion e intenta de nuevo.');
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
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
            {error}{' '}
            <button onClick={cargarFincas} className="underline font-medium">
              Reintentar
            </button>
          </p>
        )}
        <FincasList fincas={fincas} loading={loading} onCambio={cargarFincas} />
      </div>
    </div>
  );
}
