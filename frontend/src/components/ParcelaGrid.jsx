function calcularEstiloCelda(celdaAsignaciones, estadoFiltroId) {
  const filtroActivo = estadoFiltroId !== null;
  const coincideFiltro = celdaAsignaciones.some((a) => a.estado_id === estadoFiltroId);

  if (filtroActivo && !coincideFiltro) {
    return { style: {}, className: 'bg-gray-100 opacity-40', asterisco: false };
  }

  if (celdaAsignaciones.length === 0) {
    return { style: {}, className: 'bg-white', asterisco: false };
  }

  if (celdaAsignaciones.length === 1) {
    return {
      style: { backgroundColor: celdaAsignaciones[0].color_hexadecimal },
      className: '',
      asterisco: false,
    };
  }

  if (celdaAsignaciones.length === 2) {
    const [a, b] = celdaAsignaciones;
    return {
      style: {
        background: `linear-gradient(90deg, ${a.color_hexadecimal} 50%, ${b.color_hexadecimal} 50%)`,
      },
      className: '',
      asterisco: false,
    };
  }

  // Mas de 2 estados activos: color del mas antiguo (la lista ya viene ordenada por fecha_asignacion ASC).
  return {
    style: { backgroundColor: celdaAsignaciones[0].color_hexadecimal },
    className: '',
    asterisco: true,
  };
}

export default function ParcelaGrid({ parcela, asignaciones, estadoFiltroId, onCellClick }) {
  const mapa = {};
  asignaciones.forEach((a) => {
    const key = `${a.fila}-${a.columna}`;
    if (!mapa[key]) mapa[key] = [];
    mapa[key].push(a);
  });

  const filas = Array.from({ length: parcela.filas });
  const columnas = Array.from({ length: parcela.columnas });

  return (
    <div
      className="inline-grid gap-1"
      style={{ gridTemplateColumns: `repeat(${parcela.columnas}, 2.75rem)` }}
    >
      {filas.map((_, fila) =>
        columnas.map((_, columna) => {
          const key = `${fila}-${columna}`;
          const celdaAsignaciones = mapa[key] || [];
          const { style, className, asterisco } = calcularEstiloCelda(celdaAsignaciones, estadoFiltroId);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onCellClick(fila, columna)}
              title={`Fila ${fila + 1}, Columna ${columna + 1}`}
              className={`w-11 h-11 border border-gray-400 flex items-center justify-center text-white font-bold hover:ring-2 hover:ring-green-600 transition-shadow ${className}`}
              style={style}
            >
              {asterisco && '*'}
            </button>
          );
        })
      )}
    </div>
  );
}
