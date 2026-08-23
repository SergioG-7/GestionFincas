export default function EstadoFiltros({ estados, filtroSeleccionado, onSeleccionar }) {
  if (estados.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {estados.map((estado) => {
        const activo = filtroSeleccionado === estado.id;
        return (
          <button
            key={estado.id}
            type="button"
            onClick={() => onSeleccionar(activo ? null : estado.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
              activo
                ? 'border-gray-800 bg-gray-800 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full border border-white/60"
              style={{ backgroundColor: estado.color_hexadecimal }}
            />
            {estado.nombre}
          </button>
        );
      })}
    </div>
  );
}
