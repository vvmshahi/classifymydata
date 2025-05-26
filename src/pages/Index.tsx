
import React, { useState } from 'react';
import { Upload, BarChart3, Target, Download, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import ModelResults from '@/components/ModelResults';
import PredictionPlayground from '@/components/PredictionPlayground';
import InsightCard from '@/components/InsightCard';

export interface DatasetInfo {
  filename: string;
  rowCount: number;
  columns: string[];
  targetColumn: string;
  features: string[];
  data: any[];
  classes: string[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  featureImportances: { feature: string; importance: number }[];
}

const Index = () => {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDatasetUploaded = (datasetInfo: DatasetInfo) => {
    setDataset(datasetInfo);
    simulateModelTraining(datasetInfo);
  };

  const simulateModelTraining = async (datasetInfo: DatasetInfo) => {
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic metrics based on dataset characteristics
    const metrics = generateModelMetrics(datasetInfo);
    setModelMetrics(metrics);
    setIsProcessing(false);
  };

  const generateModelMetrics = (datasetInfo: DatasetInfo): ModelMetrics => {
    const numClasses = datasetInfo.classes.length;
    const numFeatures = datasetInfo.features.length;
    
    // Generate realistic accuracy based on dataset size and features
    const baseAccuracy = Math.min(0.95, 0.6 + (numFeatures * 0.02) + Math.random() * 0.2);
    
    const accuracy = Math.round(baseAccuracy * 1000) / 10; // Round to 1 decimal
    const precision = Math.round((baseAccuracy - 0.02 + Math.random() * 0.04) * 1000) / 10;
    const recall = Math.round((baseAccuracy - 0.01 + Math.random() * 0.02) * 1000) / 10;
    const f1Score = Math.round((2 * (precision/100) * (recall/100) / ((precision/100) + (recall/100))) * 1000) / 10;

    // Generate confusion matrix
    const confusionMatrix = generateConfusionMatrix(numClasses, datasetInfo.rowCount, baseAccuracy);
    
    // Generate feature importances
    const featureImportances = datasetInfo.features.map((feature, index) => ({
      feature,
      importance: Math.round((Math.random() * 0.8 + 0.1 - index * 0.05) * 100) / 100
    })).sort((a, b) => b.importance - a.importance);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix,
      featureImportances
    };
  };

  const generateConfusionMatrix = (numClasses: number, totalSamples: number, accuracy: number): number[][] => {
    const matrix: number[][] = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));
    const samplesPerClass = Math.floor(totalSamples / numClasses);
    
    for (let i = 0; i < numClasses; i++) {
      for (let j = 0; j < numClasses; j++) {
        if (i === j) {
          // Diagonal (correct predictions)
          matrix[i][j] = Math.floor(samplesPerClass * accuracy);
        } else {
          // Off-diagonal (misclassifications)
          matrix[i][j] = Math.floor(samplesPerClass * (1 - accuracy) / (numClasses - 1));
        }
      }
    }
    
    return matrix;
  };

  const addPrediction = (prediction: any) => {
    setPredictions(prev => [...prev, { ...prediction, timestamp: new Date() }]);
  };

  const downloadReport = () => {
    if (!dataset || !modelMetrics) return;
    
    const report = {
      dataset: dataset.filename,
      metrics: modelMetrics,
      predictions: predictions,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.filename}_ml_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-500 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ClassifyMyData</h1>
                <p className="text-sm text-gray-600">No-Code ML Simulation</p>
              </div>
            </div>
            {dataset && modelMetrics && (
              <Button onClick={downloadReport} className="bg-teal-500 hover:bg-teal-600">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!dataset ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onDatasetUploaded={handleDatasetUploaded} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dataset Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-teal-500" />
                  <span>Dataset Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{dataset.rowCount}</div>
                    <div className="text-sm text-gray-600">Samples</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{dataset.features.length}</div>
                    <div className="text-sm text-gray-600">Features</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{dataset.classes.length}</div>
                    <div className="text-sm text-gray-600">Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{dataset.targetColumn}</div>
                    <div className="text-sm text-gray-600">Target</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Results */}
            {isProcessing ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-lg font-medium">Training Model...</p>
                    <p className="text-gray-600">Analyzing your data with XGBoost</p>
                  </div>
                </CardContent>
              </Card>
            ) : modelMetrics ? (
              <>
                <ModelResults 
                  metrics={modelMetrics} 
                  classes={dataset.classes} 
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PredictionPlayground 
                    dataset={dataset} 
                    modelMetrics={modelMetrics}
                    onPrediction={addPrediction}
                    predictions={predictions}
                  />
                  <InsightCard 
                    dataset={dataset} 
                    modelMetrics={modelMetrics} 
                  />
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            Built by <span className="font-medium">Your Name</span> · 
            <span className="mx-2">Powered by Simulated ML</span> · 
            <a href="#" className="text-teal-500 hover:text-teal-600 mx-1">GitHub</a> |
            <a href="#" className="text-teal-500 hover:text-teal-600 mx-1">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
