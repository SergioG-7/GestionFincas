export default function ParcelaStats({ asignaciones, estados }) {
  const celdasPorEstado = {};
  asignaciones.forEach((a) => {
    const clave = `${a.fila}-${a.columna}`;
    if (!celdasPorEstado[a.estado_id]) celdasPorEstado[a.estado_id] = new Set();
    celdasPorEstado[a.estado_id].add(clave);
  });

  const stats = estados
    .map((estado) => ({ ...estado, total: celdasPorEstado[estado.id]?.size ?? 0 }))
    .filter((estado) => estado.total > 0);

  if (stats.length === 0) {
    return <p className="text-sm text-gray-500">Esta parcela todavia no tiene celdas con estados asignados.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((estado) => (
        <span
          key={estado.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: estado.color_hexadecimal }}
        >
          {estado.nombre}: {estado.total}
        </span>
      ))}
    </div>
  );
}
