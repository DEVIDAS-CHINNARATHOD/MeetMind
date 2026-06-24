import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';
import EventDashboard from './pages/EventDashboard';
import MeetingPage from './pages/MeetingPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<HomePage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/event/:id" element={<EventDashboard />} />
            <Route path="/meeting/:id" element={<MeetingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
