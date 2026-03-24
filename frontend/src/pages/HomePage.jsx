import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Hash,
  MessageSquareText,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { getEvents, deleteEvent } from '../api';
import { useStore } from '../store';

const onboarding = [
  { icon: UploadCloud, title: 'Add transcripts', text: 'Create an event, add meetings, and paste the transcript first.' },
  { icon: FileCheck2, title: 'Generate MOM', text: 'MeetMind turns transcript text into minutes, decisions, and blockers.' },
  { icon: MessageSquareText, title: 'Ask the chatbot', text: 'Chat with a meeting or across the entire event workspace.' },
  { icon: CheckCircle2, title: 'Track action items', text: 'Keep owners, pending work, and decisions visible in one dashboard.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { addNotification } = useStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch {
      addNotification('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this event and all its meetings?')) return;
    setDeletingId(id);
    try {
      await deleteEvent(id);
      setEvents(ev => ev.filter(x => x.id !== id));
      addNotification('Event deleted', 'success');
    } catch {
      addNotification('Failed to delete event', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-enter workspace-home">
      <section className="workspace-hero-v2">
        <div>
          <span className="workspace-kicker"><Brain size={15} /> MeetMind workspace</span>
          <h1>Your meeting intelligence hub</h1>
          <p>
            Create an event, add meeting transcripts, generate MOMs and action
            items, then ask the AI chatbot about anything your team discussed.
          </p>
        </div>
        <button className="workspace-primary" onClick={() => navigate('/create-event')}>
          <Plus size={18} /> New Event
        </button>
      </section>

      <section className="workspace-flow-grid" aria-label="MeetMind workflow">
        {onboarding.map(({ icon: Icon, title, text }) => (
          <article className="workspace-flow-card" key={title}>
            <div><Icon size={20} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <div className="workspace-section-head">
        <div>
          <h2>Events</h2>
          <p>
            {events.length > 0
              ? `${events.length} event${events.length !== 1 ? 's' : ''} ready for transcript analysis`
              : 'Start with an event, then add your first meeting transcript.'}
          </p>
        </div>
        <button className="workspace-secondary" onClick={() => navigate('/create-event')}>
          <Plus size={17} /> Create Event
        </button>
      </div>

      {loading && (
        <div className="event-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 210, borderRadius: 10 }} />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="empty-saas">
          <div className="empty-icon"><Brain size={34} /></div>
          <h2>No events yet</h2>
          <p>
            Create your first event workspace. After that, you can add a meeting
            transcript, generate MOM, review action items, and use the event chatbot.
          </p>
          <div className="empty-actions">
            <button className="workspace-primary" onClick={() => navigate('/create-event')}>
              <Plus size={18} /> Create First Event
            </button>
            <span><Search size={16} /> Decision search unlocks after meetings are added</span>
          </div>
        </motion.section>
      )}

      {!loading && events.length > 0 && (
        <div className="event-grid">
          <AnimatePresence>
            {events.map((event, idx) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
                className="event-card-v2"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <div className="event-card-top">
                  <div>
                    <span className="event-pill"><Hash size={12} /> Event workspace</span>
                    <h3>{event.name}</h3>
                  </div>
                  <button
                    className="icon-danger"
                    aria-label="Delete event"
                    onClick={(e) => handleDelete(e, event.id)}
                    disabled={deletingId === event.id}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {event.description && <p className="event-description">{event.description}</p>}

                <div className="event-meta-row">
                  <span><Calendar size={14} /> {new Date(event.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span><FileCheck2 size={14} /> {event.meetingCount} meeting{event.meetingCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="event-card-footer">
                  <span>Open dashboard</span>
                  <ArrowRight size={16} />
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        .workspace-home {
          width: min(1200px, calc(100% - 3rem));
          margin: 0 auto;
          padding: 2rem 0 3rem;
        }

        .workspace-hero-v2 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 1rem;
          padding: clamp(1.25rem, 3vw, 1.8rem);
          border-radius: 12px;
          background:
            linear-gradient(135deg, rgba(0, 111, 167, 0.98), rgba(25, 187, 232, 0.94)),
            #0b95c9;
          box-shadow: 0 24px 70px rgba(0, 93, 140, 0.16);
          color: #fff;
        }

        .workspace-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 0.9rem;
          color: rgba(255,255,255,0.86);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.68rem;
          font-weight: 850;
        }

        .workspace-hero-v2 h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(2.1rem, 4vw, 3.3rem);
          line-height: 1;
          letter-spacing: 0;
        }

        .workspace-hero-v2 p {
          max-width: 620px;
          margin: 0.85rem 0 0;
          color: rgba(255,255,255,0.78);
          font-size: 0.96rem;
          line-height: 1.65;
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

        .workspace-flow-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.8rem;
          margin-bottom: 2rem;
        }

        .workspace-flow-card,
        .event-card-v2,
        .empty-saas {
          border: 1px solid #dcecf2;
          border-radius: 10px;
          background: rgba(255,255,255,0.86);
          box-shadow: 0 18px 50px rgba(0, 72, 105, 0.06);
        }

        .workspace-flow-card {
          min-height: 170px;
          padding: 1rem;
        }

        .workspace-flow-card div {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #078bc1;
          background: #e8f8fd;
        }

        .workspace-flow-card h3 {
          margin: 2.5rem 0 0.4rem;
          color: #081114;
          font-size: 1rem;
          letter-spacing: 0;
        }

        .workspace-flow-card p,
        .workspace-section-head p,
        .event-description,
        .empty-saas p {
          color: #62757d;
          font-size: 0.88rem;
          line-height: 1.55;
        }

        .workspace-section-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .workspace-section-head h2 {
          margin: 0 0 0.25rem;
          color: #081114;
          font-size: 1.45rem;
          letter-spacing: 0;
        }

        .workspace-section-head p {
          margin: 0;
        }

        .empty-saas {
          display: grid;
          place-items: center;
          padding: clamp(2rem, 7vw, 5rem) 1.5rem;
          text-align: center;
        }

        .empty-icon {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          margin-bottom: 1rem;
          border-radius: 18px;
          color: #0b93c8;
          background: #dff4fb;
        }

        .empty-saas h2 {
          margin: 0 0 0.45rem;
          font-size: 1.35rem;
          letter-spacing: 0;
        }

        .empty-saas p {
          max-width: 560px;
          margin: 0 0 1.25rem;
        }

        .empty-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .empty-actions span {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #62757d;
          font-size: 0.82rem;
          font-weight: 700;
        }

        .event-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 0.9rem;
        }

        .event-card-v2 {
          min-height: 210px;
          padding: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .event-card-v2:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(0, 72, 105, 0.11);
        }

        .event-card-top {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.8rem;
        }

        .event-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #078bc1;
          font-size: 0.72rem;
          font-weight: 850;
        }

        .event-card-v2 h3 {
          margin: 0.55rem 0 0;
          color: #081114;
          font-size: 1.2rem;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .icon-danger {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          color: #8fa0a7;
          background: #f4f9fb;
          cursor: pointer;
        }

        .icon-danger:hover {
          color: #dc2626;
          background: #fff1f1;
        }

        .event-description {
          min-height: 42px;
          margin: 0 0 1rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .event-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .event-meta-row span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.55rem;
          border-radius: 999px;
          color: #50666f;
          background: #f0f8fb;
          font-size: 0.76rem;
          font-weight: 750;
        }

        .event-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid #e6f0f4;
          color: #078bc1;
          font-size: 0.82rem;
          font-weight: 850;
        }

        @media (max-width: 900px) {
          .workspace-home {
            width: calc(100% - 1.5rem);
            padding-top: 1rem;
          }

          .workspace-hero-v2,
          .workspace-section-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .workspace-flow-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 560px) {
          .workspace-flow-grid,
          .event-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
