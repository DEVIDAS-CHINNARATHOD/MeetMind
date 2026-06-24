import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText, MessageSquare, AlertTriangle,
  CheckCircle2, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MOMDisplay({ mom }) {
  if (!mom) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Summary Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #F0F4FF 100%)',
        border: '1px solid var(--color-accent-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
          <div style={{
            width: 32, height: 32, background: 'var(--color-accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FileText size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-accent)', marginBottom: '0.375rem' }}>
              Meeting Summary
            </div>
            <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '0.9rem', lineHeight: 1.65 }}>
              {mom.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Key Discussion Points */}
      {mom.keyDiscussionPoints?.length > 0 && (
        <MOMSection
          icon={<MessageSquare size={15} />}
          title="Key Discussion Points"
          color="#4F46E5"
          bgColor="#EEF2FF"
          defaultOpen={true}
        >
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mom.keyDiscussionPoints.map((point, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-accent)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>·</span>
                <span style={{ color: 'var(--color-text-primary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{point}</span>
              </li>
            ))}
          </ul>
        </MOMSection>
      )}

      {/* Decisions Taken */}
      {mom.decisionsTaken?.length > 0 && (
        <MOMSection
          icon={<CheckCircle2 size={15} />}
          title="Decisions Taken"
          color="#059669"
          bgColor="#ECFDF5"
          defaultOpen={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mom.decisionsTaken.map((decision, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.625rem', alignItems: 'flex-start',
                background: '#F0FDF4', borderRadius: 8, padding: '0.6rem 0.75rem',
                border: '1px solid #D1FAE5',
              }}>
                <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: 'var(--color-text-primary)', fontSize: '0.875rem', lineHeight: 1.55 }}>{decision}</span>
              </div>
            ))}
          </div>
        </MOMSection>
      )}

      {/* Action Items */}
      {mom.actionItems?.length > 0 && (
        <MOMSection
          icon={<Clock size={15} />}
          title={`Action Items (${mom.actionItems.length})`}
          color="#D97706"
          bgColor="#FFFBEB"
          defaultOpen={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {mom.actionItems.map((item, i) => (
              <div key={i} style={{
                background: '#FFFBEB', borderRadius: 8, padding: '0.75rem',
                border: '1px solid #FDE68A',
              }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
                  <ArrowRight size={12} color="#D97706" style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {item.task}
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {item.responsible && item.responsible !== 'Not specified' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                      <User size={11} /> {item.responsible}
                    </span>
                  )}
                  {item.deadline && item.deadline !== 'Not specified' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                      <Calendar size={11} /> {item.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MOMSection>
      )}

      {/* Risks */}
      {mom.risks?.length > 0 && (
        <MOMSection
          icon={<AlertTriangle size={15} />}
          title="Risks & Concerns"
          color="#DC2626"
          bgColor="#FEF2F2"
          defaultOpen={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mom.risks.map((risk, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                background: '#FEF2F2', borderRadius: 8, padding: '0.6rem 0.75rem',
                border: '1px solid #FECACA',
              }}>
                <AlertTriangle size={13} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.55 }}>{risk}</span>
              </div>
            ))}
          </div>
        </MOMSection>
      )}

      {/* Next Meeting Agenda */}
      {mom.nextMeetingAgenda?.length > 0 && (
        <MOMSection
          icon={<Calendar size={15} />}
          title="Next Meeting Agenda"
          color="#7C3AED"
          bgColor="#F5F3FF"
          defaultOpen={false}
        >
          <ol style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {mom.nextMeetingAgenda.map((item, i) => (
              <li key={i} style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ol>
        </MOMSection>
      )}
    </div>
  );
}

function MOMSection({ icon, title, color, bgColor, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--color-surface)',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '0.875rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: open ? bgColor : 'var(--color-surface)',
          border: 'none', cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color, fontWeight: 600, fontSize: '0.875rem' }}>
          {icon} {title}
        </span>
        {open ? <ChevronUp size={15} color={color} /> : <ChevronDown size={15} color="var(--color-text-muted)" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1rem 1rem' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MOMSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {[140, 100, 120, 180].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );
}
