import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Thermometer, 
  Target, 
  Flag, 
  Activity, 
  Zap, 
  Shield, 
  Clock, 
  Settings, 
  Info, 
  TrendingUp, 
  AlertCircle,
  BarChart3,
  Dribbble,
  Timer,
  Bot,
  Square,
  Circle,
  Check,
  X,
  ArrowRightLeft,
  Layout,
  Percent
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface TeamStats {
  shots: number;
  corners: number;
  possession: number;
  xg: number;
  fouls: number;
}

interface MatchData {
  league: string;
  round: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  time: string;
  status: 'LIVE' | 'HT' | 'FT';
  temp: { min: number; max: number };
  oddsProb: { home: number; away: number };
  stats: {
    home: TeamStats & { attacks: number; cards: number; goals: number; defenses: number; passes: number };
    away: TeamStats & { attacks: number; cards: number; goals: number; defenses: number; passes: number };
  };
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  pressure: {
    home: number;
    away: number;
  };
  liveXG: {
    home: number;
    away: number;
  };
  timeline: {
    minute: number;
    home: number;
    away: number;
    event?: 'goal' | 'card' | 'corner' | 'danger' | 'miss';
  }[];
  tendency: {
    home: string;
    away: string;
    nextGoal: string;
  };
}

// --- Mock Data Generator ---
const generateMockData = (prev?: MatchData): MatchData => {
  const currentMin = prev ? parseInt(prev.time) : 45;
  const minute = Math.min(90, currentMin + (prev ? 1 : 0));
  
  const newTimeline: MatchData['timeline'] = prev ? [...prev.timeline] : Array.from({ length: 45 }, (_, i) => ({
    minute: i,
    home: Math.random() * 15,
    away: Math.random() * 15,
    event: Math.random() > 0.9 ? (Math.random() > 0.5 ? 'danger' : 'miss') : undefined
  }));

  if (prev && minute > currentMin) {
    newTimeline.push({
      minute: minute,
      home: Math.random() * 15,
      away: Math.random() * 15,
      event: Math.random() > 0.98 ? 'goal' : (Math.random() > 0.9 ? 'danger' : undefined)
    });
  }

  return {
    league: "Etiópia: Higher League",
    round: 14,
    homeTeam: "Akaki Kality",
    awayTeam: "Batu Ketema",
    homeScore: 0,
    awayScore: 0,
    time: `${minute}`,
    status: minute === 45 ? 'HT' : 'LIVE',
    temp: { min: 3, max: 9 },
    oddsProb: { home: 47, away: 72 },
    stats: {
      home: { shots: 8, corners: 4, possession: 37, xg: 0.8, fouls: 17, attacks: 45, cards: 1, goals: 0, defenses: 12, passes: 245 },
      away: { shots: 3, corners: 2, possession: 63, xg: 0.3, fouls: 42, attacks: 82, cards: 3, goals: 0, defenses: 8, passes: 412 }
    },
    odds: { home: 5.00, draw: 2.37, away: 2.20 },
    pressure: { home: 0.2, away: -2 },
    liveXG: { home: 0.2, away: -2 },
    timeline: newTimeline,
    tendency: {
      home: "CASA OVER",
      away: "VISITANTE UNDER",
      nextGoal: "PRIMEIRO GOL: VISITANTE"
    }
  };
};

// --- Components ---

const Header = ({ data }: { data: MatchData }) => (
  <div className="bg-white border-b border-gray-100 p-6 shadow-sm">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col items-center md:items-start gap-1">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <Trophy size={12} className="text-orange-500" />
          <span>{data.league} - Rodada:{data.round}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
            <Thermometer size={10} className="text-blue-500" />
            <span className="text-[10px] font-bold text-gray-600">{data.temp.max}°/{data.temp.min}°</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-orange-500">{data.oddsProb.home}%</span>
            <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500" style={{ width: `${data.oddsProb.home}%` }} />
            </div>
            <span className="text-[10px] font-black text-gray-600">{data.oddsProb.away}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 md:gap-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
            <Shield size={32} className="text-orange-500" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-800">{data.homeTeam}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="text-5xl font-black text-gray-900">{data.homeScore}</span>
            <span className="text-2xl font-black text-gray-200">-</span>
            <span className="text-5xl font-black text-gray-900">{data.awayScore}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">Intervalo</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">HT 0-0</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Shield size={32} className="text-gray-600" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-800">{data.awayTeam}</span>
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-end gap-2">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100">
          <Clock size={14} className="text-gray-400" />
          <span className="text-lg font-black text-gray-900">{data.time}'</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
        </div>
      </div>
    </div>
  </div>
);

