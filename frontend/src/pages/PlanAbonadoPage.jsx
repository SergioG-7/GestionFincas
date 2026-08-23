import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Settings, Calendar, Pencil, Copy } from 'lucide-react';
import api from '../api/axios';
import AbonoModal from '../components/AbonoModal';
import GestionarTiposAbonoModal from '../components/GestionarTiposAbonoModal';
import CopiarPlanModal from '../components/CopiarPlanModal';

const ANIO_ACTUAL = new Date().getFullYear();
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio}`;
}

// La API devuelve las fechas como ISO en UTC (p.ej. "2026-02-28T23:00:00.000Z" para
// medianoche local del 1 de marzo). Un simple slice(0,10) tomaria el dia UTC, que
// puede ir un dia por detras del dia local real. Usamos los getters locales del
// Date para recuperar el dia calendario correcto.
function aFechaLocal(fechaISO) {
  if (!fechaISO) return '';
  const d = new Date(fechaISO);
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export default function PlanAbonadoPage() {
  const [fincas, setFincas] = useState([]);
  const [tiposAbono, setTiposAbono] = useState([]);
  const [fincaId, setFincaId] = useState('');
  const [anio, setAnio] = useState(String(ANIO_ACTUAL));
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [gestionandoTipos, setGestionandoTipos] = useState(false);
  const [copiandoPlan, setCopiandoPlan] = useState(false);
  const [aniosConDatos, setAniosConDatos] = useState([]);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [editandoTemporada, setEditandoTemporada] = useState(false);
  const [guardandoTemporada, setGuardandoTemporada] = useState(false);

  function cargarTiposAbono() {
    api.get('/tipos-abono').then(({ data }) => setTiposAbono(data)).catch(() => {});
  }

  useEffect(() => {
    api.get('/fincas').then(({ data }) => {
      setFincas(data);
      if (data.length > 0) setFincaId((actual) => actual || String(data[0].id));
    }).catch(() => {});
    cargarTiposAbono();
  }, []);

  const cargarRegistros = useCallback(() => {
    if (!fincaId || !anio) {
      setRegistros([]);
      return;
    }
    setLoading(true);
    setError('');
    api
      .get('/abonado', { params: { finca_id: fincaId, anio } })
      .then(({ data }) => setRegistros(data))
      .catch(() => setError('No se pudo cargar el plan de abonado. Comprueba tu conexion e intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [fincaId, anio]);

  const cargarTemporada = useCallback(() => {
    if (!fincaId || !anio) {
      setFechaInicio('');
      setFechaFin('');
      return;
    }
    api
      .get('/abonado/temporada', { params: { finca_id: fincaId, anio } })
      .then(({ data }) => {
        setFechaInicio(aFechaLocal(data.fecha_inicio));
        setFechaFin(aFechaLocal(data.fecha_fin));
      })
      .catch(() => {});
  }, [fincaId, anio]);

  const cargarAniosConDatos = useCallback(() => {
    if (!fincaId) {
      setAniosConDatos([]);
      return;
    }
    api
      .get('/abonado/anios', { params: { finca_id: fincaId } })
      .then(({ data }) => setAniosConDatos(data))
      .catch(() => {});
  }, [fincaId]);

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  useEffect(() => {
    cargarTemporada();
    setEditandoTemporada(false);
  }, [cargarTemporada]);

  useEffect(() => {
    cargarAniosConDatos();
  }, [cargarAniosConDatos]);

  async function handleGuardarTemporada() {
    setGuardandoTemporada(true);
    try {
      await api.post('/abonado/temporada', {
        finca_id: fincaId,
        anio,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
      });
      setEditandoTemporada(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar el rango de temporada.');
    } finally {
      setGuardandoTemporada(false);
    }
  }

  const registrosPorMes = {};
  registros.forEach((r) => {
    if (!registrosPorMes[r.mes]) registrosPorMes[r.mes] = [];
    registrosPorMes[r.mes].push(r);
  });

  const aniosParaCopiar = aniosConDatos.filter((a) => String(a) !== String(anio));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Plan de abonado</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCopiandoPlan(true)}
            disabled={!fincaId}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <Copy size={16} />
            Copiar de otro año
          </button>
          <button
            type="button"
            onClick={() => setGestionandoTipos(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            <Settings size={16} />
            Gestionar tipos de abono
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Finca</label>
          <select
            value={fincaId}
            onChange={(e) => setFincaId(e.target.value)}
            className="w-full sm:w-56 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Selecciona una finca</option>
            {fincas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año de temporada</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="w-28 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}{' '}
          <button onClick={cargarRegistros} className="underline font-medium">
            Reintentar
          </button>
        </p>
      )}

      {fincaId && (
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          {editandoTemporada ? (
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio de temporada</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin de temporada</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <button
                type="button"
                onClick={handleGuardarTemporada}
                disabled={guardandoTemporada}
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
              >
                {guardandoTemporada ? 'Guardando...' : 'Guardar rango'}
              </button>
              <button
                type="button"
                onClick={() => setEditandoTemporada(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditandoTemporada(true)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <Calendar size={16} className="text-green-700 shrink-0" />
              {fechaInicio || fechaFin ? (
                <span>
                  Temporada {anio}: {formatearFecha(fechaInicio) || '?'} - {formatearFecha(fechaFin) || '?'}
                </span>
              ) : (
                <span className="text-gray-500">Temporada no configurada (clic para definir fechas)</span>
              )}
              <Pencil size={14} className="text-gray-400 shrink-0" />
            </button>
          )}

          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MESES.map((nombreMes, idx) => {
                const mes = idx + 1;
                const registrosMes = registrosPorMes[mes] || [];
                const tieneObservaciones = registrosMes.some((r) => r.observaciones?.trim());

                return (
                  <button
                    key={mes}
                    type="button"
                    onClick={() => setMesSeleccionado(mes)}
                    className="relative text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 min-h-[92px] transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-800">{nombreMes}</p>

                    {registrosMes.length === 0 ? (
                      <p className="text-xs text-gray-400 mt-1">Sin abono</p>
                    ) : (
                      <div className="mt-1.5 space-y-1">
                        {registrosMes.map((r) => (
                          <span
                            key={r.id}
                            className="block text-xs font-medium text-white rounded px-1.5 py-0.5 truncate"
                            style={{ backgroundColor: r.color_hexadecimal }}
                          >
                            {r.tipo_abono_nombre}
                            {r.cantidad_dosis ? ` · ${r.cantidad_dosis}` : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {tieneObservaciones && (
                      <MessageSquare size={12} className="absolute top-2 right-2 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mesSeleccionado && (
        <AbonoModal
          fincaId={Number(fincaId)}
          temporadaAnio={Number(anio)}
          mes={mesSeleccionado}
          registrosMes={registrosPorMes[mesSeleccionado] || []}
          tiposAbono={tiposAbono}
          onClose={() => setMesSeleccionado(null)}
          onCambio={cargarRegistros}
          onGuardar={() => {
            setMesSeleccionado(null);
            cargarRegistros();
          }}
        />
      )}

      {gestionandoTipos && (
        <GestionarTiposAbonoModal
          tiposAbono={tiposAbono}
          onClose={() => setGestionandoTipos(false)}
          onCambio={() => {
            cargarTiposAbono();
            cargarRegistros();
          }}
        />
      )}

      {copiandoPlan && (
        <CopiarPlanModal
          fincaId={Number(fincaId)}
          anioDestino={anio}
          aniosDisponibles={aniosParaCopiar}
          onClose={() => setCopiandoPlan(false)}
          onCopiado={() => {
            setCopiandoPlan(false);
            cargarRegistros();
            cargarTemporada();
            cargarAniosConDatos();
          }}
        />
      )}
    </div>
  );
}
