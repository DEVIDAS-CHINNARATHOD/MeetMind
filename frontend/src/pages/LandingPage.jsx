import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Brain,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UsersRound,
  Zap,
} from "lucide-react";

const productTabs = [
  { icon: UploadCloud, label: "Transcript" },
  { icon: FileCheck2, label: "MOM" },
  { icon: CheckCircle2, label: "Actions" },
  { icon: MessageSquareText, label: "AI Chat" },
];

const features = [
  {
    icon: UploadCloud,
    title: "Transcript workspace",
    text: "Paste or upload a meeting transcript and keep the original conversation visible beside the AI output.",
  },
  {
    icon: MessageSquareText,
    title: "Meeting chatbot",
    text: "Ask questions like who owns a task, what decisions were made, or what risks were mentioned.",
  },
  {
    icon: FileCheck2,
    title: "Minutes of meeting",
    text: "Generate structured MOM with agenda, discussion points, decisions, blockers, and clean follow-up.",
  },
  {
    icon: CheckCircle2,
    title: "Action item tracker",
    text: "Turn vague follow-ups into assigned tasks with status, owner context, and completion visibility.",
  },
  {
    icon: Search,
    title: "Decision search",
    text: "Find past decisions and meeting context across events without rereading long transcripts.",
  },
  {
    icon: UsersRound,
    title: "Event dashboards",
    text: "Group meetings by event or project so teams can understand progress at a glance.",
  },
];

