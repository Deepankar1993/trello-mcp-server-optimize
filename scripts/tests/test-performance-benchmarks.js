#!/usr/bin/env node

/**
 * Performance Benchmark Script
 * 
 * Tests and measures the performance of the optimization features
 * across different operations and optimization levels.
 */

import { responseOptimizer } from './build/utils/response-optimizer.js';
import { ResponseSummarizer } from './build/services/response-summarizer.js';

// Sample data for different entity types
const sampleBoard = {
  id: 'board123',
  name: 'My Project Board',
  desc: 'This is a very long description that contains a lot of detailed information about the project board, including its purpose, goals, and various other metadata that might not always be necessary but is included in the full API response. It goes on and on with additional details that increase the token count significantly.',
  closed: false,
  idOrganization: 'org123',
  pinned: false,
  url: 'https://trello.com/b/board123/my-project-board',
  shortUrl: 'https://trello.com/b/board123',
  prefs: {
    permissionLevel: 'private',
    hideVotes: false,
    voting: 'disabled',
    comments: 'members',
    background: 'blue',
    backgroundImage: null,
    backgroundImageScaled: null,
    backgroundTile: false,
    backgroundBrightness: 'dark',
    backgroundColor: '#0079BF',
    backgroundBottomColor: '#0079BF',
    backgroundTopColor: '#0079BF',
    canBePublic: true,
    canBeEnterprise: true,
    canBeOrg: true,
    canBePrivate: true,
    canInvite: true
  },
  labelNames: {
    green: 'Low Priority',
    yellow: 'Medium Priority',
    orange: 'High Priority',
    red: 'Urgent',
    purple: 'Bug',
    blue: 'Feature',
    sky: 'Enhancement',
    lime: 'Documentation',
    pink: 'Research',
    black: 'Blocked'
  },
  limits: {
    attachments: { perBoard: { status: 'ok', disableAt: 36000, warnAt: 28800 } }
  },
  memberships: [
    { id: 'membership1', idMember: 'member123', memberType: 'admin' }
  ],
  powerUps: [],
  dateLastActivity: '2024-01-15T10:30:00.000Z',
  dateLastView: '2024-01-15T09:00:00.000Z',
  nodeId: 'ari:cloud:trello::board/workspace/123/board123'
};

const sampleCard = {
  id: 'card456',
  name: 'Implement new feature',
  desc: 'This card has a detailed description explaining the feature requirements, acceptance criteria, technical considerations, and implementation notes. It includes multiple paragraphs of text that significantly increase the token count when included in API responses.',
  idBoard: 'board123',
  idList: 'list789',
  closed: false,
  pos: 65536,
  due: '2024-02-01T12:00:00.000Z',
  dueComplete: false,
  idMembers: ['member123', 'member456'],
  idLabels: ['label1', 'label2'],
  badges: {
    attachments: 3,
    checkItems: 5,
    checkItemsChecked: 2,
    comments: 8,
    description: true,
    due: '2024-02-01T12:00:00.000Z',
    dueComplete: false,
    location: false,
    subscribed: true,
    viewingMemberVoted: false,
    votes: 2
  },
  cover: {
    idAttachment: null,
    color: 'green',
    idUploadedBackground: null,
    size: 'normal',
    brightness: 'light'
  },
  attachments: [],
  subscribed: true,
  dateLastActivity: '2024-01-15T10:00:00.000Z',
  shortUrl: 'https://trello.com/c/card456'
};

// Generate sample arrays
function generateSampleData(baseItem, count) {
  return Array.from({ length: count }, (_, i) => ({
    ...baseItem,
    id: `${baseItem.id}_${i}`,
    name: `${baseItem.name} ${i + 1}`
  }));
}

// Measure token count (rough estimate)
function estimateTokens(data) {
  return Math.ceil(JSON.stringify(data).length / 4);
}

