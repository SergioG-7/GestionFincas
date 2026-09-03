function desplazarAnio(fecha, anioDestino) {
  if (!fecha) return null;
  const d = new Date(fecha);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anioDestino}-${mes}-${dia}`;
}

module.exports = { desplazarAnio };
