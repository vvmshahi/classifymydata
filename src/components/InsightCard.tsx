
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import type { DatasetInfo, ModelMetrics } from '@/pages/Index';

interface InsightCardProps {
  dataset: DatasetInfo;
  modelMetrics: ModelMetrics;
}

const InsightCard: React.FC<InsightCardProps> = ({ dataset, modelMetrics }) => {
  const generateInsights = () => {
    const insights = [];
    
    // Performance insight
    if (modelMetrics.accuracy >= 90) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Excellent Performance',
        text: `The model achieved outstanding ${modelMetrics.accuracy}% accuracy, indicating strong predictive capability.`
      });
    } else if (modelMetrics.accuracy >= 75) {
      insights.push({
        type: 'good',
        icon: TrendingUp,
        title: 'Good Performance',
        text: `With ${modelMetrics.accuracy}% accuracy, the model shows solid predictive performance.`
      });
    } else {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Room for Improvement',
        text: `At ${modelMetrics.accuracy}% accuracy, consider feature engineering or gathering more data.`
      });
    }

    // Feature importance insight
    const topFeature = modelMetrics.featureImportances[0];
    insights.push({
      type: 'info',
      icon: Lightbulb,
      title: 'Key Driver',
      text: `${topFeature.feature} is the most important feature with ${(topFeature.importance * 100).toFixed(1)}% importance, driving most predictions.`
    });

    // Class balance insight
    const classDistribution = dataset.classes.map(cls => 
      dataset.data.filter(row => row[dataset.targetColumn] === cls).length
    );
    const maxClass = Math.max(...classDistribution);
    const minClass = Math.min(...classDistribution);
    const imbalanceRatio = maxClass / minClass;

    if (imbalanceRatio > 3) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Class Imbalance',
        text: `Dataset shows class imbalance (${imbalanceRatio.toFixed(1)}:1 ratio). Consider balancing techniques for better performance.`
      });
    } else {
      insights.push({
        type: 'good',
        icon: TrendingUp,
        title: 'Balanced Classes',
        text: 'Dataset has good class distribution, which helps model performance across all categories.'
      });
    }

    // Confusion matrix insight
    const confusionMatrix = modelMetrics.confusionMatrix;
    let maxConfusion = 0;
    let confusedClasses = ['', ''];
    
    for (let i = 0; i < confusionMatrix.length; i++) {
      for (let j = 0; j < confusionMatrix[i].length; j++) {
        if (i !== j && confusionMatrix[i][j] > maxConfusion) {
          maxConfusion = confusionMatrix[i][j];
          confusedClasses = [dataset.classes[i], dataset.classes[j]];
        }
      }
    }

    if (maxConfusion > 0) {
      insights.push({
        type: 'info',
        icon: Lightbulb,
        title: 'Misclassification Pattern',
        text: `Most confusion occurs between ${confusedClasses[0]} and ${confusedClasses[1]} classes. These may share similar characteristics.`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'good': return 'text-teal-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'good': return 'bg-teal-50 border-teal-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-teal-500" />
          <span>Model Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getBgColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${getIconColor(insight.type)}`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
          <p className="text-sm text-gray-600">
            Your model processed {dataset.rowCount} samples with {dataset.features.length} features 
            to classify {dataset.classes.length} classes. The {modelMetrics.featureImportances[0].feature} feature 
            was most predictive, and the model achieved {modelMetrics.accuracy}% accuracy with 
            {modelMetrics.precision}% precision.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
