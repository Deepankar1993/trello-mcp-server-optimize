/**
 * Test script to measure token reduction with optimization
 * 
 * This script tests the ResponseOptimizer by comparing token counts
 * before and after optimization for different detail levels.
 */

import { responseOptimizer } from './build/utils/response-optimizer.js';
import fs from 'fs';

// Load mock data from baseline measurements
const mockData = JSON.parse(fs.readFileSync('./baseline-raw-measurements.json', 'utf8'));

// Function to estimate token count (rough estimate: 1 token ≈ 4 characters)
function estimateTokens(data) {
    const jsonString = JSON.stringify(data);
    return Math.round(jsonString.length / 4);
}

// Test each operation with different optimization levels
function testOptimization() {
    console.log('=== Token Optimization Test Results ===\n');
    
    const operations = ['get_cards_in_list', 'get_board'];
    const levels = ['minimal', 'standard', 'detailed', 'full'];
    
    for (const operation of operations) {
        const testData = mockData[operation];
        if (!testData) {
            console.log(`No test data found for ${operation}\n`);
            continue;
        }
        
        console.log(`\n📊 Operation: ${operation}`);
        console.log('─'.repeat(50));
        
        const originalTokens = estimateTokens(testData);
        console.log(`Original: ${originalTokens} tokens (${JSON.stringify(testData).length} chars)`);
        
        for (const level of levels) {
            const optimized = responseOptimizer.optimize(testData, operation, { level });
            const optimizedTokens = estimateTokens(optimized);
            const reduction = Math.round((1 - optimizedTokens / originalTokens) * 100);
            
            console.log(`${level.padEnd(10)}: ${optimizedTokens} tokens (${reduction}% reduction)`);
            
            // Show sample fields for non-full levels
            if (level !== 'full' && optimized) {
                const sampleData = Array.isArray(optimized) ? optimized[0] : optimized;
                if (sampleData) {
                    console.log(`  Fields: ${Object.keys(sampleData).join(', ')}`);
                }
            }
        }
        
        // Get optimization stats
        const stats = responseOptimizer.getOptimizationStats(
            testData,
            responseOptimizer.optimize(testData, operation, { level: 'standard' }),
            operation
        );
        
        console.log(`\nOptimization Stats (standard level):`);
        console.log(`  Original size: ${stats.originalSize} bytes`);
        console.log(`  Optimized size: ${stats.optimizedSize} bytes`);
        console.log(`  Reduction: ${stats.reductionPercentage}%`);
        console.log(`  Estimated token reduction: ${stats.estimatedTokenReduction} tokens`);
    }
    
    // Test custom field selection
    console.log('\n\n📊 Custom Field Selection Test');
    console.log('─'.repeat(50));
    
    const boardData = mockData.get_board;
    if (boardData) {
        const customOptimized = responseOptimizer.optimize(boardData, 'get_board', {
            fields: ['id', 'name', 'desc', 'url']
        });
        
        console.log('Custom fields (id, name, desc, url):');
        console.log(`  Original: ${estimateTokens(boardData)} tokens`);
        console.log(`  Optimized: ${estimateTokens(customOptimized)} tokens`);
        console.log(`  Fields present: ${Object.keys(customOptimized).join(', ')}`);
    }
    
    // Show configuration
    console.log('\n\n⚙️  Current Configuration');
    console.log('─'.repeat(50));
    console.log(JSON.stringify(responseOptimizer.getConfig(), null, 2));
}

// Run the test
testOptimization();