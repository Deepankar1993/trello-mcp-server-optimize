#!/usr/bin/env node

/**
 * Direct Baseline Token Measurement Script
 * Runs measurements through the Trello MCP server directly
 */

import { ServiceFactory } from '../../build/services/service-factory.js';
import { trelloToolHandlers } from '../../build/tools/trello-tool-handlers.js';
import { TokenMeasurement } from '../../build/utils/token-measurement.js';
import { writeFileSync } from 'fs';
import config from '../../build/config.js';

// Test IDs from the Trello MCP Optimizations board
const TEST_BOARD_ID = '685ff55ec786614448169720';
const TEST_LIST_ID = '685ff6d394ae809cdfad1622'; // Phase 1 list
const TEST_CARD_ID = '685ff7151dd5a6e9f1825c46'; // First card in Phase 1
const TEST_CHECKLIST_ID = '685ff873df2ffa50f4aeaa55'; // Token Measurement Tasks checklist

// High-priority operations to measure
const OPERATIONS_TO_MEASURE = [
  // Board operations (expected high token usage)
  { tool: 'get_board', args: { boardId: TEST_BOARD_ID }, category: 'board' },
  { tool: 'get_board_lists', args: { boardId: TEST_BOARD_ID }, category: 'board' },
  { tool: 'get_board_members', args: { boardId: TEST_BOARD_ID }, category: 'board' },
  { tool: 'get_board_labels', args: { boardId: TEST_BOARD_ID }, category: 'board' },
  
  // Card operations (variable token usage)
  { tool: 'get_card', args: { cardId: TEST_CARD_ID }, category: 'card' },
  { tool: 'get_cards_in_list', args: { listId: TEST_LIST_ID }, category: 'card' },
  { tool: 'get_comments', args: { cardId: TEST_CARD_ID }, category: 'card' },
  { tool: 'get_attachments', args: { cardId: TEST_CARD_ID }, category: 'card' },
  { tool: 'get_card_members', args: { cardId: TEST_CARD_ID }, category: 'card' },
  
  // List operations (medium token usage)
  { tool: 'get_list', args: { listId: TEST_LIST_ID }, category: 'list' },
  { tool: 'get_cards_in_list', args: { listId: '685ff6dc32871811e741874d' }, category: 'list' }, // Phase 2 list (might have different content)
  
  // Member operations (low-medium token usage)
  { tool: 'get_me', args: {}, category: 'member' },
  { tool: 'get_member', args: { memberIdOrUsername: 'me' }, category: 'member' },
  { tool: 'get_member_boards', args: { memberIdOrUsername: 'me' }, category: 'member' },
  
  // Label operations (low token usage)
  { tool: 'get_label', args: { labelId: '685ff55ec78661444816975f' }, category: 'label' },
  { tool: 'get_card_labels', args: { cardId: TEST_CARD_ID }, category: 'label' },
  
  // Checklist operations
  { tool: 'get_checklist', args: { checklistId: TEST_CHECKLIST_ID }, category: 'checklist' },
  { tool: 'get_checkitems', args: { checklistId: TEST_CHECKLIST_ID }, category: 'checklist' },
  
  // Search operations (potentially high token usage)
  { tool: 'search_members', args: { query: 'test' }, category: 'search' }
];

