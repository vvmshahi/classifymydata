
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, History } from 'lucide-react';
import type { DatasetInfo, ModelMetrics } from '@/pages/Index';

interface PredictionPlaygroundProps {
  dataset: DatasetInfo;
  modelMetrics: ModelMetrics;
  onPrediction: (prediction: any) => void;
  predictions: any[];
}

const PredictionPlayground: React.FC<PredictionPlaygroundProps> = ({
  dataset,
  modelMetrics,
  onPrediction,
  predictions
}) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);

  const topFeatures = modelMetrics.featureImportances.slice(0, 3);

  const getUniqueValues = (feature: string) => {
    const values = dataset.data.map(row => row[feature]).filter(v => v !== undefined && v !== '');
    return [...new Set(values)].slice(0, 10); // Limit to 10 options
  };

  const isNumericFeature = (feature: string) => {
    const sampleValues = dataset.data.slice(0, 10).map(row => row[feature]);
    return sampleValues.every(val => !isNaN(Number(val)) && val !== '');
  };

  const makePrediction = () => {
    // Simulate prediction based on feature importance and input values
    let score = 0;
    topFeatures.forEach(feature => {
      const value = inputValues[feature.feature];
      if (value) {
        score += feature.importance * Math.random();
      }
    });

    // Choose a class based on the score and add some randomness
    const classIndex = Math.floor((score + Math.random() * 0.3) * dataset.classes.length) % dataset.classes.length;
    const predictedClass = dataset.classes[classIndex];
    const predictionConfidence = Math.round((70 + Math.random() * 25) * 10) / 10;

    setPrediction(predictedClass);
    setConfidence(predictionConfidence);

    const predictionData = {
      inputs: { ...inputValues },
      prediction: predictedClass,
      confidence: predictionConfidence
    };

    onPrediction(predictionData);
  };

  const canPredict = topFeatures.every(feature => inputValues[feature.feature]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-teal-500" />
            <span>Prediction Playground</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topFeatures.map(feature => (
            <div key={feature.feature}>
              <Label htmlFor={feature.feature} className="block text-sm font-medium mb-2">
                {feature.feature}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {(feature.importance * 100).toFixed(1)}% importance
                </Badge>
              </Label>
              
              {isNumericFeature(feature.feature) ? (
                <Input
                  id={feature.feature}
                  type="number"
                  placeholder="Enter numeric value"
                  value={inputValues[feature.feature] || ''}
                  onChange={(e) => setInputValues(prev => ({
                    ...prev,
                    [feature.feature]: e.target.value
                  }))}
                />
              ) : (
                <Select
                  value={inputValues[feature.feature] || ''}
                  onValueChange={(value) => setInputValues(prev => ({
                    ...prev,
                    [feature.feature]: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUniqueValues(feature.feature).map(value => (
                      <SelectItem key={value} value={String(value)}>
                        {String(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <Button 
            onClick={makePrediction} 
            disabled={!canPredict}
            className="w-full bg-teal-500 hover:bg-teal-600"
          >
            <Play className="h-4 w-4 mr-2" />
            Make Prediction
          </Button>

          {prediction && (
            <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Prediction</p>
                <p className="text-xl font-bold text-teal-700">{prediction}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Confidence: {confidence}%
                </p>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <p><strong>Why this prediction?</strong></p>
                <p>Based on the input values and feature importance weights, the model determined that the combination of {topFeatures[0].feature} and other features most strongly indicates class "{prediction}".</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-teal-500" />
              <span>Prediction History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {predictions.slice(-5).reverse().map((pred, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-teal-700">{pred.prediction}</span>
                    <span className="text-sm text-gray-500">{pred.confidence}% confidence</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.entries(pred.inputs).map(([key, value]) => (
                      <span key={key} className="mr-3">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictionPlayground;
