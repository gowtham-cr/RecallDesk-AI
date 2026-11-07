import React, { useState } from 'react';
import { 
  Users, 
  PlusCircle, 
  MessageSquare, 
  History, 
  Laptop, 
  ShieldCheck, 
  ArrowRight,
  FolderOpen
} from 'lucide-react';

export default function Sidebar({
  activeCustomerId,
  onSelectCustomer,
  onNewSession,
  sessionCount,
  sessionHistory = []
}) {
  const [customInput, setCustomInput] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const predefinedCustomers = [
    {
      id: 'demo_customer_01',
      name: 'Alex Rivera',
      device: 'Dell Windows 11',
      tag: 'Primary Demo'
    },
    {
      id: 'demo_customer_02',
      name: 'Sarah Chen',
      device: 'MacBook Pro M2',
      tag: 'Enterprise'
    },
    {
      id: 'demo_customer_03',
      name: 'Marcus Vance',
      device: 'ThinkPad X1',
      tag: 'Standard'
    }
  ];

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelectCustomer(customInput.trim());
      setCustomInput('');
      setShowAddCustom(false);
    }
  };

  return (
    <aside style={{
      width: '280px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* New Session Action */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={onNewSession}
          className="glow-btn"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <PlusCircle size={16} />
          <span>New Session</span>
        </button>
        <p style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          marginTop: '6px',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          Preserves customer ID & memory bank across clean chat windows.
        </p>
      </div>

      {/* Customer Selection Section */}
      <div style={{ padding: '16px 16px 8px 16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color="var(--text-muted)" />
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)'
            }}>
              Customer Profiles
            </span>
          </div>
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600
            }}
          >
            {showAddCustom ? 'Cancel' : '+ Custom'}
          </button>
        </div>

        {/* Custom Input Form */}
        {showAddCustom && (
          <form onSubmit={handleAddCustom} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="e.g. user_1029"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0 10px',
                  cursor: 'pointer'
                }}
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* Customer List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {predefinedCustomers.map((cust) => {
            const isSelected = cust.id === activeCustomerId;
            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#a5b4fc' : 'var(--text-primary)'
                  }}>
                    {cust.name}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#c7d2fe' : 'var(--text-muted)'
                  }}>
                    {cust.tag}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Laptop size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {cust.device}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  color: isSelected ? '#38bdf8' : 'var(--text-muted)',
                  marginTop: '2px'
                }}>
                  ID: {cust.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Customer Bank Info */}
      <div style={{
        margin: '12px 16px',
        padding: '12px',
        borderRadius: '8px',
        background: 'rgba(31, 41, 55, 0.4)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#34d399' }}>
            Hindsight Isolated Bank
          </span>
        </div>
        <div style={{
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px 6px',
          borderRadius: '4px',
          wordBreak: 'break-all',
          color: '#e2e8f0'
        }}>
          customer-{activeCustomerId.replace(/[^a-z0-9_-]/g, '_').toLowerCase()}
        </div>
      </div>

      {/* Session History */}
      <div style={{
        flex: 1,
        padding: '12px 16px',
        overflowY: 'auto',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px'
        }}>
          <History size={14} color="var(--text-muted)" />
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)'
          }}>
            Session Queries ({sessionHistory.length})
          </span>
        </div>

        {sessionHistory.length === 0 ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.75rem'
          }}>
            <MessageSquare size={20} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
            No queries in current session.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sessionHistory.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'rgba(17, 24, 39, 0.5)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '3px'
                }}>
                  <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 600 }}>
                    Turn #{idx + 1}
                  </span>
                  {item.recalledCount > 0 && (
                    <span style={{
                      fontSize: '0.62rem',
                      color: '#34d399',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '1px 5px',
                      borderRadius: '3px'
                    }}>
                      ⚡ {item.recalledCount} memories
                    </span>
                  )}
                </div>
                <p style={{
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.query}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

