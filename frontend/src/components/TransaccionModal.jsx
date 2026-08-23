import { useState } from 'react';
import Modal from './Modal';
import api from '../api/axios';

const vacio = {
  fecha: new Date().toISOString().slice(0, 10),
  tipo: 'gasto',
  concepto: '',
  categoria: '',
  importe: '',
  finca_id: '',
  observaciones: '',
};

export default function TransaccionModal({ transaccion, fincas, onClose, onGuardado }) {
  const [form, setForm] = useState(
    transaccion
      ? {
          fecha: transaccion.fecha.slice(0, 10),
          tipo: transaccion.tipo,
          concepto: transaccion.concepto,
          categoria: transaccion.categoria || '',
          importe: transaccion.importe,
          finca_id: transaccion.finca_id || '',
          observaciones: transaccion.observaciones || '',
        }
      : vacio
  );
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function actualizar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  async function handleGuardar() {
    if (!form.concepto || !form.importe || !form.fecha) {
      setError('Fecha, concepto e importe son obligatorios.');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      const payload = {
        finca_id: form.finca_id || null,
        tipo: form.tipo,
        concepto: form.concepto,
        categoria: form.categoria || null,
        importe: Number(form.importe),
        fecha: form.fecha,
        observaciones: form.observaciones || null,
      };

      if (transaccion) {
        await api.put(`/transacciones/${transaccion.id}`, payload);
      } else {
        await api.post('/transacciones', payload);
      }
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el movimiento.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={transaccion ? 'Editar movimiento' : 'Nuevo movimiento'} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => actualizar('fecha', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => actualizar('tipo', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
          <input
            type="text"
            value={form.concepto}
            onChange={(e) => actualizar('concepto', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.importe}
              onChange={(e) => actualizar('importe', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              placeholder="Maquinaria, Jornales..."
              value={form.categoria}
              onChange={(e) => actualizar('categoria', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Finca (opcional)</label>
          <select
            value={form.finca_id}
            onChange={(e) => actualizar('finca_id', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">General (sin finca)</option>
            {fincas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea
            value={form.observaciones}
            onChange={(e) => actualizar('observaciones', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
