/**
 * Response Summarization Service
 * 
 * Provides intelligent summarization capabilities for large Trello API responses.
 * Reduces token usage by converting verbose data into concise summaries.
 */

import { 
  TrelloBoard, 
  TrelloCard, 
  TrelloList, 
  TrelloMember,
  TrelloLabel,
  TrelloChecklist,
  TrelloCheckItem,
  TrelloAttachment
} from '../types/trello-types.js';

export interface SummaryOptions {
  includeStats?: boolean;
  maxSampleItems?: number;
  truncateDescriptions?: number;
  flattenNested?: boolean;
}

export interface ArraySummary<T> {
  totalCount: number;
  items: T[];
  stats?: Record<string, number>;
  hasMore: boolean;
  remainingCount: number;
}

export interface ContentSummary {
  original: string;
  truncated: string;
  isTruncated: boolean;
  originalLength: number;
}

export class ResponseSummarizer {
  private static readonly DEFAULT_MAX_SAMPLES = 5;
  private static readonly DEFAULT_DESCRIPTION_LENGTH = 100;

  /**
   * Summarize an array of items with statistics
   */
  static summarizeArray<T extends { id: string; name?: string }>(
    items: T[],
    options: SummaryOptions = {}
  ): ArraySummary<T> {
    // Handle null/undefined items
    if (!items) {
      return {
        totalCount: 0,
        items: [],
        hasMore: false,
        remainingCount: 0
      };
    }

    const maxSamples = options.maxSampleItems || this.DEFAULT_MAX_SAMPLES;
    const includeStats = options.includeStats !== false;

    const summary: ArraySummary<T> = {
      totalCount: items.length,
      items: items.slice(0, maxSamples),
      hasMore: items.length > maxSamples,
      remainingCount: Math.max(0, items.length - maxSamples)
    };

    if (includeStats && items.length > 0) {
      summary.stats = this.generateStats(items);
    }

    return summary;
  }

  /**
   * Generate statistics for different entity types
   */
  private static generateStats(items: any[]): Record<string, number> {
    const stats: Record<string, number> = {};

    // Determine entity type and generate appropriate stats
    if (items[0]?.due !== undefined) {
      // Cards
      stats.withDueDate = items.filter(item => item.due).length;
      stats.overdue = items.filter(item => 
        item.due && new Date(item.due) < new Date() && !item.dueComplete
      ).length;
      stats.completed = items.filter(item => item.dueComplete).length;
      stats.archived = items.filter(item => item.closed).length;
    } else if (items[0]?.closed !== undefined) {
      // Boards or Lists
      stats.open = items.filter(item => !item.closed).length;
      stats.closed = items.filter(item => item.closed).length;
    } else if (items[0]?.state !== undefined) {
      // Checklist items
      stats.complete = items.filter(item => item.state === 'complete').length;
      stats.incomplete = items.filter(item => item.state === 'incomplete').length;
    }

    return stats;
  }

  /**
   * Summarize boards with key metrics
   */
  static summarizeBoards(boards: TrelloBoard[], options: SummaryOptions = {}): string {
    const summary = this.summarizeArray(boards, options);
    const parts: string[] = [];

    parts.push(`${summary.totalCount} board${summary.totalCount !== 1 ? 's' : ''}`);

    if (summary.stats) {
      const statParts: string[] = [];
      if (summary.stats.open) statParts.push(`${summary.stats.open} open`);
      if (summary.stats.closed) statParts.push(`${summary.stats.closed} closed`);
      if (statParts.length > 0) {
        parts.push(`(${statParts.join(', ')})`);
      }
    }

    if (summary.hasMore) {
      parts.push(`- showing first ${summary.items.length}`);
    }

    return parts.join(' ');
  }

  /**
   * Summarize cards with status breakdown
   */
  static summarizeCards(cards: TrelloCard[], options: SummaryOptions = {}): string {
    const summary = this.summarizeArray(cards, options);
    const parts: string[] = [];

    parts.push(`${summary.totalCount} card${summary.totalCount !== 1 ? 's' : ''}`);

    if (summary.stats) {
      const statParts: string[] = [];
      if (summary.stats.withDueDate) {
        statParts.push(`${summary.stats.withDueDate} with due dates`);
        if (summary.stats.overdue) {
          statParts.push(`${summary.stats.overdue} overdue`);
        }
      }
      if (summary.stats.completed) statParts.push(`${summary.stats.completed} completed`);
      if (summary.stats.archived) statParts.push(`${summary.stats.archived} archived`);
      
      if (statParts.length > 0) {
        parts.push(`(${statParts.join(', ')})`);
      }
    }

    if (summary.hasMore) {
      parts.push(`- showing first ${summary.items.length}`);
    }

    return parts.join(' ');
  }

