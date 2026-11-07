import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Clock,
  Layers,
  Info
} from 'lucide-react';

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
  activeCustomerId,
  onSelectDemoPrompt
}) {
  const [inputText, setInputText] = useState('');
  const [expandedMemories, setExpandedMemories] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleMemoryExpansion = (idx) => {
    setExpandedMemories(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const demoPills = [
    {
      label: 'Demo 1: Report Restart & Failed Driver',
      prompt: 'Customer uses a Dell Windows 11 laptop. The laptop restarts unexpectedly, and a driver update was attempted but failed.'
    },
    {
      label: 'Demo 2: New Session - "My laptop is restarting again"',
      prompt: 'My laptop is restarting again. What should we do next?'
    },
    {
      label: 'Check History: "What steps did we already try?"',
      prompt: 'What troubleshooting steps have we already tried so far?'
    }
  ];

  return (
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Demo helper banner */}
      <div style={{
        padding: '10px 20px',
        background: 'rgba(17, 24, 39, 0.8)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '0.75rem', fontWeight: 600 }}>
          <Zap size={14} />
          <span>Quick Prompts:</span>
        </div>
        {demoPills.map((pill, i) => (
          <button
            key={i}
            onClick={() => onSelectDemoPrompt(pill.prompt)}
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#c7d2fe',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            maxWidth: '480px',
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(31, 41, 55, 0.4)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)'
            }}>
              <BrainCircuit size={28} color="#fff" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              RecallDesk AI Support Ready
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              Connected to customer memory bank <code style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>customer-{activeCustomerId}</code>.
              Send a customer inquiry or select a demonstration prompt above.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              textAlign: 'left',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              background: 'rgba(17, 24, 39, 0.6)',
              padding: '12px 16px',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>✔</span>
                <span>Automatic Vectorize Hindsight memory recall on every turn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>✔</span>
                <span>Gemini 3.5 Flash response grounding (never repeats failed fixes)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>✔</span>
                <span>Memory bank persists across new sessions</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const hasMemories = msg.recalledMemories && msg.recalledMemories.length > 0;
            const isExpanded = expandedMemories[idx];

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  gap: '6px'
                }}
              >
                {/* Sender Tag */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)'
                }}>
                  {isUser ? (
                    <>
                      <span>Customer ({activeCustomerId})</span>
                      <User size={13} />
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} color="#818cf8" />
                      <span style={{ color: '#a5b4fc', fontWeight: 600 }}>RecallDesk Agent</span>
                      <span style={{ opacity: 0.5 }}>• {msg.model || 'Gemini'}</span>
                    </>
                  )}
                  {msg.timestamp && (
                    <span style={{ opacity: 0.5, marginLeft: '4px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div style={{
                  maxWidth: '78%',
                  padding: '14px 18px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                  color: '#fff',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  boxShadow: isUser 
                    ? '0 4px 14px rgba(99, 102, 241, 0.25)' 
                    : '0 4px 14px rgba(0, 0, 0, 0.2)',
                  lineHeight: '1.55',
                  fontSize: '0.88rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.text}
                </div>

                {/* Memory Recalled Indicator Pill */}
                {!isUser && hasMemories && (
                  <div style={{
                    marginTop: '2px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}>
                    <button
                      onClick={() => toggleMemoryExpansion(idx)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <BrainCircuit size={12} />
                      <span>{msg.recalledMemories.length} Memories Recalled From Hindsight</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {/* Expanded Memory Drawer */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '8px',
                        maxWidth: '560px',
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#6ee7b7', fontWeight: 600 }}>
                          <span>Facts Injected into Gemini Prompt:</span>
                          <span style={{ fontSize: '0.68rem', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>
                            customer-{activeCustomerId}
                          </span>
                        </div>
                        <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#e2e8f0' }}>
                          {msg.recalledMemories.map((mem, mIdx) => (
                            <li key={mIdx} style={{ lineHeight: '1.4' }}>
                              {mem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#a5b4fc' }}>
              <Sparkles size={13} className="status-dot checking" />
              <span>RecallDesk Agent is retrieving memory & thinking...</span>
            </div>
            <div style={{
              padding: '12px 20px',
              borderRadius: '16px 16px 16px 4px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', animation: 'pulseGlow 1s infinite' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', animation: 'pulseGlow 1s infinite 0.2s' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'pulseGlow 1s infinite 0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <footer style={{
        padding: '16px 24px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '8px 12px',
          transition: 'border 0.2s'
        }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message RecallDesk support agent for ${activeCustomerId}... (Enter to send, Shift+Enter for new line)`}
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.4',
              maxHeight: '120px'
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="glow-btn"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem'
            }}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </footer>
    </main>
  );
}

