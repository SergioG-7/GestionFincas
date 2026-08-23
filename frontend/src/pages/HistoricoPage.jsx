import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../api/axios';

const ENCABEZADOS_CSV = ['Finca', 'Parcela', 'Fila', 'Columna', 'Fecha', 'Estado', 'Observaciones', 'Activo'];

function escaparCampoCsv(valor) {
  const texto = String(valor ?? '');
  if (/[",\n;]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function exportarCsv(filas) {
  const filasCsv = filas.map((f) => [
    f.finca_nombre,
    f.parcela_nombre,
    f.fila + 1,
    f.columna + 1,
    new Date(f.fecha_asignacion).toLocaleDateString('es-ES'),
    f.estado_nombre,
    f.observaciones || '',
    f.activo_en_celda ? 'Si' : 'No',
  ]);

  const contenido = [ENCABEZADOS_CSV, ...filasCsv]
    .map((fila) => fila.map(escaparCampoCsv).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `historico_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

const filtrosVacios = { desde: '', hasta: '', finca_id: '', parcela_id: '', estado_id: '' };

export default function HistoricoPage() {
  const [fincas, setFincas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState(filtrosVacios);

  useEffect(() => {
    api.get('/fincas').then(({ data }) => setFincas(data));
    api.get('/estados').then(({ data }) => setEstados(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v));
    api
      .get('/asignaciones/historico', { params })
      .then(({ data }) => setFilas(data))
      .finally(() => setLoading(false));
  }, [filtros]);

  const parcelasDisponibles = useMemo(() => {
    if (!filtros.finca_id) return [];
    const finca = fincas.find((f) => f.id === Number(filtros.finca_id));
    return finca?.parcelas ?? [];
  }, [fincas, filtros.finca_id]);

  function actualizarFiltro(campo, valor) {
    setFiltros((actuales) => {
      const nuevos = { ...actuales, [campo]: valor };
      if (campo === 'finca_id') nuevos.parcela_id = '';
      return nuevos;
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Historico de asignaciones</h1>
        <button
          type="button"
          onClick={() => exportarCsv(filas)}
          disabled={filas.length === 0}
          className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-50"
        >
          <Download size={18} />
          Exportar a Excel (CSV)
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => actualizarFiltro('desde', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => actualizarFiltro('hasta', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Finca</label>
          <select
            value={filtros.finca_id}
            onChange={(e) => actualizarFiltro('finca_id', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Todas</option>
            {fincas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parcela</label>
          <select
            value={filtros.parcela_id}
            onChange={(e) => actualizarFiltro('parcela_id', e.target.value)}
            disabled={!filtros.finca_id}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
          >
            <option value="">Todas</option>
            {parcelasDisponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={filtros.estado_id}
            onChange={(e) => actualizarFiltro('estado_id', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Todos</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Finca</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3">Fila</th>
              <th className="px-4 py-3">Columna</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No hay asignaciones para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className={fila.activo_en_celda ? '' : 'opacity-50'}>
                  <td className="px-4 py-2">{fila.finca_nombre}</td>
                  <td className="px-4 py-2">{fila.parcela_nombre}</td>
                  <td className="px-4 py-2">{fila.fila + 1}</td>
                  <td className="px-4 py-2">{fila.columna + 1}</td>
                  <td className="px-4 py-2">
                    {new Date(fila.fecha_asignacion).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: fila.color_hexadecimal }}
                      />
                      {fila.estado_nombre}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{fila.observaciones || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
