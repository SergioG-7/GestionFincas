import { NavLink } from 'react-router-dom';
import { Sprout } from 'lucide-react';

const links = [
  { to: '/', label: 'Panel' },
  { to: '/fincas', label: 'Fincas' },
  { to: '/historico', label: 'Historico' },
  { to: '/contabilidad', label: 'Contabilidad' },
  { to: '/plan-abonado', label: 'Plan Abonado' },
];

export default function Navbar() {
  return (
    <header className="bg-green-700 text-white shadow">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
        <Sprout size={24} className="shrink-0" />
        <span className="font-semibold text-lg hidden sm:inline mr-2">GestionFincas</span>
        <nav className="flex gap-1 sm:gap-4 overflow-x-auto whitespace-nowrap">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors shrink-0 ${
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
