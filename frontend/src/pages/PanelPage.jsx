import { useCallback, useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import api from '../api/axios';
import ParcelaGrid from '../components/ParcelaGrid';
import EstadoFiltros from '../components/EstadoFiltros';
import ParcelaStats from '../components/ParcelaStats';

export default function PanelPage() {
  const [fincas, setFincas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [fincaId, setFincaId] = useState('');
  const [parcelaId, setParcelaId] = useState('');
  const [asignaciones, setAsignaciones] = useState([]);
  const [filtroEstadoId, setFiltroEstadoId] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(true);

  useEffect(() => {
    api.get('/fincas').then(({ data }) => setFincas(data));
    api.get('/estados').then(({ data }) => setEstados(data));
  }, []);

  const finca = fincas.find((f) => f.id === Number(fincaId));
  const parcela = finca?.parcelas.find((p) => p.id === Number(parcelaId));

  const cargarAsignaciones = useCallback((idParcela) => {
    if (!idParcela) {
      setAsignaciones([]);
      return;
    }
    api.get(`/asignaciones/parcela/${idParcela}`).then(({ data }) => setAsignaciones(data));
  }, []);

  useEffect(() => {
    cargarAsignaciones(parcelaId);
  }, [parcelaId, cargarAsignaciones]);

  function handleSeleccionarFinca(id) {
    setFincaId(id);
    setParcelaId('');
    setFiltroEstadoId(null);
  }

  function handleSeleccionarParcela(id) {
    setParcelaId(id);
    setFiltroEstadoId(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Panel</h1>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Finca</label>
        <select
          value={fincaId}
          onChange={(e) => handleSeleccionarFinca(e.target.value)}
          className="w-full sm:w-72 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">Selecciona una finca</option>
          {fincas.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
      </div>

      {finca && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parcela</label>
          <div className="flex flex-wrap gap-2">
            {finca.parcelas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSeleccionarParcela(p.id)}
                className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                  Number(parcelaId) === p.id
                    ? 'bg-green-700 border-green-700 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {parcela && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <ParcelaStats asignaciones={asignaciones} estados={estados} />

            <button
              type="button"
              onClick={() => setModoEdicion((m) => !m)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors shrink-0 ${
                modoEdicion
                  ? 'bg-green-700 border-green-700 text-white hover:bg-green-800'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {modoEdicion ? <Unlock size={16} /> : <Lock size={16} />}
              {modoEdicion ? 'Modo edicion' : 'Solo lectura'}
            </button>
          </div>

          <EstadoFiltros
            estados={estados}
            filtroSeleccionado={filtroEstadoId}
            onSeleccionar={setFiltroEstadoId}
          />

          {modoEdicion && (
            <p className="text-xs text-gray-500">
              Haz click y arrastra para seleccionar varias celdas a la vez.
            </p>
          )}

          <ParcelaGrid
            parcela={parcela}
            asignaciones={asignaciones}
            estados={estados}
            estadoFiltroId={filtroEstadoId}
            modoEdicion={modoEdicion}
            onCambio={() => cargarAsignaciones(parcelaId)}
          />
        </div>
      )}
    </div>
  );
}
