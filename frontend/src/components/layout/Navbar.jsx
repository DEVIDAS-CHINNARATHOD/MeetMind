import { Link, useLocation } from 'react-router-dom';
import { Brain, Home, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

export default function Navbar() {
  const location = useLocation();
  const { notifications, removeNotification } = useStore();

  const isLanding = location.pathname === '/';

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Workspace', to: '/events' }];
    if (parts[0] === 'event' && parts[1]) {
      crumbs.push({ label: 'Event', to: null });
    }
    if (parts[0] === 'meeting' && parts[1]) {
      crumbs.push({ label: 'Meeting', to: null });
    }
    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  const renderToasts = () => (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            style={{
              background: n.type === 'error' ? '#FEF2F2' : n.type === 'success' ? '#ECFDF5' : 'white',
              border: `1px solid ${n.type === 'error' ? '#FECACA' : n.type === 'success' ? '#A7F3D0' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: n.type === 'error' ? '#B91C1C' : n.type === 'success' ? '#065F46' : 'var(--color-text-primary)',
              cursor: 'pointer',
              maxWidth: 320,
            }}
            onClick={() => removeNotification(n.id)}
          >
            {n.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  if (isLanding) {
    return (
      <>
        <header style={{
          background: 'transparent',
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
              textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                width: 24, height: 24, background: 'rgba(255,255,255,0.95)',
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={14} color="#0b82bd" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff', letterSpacing: '-0.02em' }}>
                MeetMind
              </span>
            </Link>

            {/* Nav Anchors */}
            <nav className="landing-nav-links" style={{ display: 'flex', gap: '2.15rem', alignItems: 'center' }}>
              <a href="/" style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.86)', textDecoration: 'none', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Home
              </a>
              <a href="#features" style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.86)', textDecoration: 'none', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Features
              </a>
              <a href="#workflow" style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.86)', textDecoration: 'none', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Workflow
              </a>
              <a href="#about" style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.86)', textDecoration: 'none', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                About us
              </a>
            </nav>

            {/* Launch App CTA Button */}
            <Link to="/events" className="landing-nav-cta" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 38, padding: '0 1.35rem', borderRadius: 999,
              background: '#cfff31', color: '#111', textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.68rem',
              fontWeight: 900, boxShadow: '0 10px 28px rgba(69, 137, 0, 0.16)'
            }}>
              Launch app
            </Link>
          </div>
        </header>
        {renderToasts()}
      </>
    );
  }

  // Else: Normal Workspace Navbar
  return (
    <>
      <header style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 100,
      }} className="workspace-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          
          {/* Logo */}
          <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
            textDecoration: 'none', color: 'inherit' }}>
            <div className="workspace-brand-mark" style={{
              width: 28, height: 28, background: '#000',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={15} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#000', letterSpacing: '-0.02em' }}>
              MeetMind
            </span>
          </Link>

          {/* Breadcrumbs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {crumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {i > 0 && <ChevronRight size={13} color="var(--color-text-muted)" />}
                {crumb.to ? (
                  <Link to={crumb.to} style={{
                    fontSize: '0.8125rem', color: 'var(--color-text-secondary)',
                    textDecoration: 'none', fontWeight: 600,
                  }}
                    onMouseEnter={e => e.target.style.color = '#000'}
                    onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
                  >
                    {i === 0 && <Home size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          <div className="workspace-version-pill" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Prototype v1.0
          </div>
        </div>
      </header>
      {renderToasts()}
    </>
  );
}
