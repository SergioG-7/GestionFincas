import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import FincasPage from './pages/FincasPage';
import EstadosPage from './pages/EstadosPage';
import PanelPage from './pages/PanelPage';
import HistoricoPage from './pages/HistoricoPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<PanelPage />} />
        <Route path="/fincas" element={<FincasPage />} />
        <Route path="/estados" element={<EstadosPage />} />
        <Route path="/historico" element={<HistoricoPage />} />
      </Routes>
    </div>
  );
}