  /**
   * Truncate long text content
   */
  static truncateContent(
    content: string | null | undefined,
    maxLength?: number
  ): ContentSummary {
    if (!content) {
      return {
        original: '',
        truncated: '',
        isTruncated: false,
        originalLength: 0
      };
    }

    const limit = maxLength || this.DEFAULT_DESCRIPTION_LENGTH;
    const originalLength = content.length;

    if (originalLength <= limit) {
      return {
        original: content,
        truncated: content,
        isTruncated: false,
        originalLength
      };
    }

    // Find a good break point (word boundary)
    let truncateAt = limit;
    const lastSpace = content.lastIndexOf(' ', limit);
    if (lastSpace > limit * 0.8) {
      truncateAt = lastSpace;
    }

    return {
      original: content,
      truncated: content.substring(0, truncateAt) + '...',
      isTruncated: true,
      originalLength
    };
  }

  /**
   * Flatten nested objects to reduce depth
   */
  static flattenObject(obj: any, maxDepth: number = 2): any {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }

    const flatten = (current: any, depth: number = 0): any => {
      if (depth >= maxDepth || !current || typeof current !== 'object') {
        return current;
      }

      const result: any = {};

      for (const [key, value] of Object.entries(current)) {
        if (Array.isArray(value)) {
          // Keep arrays but limit their size
          result[key] = value.slice(0, 3);
          if (value.length > 3) {
            result[`${key}Count`] = value.length;
          }
        } else if (value && typeof value === 'object') {
          // Flatten nested objects
          if (depth < maxDepth - 1) {
            const flattened = flatten(value, depth + 1);
            // Merge flattened properties with prefix
            for (const [subKey, subValue] of Object.entries(flattened)) {
              result[`${key}_${subKey}`] = subValue;
            }
          } else {
            // At max depth, just indicate presence
            result[key] = '[object]';
          }
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    return flatten(obj);
  }

  /**
   * Create a summary object from a full response
   */
  static createSummaryResponse(
    data: any,
    entityType: string,
    options: SummaryOptions = {}
  ): any {
    // Handle arrays
    if (Array.isArray(data)) {
      const summary = this.summarizeArray(data, options);
      
      // Create appropriate text summary based on entity type
      let textSummary: string;
      switch (entityType) {
        case 'boards':
          textSummary = this.summarizeBoards(data as TrelloBoard[], options);
          break;
        case 'cards':
          textSummary = this.summarizeCards(data as TrelloCard[], options);
          break;
        case 'lists':
          textSummary = `${summary.totalCount} list${summary.totalCount !== 1 ? 's' : ''}`;
          break;
        case 'members':
          textSummary = `${summary.totalCount} member${summary.totalCount !== 1 ? 's' : ''}`;
          break;
        case 'labels':
          textSummary = `${summary.totalCount} label${summary.totalCount !== 1 ? 's' : ''}`;
          break;
        case 'checklists':
          textSummary = `${summary.totalCount} checklist${summary.totalCount !== 1 ? 's' : ''}`;
          break;
        default:
          textSummary = `${summary.totalCount} item${summary.totalCount !== 1 ? 's' : ''}`;
      }

      return {
        summary: {
          text: textSummary,
          totalCount: summary.totalCount,
          items: summary.items.map(item => ({
            id: item.id,
            name: item.name || item.username || item.fullName || '[unnamed]'
          })),
          stats: summary.stats,
          hasMore: summary.hasMore,
          remainingCount: summary.remainingCount
        }
      };
    }

    // Handle single objects
    if (options.truncateDescriptions && data.desc) {
      const truncated = this.truncateContent(data.desc, options.truncateDescriptions);
      if (truncated.isTruncated) {
        data = {
          ...data,
          desc: truncated.truncated,
          descOriginalLength: truncated.originalLength
        };
      }
    }

    if (options.flattenNested) {
      data = this.flattenObject(data);
    }

    return data;
  }

  /**
   * Get entity type from operation name
   */
  static getEntityType(operation: string): string {
    if (operation.includes('board')) return 'boards';
    if (operation.includes('card')) return 'cards';
    if (operation.includes('list')) return 'lists';
    if (operation.includes('member')) return 'members';
    if (operation.includes('label')) return 'labels';
    if (operation.includes('checklist')) return 'checklists';
    if (operation.includes('comment')) return 'comments';
    if (operation.includes('attachment')) return 'attachments';
    return 'items';
  }

  /**
   * Check if response should be summarized based on size
   */
  static shouldSummarize(data: any, threshold: number = 1000): boolean {
    if (Array.isArray(data)) {
      return data.length > 10;
    }
    
    // Estimate object size
    const jsonString = JSON.stringify(data);
    return jsonString.length > threshold;
  }
}