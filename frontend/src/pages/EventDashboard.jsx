import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileCheck2,
  FileText,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  Target,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  chatWithEvent,
  createMeeting,
  generateEventSummary,
  getEvent,
  getEventActionItems,
  getEventDecisions,
} from '../api';
import { useStore } from '../store';
import { ChatWindow } from '../components/chat/ChatWindow';
import MeetingTimeline from '../components/meeting/MeetingTimeline';

const TABS = [
  { id: 'Timeline', icon: Calendar },
  { id: 'Decisions', icon: CheckCircle2 },
  { id: 'Action Items', icon: CheckSquare },
  { id: 'AI Summary', icon: Sparkles },
];

const capabilityCards = [
  { icon: UploadCloud, title: 'Transcript input', text: 'Paste or upload transcript text when adding a meeting.' },
  { icon: FileCheck2, title: 'Auto MOM', text: 'Generate minutes, decisions, blockers, and follow-up.' },
  { icon: MessageSquareText, title: 'Event chatbot', text: 'Ask across every meeting inside this event.' },
  { icon: Search, title: 'Searchable memory', text: 'Review decisions and actions without rereading transcripts.' },
];

export default function EventDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useStore();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Timeline');
  const [showModal, setShowModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    transcript: '',
  });
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const fileInputRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [decisions, setDecisions] = useState([]);
  const [eventActions, setEventActions] = useState([]);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchEvent = async () => {
    try {
      const data = await getEvent(id);
      setEvent(data);
    } catch {
      addNotification('Failed to load event', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'Decisions' && decisions.length === 0) {
      try { setDecisions(await getEventDecisions(id)); } catch {}
    }
    if (tab === 'Action Items' && eventActions.length === 0) {
      try { setEventActions(await getEventActionItems(id)); } catch {}
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) { addNotification('Meeting title required', 'error'); return; }
    if (!meetingForm.transcript.trim()) { addNotification('Transcript required', 'error'); return; }
    setCreatingMeeting(true);
    try {
      await createMeeting({ eventId: id, ...meetingForm });
      await fetchEvent();
      setShowModal(false);
      setMeetingForm({ title: '', date: new Date().toISOString().split('T')[0], transcript: '' });
      addNotification('Meeting added and MOM generated!', 'success');
      setActiveTab('Timeline');
    } catch (err) {
      addNotification(err.response?.data?.error || 'Failed to create meeting', 'error');
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMeetingForm(f => ({ ...f, transcript: ev.target.result }));
    reader.readAsText(file);
  };

  const handleEventChat = async (question) => {
    const userMsg = { role: 'user', content: question };
    setChatHistory(h => [...h, userMsg]);
    setChatLoading(true);
    try {
      const { answer } = await chatWithEvent(id, question, chatHistory);
      setChatHistory(h => [...h, { role: 'assistant', content: answer }]);
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const { summary: s } = await generateEventSummary(id);
      setSummary(s);
    } catch {
      addNotification('Failed to generate summary', 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) return <PageSkeleton />;
  if (!event) return (
    <div className="event-dashboard-shell" style={{ textAlign: 'center' }}>
      <p>Event not found.</p>
      <button className="workspace-primary" onClick={() => navigate('/events')}>Go Home</button>
    </div>
  );

  const stats = event.stats || {};
  const meetings = event.meetings || [];
  const transcriptWords = meetingForm.transcript.trim()
    ? meetingForm.transcript.trim().split(/\s+/).length
    : 0;

  return (
    <div className="page-enter event-dashboard-shell">
      <button className="back-link" onClick={() => navigate('/events')}>
        <ArrowLeft size={16} /> All Events
      </button>

      <section className="event-hero-v2">
        <div>
          <span className="workspace-kicker"><BarChart3 size={15} /> Event dashboard</span>
          <h1>{event.name}</h1>
          <p>
            {event.description || 'A complete SaaS workspace for meeting transcripts, AI MOM, action items, decisions, and chatbot answers.'}
          </p>
        </div>
        <div className="hero-actions-v2">
          <button className="workspace-secondary" onClick={() => handleTabChange('AI Summary')}>
            <Sparkles size={17} /> AI Summary
          </button>
          <button className="workspace-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} /> Add Transcript
          </button>
        </div>
      </section>

      <section className="capability-grid">
        {capabilityCards.map(({ icon: Icon, title, text }) => (
          <article className="capability-card" key={title}>
            <div><Icon size={20} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="stats-grid-v2">
        {[
          { label: 'Meetings', value: stats.totalMeetings || 0, icon: Calendar, tone: 'blue' },
          { label: 'Action Items', value: stats.totalActionItems || 0, icon: Target, tone: 'green' },
          { label: 'Pending Tasks', value: stats.pendingTasks || 0, icon: Clock, tone: 'amber' },
          { label: 'Decisions Made', value: stats.totalDecisions || 0, icon: CheckSquare, tone: 'dark' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div className={`stat-card-v2 ${tone}`} key={label}>
            <Icon size={20} />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="event-layout-v2">
        <div className="main-panel-v2">
          <div className="tabs-v2">
            {TABS.map(({ id: tab, icon: Icon }) => (
              <button
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => handleTabChange(tab)}
              >
                <Icon size={16} /> {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {activeTab === 'Timeline' && (
                meetings.length ? (
                  <MeetingTimeline meetings={meetings} eventId={id} />
                ) : (
                  <EmptyTranscriptState onAdd={() => setShowModal(true)} />
                )
              )}

              {activeTab === 'Decisions' && (
                decisions.length === 0 ? (
                  <EmptyState icon={CheckCircle2} title="No decisions yet" desc="Add a meeting transcript and generated MOM decisions will appear here." />
                ) : (
                  <div className="list-stack">
                    {decisions.map((d, i) => (
                      <motion.article className="list-card" key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                        <CheckCircle2 size={18} />
                        <div>
                          <p>{d.decision}</p>
                          <span>{d.meetingTitle} - {new Date(d.date).toLocaleDateString()}</span>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'Action Items' && (
                eventActions.length === 0 ? (
                  <EmptyState icon={CheckSquare} title="No action items yet" desc="Action items are created from meeting MOMs after you add transcript content." />
                ) : (
                  <div className="list-stack">
                    {eventActions.map((item, i) => (
                      <article className="list-card" key={i}>
                        <CheckSquare size={18} />
                        <div>
                          <p style={{ textDecoration: item.status === 'completed' ? 'line-through' : 'none' }}>{item.task}</p>
                          <span>{item.meetingTitle}{item.responsible && item.responsible !== 'Not specified' ? ` - ${item.responsible}` : ''}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'AI Summary' && (
                <SummaryPanel
                  summary={summary}
                  loading={summaryLoading}
                  meetingCount={meetings.length}
                  onGenerate={handleGenerateSummary}
                  onReset={() => setSummary('')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="side-panel-v2">
          <div className="quick-transcript-card">
            <div className="side-head">
              <div>
                <strong>Add meeting transcript</strong>
                <span>Required before MOM, actions, and chat become useful.</span>
              </div>
              <UploadCloud size={20} />
            </div>
            <button className="workspace-primary" onClick={() => setShowModal(true)}>
              <Plus size={17} /> Add Transcript
            </button>
          </div>

          <div className="chat-card-v2">
            <div className="side-head">
              <div>
                <strong>Event AI Chatbot</strong>
                <span>Ask across all {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</span>
              </div>
              <MessageSquareText size={20} />
            </div>
            <div className="chat-body-v2">
              <ChatWindow
                messages={chatHistory}
                onSend={handleEventChat}
                loading={chatLoading}
                placeholder="Ask: What decisions were made?"
              />
            </div>
          </div>
        </aside>
      </section>

      <AnimatePresence>
        {showModal && (
          <Modal title="Add meeting transcript" onClose={() => setShowModal(false)}>
            <form onSubmit={handleCreateMeeting}>
              <div className="modal-grid">
                <div>
                  <label style={labelStyle}>Meeting Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. Product planning sync"
                    value={meetingForm.title}
                    onChange={e => setMeetingForm(f => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={labelStyle}>Meeting Date</label>
                  <input
                    type="date"
                    className="input"
                    value={meetingForm.date}
                    onChange={e => setMeetingForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div className="transcript-label-row">
                  <label style={labelStyle}>Transcript *</label>
                  <button type="button" className="workspace-secondary mini" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={14} /> Upload .txt
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept=".txt" style={{ display: 'none' }} onChange={handleFileUpload} />
                <textarea
                  className="input transcript-input"
                  rows={10}
                  placeholder={'Paste your meeting transcript here...\n\nExample:\nPriya: We need final approval by Friday.\nAhmed: I will share the vendor budget today.'}
                  value={meetingForm.transcript}
                  onChange={e => setMeetingForm(f => ({ ...f, transcript: e.target.value }))}
                />
                <div className="transcript-helper">
                  <span>{transcriptWords} words</span>
                  <span>MeetMind will generate MOM, decisions, action items, and chatbot context.</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="workspace-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="workspace-primary" disabled={creatingMeeting}>
                  {creatingMeeting ? <><Spinner /> Generating MOM...</> : <><Sparkles size={16} /> Add and Generate MOM</>}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <style>{`
        .event-dashboard-shell {
          width: min(1280px, calc(100% - 3rem));
          margin: 0 auto;
          padding: 2rem 0 3rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 1rem;
          border: 0;
          background: transparent;
          color: #62757d;
          cursor: pointer;
          font-weight: 800;
        }

        .event-hero-v2 {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1rem;
          padding: clamp(1.25rem, 3vw, 1.8rem);
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(0, 111, 167, 0.98), rgba(25, 187, 232, 0.94));
          color: #fff;
          box-shadow: 0 24px 70px rgba(0, 93, 140, 0.16);
        }

        .workspace-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 0.85rem;
          color: rgba(255,255,255,0.86);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.68rem;
          font-weight: 850;
        }

        .event-hero-v2 h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(2rem, 4vw, 3.1rem);
          line-height: 1;
          letter-spacing: 0;
        }

        .event-hero-v2 p {
          max-width: 680px;
          margin: 0.75rem 0 0;
          color: rgba(255,255,255,0.78);
          line-height: 1.65;
        }

        .hero-actions-v2,
        .modal-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
        }

        .workspace-primary,
        .workspace-secondary {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          padding: 0 1.15rem;
          border-radius: 999px;
          border: 0;
          cursor: pointer;
          font-weight: 850;
          font-size: 0.82rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .workspace-primary {
          color: #101010;
          background: #cfff31;
          box-shadow: 0 16px 34px rgba(71, 136, 0, 0.22);
        }

        .workspace-secondary {
          color: #101010;
          background: #fff;
          border: 1px solid #dcecf2;
        }

        .workspace-primary:hover,
        .workspace-secondary:hover {
          transform: translateY(-2px);
        }

        .workspace-secondary.mini {
          min-height: 34px;
          padding: 0 0.8rem;
          font-size: 0.76rem;
        }

        .capability-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.8rem;
          margin-bottom: 1rem;
        }

        .capability-card,
        .stat-card-v2,
        .main-panel-v2,
        .quick-transcript-card,
        .chat-card-v2,
        .list-card,
        .summary-panel,
        .empty-transcript,
        .empty-state-v2 {
          border: 1px solid #dcecf2;
          border-radius: 10px;
          background: rgba(255,255,255,0.88);
          box-shadow: 0 18px 50px rgba(0, 72, 105, 0.06);
        }

        .capability-card {
          min-height: 145px;
          padding: 1rem;
        }

        .capability-card div {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #078bc1;
          background: #e8f8fd;
        }

        .capability-card h3 {
          margin: 1.9rem 0 0.35rem;
          color: #081114;
          font-size: 0.98rem;
          letter-spacing: 0;
        }

        .capability-card p,
        .side-head span,
        .empty-transcript p,
        .empty-state-v2 p {
          margin: 0;
          color: #62757d;
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .stats-grid-v2 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.8rem;
          margin-bottom: 1rem;
        }

        .stat-card-v2 {
          padding: 1rem;
        }

        .stat-card-v2 svg {
          color: #078bc1;
        }

        .stat-card-v2.green svg,
        .stat-card-v2.green strong { color: #059669; }
        .stat-card-v2.amber svg,
        .stat-card-v2.amber strong { color: #d97706; }
        .stat-card-v2.dark svg,
        .stat-card-v2.dark strong { color: #111; }

        .stat-card-v2 strong,
        .stat-card-v2 span {
          display: block;
        }

        .stat-card-v2 strong {
          margin-top: 1.6rem;
          color: #078bc1;
          font-size: 2rem;
          line-height: 1;
        }

        .stat-card-v2 span {
          margin-top: 0.35rem;
          color: #6b7c84;
          font-size: 0.82rem;
          font-weight: 800;
        }

        .event-layout-v2 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: 1rem;
          align-items: start;
        }

        .main-panel-v2 {
          padding: 0.85rem;
        }

        .tabs-v2 {
          display: flex;
          gap: 0.45rem;
          overflow-x: auto;
          padding-bottom: 0.85rem;
          margin-bottom: 0.85rem;
          border-bottom: 1px solid #e6f0f4;
        }

        .tabs-v2 button {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0 0.85rem;
          border: 1px solid #dcecf2;
          border-radius: 999px;
          background: #fff;
          color: #61737b;
          cursor: pointer;
          white-space: nowrap;
          font-weight: 850;
        }

        .tabs-v2 button.active {
          border-color: #0b93c8;
          background: #0b93c8;
          color: #fff;
        }

        .side-panel-v2 {
          display: grid;
          gap: 1rem;
          position: sticky;
          top: 76px;
        }

        .quick-transcript-card,
        .chat-card-v2 {
          padding: 1rem;
        }

        .side-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.85rem;
        }

        .side-head strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #081114;
          font-size: 0.98rem;
        }

        .side-head svg {
          color: #078bc1;
        }

        .quick-transcript-card .workspace-primary {
          width: 100%;
        }

        .chat-card-v2 {
          min-height: 520px;
          display: flex;
          flex-direction: column;
        }

        .chat-body-v2 {
          min-height: 420px;
          flex: 1;
          overflow: hidden;
          border: 1px solid #e6f0f4;
          border-radius: 10px;
          background: #f7fbfc;
        }

        .empty-transcript {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 1rem;
          padding: 1rem;
          align-items: stretch;
        }

        .empty-transcript-copy {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem;
          border-radius: 10px;
          background: #081114;
          color: #fff;
        }

        .empty-transcript-copy h2 {
          margin: 0 0 0.65rem;
          color: #fff;
          font-size: clamp(1.6rem, 3vw, 2.35rem);
          line-height: 1.04;
          letter-spacing: 0;
        }

        .empty-transcript-copy p {
          color: rgba(255,255,255,0.68);
        }

        .empty-transcript-preview {
          padding: 1rem;
          border-radius: 10px;
          background: #f3f9fb;
        }

        .preview-line {
          padding: 0.65rem 0.75rem;
          margin-bottom: 0.55rem;
          border-radius: 8px;
          background: #fff;
          color: #526a73;
          font-size: 0.82rem;
          line-height: 1.45;
        }

        .preview-output {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.5rem;
          margin-top: 0.8rem;
        }

        .preview-output span {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.55rem;
          border-radius: 8px;
          color: #081114;
          background: #cfff31;
          font-size: 0.72rem;
          font-weight: 850;
        }

        .list-stack {
          display: grid;
          gap: 0.65rem;
        }

        .list-card {
          display: flex;
          gap: 0.75rem;
          padding: 0.9rem 1rem;
        }

        .list-card svg {
          flex: 0 0 auto;
          color: #078bc1;
          margin-top: 0.15rem;
        }

        .list-card p {
          margin: 0 0 0.25rem;
          color: #081114;
          font-weight: 750;
        }

        .list-card span {
          color: #6b7c84;
          font-size: 0.8rem;
        }

        .summary-panel,
        .empty-state-v2 {
          padding: 1.2rem;
        }

        .summary-panel h3,
        .empty-state-v2 h3 {
          margin: 0 0 0.5rem;
          color: #081114;
          letter-spacing: 0;
        }

        .summary-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .empty-state-v2 {
          display: grid;
          place-items: center;
          min-height: 260px;
          text-align: center;
        }

        .empty-state-v2 svg {
          margin-bottom: 0.8rem;
          color: #078bc1;
        }

        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 190px;
          gap: 0.8rem;
        }

        .transcript-label-row,
        .transcript-helper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .transcript-input {
          min-height: 260px;
        }

        .transcript-helper {
          margin-top: 0.45rem;
          color: #62757d;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .modal-actions {
          justify-content: flex-end;
          margin-top: 1.25rem;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1120px) {
          .event-layout-v2 {
            grid-template-columns: 1fr;
          }

          .side-panel-v2 {
            position: static;
            grid-template-columns: 1fr;
          }

          .chat-card-v2 {
            min-height: 460px;
          }
        }

        @media (max-width: 900px) {
          .event-dashboard-shell {
            width: calc(100% - 1.5rem);
            padding-top: 1rem;
          }

          .event-hero-v2 {
            align-items: flex-start;
            flex-direction: column;
          }

          .capability-grid,
          .stats-grid-v2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .empty-transcript,
          .modal-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .capability-grid,
          .stats-grid-v2,
          .preview-output {
            grid-template-columns: 1fr;
          }

          .transcript-label-row,
          .transcript-helper,
          .modal-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  color: 'var(--color-text-primary)',
  fontSize: '0.875rem',
  fontWeight: 700,
};

function EmptyTranscriptState({ onAdd }) {
  return (
    <div className="empty-transcript">
      <div className="empty-transcript-copy">
        <div>
          <span className="workspace-kicker"><UploadCloud size={15} /> Start here</span>
          <h2>Add your first meeting transcript</h2>
          <p>
            Transcript input is the core step. Once added, MeetMind generates
            MOM, decisions, action items, and chatbot context.
          </p>
        </div>
        <button className="workspace-primary" onClick={onAdd}>
          <Plus size={17} /> Add Transcript
        </button>
      </div>
      <div className="empty-transcript-preview">
        <div className="preview-line"><b>Priya:</b> We need venue approval before Friday.</div>
        <div className="preview-line"><b>Ahmed:</b> I will share the updated budget today.</div>
        <div className="preview-line"><b>Sarah:</b> Launch copy is blocked by design review.</div>
        <div className="preview-output">
          <span><FileCheck2 size={14} /> MOM</span>
          <span><CheckSquare size={14} /> Tasks</span>
          <span><MessageSquareText size={14} /> Chat</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="empty-state-v2">
      <Icon size={34} />
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function SummaryPanel({ summary, loading, meetingCount, onGenerate, onReset }) {
  if (!summary && !loading) {
    return (
      <div className="empty-state-v2">
        <Sparkles size={36} />
        <h3>Generate event summary</h3>
        <p>Analyze all {meetingCount} meeting{meetingCount !== 1 ? 's' : ''} and create a complete event report.</p>
        <button className="workspace-primary" onClick={onGenerate} disabled={!meetingCount}>
          <Sparkles size={17} /> Generate Summary
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty-state-v2">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
        </div>
        <h3>Analyzing meetings</h3>
        <p>MeetMind is creating a summary from the event memory.</p>
      </div>
    );
  }

  return (
    <div className="summary-panel">
      <div className="summary-panel-head">
        <h3>Event Summary Report</h3>
        <button className="workspace-secondary" onClick={onReset}>Regenerate</button>
      </div>
      <div className="mom-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(8, 17, 20, 0.48)', zIndex: 200 }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(760px, calc(100% - 1.5rem))',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'rgba(255,255,255,0.98)',
          border: '1px solid #dcecf2',
          borderRadius: 12,
          boxShadow: '0 28px 80px rgba(0,0,0,0.22)',
          zIndex: 201,
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, color: '#081114', letterSpacing: 0 }}>{title}</h3>
            <p style={{ margin: '0.25rem 0 0', color: '#62757d', fontSize: '0.86rem' }}>
              Paste the transcript so MeetMind can generate MOM, tasks, decisions, and chatbot context.
            </p>
          </div>
          <button className="workspace-secondary mini" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 15,
        height: 15,
        border: '2px solid rgba(17,17,17,0.25)',
        borderTopColor: '#111',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
      }}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="event-dashboard-shell">
      <div className="skeleton" style={{ height: 210, marginBottom: '1rem', borderRadius: 12 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', marginBottom: '1rem' }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 10 }} />)}
      </div>
      <div className="skeleton" style={{ height: 420, borderRadius: 10 }} />
    </div>
  );
}
