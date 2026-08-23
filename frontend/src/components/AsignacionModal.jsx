import { useState } from 'react';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import Modal from './Modal';
import api from '../api/axios';

const SUGERENCIAS_OBSERVACIONES = ['Falta agua', 'Revisar plaga', 'Abonado completado', 'Mal estado'];

export default function AsignacionModal({
  parcelaId,
  celdas,
  estados,
  asignacionesActivas,
  onClose,
  onCambio,
  onGuardar,
}) {
  const [estadoId, setEstadoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [editandoObservacionId, setEditandoObservacionId] = useState(null);
  const [observacionesEditadas, setObservacionesEditadas] = useState('');
  const [guardandoObservacion, setGuardandoObservacion] = useState(false);
  const [limpiando, setLimpiando] = useState(false);

  const esSeleccionUnica = celdas.length === 1;
  const titulo = esSeleccionUnica
    ? `Celda (fila ${celdas[0].fila + 1}, columna ${celdas[0].columna + 1})`
    : `Asignar estado a ${celdas.length} celdas seleccionadas`;

  function agregarSugerencia(texto) {
    setObservaciones((actual) => (actual.trim() ? `${actual.trim()}, ${texto}` : texto));
  }

  async function handleGuardar() {
    if (!estadoId) {
      setError('Selecciona un estado.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await api.post('/asignaciones/lote', {
        parcela_id: parcelaId,
        estado_id: Number(estadoId),
        observaciones,
        celdas,
      });
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la asignacion.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleLimpiar() {
    const mensaje = esSeleccionUnica
      ? '¿Limpiar todos los estados activos de esta celda?'
      : `¿Limpiar todos los estados activos de las ${celdas.length} celdas seleccionadas?`;
    if (!window.confirm(mensaje)) return;

    setLimpiando(true);
    setError('');
    try {
      await api.post('/asignaciones/lote/limpiar', { parcela_id: parcelaId, celdas });
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al limpiar la celda.');
    } finally {
      setLimpiando(false);
    }
  }

  function iniciarEdicionObservacion(a) {
    setEditandoObservacionId(a.id);
    setObservacionesEditadas(a.observaciones || '');
  }

  function cancelarEdicionObservacion() {
    setEditandoObservacionId(null);
    setObservacionesEditadas('');
  }

  async function handleGuardarObservacion(id) {
    setGuardandoObservacion(true);
    setError('');
    try {
      await api.put(`/asignaciones/${id}`, { observaciones: observacionesEditadas });
      cancelarEdicionObservacion();
      onCambio();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la observacion.');
    } finally {
      setGuardandoObservacion(false);
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
    <Modal title={titulo} onClose={onClose}>
      <div className="space-y-5">
        {esSeleccionUnica && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Estados activos</h4>
            {asignacionesActivas.length === 0 ? (
              <p className="text-sm text-gray-500">Esta celda no tiene estados activos.</p>
            ) : (
              <ul className="space-y-2">
                {asignacionesActivas.map((a) => (
                  <li key={a.id} className="bg-gray-50 rounded px-3 py-2">
                    {editandoObservacionId === a.id ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: a.color_hexadecimal }}
                        />
                        <input
                          type="text"
                          value={observacionesEditadas}
                          onChange={(e) => setObservacionesEditadas(e.target.value)}
                          autoFocus
                          className="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                        <button
                          onClick={() => handleGuardarObservacion(a.id)}
                          disabled={guardandoObservacion}
                          className="text-green-700 hover:text-green-900 disabled:opacity-50 shrink-0"
                          title="Guardar"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelarEdicionObservacion}
                          className="text-gray-500 hover:text-gray-800 shrink-0"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
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
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            onClick={() => iniciarEdicionObservacion(a)}
                            className="text-gray-500 hover:text-gray-800"
                            title="Editar observaciones"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminar(a.id)}
                            disabled={eliminandoId === a.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={esSeleccionUnica ? 'border-t border-gray-200 pt-4 space-y-4' : 'space-y-4'}>
          {esSeleccionUnica && <h4 className="text-sm font-medium text-gray-700">Anadir estado</h4>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estadoId}
              onChange={(e) => setEstadoId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Selecciona un estado</option>
              {estados.map((estado) => {
                const yaActivo =
                  esSeleccionUnica && asignacionesActivas.some((a) => a.estado_id === estado.id);
                return (
                  <option key={estado.id} value={estado.id} disabled={yaActivo}>
                    {estado.nombre}
                    {yaActivo ? ' (ya activo en esta celda)' : ''}
                  </option>
                );
              })}
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
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGERENCIAS_OBSERVACIONES.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => agregarSugerencia(sugerencia)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-between gap-2">
            <button
              onClick={handleLimpiar}
              disabled={limpiando}
              className="px-4 py-2 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {limpiando ? 'Limpiando...' : 'Limpiar'}
            </button>
            <div className="flex gap-2">
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
        </div>
      </div>
    </Modal>
  );
}
