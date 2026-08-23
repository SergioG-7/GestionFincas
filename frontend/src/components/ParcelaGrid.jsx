import { Fragment, useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import AsignacionModal from './AsignacionModal';

const BORDE_AUTOSCROLL = 50; // px desde el borde del contenedor para activar el auto-scroll
const VELOCIDAD_AUTOSCROLL = 12; // px por frame

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
  const contenedorRef = useRef(null);
  const velocidadScrollRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;
    function finalizarArrastre() {
      setIsDragging(false);
    }
    window.addEventListener('mouseup', finalizarArrastre);
    window.addEventListener('touchend', finalizarArrastre);
    window.addEventListener('touchcancel', finalizarArrastre);
    return () => {
      window.removeEventListener('mouseup', finalizarArrastre);
      window.removeEventListener('touchend', finalizarArrastre);
      window.removeEventListener('touchcancel', finalizarArrastre);
    };
  }, [isDragging]);

  // Arrastre tactil: touchstart inicia la seleccion (equivalente a mousedown).
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || !modoEdicion) return;

    function handleTouchStart(e) {
      const touch = e.touches[0];
      if (!touch) return;
      const elemento = document.elementFromPoint(touch.clientX, touch.clientY);
      const celda = elemento?.closest('[data-fila]');
      if (!celda) return;
      e.preventDefault();
      setIsDragging(true);
      setSelectedCells([{ fila: Number(celda.dataset.fila), columna: Number(celda.dataset.columna) }]);
    }

    contenedor.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => contenedor.removeEventListener('touchstart', handleTouchStart);
  }, [modoEdicion]);

  // Arrastre tactil: touchmove va sumando celdas y activa el auto-scroll cerca de los bordes.
  // Se usa un listener nativo (passive:false) porque React trata touchmove como pasivo por defecto,
  // lo que impediria bloquear el scroll de la pagina mientras se selecciona.
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!isDragging || !contenedor) return;

    function handleTouchMove(e) {
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault();

      const rect = contenedor.getBoundingClientRect();
      velocidadScrollRef.current = {
        x: calcularVelocidadEje(touch.clientX, rect.left, rect.right),
        y: calcularVelocidadEje(touch.clientY, rect.top, rect.bottom),
      };

      const elemento = document.elementFromPoint(touch.clientX, touch.clientY);
      const celda = elemento?.closest('[data-fila]');
      if (celda) {
        agregarCelda(Number(celda.dataset.fila), Number(celda.dataset.columna));
      }
    }

    contenedor.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => contenedor.removeEventListener('touchmove', handleTouchMove);
  }, [isDragging]);

  useEffect(() => {
    if (!isDragging) {
      velocidadScrollRef.current = { x: 0, y: 0 };
      return;
    }

    let frameId;
    function tick() {
      const contenedor = contenedorRef.current;
      const { x, y } = velocidadScrollRef.current;
      if (contenedor && (x !== 0 || y !== 0)) {
        contenedor.scrollLeft += x;
        contenedor.scrollTop += y;
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      velocidadScrollRef.current = { x: 0, y: 0 };
    };
  }, [isDragging]);

  function calcularVelocidadEje(posicion, inicio, fin) {
    if (posicion - inicio < BORDE_AUTOSCROLL) return -VELOCIDAD_AUTOSCROLL;
    if (fin - posicion < BORDE_AUTOSCROLL) return VELOCIDAD_AUTOSCROLL;
    return 0;
  }

  function handleMouseMoveContenedor(e) {
    if (!isDragging) return;
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const rect = contenedor.getBoundingClientRect();

    velocidadScrollRef.current = {
      x: calcularVelocidadEje(e.clientX, rect.left, rect.right),
      y: calcularVelocidadEje(e.clientY, rect.top, rect.bottom),
    };
  }

  function handleMouseLeaveContenedor() {
    velocidadScrollRef.current = { x: 0, y: 0 };
  }

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
        ref={contenedorRef}
        onMouseMove={handleMouseMoveContenedor}
        onMouseLeave={handleMouseLeaveContenedor}
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
                const tieneObservaciones = celdaAsignaciones.some((a) => a.observaciones?.trim());

                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    data-fila={fila}
                    data-columna={columna}
                    onMouseDown={() => handleMouseDown(fila, columna)}
                    onMouseEnter={() => handleMouseEnter(fila, columna)}
                    title={construirTooltip(fila, columna, celdaAsignaciones)}
                    className={`relative w-11 h-11 border border-gray-400 flex items-center justify-center text-white font-bold transition-shadow ${
                      modoEdicion ? 'cursor-pointer hover:ring-2 hover:ring-green-600' : 'cursor-default'
                    } ${className}`}
                    style={{ ...style, touchAction: modoEdicion ? 'none' : 'auto' }}
                  >
                    {asterisco && '*'}
                    {tieneObservaciones && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-black/60 rounded-full" />
                    )}
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
