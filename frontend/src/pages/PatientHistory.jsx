import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Search, AlertTriangle, CheckCircle, Eye, X } from 'lucide-react';

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const patientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(patientsData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prediction?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading patient records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient History</h2>
          <p className="text-slate-400 mt-1">View all prediction records and patient data</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or prediction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-64"
            />
          </div>
          <button
            onClick={fetchPatients}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Name</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Phone</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Prediction</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Probability</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Date</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No patient records found
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.patientId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="font-medium">{patient.patientName || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-400">{patient.patientEmail || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-400">{patient.patientPhone || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        patient.prediction === 'Malignant' 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        {patient.prediction === 'Malignant' ? (
                          <AlertTriangle size={14} />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        {patient.prediction}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${(patient.probability || 0) * 100}%`,
                              backgroundColor: patient.prediction === 'Malignant' ? '#EF4444' : '#22C55E'
                            }}
                          />
                        </div>
                        <span className="text-sm">{(patient.probability * 100 || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-400">{formatDate(patient.createdAt)}</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPatient && (
        <PatientDetailModal 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
        />
      )}
    </div>
  );
};

const PatientDetailModal = ({ patient, onClose }) => {
  const featureNames = [
    'Mean Radius', 'Mean Texture', 'Mean Perimeter', 'Mean Area', 'Mean Smoothness',
    'Mean Compactness', 'Mean Concavity', 'Mean Concave Points', 'Mean Symmetry', 'Mean Fractal Dimension',
    'Radius SE', 'Texture SE', 'Perimeter SE', 'Area SE', 'Smoothness SE',
    'Compactness SE', 'Concavity SE', 'Concave Points SE', 'Symmetry SE', 'Fractal Dimension SE',
    'Worst Radius', 'Worst Texture', 'Worst Perimeter', 'Worst Area', 'Worst Smoothness',
    'Worst Compactness', 'Worst Concavity', 'Worst Concave Points', 'Worst Symmetry', 'Worst Fractal Dimension'
  ];

  const isMalignant = patient.prediction === 'Malignant';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold">Patient Details</h3>
            <p className="text-sm text-slate-400 font-mono">ID: {patient.patientId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-4 rounded-xl mb-6 bg-slate-800/50 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Prediction</p>
                <p className={`text-2xl font-bold ${isMalignant ? 'text-red-500' : 'text-green-500'}`}>
                  {patient.prediction}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Probability</p>
                <p className="text-2xl font-bold">{((patient.probability || 0) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3">Recommendation</h4>
            <p className="text-slate-300 bg-slate-800/50 p-4 rounded-lg">{patient.recommendation}</p>
          </div>

          {patient.precautions && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Precautions</h4>
              <ul className="space-y-2">
                {patient.precautions.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h4 className="font-semibold mb-3">Input Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {patient.features?.map((value, index) => (
                <div key={index} className="bg-slate-800/50 p-2 rounded-lg">
                  <p className="text-xs text-slate-500">{featureNames[index]}</p>
                  <p className="text-sm font-medium">{value?.toFixed(4)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-slate-500">
            <p>Created: {patient.createdAt ? new Date(patient.createdAt).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
