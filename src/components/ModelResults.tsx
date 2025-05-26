
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Info } from 'lucide-react';
import type { ModelMetrics } from '@/pages/Index';

interface ModelResultsProps {
  metrics: ModelMetrics;
  classes: string[];
}

const ModelResults: React.FC<ModelResultsProps> = ({ metrics, classes }) => {
  const metricTooltips = {
    accuracy: "Percentage of correct predictions out of all predictions",
    precision: "Of all positive predictions, how many were actually correct",
    recall: "Of all actual positives, how many were correctly identified",
    f1Score: "Harmonic mean of precision and recall"
  };

  const chartData = metrics.featureImportances.slice(0, 8).map(item => ({
    name: item.feature.length > 12 ? item.feature.substring(0, 12) + '...' : item.feature,
    importance: item.importance,
    fullName: item.feature
  }));

  const getColorForImportance = (importance: number) => {
    if (importance > 0.7) return '#0d9488'; // teal-600
    if (importance > 0.5) return '#14b8a6'; // teal-500
    if (importance > 0.3) return '#2dd4bf'; // teal-400
    return '#5eead4'; // teal-300
  };

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TooltipProvider>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-teal-600">{metrics.accuracy}%</p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{metricTooltips.accuracy}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Progress value={metrics.accuracy} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Precision</p>
                  <p className="text-2xl font-bold text-teal-600">{metrics.precision}%</p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{metricTooltips.precision}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Progress value={metrics.precision} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recall</p>
                  <p className="text-2xl font-bold text-teal-600">{metrics.recall}%</p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{metricTooltips.recall}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Progress value={metrics.recall} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">F1-Score</p>
                  <p className="text-2xl font-bold text-teal-600">{metrics.f1Score}%</p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{metricTooltips.f1Score}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Progress value={metrics.f1Score} className="mt-2" />
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-xs text-gray-500 text-center mb-4">
                Predicted →
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${classes.length}, 1fr)` }}>
                <div></div>
                {classes.map((cls, i) => (
                  <div key={i} className="text-xs font-medium text-center text-gray-600 p-2">
                    {cls}
                  </div>
                ))}
                
                {classes.map((actualClass, i) => (
                  <React.Fragment key={i}>
                    {i === Math.floor(classes.length / 2) && (
                      <div className="text-xs text-gray-500 writing-mode-vertical transform -rotate-90 flex items-center justify-center">
                        Actual
                      </div>
                    )}
                    {i !== Math.floor(classes.length / 2) && <div></div>}
                    
                    {classes.map((_, j) => {
                      const value = metrics.confusionMatrix[i][j];
                      const maxValue = Math.max(...metrics.confusionMatrix.flat());
                      const intensity = value / maxValue;
                      
                      return (
                        <div
                          key={j}
                          className={`aspect-square flex items-center justify-center text-sm font-medium rounded ${
                            i === j ? 'text-white' : 'text-gray-700'
                          }`}
                          style={{
                            backgroundColor: i === j 
                              ? `rgba(13, 148, 136, ${0.3 + intensity * 0.7})`
                              : `rgba(239, 68, 68, ${intensity * 0.3})`
                          }}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Importance */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${(value as number * 100).toFixed(1)}%`,
                      props.payload?.fullName || name
                    ]}
                  />
                  <Bar dataKey="importance">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorForImportance(entry.importance)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelResults;
