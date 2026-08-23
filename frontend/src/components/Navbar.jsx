import { NavLink } from 'react-router-dom';
import { Sprout } from 'lucide-react';

const links = [
  { to: '/', label: 'Panel' },
  { to: '/fincas', label: 'Fincas' },
  { to: '/estados', label: 'Estados' },
  { to: '/historico', label: 'Historico' },
];

export default function Navbar() {
  return (
    <header className="bg-green-700 text-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
        <Sprout size={24} />
        <span className="font-semibold text-lg mr-6">GestionFincas</span>
        <nav className="flex gap-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors ${
                  isActive ? 'bg-green-900' : 'hover:bg-green-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
