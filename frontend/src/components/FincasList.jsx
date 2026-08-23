import { MapPin, LayoutGrid } from 'lucide-react';

export default function FincasList({ fincas, loading }) {
  if (loading) {
    return <p className="text-gray-500">Cargando fincas...</p>;
  }

  if (fincas.length === 0) {
    return <p className="text-gray-500">Todavia no hay fincas registradas.</p>;
  }

  return (
    <div className="space-y-4">
      {fincas.map((finca) => (
        <div key={finca.id} className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{finca.nombre}</h3>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin size={16} />
              {finca.localidad || 'Sin localidad'}
            </span>
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
  );
}
