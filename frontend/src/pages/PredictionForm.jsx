import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { api } from '../api';
import { Loader2, AlertTriangle, CheckCircle, Info, Activity, FileJson, Keyboard } from 'lucide-react';

const featureNames = [
  'Mean Radius', 'Mean Texture', 'Mean Perimeter', 'Mean Area', 'Mean Smoothness',
  'Mean Compactness', 'Mean Concavity', 'Mean Concave Points', 'Mean Symmetry', 'Mean Fractal Dimension',
  'Radius SE', 'Texture SE', 'Perimeter SE', 'Area SE', 'Smoothness SE',
  'Compactness SE', 'Concavity SE', 'Concave Points SE', 'Symmetry SE', 'Fractal Dimension SE',
  'Worst Radius', 'Worst Texture', 'Worst Perimeter', 'Worst Area', 'Worst Smoothness',
  'Worst Compactness', 'Worst Concavity', 'Worst Concave Points', 'Worst Symmetry', 'Worst Fractal Dimension'
];

const defaultFeatures = [
  14.22, 19.56, 92.55, 654.2, 0.0969, 0.1079, 0.1279, 0.09388, 0.1814, 0.06369,
  0.6368, 1.5715, 3.454, 53.27, 0.004113, 0.02579, 0.03118, 0.02027, 0.004038, 0.001996,
  18.25, 23.03, 118.4, 1060, 0.141, 0.354, 0.469, 0.2096, 0.2874, 0.09689
];

const PredictionForm = () => {
  const [features, setFeatures] = useState(defaultFeatures);
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '', phone: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'json'
  const [jsonInput, setJsonInput] = useState('');

  const handleInfoChange = (field, value) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = parseFloat(value) || 0;
    setFeatures(newFeatures);
  };

  const handleJsonPaste = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        if (parsed.length === 30) {
          setFeatures(parsed);
          setError(null);
        } else {
          setError(`Expected 30 features, got ${parsed.length}`);
        }
      } else if (parsed.features && Array.isArray(parsed.features)) {
        if (parsed.features.length === 30) {
          setFeatures(parsed.features);
          if (parsed.patientName) setPatientInfo(prev => ({ ...prev, name: parsed.patientName }));
          if (parsed.patientEmail) setPatientInfo(prev => ({ ...prev, email: parsed.patientEmail }));
          if (parsed.patientPhone) setPatientInfo(prev => ({ ...prev, phone: parsed.patientPhone }));
          setError(null);
        } else {
          setError(`Expected 30 features, got ${parsed.features.length}`);
        }
      } else {
        setError('Invalid JSON format. Expected array or object with features array.');
      }
    } catch (e) {
      setError('Invalid JSON. Please check your input.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const predictionData = await api.post('/predict', { 
        features,
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone
      });

      await addDoc(collection(db, 'patients'), {
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        prediction: predictionData.prediction,
        probability: predictionData.probability,
        confidence: predictionData.confidence,
        recommendation: predictionData.recommendation,
        precautions: predictionData.precautions,
        consultDoctor: predictionData.consultDoctor,
        features: features,
        createdAt: new Date().toISOString()
      });

      setResult(predictionData);
    } catch (err) {
      setError(err.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFeatures(defaultFeatures);
    setPatientInfo({ name: '', email: '', phone: '' });
    setResult(null);
    setError(null);
    setJsonInput('');
    setInputMode('manual');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">New Prediction</h2>
          <p className="text-slate-400 mt-1">Enter tumor characteristics for risk analysis</p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="text-secondary" size={20} />
            Patient Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">Patient Name</label>
              <input
                type="text"
                value={patientInfo.name}
                onChange={(e) => handleInfoChange('name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">Email</label>
              <input
                type="email"
                value={patientInfo.email}
                onChange={(e) => handleInfoChange('email', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                placeholder="patient@email.com"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">Phone</label>
              <input
                type="tel"
                value={patientInfo.phone}
                onChange={(e) => handleInfoChange('phone', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                placeholder="+1 234 567 8900"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-slate-400">Input Mode:</span>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                inputMode === 'manual' ? 'bg-secondary text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Keyboard size={14} /> Manual
            </button>
            <button
              type="button"
              onClick={() => setInputMode('json')}
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                inputMode === 'json' ? 'bg-secondary text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <FileJson size={14} /> JSON
            </button>
          </div>

          {inputMode === 'json' ? (
            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-2">Paste JSON Array (30 values)</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-secondary transition-colors"
                placeholder='[14.22, 19.56, 92.55, ...]'
              />
              <button
                type="button"
                onClick={handleJsonPaste}
                className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Load from JSON
              </button>
            </div>
          ) : null}

          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="text-secondary" size={20} />
            Tumor Features Input
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
            {featureNames.map((name, index) => (
              <div key={name} className="space-y-1">
                <label className="text-xs text-slate-400 block">{name}</label>
                <input
                  type="number"
                  step="any"
                  value={features[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
                  placeholder="0.00"
                  disabled={inputMode === 'json'}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-secondary hover:bg-blue-600 disabled:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing...
              </>
            ) : (
              <>
                <Activity size={20} />
                Run Risk Analysis
              </>
            )}
          </button>
        </form>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-500">
              <p>{error}</p>
            </div>
          )}

          {result && (
            <ResultCard result={result} />
          )}

          {!result && !error && (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-full flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>Enter tumor characteristics and click "Run Risk Analysis" to get prediction results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ result }) => {
  const isMalignant = result.prediction === 'Malignant';
  const probPercent = Math.round(result.probability * 100);
  const barColor = isMalignant ? '#EF4444' : '#22C55E';

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
      <div className={`p-6 ${isMalignant ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Prediction Result</p>
            <h3 className={`text-3xl font-bold ${isMalignant ? 'text-red-500' : 'text-green-500'}`}>
              {result.prediction}
            </h3>
          </div>
          {isMalignant ? (
            <AlertTriangle size={48} className="text-red-500" />
          ) : (
            <CheckCircle size={48} className="text-green-500" />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Confidence Probability</span>
            <span className="font-bold">{probPercent}%</span>
          </div>
          <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{ 
                width: `${probPercent}%`,
                backgroundColor: barColor,
                transition: 'width 1s ease-in-out'
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Confidence Level:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            result.confidence === 'High' ? 'bg-red-500/20 text-red-500' :
            result.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-slate-700 text-slate-400'
          }`}>
            {result.confidence}
          </span>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{result.recommendation}</p>
          </div>
        </div>

        {result.consultDoctor && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-red-500 font-semibold mb-2">
              <AlertTriangle size={18} />
              Medical Consultation Recommended
            </div>
            <p className="text-sm text-red-500/80">Please consult with an oncologist for further diagnosis.</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold mb-3">Recommended Precautions:</h4>
          <ul className="space-y-2">
            {result.precautions.map((precaution, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {precaution}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-slate-500 pt-4 border-t border-slate-800">
          Patient ID: <span className="font-mono">{result.patientId}</span>
        </div>
      </div>
    </div>
  );
};

export default PredictionForm;