async function collectBaselines() {
  console.log('🚀 Starting Baseline Token Measurements\n');
  console.log(`📋 Using Trello API credentials from config`);
  console.log(`📋 Testing ${OPERATIONS_TO_MEASURE.length} operations\n`);
  
  // Initialize services
  const serviceFactory = ServiceFactory.initialize(
    config.trello.apiKey,
    config.trello.token
  );
  
  // Initialize token measurement
  const tokenMeasurer = TokenMeasurement.getInstance();
  tokenMeasurer.clear(); // Clear any previous measurements
  
  const results = [];
  const summaryByCategory = {};
  
  // Helper to determine operation type
  function getOperationType(toolName) {
    if (toolName.includes('search')) return 'search';
    if (toolName.includes('get_boards') || toolName.includes('get_cards_in_list') || toolName.includes('get_board_lists')) return 'list';
    if (toolName.includes('create') || toolName.includes('update') || toolName.includes('delete') || toolName.includes('add') || toolName.includes('remove')) return 'write';
    return 'read';
  }
  
  for (const operation of OPERATIONS_TO_MEASURE) {
    console.log(`\n📊 Measuring: ${operation.tool}`);
    console.log(`   Category: ${operation.category}`);
    console.log(`   Args: ${JSON.stringify(operation.args)}`);
    
    try {
      const handler = trelloToolHandlers[operation.tool];
      if (!handler) {
        console.log(`   ❌ Handler not found for ${operation.tool}`);
        continue;
      }
      
      const operationType = getOperationType(operation.tool);
      
      // Measure the operation
      const { result, measurement } = await tokenMeasurer.measureToolCall(
        operation.tool,
        operation.args,
        operationType,
        () => handler(operation.args)
      );
      
      const measurementData = {
        ...operation,
        ...measurement,
        timestamp: new Date().toISOString()
      };
      
      results.push(measurementData);
      
      // Update category summary
      if (!summaryByCategory[operation.category]) {
        summaryByCategory[operation.category] = {
          operations: [],
          totalTokens: 0,
          avgTokens: 0
        };
      }
      summaryByCategory[operation.category].operations.push(measurementData);
      
      console.log(`   ✅ Success: ${measurement.totalTokens} tokens`);
      console.log(`      Request: ${measurement.requestTokens} tokens`);
      console.log(`      Response: ${measurement.responseTokens} tokens`);
      console.log(`      Time: ${measurement.executionTime}ms`);
      console.log(`      Size: ${measurement.responseSize} bytes`);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Calculate summaries
  Object.keys(summaryByCategory).forEach(category => {
    const ops = summaryByCategory[category].operations;
    const totalTokens = ops.reduce((sum, op) => sum + op.totalTokens, 0);
    summaryByCategory[category].totalTokens = totalTokens;
    summaryByCategory[category].avgTokens = Math.round(totalTokens / ops.length);
  });
  
  // Sort results by token usage
  const sortedResults = [...results].sort((a, b) => b.totalTokens - a.totalTokens);
  const top10 = sortedResults.slice(0, 10);
  
  // Identify token hotspots (>1000 tokens)
  const tokenHotspots = results.filter(r => r.totalTokens > 1000);
  
  // Generate comprehensive report
  const report = {
    metadata: {
      timestamp: new Date().toISOString(),
      boardId: TEST_BOARD_ID,
      boardName: 'Trello MCP Optimizations',
      totalOperationsMeasured: results.length,
      totalOperationsPlanned: OPERATIONS_TO_MEASURE.length
    },
    
    summaryByCategory,
    
    top10HighestTokenOperations: top10.map(op => ({
      tool: op.tool,
      category: op.category,
      totalTokens: op.totalTokens,
      requestTokens: op.requestTokens,
      responseTokens: op.responseTokens,
      responseSize: op.responseSize,
      executionTime: op.executionTime
    })),
    
    tokenHotspots: tokenHotspots.map(op => ({
      tool: op.tool,
      category: op.category,
      totalTokens: op.totalTokens,
      percentOfResponse: Math.round((op.responseTokens / op.totalTokens) * 100)
    })),
    
    statistics: {
      current: {
        avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length),
        medianTokens: sortedResults[Math.floor(sortedResults.length / 2)]?.totalTokens || 0,
        maxTokens: Math.max(...results.map(r => r.totalTokens)),
        minTokens: Math.min(...results.map(r => r.totalTokens)),
        totalTokensAllOperations: results.reduce((sum, r) => sum + r.totalTokens, 0),
        avgResponseSize: Math.round(results.reduce((sum, r) => sum + r.responseSize, 0) / results.length),
        avgExecutionTime: Math.round(results.reduce((sum, r) => sum + r.executionTime, 0) / results.length)
      },
      
      optimizationTargets: {
        '60_percent_reduction': {
          avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.4),
          maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.4),
          totalSavings: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.6)
        },
        '70_percent_reduction': {
          avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.3),
          maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.3),
          totalSavings: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.7)
        },
        '85_percent_reduction': {
          avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.15),
          maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.15),
          totalSavings: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.85)
        },
        '90_percent_reduction': {
          avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.1),
          maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.1),
          totalSavings: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.9)
        }
      }
    },
    
    detailedMeasurements: results.map(r => ({
      tool: r.tool,
      category: r.category,
      operationType: r.operationType,
      totalTokens: r.totalTokens,
      requestTokens: r.requestTokens,
      responseTokens: r.responseTokens,
      responseSize: r.responseSize,
      executionTime: r.executionTime,
      tokensPerByte: (r.totalTokens / r.responseSize).toFixed(3),
      timestamp: r.timestamp
    })),
    
    recommendations: {
      highPriorityOptimizations: tokenHotspots.map(op => op.tool),
      potentialFieldsToFilter: [
        'prefs (board preferences - often not needed)',
        'badges (card badges - can be minimized)',
        'descData (description metadata)',
        'limits (API limits info)',
        'nodeId (internal identifiers)',
        'sharedSourceUrl (image URLs)',
        'backgroundImageScaled (multiple image sizes)'
      ],
      suggestedDetailLevels: {
        minimal: 'Only essential fields (id, name, key properties)',
        standard: 'Common fields for typical use cases',
        detailed: 'All fields except metadata and preferences',
        full: 'Complete response (current behavior)'
      }
    }
  };
  
  // Save detailed report
  const reportPath = '../../reports/baseline/baseline-measurements-report.json';
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: reports/baseline/baseline-measurements-report.json`);
  
  // Save summary report
  const summaryReport = {
    timestamp: report.metadata.timestamp,
    summary: `Measured ${results.length} operations with average ${report.statistics.current.avgTokensPerOperation} tokens per operation`,
    tokenHotspots: report.tokenHotspots,
    top5Operations: report.top10HighestTokenOperations.slice(0, 5),
    categoryBreakdown: Object.entries(summaryByCategory).map(([cat, data]) => ({
      category: cat,
      avgTokens: data.avgTokens,
      operations: data.operations.length
    })),
    targets: {
      current: report.statistics.current.avgTokensPerOperation,
      target60: report.statistics.optimizationTargets['60_percent_reduction'].avgTokensPerOperation,
      target85: report.statistics.optimizationTargets['85_percent_reduction'].avgTokensPerOperation
    }
  };
  
  const summaryPath = '../../reports/baseline/baseline-summary.json';
  writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
  console.log(`📄 Summary report saved to: reports/baseline/baseline-summary.json`);
  
  // Display results
  console.log('\n' + '='.repeat(50));
  console.log('   BASELINE MEASUREMENT RESULTS');
  console.log('='.repeat(50) + '\n');
  
  console.log(`📊 Total Operations Measured: ${results.length}`);
  console.log(`⏱️  Average Execution Time: ${report.statistics.current.avgExecutionTime}ms`);
  console.log(`📏 Average Response Size: ${report.statistics.current.avgResponseSize} bytes`);
  
  console.log(`\n📈 Token Usage Statistics:`);
  console.log(`   Average: ${report.statistics.current.avgTokensPerOperation} tokens/operation`);
  console.log(`   Median: ${report.statistics.current.medianTokens} tokens`);
  console.log(`   Maximum: ${report.statistics.current.maxTokens} tokens`);
  console.log(`   Minimum: ${report.statistics.current.minTokens} tokens`);
  console.log(`   Total: ${report.statistics.current.totalTokensAllOperations} tokens`);
  
  console.log(`\n📊 Token Usage by Category:`);
  Object.entries(summaryByCategory).forEach(([category, data]) => {
    console.log(`   ${category.padEnd(10)}: ${data.avgTokens} avg tokens (${data.operations.length} operations)`);
  });
  
  if (tokenHotspots.length > 0) {
    console.log(`\n🔥 Token Hotspots (>1000 tokens): ${tokenHotspots.length} operations`);
    tokenHotspots.forEach(op => {
      console.log(`   - ${op.tool}: ${op.totalTokens} tokens (${op.percentOfResponse}% in response)`);
    });
  }
  
  console.log(`\n🏆 Top 5 Highest Token Operations:`);
  top10.slice(0, 5).forEach((op, i) => {
    console.log(`   ${i + 1}. ${op.tool}: ${op.totalTokens} tokens (${op.responseSize} bytes)`);
  });
  
  console.log(`\n🎯 Optimization Targets:`);
  console.log(`   Current Average: ${report.statistics.current.avgTokensPerOperation} tokens/operation`);
  console.log(`   60% Reduction: ${report.statistics.optimizationTargets['60_percent_reduction'].avgTokensPerOperation} tokens/operation (save ${report.statistics.optimizationTargets['60_percent_reduction'].totalSavings} tokens)`);
  console.log(`   70% Reduction: ${report.statistics.optimizationTargets['70_percent_reduction'].avgTokensPerOperation} tokens/operation (save ${report.statistics.optimizationTargets['70_percent_reduction'].totalSavings} tokens)`);
  console.log(`   85% Reduction: ${report.statistics.optimizationTargets['85_percent_reduction'].avgTokensPerOperation} tokens/operation (save ${report.statistics.optimizationTargets['85_percent_reduction'].totalSavings} tokens)`);
  
  console.log('\n✅ Baseline measurements complete!');
  
  // Export raw measurements from TokenMeasurement instance
  const rawMeasurements = tokenMeasurer.exportMeasurements();
  writeFileSync('../../reports/baseline/baseline-raw-measurements.json', rawMeasurements);
  console.log('📄 Raw measurements exported to: reports/baseline/baseline-raw-measurements.json');
}

// Run baseline measurements
collectBaselines().catch(console.error);