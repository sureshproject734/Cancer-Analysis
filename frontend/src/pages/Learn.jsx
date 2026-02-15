import React, { useState } from 'react';
import { Search, BookOpen, Info, X } from 'lucide-react';

const featureInfo = [
  {
    name: 'Mean Radius',
    description: 'The mean size of the nucleus in the center of the cell',
    normal: '14-20 mm',
    malignant: 'Greater than 20 mm',
    importance: 'Higher values indicate larger nuclei, often associated with malignant cells'
  },
  {
    name: 'Mean Texture',
    description: 'The standard deviation of gray-scale values in the nucleus',
    normal: '14-22',
    malignant: 'Greater than 22',
    importance: 'Measures the variation in pixel intensities - higher texture suggests irregular cells'
  },
  {
    name: 'Mean Perimeter',
    description: 'The total length of the boundary of the nucleus',
    normal: '80-100 mm',
    malignant: 'Greater than 100 mm',
    importance: 'Larger perimeters indicate larger, often malignant cells'
  },
  {
    name: 'Mean Area',
    description: 'The size of the nucleus measured in pixels',
    normal: '400-800 pixels²',
    malignant: 'Greater than 800 pixels²',
    importance: 'Area directly correlates with cell size and malignancy'
  },
  {
    name: 'Mean Smoothness',
    description: 'The smoothness of the nuclear contour (local variation in radius)',
    normal: '0.08-0.10',
    malignant: 'Greater than 0.10',
    importance: 'Higher values indicate rougher, irregular cell boundaries'
  },
  {
    name: 'Mean Compactness',
    description: 'The ratio of perimeter² to area (1 = circle)',
    normal: '0.04-0.08',
    malignant: 'Greater than 0.08',
    importance: 'More irregular shapes have higher compactness values'
  },
  {
    name: 'Mean Concavity',
    description: 'The severity of concave portions of the nuclear contour',
    normal: '0.00-0.05',
    malignant: 'Greater than 0.05',
    importance: 'Higher concavity indicates irregular, indented nuclei'
  },
  {
    name: 'Mean Concave Points',
    description: 'The number of concave portions of the contour',
    normal: '0.00-0.02',
    malignant: 'Greater than 0.02',
    importance: 'More concave points suggest malignant characteristics'
  },
  {
    name: 'Mean Symmetry',
    description: 'How symmetric the nuclear shape is',
    normal: '0.15-0.20',
    malignant: 'Greater than 0.20',
    importance: 'Asymmetric cells often indicate malignancy'
  },
  {
    name: 'Mean Fractal Dimension',
    description: 'The complexity of the nuclear boundary (texture)',
    normal: '0.06-0.07',
    malignant: 'Greater than 0.07',
    importance: 'More complex boundaries suggest malignancy'
  },
  {
    name: 'Radius SE',
    description: 'Standard error of the mean radius',
    normal: '0.1-0.5',
    malignant: 'Greater than 0.5',
    importance: 'Higher SE indicates more variability in cell sizes'
  },
  {
    name: 'Texture SE',
    description: 'Standard error of the mean texture',
    normal: '0.3-1.0',
    malignant: 'Greater than 1.0',
    importance: 'Higher SE indicates inconsistent texture patterns'
  },
  {
    name: 'Perimeter SE',
    description: 'Standard error of the mean perimeter',
    normal: '0.5-2.0',
    malignant: 'Greater than 2.0',
    importance: 'Higher values suggest irregular cell boundaries'
  },
  {
    name: 'Area SE',
    description: 'Standard error of the mean area',
    normal: '5-20',
    malignant: 'Greater than 20',
    importance: 'Higher SE indicates variability in cell size'
  },
  {
    name: 'Smoothness SE',
    description: 'Standard error of mean smoothness',
    normal: '0.002-0.005',
    malignant: 'Greater than 0.005',
    importance: 'Higher values indicate inconsistent boundary smoothness'
  },
  {
    name: 'Compactness SE',
    description: 'Standard error of mean compactness',
    normal: '0.002-0.006',
    malignant: 'Greater than 0.006',
    importance: 'Variability in shape irregularity'
  },
  {
    name: 'Concavity SE',
    description: 'Standard error of mean concavity',
    normal: '0.001-0.004',
    malignant: 'Greater than 0.004',
    importance: 'Inconsistency in concave regions'
  },
  {
    name: 'Concave Points SE',
    description: 'Standard error of mean concave points',
    normal: '0.001-0.003',
    malignant: 'Greater than 0.003',
    importance: 'Variability in number of indentations'
  },
  {
    name: 'Symmetry SE',
    description: 'Standard error of mean symmetry',
    normal: '0.008-0.020',
    malignant: 'Greater than 0.020',
    importance: 'Higher SE indicates inconsistent symmetry'
  },
  {
    name: 'Fractal Dimension SE',
    description: 'Standard error of fractal dimension',
    normal: '0.001-0.003',
    malignant: 'Greater than 0.003',
    importance: 'Variability in boundary complexity'
  },
  {
    name: 'Worst Radius',
    description: 'The largest mean radius value among all cell nuclei',
    normal: '16-25 mm',
    malignant: 'Greater than 25 mm',
    importance: 'Largest radius indicates the most aggressive cells'
  },
  {
    name: 'Worst Texture',
    description: 'The largest mean texture value',
    normal: '17-30',
    malignant: 'Greater than 30',
    importance: 'Highest texture value shows most irregular cell'
  },
  {
    name: 'Worst Perimeter',
    description: 'The largest mean perimeter value',
    normal: '100-150 mm',
    malignant: 'Greater than 150 mm',
    importance: 'Largest perimeter shows biggest cell nuclei'
  },
  {
    name: 'Worst Area',
    description: 'The largest mean area value',
    normal: '500-1200 pixels²',
    malignant: 'Greater than 1200 pixels²',
    importance: 'Largest area indicates most enlarged cells'
  },
  {
    name: 'Worst Smoothness',
    description: 'The largest mean smoothness value',
    normal: '0.10-0.15',
    malignant: 'Greater than 0.15',
    importance: 'Most irregular boundary in the sample'
  },
  {
    name: 'Worst Compactness',
    description: 'The largest mean compactness value',
    normal: '0.10-0.25',
    malignant: 'Greater than 0.25',
    importance: 'Most irregular shape in the sample'
  },
  {
    name: 'Worst Concavity',
    description: 'The largest mean concavity value',
    normal: '0.00-0.15',
    malignant: 'Greater than 0.15',
    importance: 'Most severe concavity in the sample'
  },
  {
    name: 'Worst Concave Points',
    description: 'The largest mean concave points value',
    normal: '0.00-0.06',
    malignant: 'Greater than 0.06',
    importance: 'Most number of indentations found'
  },
  {
    name: 'Worst Symmetry',
    description: 'The largest mean symmetry value',
    normal: '0.20-0.35',
    malignant: 'Greater than 0.35',
    importance: 'Least symmetric cell in the sample'
  },
  {
    name: 'Worst Fractal Dimension',
    description: 'The largest mean fractal dimension value',
    normal: '0.07-0.10',
    malignant: 'Greater than 0.10',
    importance: 'Most complex boundary in the sample'
  }
];

