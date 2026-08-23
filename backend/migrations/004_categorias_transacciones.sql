-- Migracion Paso 20: catalogo de categorias contables reutilizable (en vez de texto libre).

CREATE TABLE IF NOT EXISTS categorias_transacciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo ENUM('gasto', 'ingreso', 'ambos') DEFAULT 'ambos',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

ALTER TABLE transacciones
  ADD COLUMN categoria_id INT NULL AFTER categoria,
  ADD CONSTRAINT fk_transacciones_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias_transacciones(id) ON DELETE SET NULL;
