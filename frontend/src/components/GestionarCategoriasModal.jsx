import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import Modal from './Modal';
import api from '../api/axios';

const TIPOS = [
  { value: 'ambos', label: 'Gasto e ingreso' },
  { value: 'gasto', label: 'Solo gasto' },
  { value: 'ingreso', label: 'Solo ingreso' },
];

export default function GestionarCategoriasModal({ categorias, onClose, onCambio }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('ambos');
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function cancelarEdicion() {
    setEditandoId(null);
    setNombre('');
    setTipo('ambos');
  }

  function handleEditar(categoria) {
    setEditandoId(categoria.id);
    setNombre(categoria.nombre);
    setTipo(categoria.tipo);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre) {
      setError('El nombre es obligatorio.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      if (editandoId) {
        await api.put(`/categorias-transacciones/${editandoId}`, { nombre, tipo });
      } else {
        await api.post('/categorias-transacciones', { nombre, tipo });
      }
      cancelarEdicion();
      onCambio();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la categoria.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(categoria) {
    const confirmado = window.confirm(
      `¿Eliminar la categoria "${categoria.nombre}"? Las transacciones que la usan quedaran sin categoria.`
    );
    if (!confirmado) return;

    setError('');
    try {
      await api.delete(`/categorias-transacciones/${categoria.id}`);
      if (editandoId === categoria.id) cancelarEdicion();
      onCambio();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar la categoria.');
    }
  }

  return (
    <Modal title="Gestionar categorias" onClose={onClose}>
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Nombre de la categoria"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="flex-1 min-w-[140px] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-2 bg-green-700 text-white px-3 py-1.5 rounded text-sm hover:bg-green-800 disabled:opacity-50"
            >
              <Plus size={16} />
              {editandoId ? 'Actualizar' : 'Crear'}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                <X size={16} />
                Cancelar
              </button>
            )}
          </div>
        </form>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <ul className="space-y-2">
          {categorias.length === 0 && (
            <p className="text-sm text-gray-500">Todavia no hay categorias creadas.</p>
          )}
          {categorias.map((categoria) => (
            <li
              key={categoria.id}
              className={`flex items-center justify-between bg-gray-50 rounded px-3 py-2 ${
                editandoId === categoria.id ? 'ring-2 ring-green-600' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate">{categoria.nombre}</p>
                <p className="text-xs text-gray-500">
                  {TIPOS.find((t) => t.value === categoria.tipo)?.label || categoria.tipo}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <button
                  onClick={() => handleEditar(categoria)}
                  className="text-gray-500 hover:text-gray-800"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleEliminar(categoria)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
