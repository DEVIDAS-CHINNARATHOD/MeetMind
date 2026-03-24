import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Sparkles, MessageSquare, CheckSquare, RefreshCw, ChevronRight } from 'lucide-react';
import { getMeeting, chatWithMeeting, regenerateMOM } from '../api';
import { useStore } from '../store';
import MOMDisplay, { MOMSkeleton } from '../components/mom/MOMDisplay';
import ActionChecklist from '../components/mom/ActionChecklist';
import { ChatWindow } from '../components/chat/ChatWindow';

const SECTIONS = [
  { id: 'transcript', label: 'Transcript', icon: FileText },
  { id: 'mom', label: 'MOM', icon: Sparkles },
  { id: 'actions', label: 'Action Items', icon: CheckSquare },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
];

export default function MeetingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useStore();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('mom');
  const [regenLoading, setRegenLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMeeting(id);
        setMeeting(data);
      } catch {
        addNotification('Failed to load meeting', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleRegenMOM = async () => {
    setRegenLoading(true);
    try {
      const updated = await regenerateMOM(id);
      setMeeting(updated);
      addNotification('MOM regenerated!', 'success');
    } catch {
      addNotification('Failed to regenerate MOM', 'error');
    } finally {
      setRegenLoading(false);
    }
  };

  const handleChat = async (question) => {
    const userMsg = { role: 'user', content: question };
    setChatHistory(h => [...h, userMsg]);
    setChatLoading(true);
    try {
      const { answer } = await chatWithMeeting(id, question, chatHistory);
      setChatHistory(h => [...h, { role: 'assistant', content: answer }]);
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <MeetingPageSkeleton />;
  if (!meeting) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p>Meeting not found.</p>
    </div>
  );

  const completedActions = meeting.actionItems?.filter(a => a.status === 'completed').length || 0;
  const totalActions = meeting.actionItems?.length || 0;

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/event/${meeting.eventId}`)}
          style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
          <ArrowLeft size={15} /> Back to Event
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {meeting.title}
            </h1>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                📅 {new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {totalActions > 0 && (
                <span className={`badge ${completedActions === totalActions ? 'badge-green' : 'badge-yellow'}`}>
                  {completedActions}/{totalActions} tasks done
                </span>
              )}
              {meeting.mom && <span className="badge badge-indigo"><Sparkles size={10} /> MOM Generated</span>}
            </div>
          </div>

          {meeting.mom && (
            <button className="btn btn-ghost btn-sm" onClick={handleRegenMOM} disabled={regenLoading}>
              <RefreshCw size={14} className={regenLoading ? 'spinning' : ''} />
              {regenLoading ? 'Regenerating...' : 'Regenerate MOM'}
            </button>
          )}
        </div>
      </div>

      {/* Section Nav */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${SECTIONS.length}, 1fr)`,
        gap: '0.5rem', marginBottom: '1.5rem',
      }}>
        {SECTIONS.map(({ id: sid, label, icon: Icon }) => {
          const active = activeSection === sid;
          return (
            <button key={sid} onClick={() => setActiveSection(sid)}
              style={{
                padding: '0.625rem 0.75rem',
                background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                color: active ? 'white' : 'var(--color-text-secondary)',
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-full)', cursor: 'pointer',
                fontWeight: active ? 600 : 500, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                transition: 'all 0.15s',
              }}>
              <Icon size={15} /> {label}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeSection}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

          {/* Transcript */}
          {activeSection === 'transcript' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Original Transcript</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {meeting.transcript.split(/\s+/).length} words
                </span>
              </div>
              <pre style={{
                margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)',
                lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                fontFamily: 'Inter, sans-serif',
                background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)',
                padding: '1rem', maxHeight: '60vh', overflowY: 'auto',
              }}>
                {meeting.transcript}
              </pre>
            </div>
          )}

          {/* MOM */}
          {activeSection === 'mom' && (
            <div>
              {regenLoading ? <MOMSkeleton /> :
               meeting.mom ? <MOMDisplay meetingId={meeting.id} meetingTitle={meeting.title} mom={meeting.mom} /> : (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>MOM not yet generated.</p>
                  <button className="btn btn-primary" onClick={handleRegenMOM}>
                    <Sparkles size={16} /> Generate MOM Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Items */}
          {activeSection === 'actions' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontWeight: 700 }}>Action Items</h3>
              <ActionChecklist
                items={meeting.actionItems || []}
                meetingId={meeting.id}
                onUpdate={setMeeting}
              />
            </div>
          )}

          {/* Chat */}
          {activeSection === 'chat' && (
            <div className="card" style={{ height: 520, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Meeting AI Chat</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                  Ask questions about this specific meeting
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <ChatWindow
                  messages={chatHistory}
                  onSend={handleChat}
                  loading={chatLoading}
                  placeholder="e.g. Who is responsible for venue booking?"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}

function MeetingPageSkeleton() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="skeleton" style={{ height: 20, width: 100, marginBottom: '1rem', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 36, width: 300, marginBottom: '0.5rem', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 20, width: 200, marginBottom: '1.5rem', borderRadius: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 'var(--radius-md)' }} />)}
      </div>
      <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
    </div>
  );
}
