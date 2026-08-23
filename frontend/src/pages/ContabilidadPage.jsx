import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import api from '../api/axios';
import TransaccionModal from '../components/TransaccionModal';
import GestionarCategoriasModal from '../components/GestionarCategoriasModal';

const ANIO_ACTUAL = new Date().getFullYear();

function formatearImporte(valor) {
  return Number(valor).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

export default function ContabilidadPage() {
  const [fincas, setFincas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [resumen, setResumen] = useState({ total_ingresos: 0, total_gastos: 0, balance_neto: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anio, setAnio] = useState(String(ANIO_ACTUAL));
  const [fincaId, setFincaId] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [transaccionEditando, setTransaccionEditando] = useState(null);
  const [gestionandoCategorias, setGestionandoCategorias] = useState(false);

  function cargarCategorias() {
    api.get('/categorias-transacciones').then(({ data }) => setCategorias(data)).catch(() => {});
  }

  useEffect(() => {
    api.get('/fincas').then(({ data }) => setFincas(data)).catch(() => {});
    cargarCategorias();
  }, []);

  async function cargarTransacciones() {
    setLoading(true);
    setError('');
    try {
      const params = { anio };
      if (fincaId) params.finca_id = fincaId;
      const { data } = await api.get('/transacciones', { params });
      setTransacciones(data.transacciones);
      setResumen(data.resumen);
    } catch {
      setError('No se pudieron cargar los movimientos. Comprueba tu conexion e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTransacciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio, fincaId]);

  function abrirNuevo() {
    setTransaccionEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(transaccion) {
    setTransaccionEditando(transaccion);
    setModalAbierto(true);
  }

  async function handleEliminar(transaccion) {
    const confirmado = window.confirm(`¿Eliminar el movimiento "${transaccion.concepto}"?`);
    if (!confirmado) return;

    try {
      await api.delete(`/transacciones/${transaccion.id}`);
      cargarTransacciones();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el movimiento.');
    }
  }

  const balancePositivo = resumen.balance_neto >= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Contabilidad</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGestionandoCategorias(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            <Settings size={16} />
            Gestionar categorias
          </button>
          <button
            type="button"
            onClick={abrirNuevo}
            className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            <Plus size={18} />
            Nuevo movimiento
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="w-28 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Finca</label>
          <select
            value={fincaId}
            onChange={(e) => setFincaId(e.target.value)}
            className="w-full sm:w-56 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Todas</option>
            {fincas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}{' '}
          <button onClick={cargarTransacciones} className="underline font-medium">
            Reintentar
          </button>
        </p>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-5">
          <p className="text-sm text-green-800 font-medium">Total ingresos</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatearImporte(resumen.total_ingresos)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <p className="text-sm text-red-800 font-medium">Total gastos</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatearImporte(resumen.total_gastos)}</p>
        </div>
        <div className={`rounded-lg p-5 border ${balancePositivo ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm font-medium ${balancePositivo ? 'text-green-800' : 'text-red-800'}`}>Balance neto</p>
          <p className={`text-2xl font-bold mt-1 ${balancePositivo ? 'text-green-700' : 'text-red-700'}`}>
            {formatearImporte(resumen.balance_neto)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Concepto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Finca</th>
              <th className="px-4 py-3 text-right">Importe</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : transacciones.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No hay movimientos para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              transacciones.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(t.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{t.concepto}</td>
                  <td className="px-4 py-2 text-gray-600">{t.categoria_nombre || '-'}</td>
                  <td className="px-4 py-2 text-gray-600">{t.finca_nombre || 'General'}</td>
                  <td
                    className={`px-4 py-2 text-right font-medium whitespace-nowrap ${
                      t.tipo === 'ingreso' ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {t.tipo === 'ingreso' ? '+' : '-'}
                    {formatearImporte(t.importe)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => abrirEditar(t)}
                        className="text-gray-500 hover:text-gray-800"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(t)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <TransaccionModal
          transaccion={transaccionEditando}
          fincas={fincas}
          categorias={categorias}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => {
            setModalAbierto(false);
            cargarTransacciones();
          }}
        />
      )}

      {gestionandoCategorias && (
        <GestionarCategoriasModal
          categorias={categorias}
          onClose={() => setGestionandoCategorias(false)}
          onCambio={cargarCategorias}
        />
      )}
    </div>
  );
}
