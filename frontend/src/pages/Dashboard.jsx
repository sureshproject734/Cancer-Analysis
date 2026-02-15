import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { api } from '../api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Legend
} from 'recharts';
import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const MODEL_METRICS = {
  accuracy: 0.9649,
  precision: 0.9589,
  recall: 0.9859
};

const Dashboard = () => {
  const [stats, setStats] = useState({ total_predictions: 0, malignant_count: 0, benign_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const total = patients.length;
        const malignant = patients.filter(p => p.prediction === 'Malignant').length;
        const benign = patients.filter(p => p.prediction === 'Benign').length;
        
        setStats({ total_predictions: total, malignant_count: malignant, benign_count: benign });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading clinical data...</div>;

  const pieData = [
    { name: 'Malignant', value: stats.malignant_count || 0, color: '#EF4444' },
    { name: 'Benign', value: stats.benign_count || 0, color: '#22C55E' },
  ];

  const accuracyData = [
    { name: 'Accuracy', value: MODEL_METRICS.accuracy * 100 },
    { name: 'Precision', value: MODEL_METRICS.precision * 100 },
    { name: 'Recall', value: MODEL_METRICS.recall * 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Predictions" 
          value={stats.total_predictions} 
          icon={<Users className="text-secondary" />} 
          sub="All time"
        />
        <StatCard 
          title="Malignant Cases" 
          value={stats.malignant_count} 
          icon={<AlertTriangle className="text-danger" />} 
          sub={`${((stats.malignant_count / stats.total_predictions) * 100 || 0).toFixed(1)}% ratio`}
        />
        <StatCard 
          title="Benign Cases" 
          value={stats.benign_count} 
          icon={<CheckCircle className="text-success" />} 
          sub={`${((stats.benign_count / stats.total_predictions) * 100 || 0).toFixed(1)}% ratio`}
        />
        <StatCard 
          title="Model Accuracy" 
          value={`${(MODEL_METRICS.accuracy * 100).toFixed(1)}%`} 
          icon={<TrendingUp className="text-secondary" />} 
          sub="RandomForest Classifier"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6">Distribution Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6">Model Performance Metrics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, sub }) => (
  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
    </div>
    <h4 className="text-slate-400 text-sm font-medium">{title}</h4>
    <p className="text-3xl font-bold mt-1">{value}</p>
    <p className="text-xs text-slate-500 mt-2">{sub}</p>
  </div>
);

export default Dashboard;
