import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from './Modal';
import api from '../api/axios';

export default function AsignacionModal({
  parcelaId,
  fila,
  columna,
  estados,
  asignacionesActivas,
  onClose,
  onCambio,
}) {
  const [estadoId, setEstadoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

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
      setEstadoId('');
      setObservaciones('');
      onCambio();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la asignacion.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id) {
    setEliminandoId(id);
    setError('');
    try {
      await api.patch(`/asignaciones/${id}/desactivar`);
      onCambio();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar la asignacion.');
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <Modal title={`Celda (fila ${fila + 1}, columna ${columna + 1})`} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Estados activos</h4>
          {asignacionesActivas.length === 0 ? (
            <p className="text-sm text-gray-500">Esta celda no tiene estados activos.</p>
          ) : (
            <ul className="space-y-2">
              {asignacionesActivas.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                      style={{ backgroundColor: a.color_hexadecimal }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">{a.estado_nombre}</p>
                      {a.observaciones && (
                        <p className="text-xs text-gray-500 truncate">{a.observaciones}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEliminar(a.id)}
                    disabled={eliminandoId === a.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 shrink-0 ml-2"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Anadir estado</h4>
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
              Cerrar
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
      </div>
    </Modal>
  );
}
