import { Routes, Route } from 'react-router-dom';
import { NameInputPage } from './pages/NameInputPage';
import { RoomGuardPage } from './pages/RoomGuardPage';
import { AdminPage } from './pages/AdminPage';
import { NavHeader } from './components/NavHeader';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <NavHeader />
      <main className="flex-1 flex flex-col items-center justify-center pt-14 sm:pt-16">
        <Routes>
          <Route path="/" element={<NameInputPage />} />
          <Route path="/room/:roomId" element={<RoomGuardPage />} />
          <Route path="/taiwanno1111111111111" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
