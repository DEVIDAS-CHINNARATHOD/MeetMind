import { motion, AnimatePresence } from 'framer-motion';

export function ChatWindow({ messages, onSend, loading, placeholder = 'Ask a question...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatMessages messages={messages} loading={loading} />
      <ChatInput onSend={onSend} loading={loading} placeholder={placeholder} />
    </div>
  );
}

export function ChatMessages({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '1rem',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      {messages.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)',
          fontSize: '0.875rem', padding: '2rem', flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ fontSize: '2rem' }}>💬</div>
          <div style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Ask anything about this meeting</div>
          <div style={{ fontSize: '0.8125rem' }}>Try: "What decisions were made?" or "Who is responsible for X?"</div>
        </div>
      )}
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'user' ? (
              <div className="chat-bubble-user">{msg.content}</div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--color-accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', flexShrink: 0, marginTop: 2,
                }}>🧠</div>
                <div className="chat-bubble-ai">
                  <MemoMarkdown content={msg.content} />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--color-accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
          }}>🧠</div>
          <div className="chat-bubble-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.6rem 0.875rem' }}>
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export function ChatInput({ onSend, loading, placeholder }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const q = value.trim();
    if (!q || loading) return;
    onSend(q);
    setValue('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: '0.875rem 1rem',
      borderTop: '1px solid var(--color-border)',
      display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
    }}>
      <textarea
        className="input"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={loading}
        rows={1}
        style={{ minHeight: 'auto', resize: 'none', flex: 1, lineHeight: 1.5, paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
        onInput={e => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        }}
      />
      <button className="btn btn-primary" onClick={handleSend} disabled={loading || !value.trim()}
        style={{ flexShrink: 0, height: 38 }}>
        <Send size={15} />
      </button>
    </div>
  );
}

// Memoized markdown renderer to avoid re-renders
function MemoMarkdown({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p style={{ margin: '0 0 0.5rem', lineHeight: 1.6 }}>{children}</p>,
        ul: ({ children }) => <ul style={{ margin: '0.25rem 0', paddingLeft: '1.2rem' }}>{children}</ul>,
        li: ({ children }) => <li style={{ marginBottom: '0.2rem' }}>{children}</li>,
        strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
        code: ({ children }) => (
          <code style={{
            background: 'var(--color-surface-2)', padding: '0.1rem 0.3rem',
            borderRadius: 4, fontSize: '0.85em', fontFamily: 'monospace',
          }}>{children}</code>
        ),
      }}>
      {content}
    </ReactMarkdown>
  );
}

import { useRef, useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
