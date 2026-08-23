import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import Modal from './Modal';
import api from '../api/axios';

export default function GestionarEstadosModal({ estados, onClose, onCambio }) {
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#22c55e');
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function cancelarEdicion() {
    setEditandoId(null);
    setNombre('');
    setColor('#22c55e');
  }

  function handleEditar(estado) {
    setEditandoId(estado.id);
    setNombre(estado.nombre);
    setColor(estado.color_hexadecimal);
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
        await api.put(`/estados/${editandoId}`, { nombre, color_hexadecimal: color });
      } else {
        await api.post('/estados', { nombre, color_hexadecimal: color });
      }
      cancelarEdicion();
      onCambio();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el estado.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(estado) {
    const confirmado = window.confirm(
      `¿Eliminar el estado "${estado.nombre}"? Se borraran tambien todas las asignaciones asociadas a este estado, incluido su historico.`
    );
    if (!confirmado) return;

    setError('');
    try {
      await api.delete(`/estados/${estado.id}`);
      if (editandoId === estado.id) cancelarEdicion();
      onCambio();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el estado.');
    }
  }

  return (
    <Modal title="Gestionar estados" onClose={onClose}>
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Nombre del estado"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="flex-1 min-w-[140px] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-9 border border-gray-300 rounded cursor-pointer"
            />
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
          {estados.length === 0 && (
            <p className="text-sm text-gray-500">Todavia no hay estados creados.</p>
          )}
          {estados.map((estado) => (
            <li
              key={estado.id}
              className={`flex items-center justify-between bg-gray-50 rounded px-3 py-2 ${
                editandoId === estado.id ? 'ring-2 ring-green-600' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                  style={{ backgroundColor: estado.color_hexadecimal }}
                />
                <span className="text-sm text-gray-800 truncate">{estado.nombre}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <button
                  onClick={() => handleEditar(estado)}
                  className="text-gray-500 hover:text-gray-800"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleEliminar(estado)}
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
