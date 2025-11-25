export interface FinancialRecord {
  id: string;
  accountCode: string;
  accountName: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  previousAmount: number;
  currentAmount: number;
}

export interface VarianceResult extends FinancialRecord {
  diff: number;
  percentChange: number;
  isMaterial: boolean;
}

export interface AnalysisConfig {
  thresholdPercent: number;
  thresholdAmount: number;
}

export interface AIAnalysisResponse {
  summary: string;
  details: {
    accountName: string;
    possibleCause: string;
    recommendation: string;
  }[];
}