const Learn = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);

  const filteredFeatures = featureInfo.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feature Guide</h2>
          <p className="text-slate-400 mt-1">Learn about all the features used in breast cancer prediction</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-48"
          />
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-secondary" size={24} />
          <div>
            <h3 className="font-bold">Understanding the Features</h3>
            <p className="text-sm text-slate-400">The model uses 30 features derived from cell nuclei images</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredFeatures.map((feature, index) => (
            <div 
              key={index}
              onClick={() => setSelectedFeature(feature)}
              className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-secondary cursor-pointer transition-colors"
            >
              <h4 className="font-semibold text-secondary mb-2">{feature.name}</h4>
              <p className="text-sm text-slate-400 line-clamp-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedFeature && (
        <FeatureModal feature={selectedFeature} onClose={() => setSelectedFeature(null)} />
      )}
    </div>
  );
};

const FeatureModal = ({ feature, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg">
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <h3 className="text-xl font-bold text-secondary">{feature.name}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-secondary" />
            <h4 className="font-semibold">Description</h4>
          </div>
          <p className="text-slate-300">{feature.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-success/10 p-3 rounded-lg border border-success/30">
            <p className="text-xs text-success mb-1">Normal Range</p>
            <p className="font-medium">{feature.normal}</p>
          </div>
          <div className="bg-danger/10 p-3 rounded-lg border border-danger/30">
            <p className="text-xs text-danger mb-1">Malignant Indicator</p>
            <p className="font-medium">{feature.malignant}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Clinical Importance</h4>
          <p className="text-slate-400 text-sm">{feature.importance}</p>
        </div>
      </div>
    </div>
  </div>
);

export default Learn;
