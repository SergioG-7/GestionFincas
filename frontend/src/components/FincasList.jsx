import { useState } from 'react';
import { MapPin, LayoutGrid, Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import EditarFincaModal from './EditarFincaModal';

export default function FincasList({ fincas, loading, onCambio }) {
  const [fincaEditando, setFincaEditando] = useState(null);

  async function handleEliminar(finca) {
    const confirmado = window.confirm(
      `¿Eliminar la finca "${finca.nombre}"? Se borraran tambien sus parcelas y todo su historico de asignaciones.`
    );
    if (!confirmado) return;

    try {
      await api.delete(`/fincas/${finca.id}`);
      onCambio();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la finca.');
    }
  }

  if (loading) {
    return <p className="text-gray-500">Cargando fincas...</p>;
  }

  if (fincas.length === 0) {
    return <p className="text-gray-500">Todavia no hay fincas registradas.</p>;
  }

  return (
    <>
      <div className="space-y-4">
        {fincas.map((finca) => (
          <div key={finca.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-semibold text-gray-800 min-w-0 break-words">{finca.nombre}</h3>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={16} />
                  {finca.localidad || 'Sin localidad'}
                </span>
                <button
                  onClick={() => setFincaEditando(finca)}
                  className="text-gray-500 hover:text-gray-800"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleEliminar(finca)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {finca.parcelas.map((parcela) => (
                <div
                  key={parcela.id}
                  className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded px-3 py-2"
                >
                  <LayoutGrid size={16} className="text-green-700" />
                  <span>
                    {parcela.nombre} &middot; {parcela.filas}x{parcela.columnas}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {fincaEditando && (
        <EditarFincaModal
          finca={fincaEditando}
          onClose={() => setFincaEditando(null)}
          onGuardado={() => {
            setFincaEditando(null);
            onCambio();
          }}
        />
      )}
    </>
  );
}
