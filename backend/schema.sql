-- Esquema de base de datos para GestionFincas
CREATE DATABASE IF NOT EXISTS gestion_fincas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gestion_fincas;

CREATE TABLE fincas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  localidad VARCHAR(150),
  num_parcelas INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE parcelas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  finca_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  filas INT NOT NULL,
  columnas INT NOT NULL,
  CONSTRAINT fk_parcelas_finca FOREIGN KEY (finca_id)
    REFERENCES fincas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE estados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  color_hexadecimal VARCHAR(7) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE asignaciones_celdas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parcela_id INT NOT NULL,
  fila INT NOT NULL,
  columna INT NOT NULL,
  estado_id INT NOT NULL,
  observaciones TEXT,
  fecha_asignacion DATE NOT NULL,
  activo_en_celda BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_asignaciones_parcela FOREIGN KEY (parcela_id)
    REFERENCES parcelas(id) ON DELETE CASCADE,
  CONSTRAINT fk_asignaciones_estado FOREIGN KEY (estado_id)
    REFERENCES estados(id)
) ENGINE=InnoDB;

CREATE TABLE transacciones (
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

-- Catalogo de tipos de abono (nombre + color), analogo a "estados".
CREATE TABLE tipos_abono (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  color_hexadecimal VARCHAR(7) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE planes_abonado (
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
