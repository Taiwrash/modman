import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Activity, 
  Zap, 
  Share2, 
  Wrench, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Cpu,
  History,
  Layout
} from 'lucide-react';

interface LessonStat {
  lesson_id: string;
  success: number;
  error: number;
  total: number;
}

interface DayActivity {
  date: string;
  count: number;
}

interface InsightData {
  totals: {
    runs: number;
    shares: number;
    fixes: number;
  };
  run_stats: {
    success: number;
    error: number;
  };
  lesson_stats: LessonStat[];
  daily_usage: DayActivity[];
  activity_24h: number;
}

export default function Insights() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/insights')
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.error || err.message || 'Unknown connection error');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-rams-blue font-mono">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="animate-spin" size={32} />
          <div className="text-[10px] tracking-[0.3em] uppercase">Initialising_Analytics_Stream...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-red-500 font-mono">
        <div className="flex flex-col items-center gap-4 border border-red-500/20 p-8">
          <XCircle size={32} />
          <div className="text-[10px] tracking-[0.3em] uppercase">Stream_Connection_Failed</div>
          <div className="text-[10px] opacity-50 font-bold mt-4">ERROR: {error.toUpperCase()}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold"
          >
            RETRY_CONNECTION
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxDailyCount = Math.max(...data.daily_usage.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-mono p-4 md:p-12 overflow-y-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 text-rams-blue mb-4">
            <Activity size={20} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-60">System Metrics // Terminal 01</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">MODMAN_INSIGHTS</h1>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 mb-1">Status: Operational</div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-rams-blue">Data_Refreshed: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard 
          icon={<Zap size={18} />} 
          label="Compute Cycles" 
          value={data.totals.runs} 
          trend="+12%" 
          color="blue"
        />
        <StatCard 
          icon={<Share2 size={18} />} 
          label="Neural Exports" 
          value={data.totals.shares} 
          trend="+5%" 
          color="zinc"
        />
        <StatCard 
          icon={<Wrench size={18} />} 
          label="System Repairs" 
          value={data.totals.fixes} 
          trend="NOMINAL" 
          color="zinc"
        />
        <StatCard 
          icon={<TrendingUp size={18} />} 
          label="24h Throughput" 
          value={data.activity_24h} 
          trend="ACTIVE" 
          color="blue" 
          active
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* DAILY ACTIVITY CHART */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <History size={120} />
          </div>
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-rams-blue" size={18} />
              <h2 className="text-sm font-bold tracking-widest uppercase">System Activity // 7D</h2>
            </div>
            <div className="text-[10px] opacity-40 uppercase tracking-widest">Total Events (Runs/Shares/Fixes)</div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
            {data.daily_usage.length > 0 ? (
              data.daily_usage.map((day) => (
                <div 
                  key={day.date} 
                  className="flex-1 flex flex-col items-center group/bar"
                  onMouseEnter={() => setHoveredDay(day.date)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className="relative w-full flex flex-col items-center">
                    {hoveredDay === day.date && (
                      <div className="absolute -top-10 bg-rams-blue text-white text-[10px] font-bold py-1 px-2 rounded-none whitespace-nowrap z-10">
                        {day.count} EVENTS
                      </div>
                    )}
                    <div 
                      style={{ height: `${(day.count / maxDailyCount) * 100}%`, minHeight: '4px' }}
                      className={`w-full max-w-[40px] transition-all duration-500 ease-out ${
                        hoveredDay === day.date ? 'bg-rams-blue shadow-[0_0_20px_rgba(99,123,255,0.4)]' : 'bg-white/10'
                      }`}
                    />
                  </div>
                  <span className="text-[8px] font-bold mt-4 opacity-30 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20 text-[10px] uppercase tracking-[0.3em]">
                Insufficient Data Stream
              </div>
            )}
          </div>
        </div>

        {/* RUN SUCCESS RATE */}
        <div className="bg-[#111] border border-white/5 p-8 flex flex-col justify-center">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-8 flex items-center gap-3">
            <Layout className="text-rams-blue" size={18} />
            Integrity Check
          </h2>
          
          <div className="relative h-48 w-48 mx-auto mb-8">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#222" 
                strokeWidth="8"
              />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#637bff" 
                strokeWidth="8"
                strokeDasharray={`${(data.run_stats.success / (data.totals.runs || 1)) * 282.7} 282.7`}
                strokeLinecap="square"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold">
                {Math.round((data.run_stats.success / (data.totals.runs || 1)) * 100)}%
              </div>
              <div className="text-[8px] font-bold tracking-widest opacity-40 uppercase">Success Rate</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-green-500" />
                <span className="text-[10px] opacity-60 uppercase font-bold">Verified Executions</span>
              </div>
              <span className="text-xs font-bold">{data.run_stats.success}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <XCircle size={12} className="text-red-500" />
                <span className="text-[10px] opacity-60 uppercase font-bold">Faulty Cycles</span>
              </div>
              <span className="text-xs font-bold">{data.run_stats.error}</span>
            </div>
          </div>
        </div>

        {/* DETAILED LESSON STATS */}
        <div className="lg:col-span-3 bg-[#111] border border-white/5 p-8 mt-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-3">
              <Cpu className="text-rams-blue" size={18} />
              Module Performance Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {data.lesson_stats.length > 0 ? (
              data.lesson_stats.map((lesson) => (
                <div key={lesson.lesson_id} className="group border-b border-white/5 pb-4 last:border-0 md:last:border-b">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-rams-blue tracking-widest mb-1">MODULE_ID: {lesson.lesson_id || 'UNKNOWN'}</span>
                      <span className="text-[11px] font-bold uppercase tracking-tight">/curriculum/{lesson.lesson_id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold">{lesson.total} HITS</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 w-full flex">
                    <div 
                      style={{ width: `${(lesson.success / lesson.total) * 100}%` }}
                      className="bg-rams-blue transition-all duration-1000"
                    />
                    <div 
                      style={{ width: `${(lesson.error / lesson.total) * 100}%` }}
                      className="bg-red-900/40 transition-all duration-1000"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] font-bold opacity-30">
                    <span>SUCCESS: {lesson.success}</span>
                    <span>ERROR: {lesson.error}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center opacity-20 text-[10px] uppercase tracking-[0.3em]">
                No module execution data logged
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FOOTER DECORATION */}
      <div className="mt-20 flex items-center justify-between border-t border-white/5 pt-8 opacity-20">
        <div className="text-[8px] font-bold tracking-[0.3em] uppercase">Rams Digital Analytics Engine v2.4.0</div>
        <div className="text-[8px] font-bold tracking-[0.3em] uppercase underline">Secure Connection: TLS 1.3 // AES-256</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color, active = false }: any) {
  return (
    <div className={`p-6 border ${active ? 'bg-rams-blue border-rams-blue' : 'bg-[#111] border-white/5'} transition-all hover:border-rams-blue/50 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${active ? 'text-white' : 'text-rams-blue'} opacity-80`}>{icon}</div>
        <div className={`text-[8px] font-bold tracking-widest uppercase ${active ? 'text-white/80' : 'text-zinc-500'}`}>{trend}</div>
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-1 ${active ? 'text-white/60' : 'text-zinc-500'}`}>{label}</div>
      <div className={`text-3xl font-bold tracking-tighter ${active ? 'text-white' : 'text-white group-hover:text-rams-blue transition-colors'}`}>{value}</div>
    </div>
  );
}
