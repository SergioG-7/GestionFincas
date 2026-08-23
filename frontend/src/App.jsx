import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import FincasPage from './pages/FincasPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<FincasPage />} />
      </Routes>
    </div>
  );
}
