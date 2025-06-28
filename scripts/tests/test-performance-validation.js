#!/usr/bin/env node

/**
 * Performance Validation Script
 * 
 * Tests the MCP server with real Trello API to validate token reduction targets.
 * Requires TRELLO_API_KEY and TRELLO_TOKEN environment variables.
 */

import 'dotenv/config';
import { TrelloService } from '../../build/services/trello-service.js';
import { ResponseOptimizer } from '../../build/utils/response-optimizer.js';
import { performanceMonitor } from '../../build/utils/performance-monitor.js';
import { tokenMeasurement } from '../../build/utils/token-measurement.js';

// Check for required environment variables
if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_TOKEN) {
  console.error('❌ Error: TRELLO_API_KEY and TRELLO_TOKEN must be set in environment');
  console.error('Please create a .env file with your Trello credentials');
  process.exit(1);
}

console.log('🚀 Starting Performance Validation with Real Trello API\n');

async function measureTokenReduction(operation, data, optimizationLevel) {
  const optimizer = new ResponseOptimizer();
  
  // Measure original size
  const originalTokens = tokenMeasurement.measureTokens(data);
  const originalSize = JSON.stringify(data).length;
  
  // Optimize data
  const optimized = optimizer.optimize(data, operation, { level: optimizationLevel });
  
  // Measure optimized size
  const optimizedTokens = tokenMeasurement.measureTokens(optimized);
  const optimizedSize = JSON.stringify(optimized).length;
  
  // Calculate reduction
  const tokenReduction = ((originalTokens - optimizedTokens) / originalTokens) * 100;
  const sizeReduction = ((originalSize - optimizedSize) / originalSize) * 100;
  
  return {
    operation,
    level: optimizationLevel,
    originalTokens,
    optimizedTokens,
    tokenReduction: tokenReduction.toFixed(2),
    originalSize,
    optimizedSize,
    sizeReduction: sizeReduction.toFixed(2)
  };
}

async function runValidation() {
  try {
    // Initialize Trello service
    const trello = TrelloService.initialize(process.env.TRELLO_API_KEY, process.env.TRELLO_TOKEN);
    
    console.log('📋 Test 1: Getting user boards...');
    const boards = await trello.get('/members/me/boards');
    
    if (!boards || boards.length === 0) {
      console.error('❌ No boards found. Please ensure your API credentials have access to at least one board.');
      return;
    }
    
    console.log(`✅ Found ${boards.length} boards\n`);
    
    // Test different optimization levels on boards
    console.log('📊 Testing Board Optimization:');
    console.log('─'.repeat(80));
    
    const boardResults = [];
    for (const level of ['minimal', 'standard', 'detailed', 'full']) {
      const result = await measureTokenReduction('get_boards', boards, level);
      boardResults.push(result);
      console.log(`Level: ${level.padEnd(10)} | Tokens: ${result.originalTokens} → ${result.optimizedTokens} | Reduction: ${result.tokenReduction}%`);
    }
    
    // Get a specific board for more tests
    const boardId = boards[0].id;
    console.log(`\n📋 Test 2: Getting lists for board "${boards[0].name}"...`);
    const lists = await trello.get(`/boards/${boardId}/lists`);
    console.log(`✅ Found ${lists.length} lists\n`);
    
    // Test list optimization
    console.log('📊 Testing List Optimization:');
    console.log('─'.repeat(80));
    
    const listResults = [];
    for (const level of ['minimal', 'standard', 'detailed']) {
      const result = await measureTokenReduction('get_board_lists', lists, level);
      listResults.push(result);
      console.log(`Level: ${level.padEnd(10)} | Tokens: ${result.originalTokens} → ${result.optimizedTokens} | Reduction: ${result.tokenReduction}%`);
    }
    
    // Get cards if lists exist
    if (lists.length > 0) {
      const listId = lists[0].id;
      console.log(`\n📋 Test 3: Getting cards for list "${lists[0].name}"...`);
      const cards = await trello.get(`/lists/${listId}/cards`);
      console.log(`✅ Found ${cards.length} cards\n`);
      
      if (cards.length > 0) {
        console.log('📊 Testing Card Optimization:');
        console.log('─'.repeat(80));
        
        const cardResults = [];
        for (const level of ['minimal', 'standard', 'detailed']) {
          const result = await measureTokenReduction('get_cards_in_list', cards, level);
          cardResults.push(result);
          console.log(`Level: ${level.padEnd(10)} | Tokens: ${result.originalTokens} → ${result.optimizedTokens} | Reduction: ${result.tokenReduction}%`);
        }
      }
    }
    
    // Get aggregated performance metrics
    console.log('\n📈 Aggregated Performance Metrics:');
    console.log('─'.repeat(80));
    const metrics = performanceMonitor.getAggregatedMetrics();
    console.log(`Total API Calls: ${metrics.totalCalls}`);
    console.log(`Average Token Reduction: ${metrics.avgReductionPercentage.toFixed(2)}%`);
    console.log(`Total Original Tokens: ${metrics.totalOriginalTokens}`);
    console.log(`Total Optimized Tokens: ${metrics.totalOptimizedTokens}`);
    console.log(`Overall Reduction: ${((1 - metrics.totalOptimizedTokens / metrics.totalOriginalTokens) * 100).toFixed(2)}%`);
    
    // Check if we met the target
    const overallReduction = (1 - metrics.totalOptimizedTokens / metrics.totalOriginalTokens) * 100;
    console.log('\n🎯 Target Validation:');
    console.log('─'.repeat(80));
    console.log(`Target: 70-85% token reduction`);
    console.log(`Achieved: ${overallReduction.toFixed(2)}%`);
    
    if (overallReduction >= 70) {
      console.log('✅ Performance target achieved!');
    } else {
      console.log('❌ Performance target not met. Further optimization needed.');
    }
    
    // Export detailed metrics
    const detailedMetrics = performanceMonitor.exportMetrics();
    console.log(`\n📄 Detailed metrics saved to performance-validation-results.json`);
    
    const fs = await import('fs');
    fs.writeFileSync('performance-validation-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: metrics,
      detailedResults: detailedMetrics,
      targetMet: overallReduction >= 70
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.statusText);
    }
  }
}

// Run the validation
runValidation().then(() => {
  console.log('\n✅ Performance validation complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});