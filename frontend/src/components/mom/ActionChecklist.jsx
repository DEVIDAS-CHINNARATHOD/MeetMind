import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, CheckCircle2 } from 'lucide-react';
import { toggleActionItem } from '../../api';
import { useStore } from '../../store';

export default function ActionChecklist({ items = [], meetingId, onUpdate }) {
  const { addNotification } = useStore();
  const [toggling, setToggling] = useState({});

  const handleToggle = async (item) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    setToggling(t => ({ ...t, [item.id]: true }));
    try {
      const updated = await toggleActionItem(meetingId, item.id, newStatus);
      onUpdate?.(updated);
    } catch {
      addNotification('Failed to update task status', 'error');
    } finally {
      setToggling(t => ({ ...t, [item.id]: false }));
    }
  };

  if (!items.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)',
        fontSize: '0.875rem' }}>
        No action items extracted from this meeting.
      </div>
    );
  }

  const completed = items.filter(i => i.status === 'completed').length;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            Progress
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
            {completed}/{items.length}
          </span>
        </div>
        <div style={{ background: 'var(--color-surface-2)', borderRadius: 99, height: 6 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
            style={{ background: 'var(--color-accent)', height: '100%', borderRadius: 99 }}
          />
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence>
          {items.map((item) => (
            <motion.div key={item.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '0.75rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: item.status === 'completed' ? 'var(--color-surface-2)' : 'var(--color-surface)',
                transition: 'background 0.2s',
              }}
            >
              <button
                onClick={() => handleToggle(item)}
                disabled={toggling[item.id]}
                style={{
                  flexShrink: 0, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, marginTop: 1,
                  color: item.status === 'completed' ? 'var(--color-success)' : 'var(--color-border)',
                  transition: 'color 0.2s, transform 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {item.status === 'completed'
                  ? <CheckCircle2 size={20} fill="var(--color-success)" color="white" />
                  : <Circle size={20} color="var(--color-border)" />
                }
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.875rem', fontWeight: 500,
                  color: item.status === 'completed' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                  lineHeight: 1.5,
                }}>
                  {item.task}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  {item.responsible && item.responsible !== 'Not specified' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      👤 {item.responsible}
                    </span>
                  )}
                  {item.deadline && item.deadline !== 'Not specified' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      📅 {item.deadline}
                    </span>
                  )}
                </div>
              </div>

              <span className={`badge ${item.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}
                style={{ flexShrink: 0 }}>
                {item.status === 'completed' ? '✓ Done' : 'Pending'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
