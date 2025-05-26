
import jsPDF from 'jspdf';
import type { DatasetInfo, ModelMetrics } from '@/pages/Index';

interface ReportData {
  dataset: DatasetInfo;
  modelMetrics: ModelMetrics;
  predictions: any[];
}

export const generatePDFReport = (data: ReportData) => {
  const { dataset, modelMetrics, predictions } = data;
  const doc = new jsPDF();
  
  // Set colors
  const tealColor = [13, 148, 136]; // teal-600
  const grayColor = [75, 85, 99]; // gray-600
  const lightGrayColor = [156, 163, 175]; // gray-400
  
  let yPosition = 20;
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(...tealColor);
  doc.text('ClassifyMyData - ML Analysis Report', 20, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setTextColor(...grayColor);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
  
  yPosition += 20;
  
  // Dataset Overview Section
  doc.setFontSize(16);
  doc.setTextColor(...tealColor);
  doc.text('Dataset Overview', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(...grayColor);
  
  const overviewData = [
    [`Filename: ${dataset.filename}`, `Samples: ${dataset.rowCount}`],
    [`Features: ${dataset.features.length}`, `Classes: ${dataset.classes.length}`],
    [`Target Column: ${dataset.targetColumn}`, `Classes: ${dataset.classes.join(', ')}`]
  ];
  
  overviewData.forEach(row => {
    doc.text(row[0], 20, yPosition);
    doc.text(row[1], 120, yPosition);
    yPosition += 7;
  });
  
  yPosition += 15;
  
  // Model Performance Section
  doc.setFontSize(16);
  doc.setTextColor(...tealColor);
  doc.text('Model Performance Metrics', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(...grayColor);
  
  const metricsData = [
    [`Accuracy: ${modelMetrics.accuracy}%`, `Precision: ${modelMetrics.precision}%`],
    [`Recall: ${modelMetrics.recall}%`, `F1-Score: ${modelMetrics.f1Score}%`]
  ];
  
  metricsData.forEach(row => {
    doc.text(row[0], 20, yPosition);
    doc.text(row[1], 120, yPosition);
    yPosition += 7;
  });
  
  yPosition += 15;
  
  // Confusion Matrix Section
  doc.setFontSize(16);
  doc.setTextColor(...tealColor);
  doc.text('Confusion Matrix', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  
  // Draw confusion matrix
  const cellSize = 25;
  const startX = 40;
  const startY = yPosition;
  
  // Headers
  doc.text('Predicted', startX + (cellSize * dataset.classes.length) / 2 - 10, startY - 5);
  doc.text('A', startX - 15, startY + (cellSize * dataset.classes.length) / 2, { angle: 90 });
  doc.text('c', startX - 10, startY + (cellSize * dataset.classes.length) / 2, { angle: 90 });
  doc.text('t', startX - 5, startY + (cellSize * dataset.classes.length) / 2, { angle: 90 });
  doc.text('u', startX, startY + (cellSize * dataset.classes.length) / 2, { angle: 90 });
  doc.text('a', startX + 5, startY + (cellSize * dataset.classes.length) / 2, { angle: 90 });
  doc.text('l', startX + 10, startY + (cellSize * dataset.classes.length) / 2, { angle: 90 });
  
  // Class labels
  dataset.classes.forEach((cls, i) => {
    doc.text(cls.substring(0, 3), startX + i * cellSize + cellSize/2 - 5, startY - 2);
    doc.text(cls.substring(0, 3), startX - 20, startY + i * cellSize + cellSize/2 + 2);
  });
  
  // Matrix values
  modelMetrics.confusionMatrix.forEach((row, i) => {
    row.forEach((value, j) => {
      const x = startX + j * cellSize;
      const y = startY + i * cellSize;
      
      // Draw cell - fix the spread operator issue
      if (i === j) {
        doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
      } else {
        doc.setFillColor(239, 68, 68);
      }
      doc.rect(x, y, cellSize, cellSize, 'F');
      
      // Add value
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(value.toString(), x + cellSize/2 - 3, y + cellSize/2 + 2);
    });
  });
  
  yPosition += cellSize * dataset.classes.length + 20;
  
  // Feature Importance Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setTextColor(...tealColor);
  doc.text('Top Feature Importances', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(...grayColor);
  
  modelMetrics.featureImportances.slice(0, 5).forEach((feature, index) => {
    const barWidth = (feature.importance * 100);
    
    // Feature name
    doc.text(`${index + 1}. ${feature.feature}`, 20, yPosition);
    
    // Importance bar
    doc.setFillColor(...tealColor);
    doc.rect(120, yPosition - 4, barWidth, 6, 'F');
    
    // Percentage
    doc.text(`${(feature.importance * 100).toFixed(1)}%`, 120 + barWidth + 5, yPosition);
    
    yPosition += 10;
  });
  
  yPosition += 15;
  
  // Insights Section
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setTextColor(...tealColor);
  doc.text('Model Insights', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(...grayColor);
  
  const insights = [
    `Performance: ${modelMetrics.accuracy >= 90 ? 'Excellent' : modelMetrics.accuracy >= 75 ? 'Good' : 'Needs Improvement'} (${modelMetrics.accuracy}% accuracy)`,
    `Key Driver: ${modelMetrics.featureImportances[0].feature} is the most important feature`,
    `Predictions Made: ${predictions.length} predictions in this session`,
    `Model Type: Simulated XGBoost Classifier`
  ];
  
  insights.forEach(insight => {
    const lines = doc.splitTextToSize(insight, 170);
    lines.forEach((line: string) => {
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 3;
  });
  
  yPosition += 15;
  
  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(...tealColor);
  doc.text('Executive Summary', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(...grayColor);
  
  const summary = `This machine learning analysis processed ${dataset.rowCount} samples with ${dataset.features.length} features to classify ${dataset.classes.length} different classes. The model achieved ${modelMetrics.accuracy}% accuracy with ${modelMetrics.precision}% precision. The ${modelMetrics.featureImportances[0].feature} feature was identified as the most predictive factor. This simulation demonstrates the potential performance of a real classification model on your dataset.`;
  
  const summaryLines = doc.splitTextToSize(summary, 170);
  summaryLines.forEach((line: string) => {
    doc.text(line, 20, yPosition);
    yPosition += 6;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...lightGrayColor);
  doc.text('Generated by ClassifyMyData - No-Code ML Simulation', 20, 285);
  doc.text(`Page 1 of ${doc.getNumberOfPages()}`, 170, 285);
  
  // Download the PDF
  doc.save(`${dataset.filename}_ML_Report.pdf`);
};
