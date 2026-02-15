import React, { useState } from 'react';
import { api } from '../api';
import { Loader2, AlertTriangle, CheckCircle, Info, Activity } from 'lucide-react';

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
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = parseFloat(value) || 0;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.post('/predict', { features });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFeatures(defaultFeatures);
    setResult(null);
    setError(null);
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
            Tumor Features Input
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
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
            <div className="bg-danger/10 border border-danger/30 p-4 rounded-xl text-danger">
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
  const probPercent = (result.probability * 100).toFixed(1);

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
      <div className={`p-6 ${isMalignant ? 'bg-danger/20' : 'bg-success/20'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Prediction Result</p>
            <h3 className={`text-3xl font-bold ${isMalignant ? 'text-danger' : 'text-success'}`}>
              {result.prediction}
            </h3>
          </div>
          {isMalignant ? (
            <AlertTriangle size={48} className="text-danger" />
          ) : (
            <CheckCircle size={48} className="text-success" />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Confidence Probability</span>
            <span className="font-bold">{probPercent}%</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isMalignant ? 'bg-danger' : 'bg-success'}`}
              style={{ width: `${probPercent}%`, transition: 'width 0.5s ease' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Confidence Level:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            result.confidence === 'High' ? 'bg-danger/20 text-danger' :
            result.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-slate-700 text-slate-400'
          }`}>
            {result.confidence}
          </span>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-secondary mt-0.5 flex-shrink-0" />
            <p className="text-sm">{result.recommendation}</p>
          </div>
        </div>

        {result.consultDoctor && (
          <div className="bg-danger/10 border border-danger/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-danger font-semibold mb-2">
              <AlertTriangle size={18} />
              Medical Consultation Recommended
            </div>
            <p className="text-sm text-danger/80">Please consult with an oncologist for further diagnosis.</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold mb-3">Recommended Precautions:</h4>
          <ul className="space-y-2">
            {result.precautions.map((precaution, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
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
