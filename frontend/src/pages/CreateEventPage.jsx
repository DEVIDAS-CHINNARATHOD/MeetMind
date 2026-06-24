import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Calendar, Tag } from 'lucide-react';
import { createEvent } from '../api';
import { useStore } from '../store';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { addNotification } = useStore();
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const examples = [
    'College Hackathon 2026',
    'Annual Sports Day Planning',
    'Alumni Meet 2026',
    'Cultural Fest Committee',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Event name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const event = await createEvent(form);
      addNotification(`Event "${event.name}" created!`, 'success');
      navigate(`/event/${event.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 600, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}
        style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Events
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, background: 'var(--color-accent-light)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
          }}>
            <Sparkles size={22} color="var(--color-accent)" />
          </div>
          <h1 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Create New Event
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            An event groups all related meetings together into one intelligent workspace.
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem',
                color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                <Tag size={13} style={{ marginRight: 5, verticalAlign: 'middle', color: 'var(--color-accent)' }} />
                Event Name *
              </label>
              <input
                className="input"
                placeholder="e.g. College Hackathon 2026"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }}
                autoFocus
              />
              {error && (
                <p style={{ margin: '0.375rem 0 0', fontSize: '0.8125rem', color: 'var(--color-danger)' }}>
                  {error}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem',
                color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                <Calendar size={13} style={{ marginRight: 5, verticalAlign: 'middle', color: 'var(--color-accent)' }} />
                Description (optional)
              </label>
              <textarea
                className="input"
                placeholder="Briefly describe the event and its purpose..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Creating...
                </>
              ) : (
                <><Sparkles size={17} /> Create Event</>
              )}
            </button>
          </form>
        </div>

        {/* Examples */}
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Try these examples:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {examples.map(ex => (
              <button key={ex} className="badge badge-indigo"
                style={{ cursor: 'pointer', border: '1px solid var(--color-accent-medium)', padding: '0.35rem 0.75rem',
                  fontSize: '0.8125rem', fontWeight: 500, background: 'none',
                  transition: 'all 0.15s' }}
                onClick={() => setForm(f => ({ ...f, name: ex }))}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
