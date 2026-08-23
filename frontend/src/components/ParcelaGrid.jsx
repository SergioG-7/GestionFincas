import { Fragment, useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import AsignacionModal from './AsignacionModal';

function construirTooltip(fila, columna, celdaAsignaciones) {
  const lineas = [`Fila ${fila + 1}, Columna ${columna + 1}`];

  if (celdaAsignaciones.length > 0) {
    lineas.push(`Estados: ${celdaAsignaciones.map((a) => a.estado_nombre).join(', ')}`);

    const ultimaObservacion = [...celdaAsignaciones].reverse().find((a) => a.observaciones);
    if (ultimaObservacion) {
      lineas.push(`Ultima observacion: ${ultimaObservacion.observaciones}`);
    }
  }

  return lineas.join('\n');
}

function calcularEstiloCelda(celdaAsignaciones, estadoFiltroId, seleccionada) {
  const filtroActivo = estadoFiltroId !== null;
  const coincideFiltro = celdaAsignaciones.some((a) => a.estado_id === estadoFiltroId);

  let base;
  if (filtroActivo && !coincideFiltro) {
    base = { style: {}, className: 'bg-gray-100 opacity-40', asterisco: false };
  } else if (celdaAsignaciones.length === 0) {
    base = { style: {}, className: 'bg-white', asterisco: false };
  } else if (celdaAsignaciones.length === 1) {
    base = {
      style: { backgroundColor: celdaAsignaciones[0].color_hexadecimal },
      className: '',
      asterisco: false,
    };
  } else if (celdaAsignaciones.length === 2) {
    const [a, b] = celdaAsignaciones;
    base = {
      style: {
        background: `linear-gradient(90deg, ${a.color_hexadecimal} 50%, ${b.color_hexadecimal} 50%)`,
      },
      className: '',
      asterisco: false,
    };
  } else {
    // Mas de 2 estados activos: color del mas antiguo (la lista ya viene ordenada por fecha_asignacion ASC).
    base = {
      style: { backgroundColor: celdaAsignaciones[0].color_hexadecimal },
      className: '',
      asterisco: true,
    };
  }

  if (seleccionada) {
    base.className += ' ring-2 ring-inset ring-blue-500 opacity-80';
  }

  return base;
}

export default function ParcelaGrid({ parcela, asignaciones, estados, estadoFiltroId, modoEdicion, onCambio }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);

  useEffect(() => {
    if (!isDragging) return;
    function handleWindowMouseUp() {
      setIsDragging(false);
    }
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, [isDragging]);

  const mapa = {};
  asignaciones.forEach((a) => {
    const key = `${a.fila}-${a.columna}`;
    if (!mapa[key]) mapa[key] = [];
    mapa[key].push(a);
  });

  function estaSeleccionada(fila, columna) {
    return selectedCells.some((c) => c.fila === fila && c.columna === columna);
  }

  function agregarCelda(fila, columna) {
    setSelectedCells((actuales) => {
      if (actuales.some((c) => c.fila === fila && c.columna === columna)) return actuales;
      return [...actuales, { fila, columna }];
    });
  }

  function handleMouseDown(fila, columna) {
    if (!modoEdicion) return;
    setIsDragging(true);
    setSelectedCells([{ fila, columna }]);
  }

  function handleMouseEnter(fila, columna) {
    if (!modoEdicion || !isDragging) return;
    agregarCelda(fila, columna);
  }

  function cerrarModal() {
    setSelectedCells([]);
  }

  function guardarYCerrar() {
    onCambio();
    setSelectedCells([]);
  }

  const filas = Array.from({ length: parcela.filas });
  const columnas = Array.from({ length: parcela.columnas });
  const mostrarModal = modoEdicion && !isDragging && selectedCells.length > 0;
  const asignacionesCeldaUnica =
    selectedCells.length === 1 ? mapa[`${selectedCells[0].fila}-${selectedCells[0].columna}`] || [] : [];

  return (
    <>
      {!modoEdicion && (
        <p className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 w-fit">
          <Lock size={14} />
          Parcela bloqueada: solo lectura
        </p>
      )}

      <div
        className={`overflow-auto max-h-[70vh] rounded ${
          modoEdicion ? 'border border-gray-200' : 'border-2 border-dashed border-amber-300'
        }`}
      >
        <div
          className="inline-grid gap-1 select-none p-1"
          style={{ gridTemplateColumns: `2.25rem repeat(${parcela.columnas}, 2.75rem)` }}
          onMouseUp={() => setIsDragging(false)}
        >
          <div className="sticky top-0 left-0 z-20 bg-gray-100" />

          {columnas.map((_, columna) => (
            <div
              key={`col-${columna}`}
              className="sticky top-0 z-10 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 h-6"
            >
              {columna + 1}
            </div>
          ))}

          {filas.map((_, fila) => (
            <Fragment key={fila}>
              <div className="sticky left-0 z-10 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {fila + 1}
              </div>

              {columnas.map((_, columna) => {
                const key = `${fila}-${columna}`;
                const celdaAsignaciones = mapa[key] || [];
                const { style, className, asterisco } = calcularEstiloCelda(
                  celdaAsignaciones,
                  estadoFiltroId,
                  estaSeleccionada(fila, columna)
                );

                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    onMouseDown={() => handleMouseDown(fila, columna)}
                    onMouseEnter={() => handleMouseEnter(fila, columna)}
                    title={construirTooltip(fila, columna, celdaAsignaciones)}
                    className={`w-11 h-11 border border-gray-400 flex items-center justify-center text-white font-bold transition-shadow ${
                      modoEdicion ? 'cursor-pointer hover:ring-2 hover:ring-green-600' : 'cursor-default'
                    } ${className}`}
                    style={style}
                  >
                    {asterisco && '*'}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {mostrarModal && (
        <AsignacionModal
          parcelaId={parcela.id}
          celdas={selectedCells}
          estados={estados}
          asignacionesActivas={asignacionesCeldaUnica}
          onClose={cerrarModal}
          onCambio={onCambio}
          onGuardar={guardarYCerrar}
        />
      )}
    </>
  );
}
