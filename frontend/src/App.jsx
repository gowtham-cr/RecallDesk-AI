import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import MemoryInspector from './components/MemoryInspector.jsx';

export default function App() {
  const [activeCustomerId, setActiveCustomerId] = useState('demo_customer_01');
  const [sessionCount, setSessionCount] = useState(1);
  const [messages, setMessages] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentMemories, setCurrentMemories] = useState([]);
  const [currentEntities, setCurrentEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);

  const [statuses, setStatuses] = useState({
    backend: { ok: false, checking: true },
    gemini: { ok: false, checking: true },
    hindsight: { ok: false, version: '', checking: true }
  });

  // 1. Real Status Checks
  const checkStatuses = useCallback(async () => {
    setStatuses(prev => ({
      backend: { ...prev.backend, checking: true },
      gemini: { ...prev.gemini, checking: true },
      hindsight: { ...prev.hindsight, checking: true }
    }));

    // Backend Health
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setStatuses(prev => ({
        ...prev,
        backend: { ok: res.ok && data.status === 'ok', checking: false }
      }));
    } catch {
      setStatuses(prev => ({ ...prev, backend: { ok: false, checking: false } }));
    }

    // Gemini Status
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      setStatuses(prev => ({
        ...prev,
        gemini: { ok: res.ok && data.success, checking: false }
      }));
    } catch {
      setStatuses(prev => ({ ...prev, gemini: { ok: false, checking: false } }));
    }

    // Hindsight Status
    try {
      const res = await fetch('/api/memory/status');
      const data = await res.json();
      setStatuses(prev => ({
        ...prev,
        hindsight: { 
          ok: res.ok && data.connected, 
          version: data.apiVersion || 'v1.2.0', 
          checking: false 
        }
      }));
    } catch {
      setStatuses(prev => ({ ...prev, hindsight: { ok: false, version: '', checking: false } }));
    }
  }, []);

  // 2. Fetch Customer Memories from Hindsight
  const fetchCustomerMemories = useCallback(async (customerId) => {
    setIsMemoryLoading(true);
    try {
      const res = await fetch('/api/memory/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          query: 'customer hardware laptop issues troubleshooting history'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const results = data.data?.results || [];
        const entitiesObj = data.data?.entities || {};
        setCurrentMemories(results);
        setCurrentEntities(Object.keys(entitiesObj));
      }
    } catch (err) {
      console.error('Failed to sync memories:', err);
    } finally {
      setIsMemoryLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkStatuses();
    fetchCustomerMemories(activeCustomerId);
  }, [checkStatuses, fetchCustomerMemories, activeCustomerId]);

  // 3. Handle Send Message
  const handleSendMessage = async (userMessage) => {
    const userMsgObj = {
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsgObj]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: activeCustomerId,
          message: userMessage
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const aiMsgObj = {
          sender: 'ai',
          text: data.response,
          model: data.model,
          recalledMemories: data.recalledMemories || [],
          entities: data.entities || [],
          timestamp: data.timestamp || new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMsgObj]);

        // Add to session history
        setSessionHistory(prev => [
          ...prev,
          {
            query: userMessage,
            recalledCount: data.recalledMemories?.length || 0,
            timestamp: new Date().toISOString()
          }
        ]);

        // Refresh memories from Hindsight
        setTimeout(() => fetchCustomerMemories(activeCustomerId), 800);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Support agent error: ${data.error || 'Failed to generate response'}`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Network error connecting to backend: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Start New Session (Preserves Customer ID)
  const handleNewSession = () => {
    const nextCount = sessionCount + 1;
    setSessionCount(nextCount);
    setMessages([]);
    setSessionHistory([]);
    fetchCustomerMemories(activeCustomerId);
  };

  // 5. Switch Customer
  const handleSelectCustomer = (newCustId) => {
    if (newCustId !== activeCustomerId) {
      setActiveCustomerId(newCustId);
      setSessionCount(1);
      setMessages([]);
      setSessionHistory([]);
      fetchCustomerMemories(newCustId);
    }
  };

  // 6. Manual Retain in Inspector
  const handleManualRetain = async (factText) => {
    const res = await fetch('/api/memory/retain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: activeCustomerId,
        content: factText,
        async: false
      })
    });

    if (res.ok) {
      await fetchCustomerMemories(activeCustomerId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top Header */}
      <Header
        statuses={statuses}
        onRefreshStatuses={checkStatuses}
        activeCustomerId={activeCustomerId}
        sessionCount={sessionCount}
      />

      {/* Main 3-Column Dashboard */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar: Customers, New Session, History */}
        <Sidebar
          activeCustomerId={activeCustomerId}
          onSelectCustomer={handleSelectCustomer}
          onNewSession={handleNewSession}
          sessionCount={sessionCount}
          sessionHistory={sessionHistory}
        />

        {/* Center: Live Interactive Chat */}
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          activeCustomerId={activeCustomerId}
          onSelectDemoPrompt={handleSendMessage}
        />

        {/* Right Sidebar: Real Hindsight Memory Inspector */}
        <MemoryInspector
          activeCustomerId={activeCustomerId}
          memories={currentMemories}
          entities={currentEntities}
          isLoading={isMemoryLoading}
          onRefreshMemories={() => fetchCustomerMemories(activeCustomerId)}
          onManualRetain={handleManualRetain}
        />
      </div>
    </div>
  );
}

