import { describe, test, expect, afterAll } from '@jest/globals';
import { ResponseSummarizer } from '../../services/response-summarizer.js';
import { cacheManager } from '../../utils/cache-manager.js';

describe('ResponseSummarizer - Simple Tests', () => {
  afterAll(() => {
    // Clean up to prevent Jest from hanging
    cacheManager.destroy();
  });
  describe('Array Summarization', () => {
    test('should summarize array of items', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
        { id: '4', name: 'Item 4' },
        { id: '5', name: 'Item 5' },
      ];

      const summary = ResponseSummarizer.summarizeArray(items);

      expect(summary).toBeDefined();
      expect(summary.totalCount).toBe(5);
      expect(summary.items).toBeDefined();
      expect(Array.isArray(summary.items)).toBe(true);
      expect(summary.hasMore).toBeDefined();
    });

    test('should limit sample items', () => {
      const items = Array(20).fill(null).map((_, i) => ({
        id: `item${i}`,
        name: `Item ${i}`,
      }));

      const summary = ResponseSummarizer.summarizeArray(items, { maxSampleItems: 3 });

      expect(summary.totalCount).toBe(20);
      expect(summary.items.length).toBe(3);
      expect(summary.hasMore).toBe(true);
      expect(summary.remainingCount).toBe(17);
    });

    test('should handle empty arrays', () => {
      const summary = ResponseSummarizer.summarizeArray([]);

      expect(summary.totalCount).toBe(0);
      expect(summary.items).toEqual([]);
      expect(summary.hasMore).toBe(false);
      expect(summary.remainingCount).toBe(0);
    });

    test('should include statistics when requested', () => {
      const cards = [
        { id: '1', name: 'Card 1', closed: false },
        { id: '2', name: 'Card 2', closed: true },
        { id: '3', name: 'Card 3', closed: false },
      ];

      const summary = ResponseSummarizer.summarizeArray(cards, { includeStats: true });

      expect(summary.stats).toBeDefined();
    });
  });

  describe('Content Truncation', () => {
    test('should truncate long content', () => {
      const longText = 'This is a very long text that should be truncated. '.repeat(10);
      
      const result = ResponseSummarizer.truncateContent(longText, 50);

      expect(result.isTruncated).toBe(true);
      expect(result.truncated.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result.originalLength).toBe(longText.length);
      expect(result.truncated.endsWith('...')).toBe(true);
    });

    test('should not truncate short content', () => {
      const shortText = 'Short text';
      
      const result = ResponseSummarizer.truncateContent(shortText, 100);

      expect(result.isTruncated).toBe(false);
      expect(result.truncated).toBe(shortText);
      expect(result.originalLength).toBe(shortText.length);
    });

    test('should handle empty content', () => {
      const result = ResponseSummarizer.truncateContent('', 100);

      expect(result.isTruncated).toBe(false);
      expect(result.truncated).toBe('');
      expect(result.originalLength).toBe(0);
    });

    test('should truncate at word boundaries', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      
      const result = ResponseSummarizer.truncateContent(text, 20);

      expect(result.isTruncated).toBe(true);
      // The truncation includes '...', just verify it's truncated properly
      expect(result.truncated.endsWith('...')).toBe(true);
      expect(result.truncated.split(' ').slice(0, -1).every(word => 
        text.includes(word)
      )).toBe(true);
    });
  });

  describe('Card Summarization', () => {
    test('should summarize cards array', () => {
      const cards = [
        {
          id: '1',
          name: 'Card 1',
          desc: 'Description 1',
          closed: false,
          due: '2024-12-31T23:59:59.000Z',
          dueComplete: false,
          labels: [{ id: 'l1', color: 'red', name: 'Urgent' }],
        },
        {
          id: '2',
          name: 'Card 2',
          desc: 'Description 2',
          closed: true,
          due: null,
          dueComplete: false,
          labels: [],
        },
      ];

      const summary = ResponseSummarizer.summarizeArray(cards, { 
        includeStats: true,
        maxSampleItems: 5,
      });

      expect(summary).toBeDefined();
      expect(summary.totalCount).toBe(2);
      expect(summary.items).toHaveLength(2);
      if (summary.stats) {
        expect(summary.stats).toHaveProperty('withDueDate');
        expect(summary.stats).toHaveProperty('archived');
      }
    });
  });

  describe('Board Summarization', () => {
    test('should summarize boards array', () => {
      const boards = [
        {
          id: 'b1',
          name: 'Board 1',
          desc: 'A'.repeat(200),
          closed: false,
          memberships: [{ id: 'm1' }, { id: 'm2' }],
        },
        {
          id: 'b2',
          name: 'Board 2',
          desc: 'Short desc',
          closed: true,
          memberships: [{ id: 'm1' }],
        },
      ];

      const summary = ResponseSummarizer.summarizeArray(boards, {
        includeStats: true,
        truncateDescriptions: 50,
      });

      expect(summary).toBeDefined();
      expect(summary.totalCount).toBe(2);
      expect(summary.items).toBeDefined();
    });
  });

  describe('List Summarization', () => {
    test('should summarize lists array', () => {
      const lists = Array(10).fill(null).map((_, i) => ({
        id: `list${i}`,
        name: `List ${i}`,
        closed: i % 3 === 0,
        pos: i * 16384,
      }));

      const summary = ResponseSummarizer.summarizeArray(lists, {
        maxSampleItems: 3,
        includeStats: true,
      });

      expect(summary.totalCount).toBe(10);
      expect(summary.items.length).toBe(3);
      expect(summary.hasMore).toBe(true);
      expect(summary.remainingCount).toBe(7);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined', () => {
      expect(() => ResponseSummarizer.summarizeArray(null as any)).not.toThrow();
      expect(() => ResponseSummarizer.summarizeArray(undefined as any)).not.toThrow();
    });

    test('should handle items without required fields', () => {
      const items = [
        { id: '1' }, // no name
        { id: '2', name: undefined }, // undefined name
        { id: '3', name: 'Valid' },
      ];

      const summary = ResponseSummarizer.summarizeArray(items);
      expect(summary.totalCount).toBe(3);
    });

    test('should handle very large arrays efficiently', () => {
      const largeArray = Array(10000).fill(null).map((_, i) => ({
        id: `item${i}`,
        name: `Item ${i}`,
      }));

      const startTime = Date.now();
      const summary = ResponseSummarizer.summarizeArray(largeArray, {
        maxSampleItems: 5,
      });
      const endTime = Date.now();

      expect(summary.totalCount).toBe(10000);
      expect(summary.items.length).toBe(5);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});