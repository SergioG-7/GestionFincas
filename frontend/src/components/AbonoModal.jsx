import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import Modal from './Modal';
import api from '../api/axios';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function AbonoModal({
  fincaId,
  temporadaAnio,
  mes,
  registrosMes,
  tiposAbono,
  onClose,
  onCambio,
  onGuardar,
  onTipoCreado,
}) {
  const [tipoAbonoId, setTipoAbonoId] = useState('');
  const [cantidadDosis, setCantidadDosis] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [limpiando, setLimpiando] = useState(false);

  const [creandoTipo, setCreandoTipo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoColor, setNuevoColor] = useState('#22c55e');
  const [creandoGuardando, setCreandoGuardando] = useState(false);

  async function handleCrearTipo() {
    if (!nuevoNombre) {
      setError('Indica un nombre para el nuevo tipo de abono.');
      return;
    }
    setCreandoGuardando(true);
    setError('');
    try {
      const { data } = await api.post('/tipos-abono', { nombre: nuevoNombre, color_hexadecimal: nuevoColor });
      onTipoCreado(data);
      setTipoAbonoId(String(data.id));
      setCreandoTipo(false);
      setNuevoNombre('');
      setNuevoColor('#22c55e');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el tipo de abono.');
    } finally {
      setCreandoGuardando(false);
    }
  }

  async function handleGuardar() {
    if (!tipoAbonoId) {
      setError('Selecciona un tipo de abono.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await api.post('/abonado', {
        finca_id: fincaId,
        temporada_anio: temporadaAnio,
        mes,
        tipo_abono_id: Number(tipoAbonoId),
        cantidad_dosis: cantidadDosis,
        observaciones,
      });
      setTipoAbonoId('');
      setCantidadDosis('');
      setObservaciones('');
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el abono.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id) {
    setEliminandoId(id);
    setError('');
    try {
      await api.delete(`/abonado/${id}`);
      onCambio();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el abono.');
    } finally {
      setEliminandoId(null);
    }
  }

  async function handleLimpiarMes() {
    if (registrosMes.length === 0) return;
    const confirmado = window.confirm(`¿Limpiar todos los abonos asignados en ${MESES[mes - 1]}?`);
    if (!confirmado) return;

    setLimpiando(true);
    setError('');
    try {
      await Promise.all(registrosMes.map((r) => api.delete(`/abonado/${r.id}`)));
      onGuardar();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al limpiar el mes.');
    } finally {
      setLimpiando(false);
    }
  }

  return (
    <Modal title={MESES[mes - 1]} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Abonos asignados</h4>
          {registrosMes.length === 0 ? (
            <p className="text-sm text-gray-500">Este mes no tiene abonos asignados.</p>
          ) : (
            <ul className="space-y-2">
              {registrosMes.map((r) => (
                <li key={r.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                      style={{ backgroundColor: r.color_hexadecimal }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">
                        {r.tipo_abono_nombre}
                        {r.cantidad_dosis && <span className="text-gray-500"> &middot; {r.cantidad_dosis}</span>}
                      </p>
                      {r.observaciones && (
                        <p className="text-xs text-gray-500 truncate">{r.observaciones}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEliminar(r.id)}
                    disabled={eliminandoId === r.id}
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
          <h4 className="text-sm font-medium text-gray-700">Añadir abono</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de abono</label>
            <div className="flex gap-2">
              <select
                value={tipoAbonoId}
                onChange={(e) => setTipoAbonoId(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">Selecciona un tipo</option>
                {tiposAbono.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCreandoTipo((v) => !v)}
                className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0"
                title="Crear nuevo tipo de abono"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {creandoTipo && (
            <div className="flex flex-wrap items-end gap-2 bg-gray-50 rounded p-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del nuevo tipo</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={nuevoColor}
                  onChange={(e) => setNuevoColor(e.target.value)}
                  className="w-12 h-9 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={handleCrearTipo}
                disabled={creandoGuardando}
                className="px-3 py-1.5 rounded bg-green-700 text-white text-sm hover:bg-green-800 disabled:opacity-50"
              >
                {creandoGuardando ? 'Creando...' : 'Crear'}
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dosis / cantidad</label>
            <input
              type="text"
              placeholder="250 kg, 5 L/ha..."
              value={cantidadDosis}
              onChange={(e) => setCantidadDosis(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
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

          <div className="flex justify-between gap-2">
            <button
              onClick={handleLimpiarMes}
              disabled={limpiando || registrosMes.length === 0}
              className="px-4 py-2 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {limpiando ? 'Limpiando...' : 'Limpiar mes'}
            </button>
            <div className="flex gap-2">
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
      </div>
    </Modal>
  );
}
