import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import ParcelaGrid from '../components/ParcelaGrid';
import EstadoFiltros from '../components/EstadoFiltros';
import ParcelaStats from '../components/ParcelaStats';
import AsignacionModal from '../components/AsignacionModal';

export default function PanelPage() {
  const [fincas, setFincas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [fincaId, setFincaId] = useState('');
  const [parcelaId, setParcelaId] = useState('');
  const [asignaciones, setAsignaciones] = useState([]);
  const [filtroEstadoId, setFiltroEstadoId] = useState(null);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);

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
          <ParcelaStats asignaciones={asignaciones} estados={estados} />

          <EstadoFiltros
            estados={estados}
            filtroSeleccionado={filtroEstadoId}
            onSeleccionar={setFiltroEstadoId}
          />

          <div className="overflow-auto">
            <ParcelaGrid
              parcela={parcela}
              asignaciones={asignaciones}
              estadoFiltroId={filtroEstadoId}
              onCellClick={(fila, columna) => setCeldaSeleccionada({ fila, columna })}
            />
          </div>
        </div>
      )}

      {celdaSeleccionada && (
        <AsignacionModal
          parcelaId={parcela.id}
          fila={celdaSeleccionada.fila}
          columna={celdaSeleccionada.columna}
          estados={estados}
          asignacionesActivas={asignaciones.filter(
            (a) => a.fila === celdaSeleccionada.fila && a.columna === celdaSeleccionada.columna
          )}
          onClose={() => setCeldaSeleccionada(null)}
          onCambio={() => cargarAsignaciones(parcelaId)}
        />
      )}
    </div>
  );
}
