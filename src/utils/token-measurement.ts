import { encoding_for_model } from 'tiktoken';

export interface TokenMeasurementData {
  toolName: string;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  executionTime: number;
  responseSize: number;
  operationType: 'read' | 'write' | 'list' | 'search';
  timestamp: Date;
}

export interface MeasurementSummary {
  toolName: string;
  averageTokens: number;
  minTokens: number;
  maxTokens: number;
  totalCalls: number;
  totalTokens: number;
}

export class TokenMeasurement {
  private static instance: TokenMeasurement;
  private measurements: TokenMeasurementData[] = [];
  private encoder = encoding_for_model('gpt-4');

  private constructor() {}

  public static getInstance(): TokenMeasurement {
    if (!TokenMeasurement.instance) {
      TokenMeasurement.instance = new TokenMeasurement();
    }
    return TokenMeasurement.instance;
  }

  public countTokens(text: string): number {
    try {
      const tokens = this.encoder.encode(text);
      return tokens.length;
    } catch (error) {
      console.error('Error counting tokens:', error);
      return 0;
    }
  }

  public measureToolCall<T>(
    toolName: string,
    request: any,
    operationType: 'read' | 'write' | 'list' | 'search',
    fn: () => Promise<T>
  ): Promise<{ result: T; measurement: TokenMeasurementData }> {
    return new Promise(async (resolve, reject) => {
      const startTime = Date.now();
      
      try {
        // Count request tokens
        const requestText = JSON.stringify(request);
        const requestTokens = this.countTokens(requestText);

        // Execute the function
        const result = await fn();

        // Count response tokens
        const responseText = JSON.stringify(result);
        const responseTokens = this.countTokens(responseText);
        const responseSize = responseText.length;
        
        const executionTime = Date.now() - startTime;
        
        const measurement: TokenMeasurementData = {
          toolName,
          requestTokens,
          responseTokens,
          totalTokens: requestTokens + responseTokens,
          executionTime,
          responseSize,
          operationType,
          timestamp: new Date()
        };

        this.measurements.push(measurement);
        
        // Log measurement for development
        console.error(`[TOKEN] ${toolName}: ${measurement.totalTokens} tokens (req: ${requestTokens}, resp: ${responseTokens}), ${executionTime}ms`);
        
        resolve({ result, measurement });
      } catch (error) {
        reject(error);
      }
    });
  }

  public getMeasurements(): TokenMeasurementData[] {
    return [...this.measurements];
  }

  public getSummaryByTool(): MeasurementSummary[] {
    const summaryMap = new Map<string, TokenMeasurementData[]>();
    
    this.measurements.forEach(m => {
      if (!summaryMap.has(m.toolName)) {
        summaryMap.set(m.toolName, []);
      }
      summaryMap.get(m.toolName)!.push(m);
    });

    return Array.from(summaryMap.entries()).map(([toolName, measurements]) => {
      const tokens = measurements.map(m => m.totalTokens);
      return {
        toolName,
        averageTokens: Math.round(tokens.reduce((a, b) => a + b, 0) / tokens.length),
        minTokens: Math.min(...tokens),
        maxTokens: Math.max(...tokens),
        totalCalls: measurements.length,
        totalTokens: tokens.reduce((a, b) => a + b, 0)
      };
    }).sort((a, b) => b.totalTokens - a.totalTokens);
  }

  public getHighTokenOperations(threshold: number = 1000): TokenMeasurementData[] {
    return this.measurements
      .filter(m => m.totalTokens > threshold)
      .sort((a, b) => b.totalTokens - a.totalTokens);
  }

  public exportMeasurements(): string {
    const summary = this.getSummaryByTool();
    const highToken = this.getHighTokenOperations();
    
    return JSON.stringify({
      summary: 'Token Usage Baseline Measurements',
      timestamp: new Date().toISOString(),
      totalMeasurements: this.measurements.length,
      summaryByTool: summary,
      highTokenOperations: highToken,
      allMeasurements: this.measurements
    }, null, 2);
  }

  public clear(): void {
    this.measurements = [];
  }

  /**
   * Measure tokens in any data structure
   */
  public measureTokens(data: any): number {
    const jsonString = JSON.stringify(data);
    return this.countTokens(jsonString);
  }
}

// Export singleton instance
export const tokenMeasurement = TokenMeasurement.getInstance();