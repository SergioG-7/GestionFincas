import { useState } from 'react';
import Modal from './Modal';
import api from '../api/axios';

export default function CopiarPlanModal({ fincaId, anioDestino, aniosDisponibles, onClose, onCopiado }) {
  const [anioOrigen, setAnioOrigen] = useState(aniosDisponibles[0] ? String(aniosDisponibles[0]) : '');
  const [error, setError] = useState('');
  const [copiando, setCopiando] = useState(false);

  async function handleCopiar() {
    if (!anioOrigen) {
      setError('Selecciona un año de origen.');
      return;
    }
    setCopiando(true);
    setError('');
    try {
      await api.post('/abonado/copiar-plan', {
        finca_id: fincaId,
        anio_origen: Number(anioOrigen),
        anio_destino: Number(anioDestino),
      });
      onCopiado();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al copiar el plan.');
    } finally {
      setCopiando(false);
    }
  }

  return (
    <Modal title="Copiar plan de otro año" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Copiar plan de abonado hacia el año <strong>{anioDestino}</strong>.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año origen</label>
          {aniosDisponibles.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay ningun otro año con plan de abonado guardado para esta finca.
            </p>
          ) : (
            <select
              value={anioOrigen}
              onChange={(e) => setAnioOrigen(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {aniosDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}
        </div>

        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Si el año destino ya tiene abonos asignados, se sobrescribiran con los del año seleccionado.
        </p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCopiar}
            disabled={copiando || aniosDisponibles.length === 0}
            className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
          >
            {copiando ? 'Copiando...' : 'Copiar Plan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
