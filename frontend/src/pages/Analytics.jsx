import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Legend
} from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, historyData] = await Promise.all([
          api.get('/analytics'),
          api.get('/patient-history')
        ]);
        setStats(analyticsData);
        setPredictions(historyData || []);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading analytics...</div>;

  const pieData = [
    { name: 'Malignant', value: stats?.malignant_count || 0, color: '#EF4444' },
    { name: 'Benign', value: stats?.benign_count || 0, color: '#22C55E' },
  ];

  const confidenceData = [
    { name: 'High', value: predictions.filter(p => p.confidence === 'High').length },
    { name: 'Medium', value: predictions.filter(p => p.confidence === 'Medium').length },
    { name: 'Low', value: predictions.filter(p => p.confidence === 'Low').length },
  ];

  const trendData = predictions.slice(-10).map((p, i) => ({
    index: i + 1,
    probability: p.probability * 100,
    prediction: p.prediction === 'Malignant' ? 1 : 0
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6">Malignant vs Benign Ratio</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6">Confidence Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold mb-6">Prediction Probability Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="index" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="probability" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} name="Probability %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold mb-6">Model Performance</h3>
        <div className="grid grid-cols-3 gap-6">
          <MetricCard title="Accuracy" value={`${((stats?.model_metrics?.accuracy || 0) * 100).toFixed(2)}%`} />
          <MetricCard title="Precision" value={`${((stats?.model_metrics?.precision || 0) * 100).toFixed(2)}%`} />
          <MetricCard title="Recall" value={`${((stats?.model_metrics?.recall || 0) * 100).toFixed(2)}%`} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value }) => (
  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
    <h4 className="text-slate-400 text-sm">{title}</h4>
    <p className="text-3xl font-bold text-secondary mt-2">{value}</p>
  </div>
);

export default Analytics;