const workflow = [
  "Create an event or project workspace",
  "Add meetings and paste transcripts",
  "Generate MOM, decisions, and action items",
  "Chat with the meeting knowledge base",
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="mm-saas">
      <section className="saas-hero">
        <div className="saas-shell">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="eyebrow">
              <Sparkles size={15} />
              AI meeting intelligence platform
            </div>
            <h1>Transcript in. MOM, tasks, and answers out.</h1>
            <p>
              MeetMind is a proper SaaS workspace for meeting transcripts,
              AI chatbot Q&A, minutes of meeting, action items, and searchable
              decision memory.
            </p>
            <div className="hero-actions">
              <button className="primary-action" onClick={() => navigate("/create-event")}>
                Create event
                <ArrowUpRight size={17} />
              </button>
              <button className="secondary-action" onClick={() => navigate("/events")}>
                View workspace
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="trust-row">
              <span><BadgeCheck size={16} /> Transcript-first workflow</span>
              <span><ShieldCheck size={16} /> Clear team ownership</span>
            </div>
          </motion.div>

          <motion.div
            className="product-preview"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductMockup />
          </motion.div>
        </div>
      </section>

      <section className="logo-proof" aria-label="Product proof">
        <div className="proof-track">
          {["Awwwards inspired UI", "Fast summaries", "Transcript Q&A", "Action clarity", "Decision memory", "SaaS ready"].map((item) => (
            <span key={item}>
              <Zap size={16} />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="section feature-section" id="features">
        <div className="section-heading">
          <div>
            <span className="kicker">Core features</span>
            <h2>All important meeting tools, visible and easy to understand.</h2>
          </div>
          <p>
            The landing page now mirrors the real platform: transcript input,
            AI chat, generated MOM, action items, dashboards, and search.
          </p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              className="feature-card"
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
            >
              <div className="feature-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section workflow-section" id="workflow">
        <div className="workflow-copy">
          <span className="kicker">Platform flow</span>
          <h2>A simple workflow for every meeting-heavy team.</h2>
          <p>
            MeetMind keeps the UI quiet and practical: upload the transcript,
            generate structured output, ask the chatbot, and keep execution moving.
          </p>
        </div>
        <div className="workflow-list">
          {workflow.map((step, index) => (
            <div className="workflow-item" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section platform-section" id="about">
        <div className="platform-card">
          <div>
            <span className="kicker">Why MeetMind</span>
            <h2>Built for operators, founders, managers, and teams who need recall.</h2>
          </div>
          <div className="metric-grid">
            <div>
              <strong>4</strong>
              <span>Main views: Transcript, MOM, Actions, Chat</span>
            </div>
            <div>
              <strong>1</strong>
              <span>Shared place for meeting memory</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>Summaries and answers grounded in transcript context</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="saas-footer">
        <div className="footer-marquee" aria-hidden="true">
          <span>MeetMind</span>
          <span>Transcript</span>
          <span>Chatbot</span>
          <span>MOM</span>
          <span>Actions</span>
          <span>Search</span>
          <span>MeetMind</span>
          <span>Transcript</span>
          <span>Chatbot</span>
          <span>MOM</span>
          <span>Actions</span>
          <span>Search</span>
        </div>
        <div className="footer-inner">
          <div className="footer-brand">
            <Brain size={22} />
            <div>
              <strong>MeetMind</strong>
              <span>AI meeting intelligence platform</span>
            </div>
          </div>
          <button className="primary-action footer-action" onClick={() => navigate("/events")}>
            Launch app
            <ArrowUpRight size={17} />
          </button>
        </div>
      </footer>

      <style>{`
        .mm-saas {
          min-height: 100vh;
          padding: 0.5rem;
          overflow: hidden;
          background: #f7fbfc;
          color: #081114;
        }

        .saas-hero {
          position: relative;
          min-height: calc(100vh - 1rem);
          display: flex;
          align-items: center;
          padding: 5.5rem 0 2.5rem;
          border-radius: 18px;
          background:
            linear-gradient(135deg, rgba(0, 111, 167, 0.98), rgba(25, 187, 232, 0.94)),
            #0c98cb;
          overflow: hidden;
        }

        .saas-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 72px 72px;
          opacity: 0.32;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        .saas-hero::after {
          content: "";
          position: absolute;
          left: -8%;
          right: -8%;
          bottom: -18%;
          height: 38%;
          background: rgba(255,255,255,0.86);
          filter: blur(34px);
          transform: rotate(-2deg);
        }

        .saas-shell {
          position: relative;
          z-index: 2;
          width: min(1180px, calc(100% - 2rem));
          display: grid;
          grid-template-columns: minmax(320px, 0.88fr) minmax(520px, 1.12fr);
          align-items: center;
          gap: clamp(2rem, 5vw, 4rem);
          margin: 0 auto;
        }

        .hero-copy {
          color: #fff;
        }

        .eyebrow,
        .kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.68rem;
          font-weight: 850;
        }

        .eyebrow {
          margin-bottom: 1.1rem;
          padding: 0.45rem 0.72rem;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          background: rgba(255,255,255,0.13);
          color: rgba(255,255,255,0.9);
          backdrop-filter: blur(14px);
        }

        .hero-copy h1 {
          max-width: 620px;
          margin: 0;
          color: #fff;
          font-size: clamp(3rem, 6vw, 5.9rem);
          line-height: 0.94;
          letter-spacing: 0;
          font-weight: 760;
        }

        .hero-copy p {
          max-width: 560px;
          margin: 1.2rem 0 0;
          color: rgba(255,255,255,0.82);
          font-size: 1rem;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.6rem;
        }

        .primary-action,
        .secondary-action {
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0 1.1rem;
          border: 0;
          border-radius: 999px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.68rem;
          font-weight: 900;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .primary-action {
          background: #cfff31;
          color: #101010;
          box-shadow: 0 16px 34px rgba(71, 136, 0, 0.26);
        }

        .primary-action:hover,
        .secondary-action:hover {
          transform: translateY(-2px);
        }

        .secondary-action {
          background: rgba(255,255,255,0.13);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(12px);
        }

        .trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-top: 1.25rem;
        }

        .trust-row span {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: rgba(255,255,255,0.84);
          font-size: 0.82rem;
          font-weight: 700;
        }

        .product-preview {
          min-width: 0;
        }

        .mockup {
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.28);
          border-radius: 12px;
          background: rgba(255,255,255,0.86);
          box-shadow: 0 34px 90px rgba(0, 53, 82, 0.28);
          backdrop-filter: blur(20px);
        }

        .mockup-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(0, 87, 132, 0.1);
          background: rgba(255,255,255,0.78);
        }

        .mockup-brand {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-weight: 850;
        }

        .mockup-brand span {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #0b96cb;
          color: #fff;
        }

        .mockup-status {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #426000;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .mockup-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.45rem;
          padding: 0.8rem;
          background: #f3f9fb;
        }

        .mockup-tabs button {
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.38rem;
          border: 1px solid #d9edf4;
          border-radius: 999px;
          background: #fff;
          color: #49636d;
          font-size: 0.72rem;
          font-weight: 850;
        }

        .mockup-tabs button:first-child {
          color: #fff;
          background: #0b93c8;
          border-color: #0b93c8;
        }

        .mockup-body {
          display: grid;
          grid-template-columns: 1fr 0.82fr;
          gap: 0.8rem;
          padding: 0.8rem;
        }

        .transcript-panel,
        .chat-panel,
        .summary-card,
        .action-card {
          border: 1px solid #e3eef2;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 16px 36px rgba(0, 60, 90, 0.06);
        }

        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem;
          border-bottom: 1px solid #edf4f6;
        }

        .panel-head strong {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.86rem;
        }

        .panel-head span {
          color: #7d9199;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .transcript-text {
          display: grid;
          gap: 0.55rem;
          padding: 0.85rem;
          color: #526a73;
          font-size: 0.76rem;
          line-height: 1.55;
        }

        .transcript-text p {
          margin: 0;
          padding: 0.6rem;
          border-radius: 8px;
          background: #f5fbfd;
        }

        .output-column {
          display: grid;
          gap: 0.8rem;
        }

        .summary-card,
        .action-card,
        .chat-panel {
          padding: 0.85rem;
        }

        .summary-card h3,
        .action-card h3,
        .chat-panel h3 {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin: 0 0 0.75rem;
          color: #0c1518;
          font-size: 0.88rem;
          letter-spacing: 0;
        }

        .summary-card ul,
        .action-card ul {
          display: grid;
          gap: 0.45rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .summary-card li,
        .action-card li {
          display: flex;
          gap: 0.45rem;
          color: #536a73;
          font-size: 0.74rem;
          line-height: 1.35;
        }

        .summary-card li::before,
        .action-card li::before {
          content: "";
          width: 6px;
          height: 6px;
          flex: 0 0 auto;
          margin-top: 0.35rem;
          border-radius: 999px;
          background: #18bfe9;
        }

        .chat-bubble {
          padding: 0.65rem 0.75rem;
          border-radius: 10px;
          font-size: 0.74rem;
          line-height: 1.4;
        }

        .chat-bubble.user {
          margin-left: 2rem;
          color: #fff;
          background: #0b93c8;
        }

        .chat-bubble.ai {
          margin-top: 0.5rem;
          margin-right: 1rem;
          color: #415760;
          background: #f3f9fb;
        }

        .logo-proof {
          width: min(1120px, calc(100% - 2rem));
          margin: 1.35rem auto 4.5rem;
          overflow: hidden;
          color: #8a9aa0;
          mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
        }

        .proof-track {
          width: max-content;
          display: flex;
          align-items: center;
          gap: 2.5rem;
          animation: marquee 22s linear infinite;
        }

        .proof-track span {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.84rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .section {
          width: min(1120px, calc(100% - 2rem));
          margin: 0 auto 5rem;
        }

        .section-heading {
          display: grid;
          grid-template-columns: 1fr minmax(280px, 0.55fr);
          align-items: end;
          gap: 2rem;
          margin-bottom: 1.2rem;
        }

        .kicker {
          margin-bottom: 0.85rem;
          color: #0b83b4;
        }

        .section h2,
        .workflow-copy h2,
        .platform-card h2 {
          margin: 0;
          color: #071013;
          font-size: clamp(2rem, 4.2vw, 3.4rem);
          line-height: 1.04;
          letter-spacing: 0;
          font-weight: 760;
        }

        .section-heading p,
        .workflow-copy p {
          margin: 0;
          color: #5f737a;
          font-size: 0.95rem;
          line-height: 1.65;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.9rem;
        }

        .feature-card {
          min-height: 230px;
          padding: 1rem;
          border: 1px solid #e1edf1;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 18px 42px rgba(0, 72, 105, 0.05);
        }

        .feature-card:nth-child(2),
        .feature-card:nth-child(4) {
          background: #101718;
          color: #fff;
        }

        .feature-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #078bc1;
          background: #e8f8fd;
        }

        .feature-card:nth-child(2) .feature-icon,
        .feature-card:nth-child(4) .feature-icon {
          color: #111;
          background: #cfff31;
        }

        .feature-card h3 {
          margin: 4rem 0 0.55rem;
          color: inherit;
          font-size: 1.08rem;
          letter-spacing: 0;
        }

        .feature-card p {
          margin: 0;
          color: #657b83;
          font-size: 0.84rem;
          line-height: 1.52;
        }

        .feature-card:nth-child(2) p,
        .feature-card:nth-child(4) p {
          color: rgba(255,255,255,0.68);
        }

        .workflow-section {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 1rem;
          align-items: stretch;
        }

        .workflow-copy {
          padding: 1.4rem 1.2rem 1.4rem 0;
        }

        .workflow-copy p {
          margin-top: 1rem;
          max-width: 440px;
        }

        .workflow-list {
          display: grid;
          gap: 0.75rem;
          padding: 0.8rem;
          border: 1px solid #e1edf1;
          border-radius: 10px;
          background: #eef7fa;
        }

        .workflow-item {
          min-height: 84px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          background: #fff;
        }

        .workflow-item span {
          color: #0a91c7;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .workflow-item strong {
          color: #071013;
          font-size: clamp(1.05rem, 2vw, 1.55rem);
          line-height: 1.08;
          font-weight: 650;
          text-align: right;
        }

        .platform-card {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 2rem;
          padding: clamp(1rem, 3vw, 1.5rem);
          border-radius: 12px;
          background: #081114;
          color: #fff;
        }

        .platform-card h2 {
          color: #fff;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .metric-grid div {
          min-height: 190px;
          padding: 1rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
        }

        .metric-grid strong,
        .metric-grid span {
          display: block;
        }

        .metric-grid strong {
          color: #cfff31;
          font-size: 2.4rem;
          line-height: 1;
        }

        .metric-grid span {
          margin-top: 4rem;
          color: rgba(255,255,255,0.68);
          font-size: 0.82rem;
          line-height: 1.45;
        }

        .saas-footer {
          overflow: hidden;
          margin: 0.5rem;
          border-radius: 16px;
          background: #071013;
          color: #fff;
        }

        .footer-marquee {
          width: max-content;
          display: flex;
          gap: 2rem;
          padding: 1.2rem 0;
          color: rgba(255,255,255,0.12);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          animation: footer-marquee 24s linear infinite;
        }

        .footer-marquee span {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: clamp(2rem, 6vw, 5rem);
          line-height: 1;
          font-weight: 900;
        }

        .footer-inner {
          width: min(1120px, calc(100% - 2rem));
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin: 0 auto;
          padding: 1.6rem 0;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-brand svg {
          color: #cfff31;
          animation: pulse 2.8s ease-in-out infinite;
        }

        .footer-brand strong,
        .footer-brand span {
          display: block;
        }

        .footer-brand strong {
          font-size: 1.15rem;
        }

        .footer-brand span {
          color: rgba(255,255,255,0.58);
          font-size: 0.8rem;
        }

        .footer-action {
          box-shadow: none;
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes footer-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.82; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @media (max-width: 1020px) {
          .saas-shell,
          .section-heading,
          .workflow-section,
          .platform-card {
            grid-template-columns: 1fr;
          }

          .saas-hero {
            align-items: flex-start;
          }

          .mockup-body {
            grid-template-columns: 1fr;
          }

          .feature-grid,
          .metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .workflow-copy {
            padding-right: 0;
          }
        }

        @media (max-width: 640px) {
          .mm-saas {
            padding: 0;
          }

          .saas-hero {
            min-height: auto;
            padding: 5rem 0 2rem;
            border-radius: 0 0 18px 18px;
          }

          .saas-shell,
          .section,
          .logo-proof,
          .footer-inner {
            width: calc(100% - 1.5rem);
          }

          .hero-copy h1 {
            font-size: 3rem;
          }

          .hero-copy p {
            font-size: 0.94rem;
          }

          .product-preview {
            width: 100%;
          }

          .mockup-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mockup-body {
            padding: 0.55rem;
          }

          .feature-grid,
          .metric-grid {
            grid-template-columns: 1fr;
          }

          .feature-card {
            min-height: 210px;
          }

          .workflow-item {
            align-items: flex-start;
            flex-direction: column;
          }

          .workflow-item strong {
            text-align: left;
          }

          .platform-card {
            padding: 1rem;
          }

          .metric-grid span {
            margin-top: 2rem;
          }

          .saas-footer {
            margin: 0;
            border-radius: 18px 18px 0 0;
          }

          .footer-inner {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .proof-track,
          .footer-marquee,
          .footer-brand svg {
            animation: none !important;
          }

          .primary-action,
          .secondary-action {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function ProductMockup() {
  return (
    <div className="mockup">
      <div className="mockup-top">
        <div className="mockup-brand">
          <span><Brain size={16} /></span>
          Meeting workspace
        </div>
        <div className="mockup-status">
          <Clock3 size={14} />
          AI processed
        </div>
      </div>

      <div className="mockup-tabs">
        {productTabs.map(({ icon: Icon, label }) => (
          <button key={label}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="mockup-body">
        <div className="transcript-panel">
          <div className="panel-head">
            <strong><FileText size={16} /> Transcript input</strong>
            <span>1,284 words</span>
          </div>
          <div className="transcript-text">
            <p><b>Priya:</b> We need final approval on venue booking before Friday.</p>
            <p><b>Ahmed:</b> I will confirm vendors and share the updated budget today.</p>
            <p><b>Sarah:</b> Launch messaging is blocked until the design review is complete.</p>
          </div>
        </div>

        <div className="output-column">
          <div className="summary-card">
            <h3><Sparkles size={16} /> Generated MOM</h3>
            <ul>
              <li>Decision: approve venue shortlist by Friday.</li>
              <li>Blocker: launch copy depends on final design review.</li>
              <li>Next step: budget update before stakeholder sync.</li>
            </ul>
          </div>

          <div className="action-card">
            <h3><CheckCircle2 size={16} /> Action items</h3>
            <ul>
              <li>Ahmed: send vendor budget update today.</li>
              <li>Priya: collect venue approval by Friday.</li>
            </ul>
          </div>

          <div className="chat-panel">
            <h3><MessageSquareText size={16} /> AI chatbot</h3>
            <div className="chat-bubble user">Who owns the venue approval?</div>
            <div className="chat-bubble ai">Priya owns venue approval, due Friday.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