const StatsBar = ({ data }: { data: MatchData }) => {
  const stats = [
    { label: "Ataques Perigosos", home: data.stats.home.attacks, away: data.stats.away.attacks, icon: <Layout size={16} />, color: "text-orange-500" },
    { label: "Chutes ao Gol", home: data.stats.home.shots, away: data.stats.away.shots, icon: <Target size={16} />, color: "text-orange-500" },
    { label: "Pressão/Momentum", home: 75, away: 45, icon: <Timer size={16} />, color: "text-orange-500" },
    { label: "Escanteios", home: data.stats.home.corners, away: data.stats.away.corners, icon: <Flag size={16} />, color: "text-orange-500" },
    { label: "Posse de Bola", home: data.stats.home.possession, away: data.stats.away.possession, icon: <Percent size={16} />, color: "text-orange-500" },
    { label: "Cartões", home: data.stats.home.cards, away: data.stats.away.cards, icon: <Square size={16} />, color: "text-yellow-500" },
    { label: "Gols", home: data.homeScore, away: data.awayScore, icon: <Circle size={16} />, color: "text-green-500" },
    { label: "Defesas", home: data.stats.home.defenses, away: data.stats.away.defenses, icon: <Shield size={16} />, color: "text-blue-500" },
    { label: "Passes", home: data.stats.home.passes, away: data.stats.away.passes, icon: <ArrowRightLeft size={16} />, color: "text-gray-500" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px] shadow-sm hover:shadow-md transition-shadow">
          <div className={cn("mb-2", stat.color)}>{stat.icon}</div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-orange-500">{stat.home}</span>
            <span className="text-xs font-bold text-gray-300">-</span>
            <span className="text-sm font-black text-gray-600">{stat.away}</span>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-1">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

const TimelineGraph = ({ data }: { data: any[] }) => {
  const chartData = {
    labels: Array.from({ length: 91 }, (_, i) => i),
    datasets: [
      {
        label: 'Casa',
        data: data.map(d => d.home),
        backgroundColor: '#FF8C00',
        borderRadius: 2,
      },
      {
        label: 'Visitante',
        data: data.map(d => -d.away),
        backgroundColor: '#4A5568',
        borderRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          callback: (val: any) => (val % 15 === 0 ? val : ''),
          color: '#94a3b8',
          font: { size: 10, weight: 'bold' },
        },
      },
      y: {
        display: false,
        min: -20,
        max: 20,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const val = context.raw;
            return `${context.dataset.label}: ${Math.abs(val)}`;
          }
        }
      },
    },
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm h-full flex flex-col relative overflow-hidden">
      {/* Alert Zone Background */}
      <div className="absolute top-0 left-0 w-full h-[30%] bg-orange-50/30 pointer-events-none border-b border-orange-100/20" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-orange-500 rounded-full" />
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">The Pressure Map</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-sm" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">Casa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded-sm" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">Visitante</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] relative">
        <Bar data={chartData as any} options={options as any} />
        
        {/* Event Markers Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {data.map((d, i) => {
            if (!d.event) return null;
            const left = `${(d.minute / 90) * 100}%`;
            const isHome = d.home > d.away;
            const top = isHome ? '15%' : '85%';
            
            let icon = null;
            let color = "";
            
            if (d.event === 'goal') {
              icon = <Circle size={12} fill="#4CAF50" />;
              color = "text-green-500";
            } else if (d.event === 'danger') {
              icon = <Check size={12} strokeWidth={3} />;
              color = "text-orange-500";
            } else if (d.event === 'miss') {
              icon = <X size={12} strokeWidth={3} />;
              color = "text-red-500";
            } else if (d.event === 'corner') {
              icon = <Flag size={12} />;
              color = "text-orange-500";
            }

            return (
              <div 
                key={i} 
                className={cn("absolute -translate-x-1/2 -translate-y-1/2", color)}
                style={{ left, top }}
              >
                {icon}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <Circle size={8} fill="#4CAF50" className="text-green-500" />
          <span className="text-[8px] font-bold text-gray-400 uppercase">Gol</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={10} className="text-orange-500" />
          <span className="text-[8px] font-bold text-gray-400 uppercase">Ataque Perigoso</span>
        </div>
        <div className="flex items-center gap-2">
          <X size={10} className="text-red-500" />
          <span className="text-[8px] font-bold text-gray-400 uppercase">Chance Perdida</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag size={10} className="text-orange-500" />
          <span className="text-[8px] font-bold text-gray-400 uppercase">Escanteio</span>
        </div>
      </div>
    </div>
  );
};


const BottomSection = ({ data }: { data: MatchData }) => {
  const [activeTab, setActiveTab] = useState<'mercados' | 'placar' | 'ai'>('mercados');

  const correctScores = [
    { score: "0-0", prob: 12, odds: 8.50 },
    { score: "1-1", prob: 18, odds: 6.00 },
    { score: "0-1", prob: 22, odds: 4.50 },
    { score: "1-0", prob: 15, odds: 7.00 },
    { score: "1-2", prob: 10, odds: 12.00 },
    { score: "2-1", prob: 8, odds: 15.00 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'mercados', label: 'Mercados Principais', icon: <Target size={12} /> },
              { id: 'placar', label: 'Placar Correto', icon: <Dribbble size={12} /> },
              { id: 'ai', label: 'Análise I.A.', icon: <Bot size={12} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
                  activeTab === tab.id 
                    ? "bg-gray-50 border-orange-500 text-gray-900" 
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'mercados' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Casa", val: data.tendency.home, color: "text-green-500" },
                    { label: "Visitante", val: data.tendency.away, color: "text-red-500" },
                    { label: "Próximo Gol", val: data.tendency.nextGoal, color: "text-orange-500" },
                    { label: "xG Live", val: `${data.liveXG.home} / ${data.liveXG.away}`, color: "text-gray-900" }
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">{item.label}</span>
                      <span className={cn("text-[10px] font-black italic", item.color)}>{item.val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-50 border border-gray-100 w-fit">
                  <button className="px-6 py-2 rounded-lg bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest">Ao Vivo</button>
                  <button className="px-6 py-2 rounded-lg text-gray-400 text-[10px] font-bold uppercase tracking-widest">Pré</button>
                </div>
              </div>
            )}

            {activeTab === 'placar' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {correctScores.map((s, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between group hover:border-orange-500/50 transition-all cursor-pointer">
                      <div className="flex flex-col">
                        <span className="text-lg font-black italic text-gray-900">{s.score}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Probabilidade: {s.prob}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-orange-500">@{s.odds.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Estado do Jogo</h5>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      O time visitante (<span className="text-gray-900 font-bold">Batu Ketema</span>) mantém o controle da posse, porém a pressão do time da casa tem aumentado nos últimos 5 minutos. Tendência de gol para o final do primeiro tempo.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-green-500">Histórico de Assertividade</h5>
                    <div className="flex items-center gap-2">
                      {[1, 1, 1, 0, 1, 1, 0, 1].map((win, i) => (
                        <div key={i} className={cn("w-2 h-6 rounded-full", win ? "bg-green-500" : "bg-red-500")} />
                      ))}
                      <span className="ml-2 text-sm font-black italic text-gray-900">75%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 space-y-6 h-full flex flex-col shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-800">Mercado 1X2</h4>
            <div className="flex items-center gap-2 text-[8px] font-bold text-[#127D5B]">bet365</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "1", v: data.odds.home.toFixed(2), c: "text-orange-500" },
              { l: "X", v: data.odds.draw.toFixed(2), c: "text-gray-400" },
              { l: "2", v: data.odds.away.toFixed(2), c: "text-gray-600" }
            ].map(o => (
              <div key={o.l} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-300">{o.l}</span>
                <span className={cn("text-lg font-black italic", o.c)}>{o.v}</span>
              </div>
            ))}
          </div>
          <div className="flex-1" />
          <button className="w-full py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-100 transition-all">Mais Mercados</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [match, setMatch] = useState<MatchData>(generateMockData());
  useEffect(() => {
    const interval = setInterval(() => setMatch(prev => generateMockData(prev)), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans">
      <Header data={match} />
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <StatsBar data={match} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <TimelineGraph data={match.timeline} />
          </div>
        </div>
        
        <BottomSection data={match} />
      </main>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}

export function AppWrapper() {
  return <App />;
}
