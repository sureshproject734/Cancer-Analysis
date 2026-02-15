import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Legend
} from 'recharts';

const MODEL_METRICS = {
  accuracy: 0.9649,
  precision: 0.9589,
  recall: 0.9859
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const patientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading analytics...</div>;

  const malignantCount = patients.filter(p => p.prediction === 'Malignant').length;
  const benignCount = patients.filter(p => p.prediction === 'Benign').length;

  const pieData = [
    { name: 'Malignant', value: malignantCount, color: '#EF4444' },
    { name: 'Benign', value: benignCount, color: '#22C55E' },
  ];

  const confidenceData = [
    { name: 'High', value: patients.filter(p => p.confidence === 'High').length },
    { name: 'Medium', value: patients.filter(p => p.confidence === 'Medium').length },
    { name: 'Low', value: patients.filter(p => p.confidence === 'Low').length },
  ];

  const trendData = patients.slice(-10).map((p, i) => ({
    index: i + 1,
    probability: (p.probability || 0) * 100,
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
          <MetricCard title="Accuracy" value={`${(MODEL_METRICS.accuracy * 100).toFixed(2)}%`} />
          <MetricCard title="Precision" value={`${(MODEL_METRICS.precision * 100).toFixed(2)}%`} />
          <MetricCard title="Recall" value={`${(MODEL_METRICS.recall * 100).toFixed(2)}%`} />
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
