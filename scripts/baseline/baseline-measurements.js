#!/usr/bin/env node

/**
 * Baseline Token Measurement Script
 * Collects real token usage data from Trello API operations
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { TokenMeasurement } from '../../build/utils/token-measurement.js';

// Test board ID from the Trello MCP Optimizations board
const TEST_BOARD_ID = '685ff55ec786614448169720';
const TEST_LIST_ID = '685ff6d394ae809cdfad1622'; // Phase 1 list
const TEST_CARD_ID = '685ff7151dd5a6e9f1825c46'; // First card in Phase 1

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
  
  // List operations (medium token usage)
  { tool: 'get_list', args: { listId: TEST_LIST_ID }, category: 'list' },
  
  // Member operations (low-medium token usage)
  { tool: 'get_me', args: {}, category: 'member' },
  { tool: 'get_member', args: { memberIdOrUsername: 'me' }, category: 'member' },
  
  // Label operations (low token usage)
  { tool: 'get_board_labels', args: { boardId: TEST_BOARD_ID }, category: 'label' },
  
  // Checklist operations
  { tool: 'get_checklist', args: { checklistId: '685ff873df2ffa50f4aeaa55' }, category: 'checklist' }
];

async function executeMCPTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('npx', [
      '@modelcontextprotocol/cli',
      'call',
      './build/index.js',
      toolName,
      JSON.stringify(args)
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        TRELLO_API_KEY: process.env.TRELLO_API_KEY,
        TRELLO_TOKEN: process.env.TRELLO_TOKEN
      }
    });

    let stdout = '';
    let stderr = '';

    mcpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP call failed with code ${code}: ${stderr}`));
      } else {
        // Extract token measurement from stderr
        const tokenMatch = stderr.match(/\[TOKEN\] ([^:]+): (\d+) tokens \(req: (\d+), resp: (\d+)\), (\d+)ms/);
        if (tokenMatch) {
          resolve({
            stdout,
            tokenInfo: {
              tool: tokenMatch[1],
              totalTokens: parseInt(tokenMatch[2]),
              requestTokens: parseInt(tokenMatch[3]),
              responseTokens: parseInt(tokenMatch[4]),
              executionTime: parseInt(tokenMatch[5])
            }
          });
        } else {
          resolve({ stdout, tokenInfo: null });
        }
      }
    });
  });
}

async function collectBaselines() {
  console.log('🚀 Starting Baseline Token Measurements\n');
  console.log(`📋 Testing ${OPERATIONS_TO_MEASURE.length} operations\n`);
  
  const results = [];
  const summaryByCategory = {};
  
  for (const operation of OPERATIONS_TO_MEASURE) {
    console.log(`\n📊 Measuring: ${operation.tool}`);
    console.log(`   Category: ${operation.category}`);
    console.log(`   Args: ${JSON.stringify(operation.args)}`);
    
    try {
      const startTime = Date.now();
      const result = await executeMCPTool(operation.tool, operation.args);
      const endTime = Date.now();
      
      if (result.tokenInfo) {
        const measurement = {
          ...operation,
          ...result.tokenInfo,
          responseSize: result.stdout.length,
          timestamp: new Date().toISOString()
        };
        
        results.push(measurement);
        
        // Update category summary
        if (!summaryByCategory[operation.category]) {
          summaryByCategory[operation.category] = {
            operations: [],
            totalTokens: 0,
            avgTokens: 0
          };
        }
        summaryByCategory[operation.category].operations.push(measurement);
        
        console.log(`   ✅ Success: ${result.tokenInfo.totalTokens} tokens`);
        console.log(`      Request: ${result.tokenInfo.requestTokens} tokens`);
        console.log(`      Response: ${result.tokenInfo.responseTokens} tokens`);
        console.log(`      Time: ${result.tokenInfo.executionTime}ms`);
        console.log(`      Size: ${result.stdout.length} bytes`);
      } else {
        console.log(`   ⚠️  No token measurement found`);
      }
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
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalOperations: results.length,
    summaryByCategory,
    top10HighestTokenOperations: top10,
    tokenHotspots: results.filter(r => r.totalTokens > 1000),
    allMeasurements: results,
    optimizationTargets: {
      current: {
        avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length),
        maxTokens: Math.max(...results.map(r => r.totalTokens)),
        totalTokensAllOperations: results.reduce((sum, r) => sum + r.totalTokens, 0)
      },
      target60Percent: {
        avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.4),
        maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.4),
        totalTokensAllOperations: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.4)
      },
      target90Percent: {
        avgTokensPerOperation: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) / results.length * 0.1),
        maxTokens: Math.round(Math.max(...results.map(r => r.totalTokens)) * 0.1),
        totalTokensAllOperations: Math.round(results.reduce((sum, r) => sum + r.totalTokens, 0) * 0.1)
      }
    }
  };
  
  // Save report
  const reportPath = '../../reports/baseline/baseline-measurements-report.json';
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: reports/baseline/baseline-measurements-report.json`);
  
  // Display summary
  console.log('\n=== BASELINE MEASUREMENT SUMMARY ===\n');
  console.log(`Total Operations Measured: ${results.length}`);
  console.log(`\nToken Usage by Category:`);
  Object.entries(summaryByCategory).forEach(([category, data]) => {
    console.log(`  ${category}: ${data.avgTokens} avg tokens (${data.operations.length} operations)`);
  });
  
  console.log(`\n🔥 Token Hotspots (>1000 tokens): ${report.tokenHotspots.length} operations`);
  report.tokenHotspots.forEach(op => {
    console.log(`  - ${op.tool}: ${op.totalTokens} tokens`);
  });
  
  console.log(`\n📊 Top 5 Highest Token Operations:`);
  top10.slice(0, 5).forEach((op, i) => {
    console.log(`  ${i + 1}. ${op.tool}: ${op.totalTokens} tokens`);
  });
  
  console.log(`\n🎯 Optimization Targets:`);
  console.log(`  Current Average: ${report.optimizationTargets.current.avgTokensPerOperation} tokens/operation`);
  console.log(`  60% Reduction Target: ${report.optimizationTargets.target60Percent.avgTokensPerOperation} tokens/operation`);
  console.log(`  90% Reduction Target: ${report.optimizationTargets.target90Percent.avgTokensPerOperation} tokens/operation`);
}

// Check environment variables
if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_TOKEN) {
  console.error('❌ Error: TRELLO_API_KEY and TRELLO_TOKEN environment variables must be set');
  process.exit(1);
}

// Run baseline measurements
collectBaselines().catch(console.error);