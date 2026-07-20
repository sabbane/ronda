import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, ShieldAlert, LogOut, RefreshCw, ArrowLeft, 
  Play, CheckCircle, Clock, Users, Globe, Monitor, LogIn
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

// Sub-component: Login Screen
const StatsLogin = ({ password, setPassword, error, isLoading, handleLogin, onBack }) => {
  const isArabic = localStorage.getItem('ronda_lang') === 'ar';
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {isArabic ? 'رجوع' : 'Back to Game'}
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <BarChart2 className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Ronda Analytics
          </h2>
          <p className="text-slate-400 text-sm mt-1">Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans text-center tracking-widest text-lg"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-3 text-rose-400 text-sm"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Access Dashboard
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// Sub-component: KPI Metric Cards
const KpiCards = ({ summary }) => {
  const items = [
    { title: 'Games Started', val: summary.totalStarts, color: 'from-blue-500 to-indigo-500', icon: Play },
    { title: 'Games Completed', val: summary.totalCompletions, color: 'from-emerald-500 to-teal-500', icon: CheckCircle },
    { title: 'Completion Rate', val: `${summary.completionRate}%`, color: 'from-purple-500 to-pink-500', icon: BarChart2 },
    { title: 'Avg. Duration', val: summary.avgDuration ? `${Math.round(summary.avgDuration / 60)} min` : 'N/A', color: 'from-amber-500 to-orange-500', icon: Clock }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden backdrop-blur-md"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{card.title}</p>
              <h3 data-testid={`kpi-${card.title.toLowerCase().replace(' ', '-')}`} className="text-2xl font-extrabold text-white mt-1">{card.val}</h3>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Sub-component: Breakdown Segment
const BreakdownSegment = ({ title, data, total, icon: Icon, colorClass }) => {
  const keys = Object.keys(data);
  return (
    <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 text-slate-300 font-bold border-b border-slate-800 pb-3">
        <Icon className="w-5 h-5 text-indigo-400" />
        <h4>{title}</h4>
      </div>
      <div className="space-y-4">
        {keys.length === 0 ? (
          <p className="text-sm text-slate-500">No data logged yet.</p>
        ) : (
          keys.map(key => {
            const count = data[key];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize font-semibold text-slate-300">{key.replace('_', ' ')}</span>
                  <span className="text-slate-400">{count} ({pct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Sub-component: SVG Line Graph (Trends)
const TrendsGraph = ({ trends }) => {
  const dates = Object.keys(trends).sort();
  const maxVal = Math.max(...dates.map(d => Math.max(trends[d].starts, trends[d].completions)), 10);
  
  // Format SVG coords
  const width = 800;
  const height = 220;
  const padding = 20;

  const pointsStarts = dates.map((date, idx) => {
    const x = padding + (idx / Math.max(dates.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (trends[date].starts / maxVal) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const pointsCompletions = dates.map((date, idx) => {
    const x = padding + (idx / Math.max(dates.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (trends[date].completions / maxVal) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md lg:col-span-3">
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
        <h4 className="font-bold text-slate-300 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" /> Game Activity Trends
        </h4>
        <div className="flex gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-indigo-400"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Starts</span>
          <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completions</span>
        </div>
      </div>
      
      {dates.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          Not enough historical daily activity data to display trend chart.
        </div>
      ) : (
        <div className="w-full overflow-x-auto custom-scrollbar pt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-auto">
            {/* Horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(r => (
              <line 
                key={r}
                x1={padding}
                y1={padding + r * (height - padding * 2)}
                x2={width - padding}
                y2={padding + r * (height - padding * 2)}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
            
            {/* Starts Line */}
            <polyline fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pointsStarts} />
            {/* Completions Line */}
            <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pointsCompletions} />

            {/* Render dots and labels */}
            {dates.map((date, idx) => {
              const x = padding + (idx / (dates.length - 1)) * (width - padding * 2);
              const label = date.substring(5); // MM-DD
              return (
                <text 
                  key={date} 
                  x={x} 
                  y={height - 4} 
                  fill="#94a3b8" 
                  fontSize="10" 
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};

// Main Component
export const StatsDashboard = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(analyticsService.isAuthenticated());
  const [password, setPassword] = useState('');
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getStats();
      setStatsData(data);
    } catch (err) {
      setError(err.message);
      if (err.message === 'Unauthorized') {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await analyticsService.verifyPassword(password);
      setIsAuthenticated(true);
      setPassword('');
    } catch (err) {
      setError(err.message === 'Authentication failed' ? 'Invalid password' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    analyticsService.logout();
    setIsAuthenticated(false);
    setStatsData(null);
  };

  if (!isAuthenticated) {
    return (
      <StatsLogin 
        password={password}
        setPassword={setPassword}
        error={error}
        isLoading={isLoading}
        handleLogin={handleLogin}
        onBack={onBack}
      />
    );
  }

  if (isLoading && !statsData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const summary = statsData?.summary || {
    totalStarts: 0,
    totalCompletions: 0,
    completionRate: 0,
    avgDuration: 0,
    startsByMode: {},
    completionsByMode: {},
    platforms: {},
    languages: {},
    playersCountDist: {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:text-indigo-400 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                Ronda Dashboard
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">Game Metrics & Analytics</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={fetchData}
              disabled={isLoading}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:text-indigo-400 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* KPI metrics */}
        <KpiCards summary={summary} />

        {/* Detail grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BreakdownSegment 
            title="Game Modes" 
            data={summary.startsByMode} 
            total={summary.totalStarts} 
            icon={Users} 
            colorClass="from-indigo-500 to-purple-500" 
          />
          <BreakdownSegment 
            title="Player Count" 
            data={summary.playersCountDist} 
            total={summary.totalStarts} 
            icon={Users} 
            colorClass="from-pink-500 to-rose-500" 
          />
          <BreakdownSegment 
            title="Languages (FR / EN / AR)" 
            data={summary.languages} 
            total={summary.totalStarts} 
            icon={Globe} 
            colorClass="from-emerald-500 to-teal-500" 
          />
          <BreakdownSegment 
            title="Device Platforms" 
            data={summary.platforms} 
            total={summary.totalStarts} 
            icon={Monitor} 
            colorClass="from-blue-500 to-indigo-500" 
          />

          {/* Activity charts */}
          <TrendsGraph trends={statsData?.trends || {}} />
        </div>
      </div>
    </div>
  );
};
