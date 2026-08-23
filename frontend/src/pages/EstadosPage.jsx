import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';

export default function EstadosPage() {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#22c55e');
  const [error, setError] = useState('');

  async function cargarEstados() {
    setLoading(true);
    try {
      const { data } = await api.get('/estados');
      setEstados(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarEstados();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/estados', { nombre, color_hexadecimal: color });
      setNombre('');
      setColor('#22c55e');
      cargarEstados();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el estado.');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await api.delete(`/estados/${id}`);
      cargarEstados();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el estado.');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Gestion de estados</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          <Plus size={18} />
          Guardar estado
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Estados registrados</h2>
        {loading ? (
          <p className="text-gray-500">Cargando estados...</p>
        ) : estados.length === 0 ? (
          <p className="text-gray-500">Todavia no hay estados registrados.</p>
        ) : (
          <ul className="space-y-2">
            {estados.map((estado) => (
              <li
                key={estado.id}
                className="flex items-center justify-between bg-white rounded-lg shadow px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: estado.color_hexadecimal }}
                  />
                  <span className="text-gray-800">{estado.nombre}</span>
                  <span className="text-xs text-gray-400">{estado.color_hexadecimal}</span>
                </div>
                <button
                  onClick={() => handleDelete(estado.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