// Run benchmark for a specific operation
async function runBenchmark(operation, data, levels) {
  console.log(`\n=== Benchmarking ${operation} ===`);
  const originalTokens = estimateTokens(data);
  console.log(`Original size: ${originalTokens} tokens (${JSON.stringify(data).length} chars)`);
  
  const results = {};
  
  for (const level of levels) {
    const startTime = Date.now();
    const optimized = responseOptimizer.optimize(data, operation, { level });
    const endTime = Date.now();
    
    const optimizedTokens = estimateTokens(optimized);
    const reduction = ((originalTokens - optimizedTokens) / originalTokens * 100).toFixed(1);
    
    results[level] = {
      tokens: optimizedTokens,
      reduction: `${reduction}%`,
      time: `${endTime - startTime}ms`,
      size: JSON.stringify(optimized).length
    };
    
    console.log(`\n${level.toUpperCase()}:`);
    console.log(`  Tokens: ${optimizedTokens} (${reduction}% reduction)`);
    console.log(`  Time: ${endTime - startTime}ms`);
    console.log(`  Size: ${JSON.stringify(optimized).length} chars`);
  }
  
  return results;
}

// Test array optimization features
async function testArrayOptimization() {
  console.log('\n\n=== Testing Array Optimization Features ===');
  
  const boards = generateSampleData(sampleBoard, 50);
  const originalTokens = estimateTokens(boards);
  console.log(`\nOriginal array: 50 boards, ${originalTokens} tokens`);
  
  // Test maxItems
  console.log('\n--- Testing maxItems parameter ---');
  const limited = responseOptimizer.optimize(boards, 'get_boards', { 
    level: 'minimal',
    maxItems: 5 
  });
  console.log(`Limited to 5 items: ${estimateTokens(limited)} tokens`);
  console.log(`Items returned: ${limited.length}`);
  
  // Test summarization
  console.log('\n--- Testing summarization ---');
  const summarized = responseOptimizer.optimize(boards, 'get_boards', { 
    summarize: true 
  });
  console.log(`Summarized response: ${estimateTokens(summarized)} tokens`);
  console.log('Summary:', JSON.stringify(summarized, null, 2));
}

// Test content truncation
async function testContentTruncation() {
  console.log('\n\n=== Testing Content Truncation ===');
  
  const longCard = {
    ...sampleCard,
    desc: 'A'.repeat(500) // 500 character description
  };
  
  console.log(`\nOriginal description length: ${longCard.desc.length} chars`);
  
  const truncated = responseOptimizer.optimize(longCard, 'get_card', {
    level: 'standard',
    truncateDescriptions: 100
  });
  
  console.log(`Truncated description length: ${truncated.desc.length} chars`);
  console.log(`Description ends with: "${truncated.desc.slice(-10)}"`);
  console.log(`Original length preserved: ${truncated.descOriginalLength}`);
}

// Test summarizer directly
async function testSummarizer() {
  console.log('\n\n=== Testing Response Summarizer ===');
  
  const cards = generateSampleData(sampleCard, 25);
  // Add some variety to the cards
  cards[0].due = null;
  cards[1].dueComplete = true;
  cards[2].closed = true;
  cards[3].due = '2024-01-01T00:00:00.000Z'; // Overdue
  
  const summary = ResponseSummarizer.summarizeCards(cards);
  console.log('\nCard summary:', summary);
  
  const boardSummary = ResponseSummarizer.summarizeBoards(
    generateSampleData(sampleBoard, 15).map((b, i) => ({ ...b, closed: i > 10 }))
  );
  console.log('\nBoard summary:', boardSummary);
}

// Main benchmark execution
async function main() {
  console.log('Trello MCP Server - Performance Benchmarks');
  console.log('==========================================');
  
  // Benchmark single entities
  await runBenchmark('get_board', sampleBoard, ['minimal', 'standard', 'detailed', 'full']);
  await runBenchmark('get_card', sampleCard, ['minimal', 'standard', 'detailed', 'full']);
  
  // Benchmark arrays
  const boards = generateSampleData(sampleBoard, 10);
  const cards = generateSampleData(sampleCard, 20);
  
  await runBenchmark('get_boards', boards, ['minimal', 'standard', 'detailed']);
  await runBenchmark('get_cards_in_list', cards, ['minimal', 'standard', 'detailed']);
  
  // Test specific features
  await testArrayOptimization();
  await testContentTruncation();
  await testSummarizer();
  
  // Generate performance report
  console.log('\n\n=== Performance Report ===');
  const report = responseOptimizer.generatePerformanceReport();
  console.log(report);
  
  // Cache statistics
  console.log('\n\n=== Cache Statistics ===');
  const cacheStats = responseOptimizer.getCacheStats();
  console.log('Cache stats:', cacheStats);
}

// Run benchmarks
main().catch(console.error);