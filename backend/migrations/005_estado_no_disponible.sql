-- Migracion Paso 26: estado por defecto "No Disponible" (rojo, celda con X visual en frontend).

INSERT INTO estados (nombre, color_hexadecimal)
SELECT 'No Disponible', '#EF4444'
WHERE NOT EXISTS (SELECT 1 FROM estados WHERE nombre = 'No Disponible');
