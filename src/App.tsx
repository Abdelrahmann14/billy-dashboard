/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { getInitialDashboardData, simulateActivity } from './data/mockData';
import { DashboardData, Member } from './types';
import { StatsStrip } from './components/StatsStrip';
import { AlertsSection } from './components/AlertsSection';
import { MembersTable } from './components/MembersTable';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { MemberDetailDrawer } from './components/MemberDetailDrawer';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Wifi, 
  WifiOff, 
  RotateCw, 
  Play, 
  Pause, 
  Settings, 
  ExternalLink,
  Users,
  Clock,
  HelpCircle,
  Database,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

// ==========================================
// CRITICAL CONSTANT: CONFIGURABLE JSON ENDPOINT
// Put your JSON API endpoint here (e.g. "https://api.my-trello-feed.com/v1/updates").
// If empty, the dashboard automatically runs an exciting, high-fidelity,
// real-time simulation engine that changes statuses/activities live!
// ==========================================
const API_ENDPOINT = "https://athina.pixelearth.co.uk/webhook-test/team-dashboard";

export default function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(() => getInitialDashboardData());
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState(0);
  const [countdown, setCountdown] = useState(20);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [connectionErrorDetail, setConnectionErrorDetail] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Track runtime endpoint in states to allow UI overrides
  const [activeEndpoint, setActiveEndpoint] = useState(API_ENDPOINT);
  const [showConfig, setShowConfig] = useState(false);

  // Interval references
  const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Time difference formatter to show text like "Just now", "12s ago", "2m ago" etc.
  const getCurrentTimeDiffString = (isoString: string | null): string => {
    if (!isoString) return 'Never';
    const now = Date.now();
    const past = new Date(isoString).getTime();
    const diffMs = now - past;
    
    if (diffMs < 0) return 'Just now';
    const secs = Math.floor(diffMs / 1000);
    if (secs < 10) return 'Just now';
    if (secs < 60) return `${secs}s ago`;
    
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Perform the fetch operation (or simulation step if no endpoint)
  const triggerUpdateCycle = async (overrideEndpoint?: string) => {
    const targetEndpoint = overrideEndpoint !== undefined ? overrideEndpoint : activeEndpoint;
    
    if (!targetEndpoint) {
      // 1. SIMULATOR MODE
      if (!isSimulationPaused) {
        setDashboardData(prev => simulateActivity(prev));
        setHasConnectionError(false);
        setSecondsSinceLastUpdate(0);
      }
      return;
    }

    // 2. REAL FETCH API MODE (Bypasses CORS via proxy when available, or fetches directly if on a static host like GitHub Pages)
    setIsFetching(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // generous timeout for n8n cold-starts
      
      let response: Response | undefined;
      let usedProxy = false;
      
      // Determine if we should attempt direct fetch first (e.g., when hosted on a static domain like github.io)
      const isStaticHost = window.location.hostname.endsWith('github.io') || 
                           window.location.hostname.endsWith('pages.dev') ||
                           window.location.hostname.endsWith('vercel.app') ||
                           window.location.hostname.endsWith('netlify.app');
      
      if (isStaticHost) {
        try {
          // Direct client-side fetch for static servers
          response = await fetch(targetEndpoint, { signal: controller.signal });
        } catch (directErr) {
          console.warn("Direct fetch failed, will try proxy workaround...", directErr);
        }
      }
      
      if (!response) {
        try {
          // Proxy fetch to bypass local browser CORS rules in the dev sandbox frame
          const proxyUrl = `/api/team-dashboard?url=${encodeURIComponent(targetEndpoint)}`;
          response = await fetch(proxyUrl, { signal: controller.signal });
          usedProxy = true;
        } catch (proxyErr) {
          // If proxy is absent (or returns a network error on a static site), fetch directly through the browser instead
          console.warn("Proxy connection failed (likely on static host), attempting direct browser fetch...", proxyErr);
          response = await fetch(targetEndpoint, { signal: controller.signal });
        }
      }
      
      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        // If the proxy route gave an error, try direct fetch once as a bulletproof secondary fallback
        if (usedProxy) {
          try {
            const fallbackController = new AbortController();
            const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 8000);
            const fallbackResponse = await fetch(targetEndpoint, { signal: fallbackController.signal });
            clearTimeout(fallbackTimeoutId);
            if (fallbackResponse.ok) {
              response = fallbackResponse;
            }
          } catch (_) {}
        }
      }

      if (!response || !response.ok) {
        let errMsg = response ? `Response returned HTTP ${response.status}` : "Network connection failed";
        try {
          const errPayload = await response?.json();
          if (errPayload && errPayload.error) {
            errMsg = `${errPayload.error} (HTTP ${response?.status})`;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      
      const data: DashboardData = await response.json();
      
      // Ensure the return shape is consistent
      if (data && data.members && data.activity) {
        setDashboardData(data);
        setHasConnectionError(false);
        setConnectionErrorDetail(null);
        setSecondsSinceLastUpdate(0);
      } else {
        throw new Error("Invalid schema contract returned by endpoint. Missing required 'members' or 'activity' fields.");
      }
    } catch (error: any) {
      console.error("API update sync lost handled by proxy:", error);
      const message = error?.message || String(error);
      setHasConnectionError(true);
      setConnectionErrorDetail(message);
      
      // Resilient local fallback: trigger simulation step so the beautiful UI remains active while the developer configures their endpoint!
      if (!isSimulationPaused) {
        setDashboardData(prev => simulateActivity(prev));
      }
    } finally {
      setIsFetching(false);
    }
  };

  // 1-second interval timer for the relative seconds clock and countdown ticking
  useEffect(() => {
    clockTimerRef.current = setInterval(() => {
      // Tick up the elapsed time since last success
      setSecondsSinceLastUpdate(prev => prev + 1);

      // Tick down the polling timer
      setCountdown(prev => {
        if (prev <= 1) {
          // Trigger updates at 0 and reset back to 20
          triggerUpdateCycle();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (clockTimerRef.current) clearInterval(clockTimerRef.current);
    };
  }, [activeEndpoint, isSimulationPaused]);

  // Keep the selected member directory info updated when the global status changes!
  useEffect(() => {
    if (selectedMember) {
      const match = dashboardData.members.find(m => m.id === selectedMember.id);
      if (match) {
        setSelectedMember(match);
      }
    }
  }, [dashboardData, selectedMember?.id]);

  // Handle immediate manual update/poll requests
  const handleImmediateRefresh = () => {
    triggerUpdateCycle();
    setCountdown(20);
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800 pb-12">
      {/* 1. Header Banner */}
      <header id="app-main-header" className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)] backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Brand Name */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#0B1F3A] rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#0B1F3A] tracking-tight">Team Activity</h1>
              <p className="text-[11px] text-slate-400 font-medium">Monitoring shift intervals and Trello logs</p>
            </div>
          </div>

          {/* Indicators & Refresh Status */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Connection State Badge */}
            {hasConnectionError ? (
              <span id="conn-state-err" className="inline-flex items-center gap-1.5 font-semibold text-red-650 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 animate-pulse">
                <WifiOff className="w-3.5 h-3.5" /> Connection Lost
              </span>
            ) : (
              <span id="conn-state-ok" className="inline-flex items-center gap-1.5 font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
            )}

            {/* Last Successful Update Status */}
            <div className="flex items-center gap-1.5 font-medium text-slate-550 border-r border-slate-100 pr-4">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last updated · <strong className="text-slate-700 font-semibold">{secondsSinceLastUpdate}s ago</strong></span>
            </div>

            {/* Interval Timer Countdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-slate-100 text-[#0B1F3A] font-bold px-2 py-1 rounded select-none cursor-pointer" title="Refresh Countdown Indicator">
                Next update in: <span className="text-[#2563EB]">{countdown}s</span>
              </span>
              
              <button
                id="manual-refresh-btn"
                onClick={handleImmediateRefresh}
                disabled={isFetching}
                className={`p-1.5 rounded-lg text-slate-500 hover:text-[#0B1F3A] hover:bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all disabled:opacity-50 ${isFetching ? 'animate-spin' : ''}`}
                title="Refresh updates now"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                id="toggle-sim-config"
                onClick={() => setShowConfig(!showConfig)}
                className={`p-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all ${showConfig ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                title="Configure Endpoint URL / Simulator Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Custom Config Ribbon (Gear dropdown) */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            id="config-ribbon"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 border-b border-slate-200/60 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              
              {/* Endpoint configuration */}
              <div className="space-y-1.5 md:col-span-2">
                <span className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-indigo-550" />
                  Trello Tagger JSON API Endpoint URL
                </span>
                <div className="flex gap-2">
                  <input
                    id="api-url-input"
                    type="text"
                    spellCheck={false}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono select-all focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    placeholder="Enter JSON target url... (Leave blank for simulation)"
                    value={activeEndpoint}
                    onChange={(e) => setActiveEndpoint(e.target.value)}
                  />
                  <button
                    id="save-ep-btn"
                    onClick={() => {
                      triggerUpdateCycle(activeEndpoint);
                      setCountdown(20);
                    }}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Connect
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {API_ENDPOINT 
                    ? `Default configured: "${API_ENDPOINT}"` 
                    : "No defaults provided. Running in client-side active simulator."}
                </p>
              </div>

              {/* Simulation State Controllers */}
              <div className="space-y-1.5 p-3 bg-white border border-slate-105 rounded-xl">
                <span className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                  Simulation controls
                </span>
                <div className="flex items-center gap-2">
                  <button
                    id="toggle-sim-pause-btn"
                    onClick={() => setIsSimulationPaused(!isSimulationPaused)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border text-xs transition-colors ${
                      isSimulationPaused 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                  >
                    {isSimulationPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {isSimulationPaused ? 'Resume Auto-Tick' : 'Pause Auto-Tick'}
                  </button>

                  <button
                    id="simulate-tick-now-btn"
                    onClick={() => {
                      setDashboardData(prev => simulateActivity(prev));
                      setSecondsSinceLastUpdate(0);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                    title="Simulate random live activity instantly"
                  >
                    Trigger Event
                  </button>
                </div>
                <span className="block text-[9px] text-slate-400">
                  Allows simulating random actions instantly (ideal for reviewing animations).
                </span>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Page Layout Grid */}
      <main id="app-main-content" className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Connection Failure Diagnostic Banner */}
        <AnimatePresence>
          {hasConnectionError && (
            <motion.div
              id="diagnostic-alert-card"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-rose-100 rounded-2xl p-5 shadow-[0_4px_24px_-4px_rgba(244,63,94,0.08)]"
            >
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      External Sync Paused (HTTP 404 / Webhook Offline)
                    </h3>
                    <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                      {connectionErrorDetail || 'Connection lost'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed md:max-w-4xl">
                    We encountered an error connecting to: <code className="bg-slate-50 text-indigo-650 px-1 py-0.5 rounded font-mono text-[11px] break-all">{activeEndpoint}</code>.
                  </p>

                  {/* n8n Specific Knowledge Base */}
                  {activeEndpoint.includes('webhook-test') && (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 mt-2 space-y-2 text-xs text-slate-700">
                      <p className="font-bold text-[#0B1F3A] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        n8n Hook Diagnostic Checklist
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed pl-1">
                        <li>
                          <strong className="text-slate-800">Test Node Inactive:</strong> A path containing <code className="bg-amber-100/50 text-[#0B1F3A] px-1 rounded font-mono">/webhook-test/</code> is only registered on n8n *temporarily* while you actively click <strong className="text-[#0B1F3A]">Listen for test event</strong> in the n8n editor workflow. If you are not actively running a test in n8n, it returns a 404!
                        </li>
                        <li>
                          <strong className="text-slate-800">Switch to Production Path:</strong> When your workflow is ready, set the workflow state to <strong className="text-[#0B1F3A]">Active</strong> in n8n, then change the URL path from <code className="bg-amber-100/50 text-slate-700 px-1 rounded font-mono">/webhook-test/...</code> to <code className="bg-amber-100/50 text-green-700 px-1 rounded font-mono">/webhook/...</code>
                        </li>
                        <li>
                          <strong className="text-slate-800">Data Contract:</strong> Ensure your n8n workflow returns an appropriate JSON schema matching the state structure (Trello tags config, updates, list of members).
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      id="action-clear-ep"
                      onClick={() => {
                        setActiveEndpoint("");
                        setHasConnectionError(false);
                        setConnectionErrorDetail(null);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      Use Pure Local Simulator
                    </button>
                    <button
                      id="action-open-ribbon"
                      onClick={() => setShowConfig(true)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Change Endpoint URL
                    </button>
                    <span className="text-[11px] text-[#2563EB] font-bold ml-2 animate-pulse">
                      ⚡ Active Fallback: Running simulation updates live so you can still use the app!
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI metrics row */}
        <StatsStrip stats={dashboardData.stats} />

        {/* Collapsible alerts section */}
        <AlertsSection 
          members={dashboardData.members} 
          onSelectMember={(member) => setSelectedMember(member)} 
        />

        {/* Dashboard visual split */}
        <div id="split-dashboard-layout" className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          
          {/* Members Table: Left 60% (6 cols) */}
          <div className="lg:col-span-6">
            <MembersTable 
              members={dashboardData.members}
              onSelectMember={(member) => setSelectedMember(member)}
              getCurrentTimeDiffString={getCurrentTimeDiffString}
            />
          </div>

          {/* Activity Timeline Feed: Right 40% (4 cols) */}
          <div className="lg:col-span-4">
            <LiveActivityFeed 
              activity={dashboardData.activity}
              getCurrentTimeDiffString={getCurrentTimeDiffString}
            />
          </div>

        </div>

      </main>

      {/* 4. Sliding Inspector Drawer */}
      <AnimatePresence>
        {selectedMember && (
          <MemberDetailDrawer
            member={selectedMember}
            activity={dashboardData.activity}
            getCurrentTimeDiffString={getCurrentTimeDiffString}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
