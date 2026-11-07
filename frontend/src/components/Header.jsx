import React from 'react';
import { Cpu, Database, Activity, RefreshCw, Sparkles, Server } from 'lucide-react';

export default function Header({ 
  statuses, 
  onRefreshStatuses, 
  activeCustomerId, 
  sessionCount 
}) {
  return (
    <header className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 10
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              RecallDesk <span style={{ color: '#818cf8' }}>AI</span>
            </h1>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontWeight: 600
            }}>
              AGENT MEMORY
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Context-Aware Customer Support Powered by Vectorize Hindsight & Gemini
          </p>
        </div>
      </div>

      {/* Active Customer Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(17, 24, 39, 0.7)',
        padding: '6px 14px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Customer
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            {activeCustomerId}
          </span>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Session
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            #{sessionCount}
          </span>
        </div>
      </div>

      {/* System Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Backend Status */}
        <div className="pill-badge" style={{
          background: statuses.backend.ok ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: statuses.backend.ok ? '#34d399' : '#f87171',
          border: `1px solid ${statuses.backend.ok ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          <Server size={12} />
          <div className={`status-dot ${statuses.backend.checking ? 'checking' : statuses.backend.ok ? 'active' : 'error'}`} />
          <span>Express Backend</span>
        </div>

        {/* Gemini Status */}
        <div className="pill-badge" style={{
          background: statuses.gemini.ok ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: statuses.gemini.ok ? '#34d399' : '#f87171',
          border: `1px solid ${statuses.gemini.ok ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          <Cpu size={12} />
          <div className={`status-dot ${statuses.gemini.checking ? 'checking' : statuses.gemini.ok ? 'active' : 'error'}`} />
          <span>Gemini 3.5</span>
        </div>

        {/* Hindsight Status */}
        <div className="pill-badge" style={{
          background: statuses.hindsight.ok ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: statuses.hindsight.ok ? '#34d399' : '#f87171',
          border: `1px solid ${statuses.hindsight.ok ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          <Database size={12} />
          <div className={`status-dot ${statuses.hindsight.checking ? 'checking' : statuses.hindsight.ok ? 'active' : 'error'}`} />
          <span>Hindsight {statuses.hindsight.version || 'Engine'}</span>
        </div>

        {/* Refresh Button */}
        <button 
          onClick={onRefreshStatuses}
          title="Refresh service connectivity checks"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </header>
  );
}

