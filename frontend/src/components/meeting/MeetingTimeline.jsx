import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, ChevronRight, Sparkles, Clock } from 'lucide-react';

export default function MeetingTimeline({ meetings, eventId }) {
  const navigate = useNavigate();

  if (!meetings || meetings.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '2.5rem 1.5rem',
        background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
          No meetings yet
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Add the first meeting to start building your event timeline
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Timeline line */}
      {meetings.length > 1 && (
        <div style={{
          position: 'absolute', left: 19, top: 40, bottom: 20, width: 2,
          background: 'linear-gradient(to bottom, var(--color-accent-medium), transparent)',
          zIndex: 0,
        }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {meetings.map((meeting, idx) => (
          <motion.div key={meeting.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}
          >
            {/* Dot */}
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: meeting.mom ? 'var(--color-accent)' : 'var(--color-surface-2)',
              border: `2px solid ${meeting.mom ? 'var(--color-accent)' : 'var(--color-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: meeting.mom ? '0 0 0 4px var(--color-accent-light)' : 'none',
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700,
                color: meeting.mom ? 'white' : 'var(--color-text-muted)' }}>
                {idx + 1}
              </span>
            </div>

            {/* Card */}
            <div className="card card-hover" style={{ flex: 1, padding: '1rem', cursor: 'pointer' }}
              onClick={() => navigate(`/meeting/${meeting.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)',
                    marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {meeting.title}
                    {meeting.mom && (
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                        <Sparkles size={10} /> MOM Ready
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <Calendar size={12} />
                      {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {meeting.actionItems?.length > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        <Clock size={12} />
                        {meeting.actionItems.filter(a => a.status === 'pending').length} tasks pending
                      </span>
                    )}
                  </div>

                  {meeting.mom?.summary && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.825rem', color: 'var(--color-text-secondary)',
                      lineHeight: 1.5, overflow: 'hidden',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {meeting.mom.summary}
                    </p>
                  )}
                </div>

                <ChevronRight size={16} color="var(--color-text-muted)" style={{ flexShrink: 0, marginLeft: '0.75rem', marginTop: 2 }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
