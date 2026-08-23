import { useState } from 'react';
import Modal from './Modal';
import api from '../api/axios';

export default function AsignacionModal({ parcelaId, fila, columna, estados, onClose, onGuardada }) {
  const [estadoId, setEstadoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar() {
    if (!estadoId) {
      setError('Selecciona un estado.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await api.post('/asignaciones', {
        parcela_id: parcelaId,
        fila,
        columna,
        estado_id: Number(estadoId),
        observaciones,
      });
      onGuardada();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la asignacion.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={`Celda (fila ${fila + 1}, columna ${columna + 1})`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={estadoId}
            onChange={(e) => setEstadoId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Selecciona un estado</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
