import { useState } from 'react';
import Modal from './Modal';
import api from '../api/axios';

export default function EditarParcelaModal({ parcela, onClose, onGuardado }) {
  const [nombre, setNombre] = useState(parcela.nombre);
  const [filas, setFilas] = useState(parcela.filas);
  const [columnas, setColumnas] = useState(parcela.columnas);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const reduceTamano = Number(filas) < parcela.filas || Number(columnas) < parcela.columnas;

  async function handleGuardar() {
    if (!nombre || !filas || !columnas) {
      setError('Nombre, filas y columnas son obligatorios.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await api.put(`/parcelas/${parcela.id}`, {
        nombre,
        filas: Number(filas),
        columnas: Number(columnas),
      });
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la parcela.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title="Editar parcela" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filas</label>
            <input
              type="number"
              min="1"
              value={filas}
              onChange={(e) => setFilas(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Columnas</label>
            <input
              type="number"
              min="1"
              value={columnas}
              onChange={(e) => setColumnas(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {reduceTamano && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Si reduces el tamano, las celdas sobrantes y su historico se perderan.
          </p>
        )}

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
