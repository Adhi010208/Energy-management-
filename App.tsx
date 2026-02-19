
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Zap, 
  Activity, 
  Database, 
  Leaf, 
  ShieldAlert, 
  BarChart3, 
  Cpu, 
  Globe,
  Terminal,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Wind,
  Network,
  BrainCircuit,
  Star,
  Building2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, animate } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchLastFeed, fetchHistory } from './services/thingSpeakService';
import { getGovernanceAdvice } from './services/geminiService';
import { ThingSpeakFeed } from './types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const BUDGET_LIMIT = 100;
const DAYS_PASSED = 10;
const CARBON_FACTOR = 0.82;
const AI_INTERVAL = 300000; // 5 minutes

const AnimatedCounter = ({ value, decimals = 1, fromZero = true }: { value: number; decimals?: number; fromZero?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startValue = fromZero ? 0 : displayValue;
    const controls = animate(startValue, value, {
      duration: 2.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value, fromZero]);

  return <>{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
};

const App: React.FC = () => {
  const [data, setData] = useState<ThingSpeakFeed | null>(null);
  const [history, setHistory] = useState<ThingSpeakFeed[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(localStorage.getItem('last_ai_insight') || "Initializing Strategic AI Analysis...");
  const [aiStatus, setAiStatus] = useState<'active' | 'limited' | 'error' | 'loading'>('loading');

  const stats = useMemo(() => {
    let current = 0, power = 0, energy = 0;
    if (isDemoMode || !data) {
      current = 1.2 + Math.random() * 0.8;
      power = 350 + Math.random() * 300;
      energy = 25 + Math.random() * 40;
    } else {
      current = parseFloat(data.field1) || 0;
      power = parseFloat(data.field2) || 0;
      energy = parseFloat(data.field3) || 0;
    }
    const prediction = (energy / DAYS_PASSED) * 30;
    const carbon = energy * CARBON_FACTOR;
    const progress = (energy / BUDGET_LIMIT) * 100;
    const annualCarbon = carbon * 12;
    const annualEnergySavings = Math.max(0, (BUDGET_LIMIT - prediction) * 12);
    
    return { current, power, energy, prediction, carbon, progress, annualCarbon, annualEnergySavings };
  }, [data, isDemoMode]);

  const isHighRisk = stats.prediction > BUDGET_LIMIT;

  const fetchTelemetry = useCallback(async () => {
    try {
      setAiStatus('loading');
      const feed = await fetchLastFeed();
      setData(feed);
      const historyData = await fetchHistory();
      setHistory(historyData);
      
      const advice = await getGovernanceAdvice(stats.energy, stats.prediction, BUDGET_LIMIT);
      setAiRecommendation(advice.text);
      setAiStatus(advice.status);
    } catch (error) {
      console.error('Error fetching telemetry:', error);
      setAiStatus('error');
    }
  }, [stats]);

  useEffect(() => {
    fetchTelemetry();
    const aiInterval = setInterval(fetchTelemetry, AI_INTERVAL);
    return () => clearInterval(aiInterval);
  }, [fetchTelemetry]);

  useEffect(() => {
    const demoInterval = setInterval(() => {
      setData(null); // Trigger useMemo recalculation
    }, 2000);
    return () => clearInterval(demoInterval);
  }, [isDemoMode]);

  const chartData = {
    labels: history.slice(-24).map((_, i) => `${i}h`),
    datasets: [
      {
        label: 'Power Consumption (W)',
        data: history.slice(-24).map(h => parseFloat(h.field2) || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Zap className="w-10 h-10 text-yellow-400" />
              Smart Energy Governance
            </h1>
            <p className="text-slate-400 mt-2">RMK Engineering College - LOGIC LORDS</p>
          </div>
          <motion.button
            onClick={() => setIsDemoMode(!isDemoMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {isDemoMode ? 'Real Data' : 'Demo Mode'}
          </motion.button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Current Power', value: `${stats.power.toFixed(1)} W`, color: 'from-yellow-500 to-orange-500' },
            { icon: Activity, label: 'Current Draw', value: `${stats.current.toFixed(2)} A`, color: 'from-blue-500 to-cyan-500' },
            { icon: Database, label: 'Energy Used', value: `${stats.energy.toFixed(2)} kWh`, color: 'from-green-500 to-emerald-500' },
            { icon: TrendingUp, label: 'Monthly Pred.', value: `${stats.prediction.toFixed(1)} kWh`, color: 'from-purple-500 to-pink-500' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${metric.color} p-6 rounded-lg shadow-lg`}
            >
              <metric.icon className="w-8 h-8 mb-2" />
              <p className="text-sm opacity-90">{metric.label}</p>
              <p className="text-2xl font-bold"><AnimatedCounter value={parseFloat(metric.value)} /></p>
            </motion.div>
          ))}
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Power Trend
            </h2>
            {history.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <p className="text-slate-400 py-8 text-center">Fetching historical data...</p>
            )}
          </div>

          {/* AI Recommendation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" /> AI Governance
            </h2>
            <div className={`p-3 rounded mb-4 ${aiStatus === 'pro' ? 'bg-green-900' : aiStatus === 'error' ? 'bg-red-900' : 'bg-yellow-900'}`}>
              <p className="text-sm">{aiRecommendation}</p>
            </div>
            <button
              onClick={fetchTelemetry}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </motion.div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Leaf, label: 'Annual Carbon', value: `${stats.annualCarbon.toFixed(1)} kg CO₂`, color: 'from-green-600 to-emerald-600' },
            { icon: Cpu, label: 'Budget Status', value: `${stats.progress.toFixed(1)}%`, color: isHighRisk ? 'from-red-600 to-orange-600' : 'from-green-600 to-emerald-600' },
            { icon: Award, label: 'Annual Savings', value: `${stats.annualEnergySavings.toFixed(0)} kWh`, color: 'from-blue-600 to-cyan-600' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`bg-gradient-to-br ${metric.color} p-6 rounded-lg shadow-lg`}
            >
              <metric.icon className="w-8 h-8 mb-2" />
              <p className="text-sm opacity-90">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default App;