
export enum CalculatorMode {
  BASIC = 'BASIC',
  SCIENTIFIC = 'SCIENTIFIC',
  AI = 'AI'
}

export interface CalculationResult {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export interface AIResponse {
  answer: string;
  steps: string[];
  explanation: string;
}
