import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  Tag, 
  Layers, 
  Calendar, 
  FileText, 
  Search, 
  Plus, 
  CheckCircle,
  ExternalLink,
  Cpu
} from 'lucide-react';

export default function MemoryInspector({
  activeCustomerId,
  memories = [],
  entities = [],
  isLoading,
  onRefreshMemories,
  onManualRetain
}) {
  const [manualNote, setManualNote] = useState('');
  const [isRetaining, setIsRetaining] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState('facts'); // 'facts' | 'entities' | 'retain'

  const bankId = `customer-${activeCustomerId.replace(/[^a-z0-9_-]/g, '_').toLowerCase()}`;

  const handleRetainSubmit = async (e) => {
    e.preventDefault();
    if (!manualNote.trim()) return;

    setIsRetaining(true);
    try {
      await onManualRetain(manualNote.trim());
      setManualNote('');
      setActiveTab('facts');
    } finally {
      setIsRetaining(false);
    }
  };

  const filteredMemories = memories.filter(m => {
    const text = typeof m === 'string' ? m : m.text || '';
    return text.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <aside style={{
      width: '340px',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="#38bdf8" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Memory Inspector
            </h3>
          </div>
          <button
            onClick={onRefreshMemories}
            disabled={isLoading}
            title="Refresh memories from Hindsight"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '5px 8px',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={12} className={isLoading ? 'status-dot checking' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {/* Bank ID Badge */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Hindsight Memory Bank
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', wordBreak: 'break-all' }}>
            {bankId}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-primary)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('facts')}
            style={{
              flex: 1,
              background: activeTab === 'facts' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'facts' ? '#a5b4fc' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '5px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Facts ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            style={{
              flex: 1,
              background: activeTab === 'entities' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'entities' ? '#a5b4fc' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '5px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Entities ({entities.length})
          </button>
          <button
            onClick={() => setActiveTab('retain')}
            style={{
              flex: 1,
              background: activeTab === 'retain' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'retain' ? '#6ee7b7' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '5px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Retain
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {activeTab === 'facts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Search Filter */}
            {memories.length > 3 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 8px'
              }}>
                <Search size={12} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Filter memories..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    width: '100%'
                  }}
                />
              </div>
            )}

            {filteredMemories.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '30px 16px',
                color: 'var(--text-muted)',
                fontSize: '0.75rem'
              }}>
                <FileText size={24} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                <p>No memories stored in this bank yet.</p>
                <p style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                  Send a message to retain customer interactions.
                </p>
              </div>
            ) : (
              filteredMemories.map((mem, idx) => {
                const text = typeof mem === 'string' ? mem : mem.text;
                const type = typeof mem === 'object' ? mem.type : 'fact';
                const score = typeof mem === 'object' && mem.scores ? mem.scores.semantic : null;

                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(31, 41, 55, 0.4)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      fontSize: '0.78rem',
                      lineHeight: '1.4'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.65rem'
                    }}>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: type === 'world' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        color: type === 'world' ? '#38bdf8' : '#c084fc',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {type}
                      </span>
                      {score && (
                        <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                          rel: {(score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#f3f4f6' }}>
                      {text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'entities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Identified Entities & Concepts:
            </span>
            {entities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                No entities mapped yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {entities.map((ent, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#c7d2fe',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Tag size={11} color="#818cf8" />
                    <span>{ent}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'retain' && (
          <form onSubmit={handleRetainSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Directly insert a persistent memory fact into <code>{bankId}</code>:
            </span>
            <textarea
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              placeholder="e.g. Customer purchased Dell Premium Pro Support warranty on Jan 2026."
              rows={4}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 10px',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              type="submit"
              disabled={!manualNote.trim() || isRetaining}
              className="glow-btn"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
            >
              <Plus size={14} />
              <span>{isRetaining ? 'Storing Fact...' : 'Retain in Hindsight'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.68rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Engine: Vectorize Hindsight</span>
        <span style={{ color: '#10b981' }}>● Active</span>
      </div>
    </aside>
  );
}

