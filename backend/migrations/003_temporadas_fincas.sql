-- Migracion Paso 19: tabla dedicada para el rango de fechas de la temporada de abonado,
-- desacoplada de si hay meses con abono asignado.

CREATE TABLE IF NOT EXISTS temporadas_fincas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  finca_id INT NOT NULL,
  anio INT NOT NULL,
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL,
  UNIQUE KEY uk_finca_anio (finca_id, anio),
  CONSTRAINT fk_temporadas_finca FOREIGN KEY (finca_id)
    REFERENCES fincas(id) ON DELETE CASCADE
) ENGINE=InnoDB;
