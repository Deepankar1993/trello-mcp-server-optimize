#!/usr/bin/env node

/**
 * Test script for Phase 3 optimization features
 * 
 * This script demonstrates and tests:
 * 1. Smart defaults for different operation types
 * 2. Array optimization (pagination and summarization)
 * 3. Caching behavior
 */

import { responseOptimizer } from './build/utils/response-optimizer.js';
import { getDefaultOptimizationLevel } from './build/utils/tool-optimization-params.js';

console.log('=== Phase 3 Optimization Features Test ===\n');

// Test 1: Smart Defaults
console.log('1. Testing Smart Defaults:');
console.log('----------------------------');
const operations = ['get_boards', 'get_board', 'create_board', 'add_comment'];
operations.forEach(op => {
  const level = getDefaultOptimizationLevel(op);
  console.log(`${op}: ${level}`);
});

// Test 2: Array Optimization
console.log('\n2. Testing Array Optimization:');
console.log('----------------------------');

// Simulate a large array response
const mockBoards = Array.from({ length: 50 }, (_, i) => ({
  id: `board-${i}`,
  name: `Board ${i}`,
  desc: `Description for board ${i}`,
  closed: false,
  dateLastActivity: new Date().toISOString(),
  idOrganization: 'org-123',
  prefs: {
    permissionLevel: 'private',
    voting: 'disabled',
    comments: 'members'
  },
  memberships: [],
  labelNames: {},
  limits: {}
}));

// Test maxItems
const limitedResponse = responseOptimizer.optimize(
  mockBoards,
  'get_boards',
  { level: 'minimal', maxItems: 5 }
);
console.log(`Original count: ${mockBoards.length}`);
console.log(`Limited count: ${limitedResponse.length}`);

// Test summarization
const summarizedResponse = responseOptimizer.optimize(
  mockBoards,
  'get_boards',
  { level: 'minimal', summarize: true }
);
console.log('\nSummarized response:', JSON.stringify(summarizedResponse, null, 2));

// Test 3: Field Optimization
console.log('\n3. Testing Field Optimization:');
console.log('----------------------------');

const singleBoard = mockBoards[0];
const minimalBoard = responseOptimizer.optimize(singleBoard, 'get_board', { level: 'minimal' });
const standardBoard = responseOptimizer.optimize(singleBoard, 'get_board', { level: 'standard' });
const detailedBoard = responseOptimizer.optimize(singleBoard, 'get_board', { level: 'detailed' });

console.log(`Original fields: ${Object.keys(singleBoard).length}`);
console.log(`Minimal fields: ${Object.keys(minimalBoard).length}`);
console.log(`Standard fields: ${Object.keys(standardBoard).length}`);
console.log(`Detailed fields: ${Object.keys(detailedBoard).length}`);

// Test 4: Cache Statistics
console.log('\n4. Testing Cache Behavior:');
console.log('----------------------------');

// Clear cache first
responseOptimizer.clearCache();

// Simulate cache operations
async function testCache() {
  // First call - cache miss
  await responseOptimizer.optimizeWithCache(
    'get_boards',
    { filter: 'open' },
    async () => mockBoards,
    { level: 'minimal' }
  );

  // Second call - cache hit
  await responseOptimizer.optimizeWithCache(
    'get_boards',
    { filter: 'open' },
    async () => mockBoards,
    { level: 'minimal' }
  );

  // Different params - cache miss
  await responseOptimizer.optimizeWithCache(
    'get_boards',
    { filter: 'closed' },
    async () => mockBoards,
    { level: 'minimal' }
  );

  const stats = responseOptimizer.getCacheStats();
  console.log('Cache statistics:', stats);
  console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);

  // Test cache invalidation
  responseOptimizer.invalidateCache('create_board');
  console.log('\nAfter invalidation (create_board):');
  const newStats = responseOptimizer.getCacheStats();
  console.log('Cache size:', newStats.size);
}

testCache().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(err => {
  console.error('Test error:', err);
});