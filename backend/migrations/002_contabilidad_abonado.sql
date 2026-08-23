-- Migracion Paso 18: modulos de Contabilidad (transacciones) y Plan de Abonado.
-- Idempotente: usa IF NOT EXISTS para poder ejecutarse sin riesgo sobre una BD ya existente.

CREATE TABLE IF NOT EXISTS transacciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  finca_id INT NULL,
  tipo ENUM('gasto', 'ingreso') NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NULL,
  importe DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  observaciones TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transacciones_finca FOREIGN KEY (finca_id)
    REFERENCES fincas(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipos_abono (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  color_hexadecimal VARCHAR(7) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS planes_abonado (
  id INT AUTO_INCREMENT PRIMARY KEY,
  finca_id INT NOT NULL,
  temporada_anio INT NOT NULL,
  mes TINYINT NOT NULL,
  tipo_abono_id INT NOT NULL,
  cantidad_dosis VARCHAR(100) NULL,
  fecha_inicio_temporada DATE NULL,
  fecha_fin_temporada DATE NULL,
  observaciones TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_planes_abonado_finca FOREIGN KEY (finca_id)
    REFERENCES fincas(id) ON DELETE CASCADE,
  CONSTRAINT fk_planes_abonado_tipo FOREIGN KEY (tipo_abono_id)
    REFERENCES tipos_abono(id)
) ENGINE=InnoDB;
