import { describe, it, expect } from 'vitest';
const { desplazarAnio } = require('../utils/fechas');

describe('desplazarAnio', () => {
  it('mantiene mes y dia, cambia solo el anio', () => {
    expect(desplazarAnio('2024-03-15', 2025)).toBe('2025-03-15');
  });

  it('rellena mes y dia con cero a la izquierda', () => {
    expect(desplazarAnio('2024-01-05', 2026)).toBe('2026-01-05');
  });

  it('devuelve null si no hay fecha', () => {
    expect(desplazarAnio(null, 2025)).toBeNull();
  });
});
