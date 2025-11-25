import { FinancialRecord, VarianceResult, AnalysisConfig } from './types';

export const formatCurrency = (amount: number): string => {
  // Handle negative values with parentheses for accounting style if desired, 
  // but standard - is fine for now. Tailwind classes handle color.
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal', // Changed to decimal to allow custom styling/prefix
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (percent: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percent / 100);
};

export const calculateVariance = (
  records: FinancialRecord[],
  config: AnalysisConfig
): VarianceResult[] => {
  return records.map((record) => {
    const diff = record.currentAmount - record.previousAmount;
    
    // Avoid division by zero
    let percentChange = 0;
    if (record.previousAmount !== 0) {
      // Use Math.abs for denominator to handle negative previous amounts correctly (e.g. contra accounts)
      // Example: Prior -100, Current -80. Diff +20. 20/|-100| = +20% (Improved)
      percentChange = (diff / Math.abs(record.previousAmount)) * 100;
    } else if (diff !== 0) {
      percentChange = 100; // New item appeared
    }

    const isMaterial =
      Math.abs(percentChange) >= config.thresholdPercent &&
      Math.abs(diff) >= config.thresholdAmount;

    return {
      ...record,
      diff,
      percentChange,
      isMaterial,
    };
  });
};

// Mock Data Generator based on PDF Page 9 (Jan-Sep 2568 vs 2567)
export const generateMockData = (): FinancialRecord[] => {
  return [
    { id: '1', accountCode: '(9)', accountName: 'รายได้จากการจำหน่ายกระแสไฟฟ้า', category: 'Revenue', previousAmount: 55870.04, currentAmount: 51668.52 },
    { id: '2', accountCode: 'หัก', accountName: 'มาตรการส่วนลดค่า Ft', category: 'Revenue', previousAmount: -22.90, currentAmount: -10.86 },
    { id: '3', accountCode: '(3)', accountName: 'รายได้อื่นจากการดำเนินงาน', category: 'Revenue', previousAmount: 987.22, currentAmount: 1214.91 },
    { id: '4', accountCode: '(4)', accountName: 'เงินชดเชยรายได้', category: 'Revenue', previousAmount: 2118.06, currentAmount: 2035.43 },
    { id: '5', accountCode: '(5)', accountName: 'รายได้อื่น', category: 'Revenue', previousAmount: 42.28, currentAmount: 678.31 },
    { id: '6', accountCode: '(6)', accountName: 'รายได้ทางการเงิน', category: 'Revenue', previousAmount: 6.37, currentAmount: 6.54 },
    { id: '7', accountCode: '(8)', accountName: 'ค่าซื้อกระแสไฟฟ้า', category: 'Expense', previousAmount: 49533.30, currentAmount: 45357.06 },
    { id: '8', accountCode: '(9)', accountName: 'ค่าใช้จ่ายเกี่ยวกับบุคลากร', category: 'Expense', previousAmount: 1427.82, currentAmount: 1475.56 },
    { id: '9', accountCode: '(10)', accountName: 'ค่าป้องกัน ซ่อมแซม บำรุงรักษา', category: 'Expense', previousAmount: 2308.55, currentAmount: 2077.31 },
    { id: '10', accountCode: '(11)', accountName: 'ค่าใช้จ่ายอื่นในการดำเนินงาน', category: 'Expense', previousAmount: 649.12, currentAmount: 676.06 },
    { id: '11', accountCode: '(12)', accountName: 'ค่าเสื่อมราคา', category: 'Expense', previousAmount: 1779.68, currentAmount: 1875.23 },
    { id: '12', accountCode: '(13)', accountName: 'ค่าใช้จ่ายโอนปิดเข้างาน', category: 'Expense', previousAmount: -2446.89, currentAmount: -2153.66 },
    { id: '13', accountCode: '(14)', accountName: 'ค่าใช้จ่ายอื่น ๆ', category: 'Expense', previousAmount: 27.76, currentAmount: 10.70 },
    { id: '14', accountCode: '(15)', accountName: 'ต้นทุนทางการเงิน', category: 'Expense', previousAmount: 2.52, currentAmount: 2.76 },
  ];
};