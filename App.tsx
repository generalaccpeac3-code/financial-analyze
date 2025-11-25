import React, { useState, useEffect, useMemo } from 'react';
import { FinancialRecord, VarianceResult, AnalysisConfig } from './types';
import { calculateVariance, generateMockData } from './utils';
import VarianceTable from './components/VarianceTable';
import DashboardCharts from './components/DashboardCharts';
import AIAnalysisSection from './components/AIAnalysisSection';
import { analyzeFinancialVariances } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [data, setData] = useState<FinancialRecord[]>([]);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    thresholdPercent: 10,
    thresholdAmount: 100, // Adjusted threshold to fit Million Baht scale if needed, or keep low
  });
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived State with Sorting: Alert items first
  const varianceData: VarianceResult[] = useMemo(() => {
    const computed = calculateVariance(data, analysisConfig);
    // Sort: Material items first, then by absolute difference desc
    return computed.sort((a, b) => {
      if (a.isMaterial === b.isMaterial) {
        return Math.abs(b.diff) - Math.abs(a.diff);
      }
      return a.isMaterial ? -1 : 1;
    });
  }, [data, analysisConfig]);

  const materialCount = varianceData.filter(v => v.isMaterial).length;

  // Handlers
  const handleLoadMockData = () => {
    setData(generateMockData());
    setAiAnalysisResult(null);
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAnalysisConfig(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
    setAiAnalysisResult(null); // Reset analysis if data/threshold changes
  };

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFinancialVariances(varianceData);
      setAiAnalysisResult(result);
    } catch (err) {
      setAiAnalysisResult("เกิดข้อผิดพลาดในการวิเคราะห์");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-indigo-900 shadow-lg sticky top-0 z-10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">AuditSense AI</h1>
              <p className="text-xs text-indigo-200 mt-1">Financial Variance Analysis System</p>
            </div>
          </div>
          <button
            onClick={handleLoadMockData}
            className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md transition-colors shadow-sm ring-1 ring-inset ring-indigo-400/20"
          >
            โหลดข้อมูลปี 2568 (Load Data)
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Controls & Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <div className="flex gap-6 flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เกณฑ์ % การเปลี่ยนแปลง (Threshold %)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="thresholdPercent"
                    value={analysisConfig.thresholdPercent}
                    onChange={handleConfigChange}
                    className="block w-32 rounded-md border-gray-300 pl-3 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เกณฑ์จำนวนเงิน (Threshold Amount)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="thresholdAmount"
                    value={analysisConfig.thresholdAmount}
                    onChange={handleConfigChange}
                    className="block w-40 rounded-md border-gray-300 pl-3 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-xs">MB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 px-6 py-3 rounded-lg border border-red-100 flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-full">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <span className="block text-sm text-gray-600">รายการที่ต้องตรวจสอบ</span>
                <span className="block text-2xl font-bold text-red-700">{materialCount} <span className="text-sm font-normal text-red-500">บัญชี</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {data.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Data & Chart */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">เปรียบเทียบงบการเงินสะสม (ม.ค.-ก.ย.)</h3>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 font-medium">หน่วย: ล้านบาท</span>
                </div>
                <VarianceTable 
                  data={varianceData} 
                  priorLabel="ปี 2567 (Prior)"
                  currentLabel="ปี 2568 (Current)"
                />
              </div>
              <DashboardCharts data={varianceData} />
            </div>

            {/* Right Column: AI Analysis */}
            <div className="lg:col-span-1">
               <div className="sticky top-24 space-y-4">
                  <AIAnalysisSection 
                    analysis={aiAnalysisResult} 
                    loading={isAnalyzing} 
                    onAnalyze={handleRunAIAnalysis}
                    hasData={true}
                  />
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">ยังไม่มีข้อมูลสำหรับการวิเคราะห์</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              กดปุ่มด้านบนเพื่อโหลดข้อมูลเปรียบเทียบงบการเงินปี 2567 และ 2568
            </p>
            <div className="mt-6">
              <button
                onClick={handleLoadMockData}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                โหลดข้อมูลปี 2568 (Load Data)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;