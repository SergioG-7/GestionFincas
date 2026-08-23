import { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/axios';

const parcelaVacia = () => ({ nombre: '', filas: '', columnas: '' });

export default function FincaForm({ onFincaCreada }) {
  const [nombre, setNombre] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [numParcelas, setNumParcelas] = useState('');
  const [parcelas, setParcelas] = useState([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function handleNumParcelasChange(e) {
    const valor = e.target.value;
    setNumParcelas(valor);

    const cantidad = Math.max(0, Math.min(50, Number(valor) || 0));
    setParcelas((actuales) => {
      const nuevas = [...actuales];
      while (nuevas.length < cantidad) nuevas.push(parcelaVacia());
      nuevas.length = cantidad;
      return nuevas;
    });
  }

  function handleParcelaChange(index, campo, valor) {
    setParcelas((actuales) =>
      actuales.map((p, i) => (i === index ? { ...p, [campo]: valor } : p))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (parcelas.length === 0) {
      setError('Indica al menos una parcela.');
      return;
    }

    const parcelasInvalidas = parcelas.some(
      (p) => !p.nombre || !p.filas || !p.columnas
    );
    if (parcelasInvalidas) {
      setError('Completa nombre, filas y columnas de todas las parcelas.');
      return;
    }

    setEnviando(true);
    try {
      await api.post('/fincas', {
        nombre,
        localidad,
        parcelas: parcelas.map((p) => ({
          nombre: p.nombre,
          filas: Number(p.filas),
          columnas: Number(p.columnas),
        })),
      });

      setNombre('');
      setLocalidad('');
      setNumParcelas('');
      setParcelas([]);
      onFincaCreada();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la finca.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Nueva finca</h2>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
          <input
            type="text"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nº de parcelas</label>
          <input
            type="number"
            min="0"
            max="50"
            value={numParcelas}
            onChange={handleNumParcelasChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {parcelas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Datos de las parcelas</h3>
          {parcelas.map((parcela, index) => (
            <div key={index} className="grid sm:grid-cols-3 gap-3 bg-gray-50 rounded p-3">
              <input
                type="text"
                placeholder={`Nombre parcela ${index + 1}`}
                value={parcela.nombre}
                onChange={(e) => handleParcelaChange(index, 'nombre', e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <input
                type="number"
                min="1"
                placeholder="Filas"
                value={parcela.filas}
                onChange={(e) => handleParcelaChange(index, 'filas', e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <input
                type="number"
                min="1"
                placeholder="Columnas"
                value={parcela.columnas}
                onChange={(e) => handleParcelaChange(index, 'columnas', e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-50"
      >
        <Plus size={18} />
        {enviando ? 'Guardando...' : 'Guardar finca'}
      </button>
    </form>
  );
}
