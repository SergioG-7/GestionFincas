import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import FincasPage from './pages/FincasPage';
import PanelPage from './pages/PanelPage';
import HistoricoPage from './pages/HistoricoPage';
import ContabilidadPage from './pages/ContabilidadPage';
import PlanAbonadoPage from './pages/PlanAbonadoPage';
import ProtectedRoute from './auth/ProtectedRoute';

function PaginaProtegida({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PaginaProtegida>
            <PanelPage />
          </PaginaProtegida>
        }
      />
      <Route
        path="/fincas"
        element={
          <PaginaProtegida>
            <FincasPage />
          </PaginaProtegida>
        }
      />
      <Route
        path="/historico"
        element={
          <PaginaProtegida>
            <HistoricoPage />
          </PaginaProtegida>
        }
      />
      <Route
        path="/contabilidad"
        element={
          <PaginaProtegida>
            <ContabilidadPage />
          </PaginaProtegida>
        }
      />
      <Route
        path="/plan-abonado"
        element={
          <PaginaProtegida>
            <PlanAbonadoPage />
          </PaginaProtegida>
        }
      />
    </Routes>
  );
}
