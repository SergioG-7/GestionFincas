import { useState } from 'react';
import Modal from './Modal';
import api from '../api/axios';

export default function EditarFincaModal({ finca, onClose, onGuardado }) {
  const [nombre, setNombre] = useState(finca.nombre);
  const [localidad, setLocalidad] = useState(finca.localidad || '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar() {
    if (!nombre) {
      setError('El nombre es obligatorio.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await api.put(`/fincas/${finca.id}`, { nombre, localidad });
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la finca.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title="Editar finca" onClose={onClose}>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
          <input
            type="text"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
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
