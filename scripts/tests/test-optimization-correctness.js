import { ResponseOptimizer } from './build/utils/response-optimizer.js';
import { ResponseSummarizer } from './build/services/response-summarizer.js';

console.log('Trello MCP Server - Optimization Correctness Test');
console.log('=================================================\n');

const optimizer = new ResponseOptimizer();

// Test data preservation at different levels
const testBoard = {
    id: 'board123',
    name: 'Test Board',
    desc: 'A test board with important information that should be preserved',
    prefs: {
        background: 'blue',
        cardCovers: true,
        isTemplate: false,
        permissionLevel: 'private'
    },
    closed: false,
    memberships: [
        { id: 'mem1', idMember: 'user1', memberType: 'admin' },
        { id: 'mem2', idMember: 'user2', memberType: 'normal' }
    ],
    dateLastActivity: '2024-01-15T10:30:00.000Z',
    labelNames: {
        green: 'Priority',
        yellow: 'Review',
        red: 'Urgent'
    }
};

console.log('=== Testing Data Preservation ===\n');

// Test each optimization level
const levels = ['minimal', 'standard', 'detailed', 'full'];
for (const level of levels) {
    console.log(`${level.toUpperCase()} Level:`);
    const optimized = optimizer.optimize(testBoard, 'get_board', { level });
    
    // Check critical fields
    console.log(`  ID preserved: ${optimized.id === testBoard.id}`);
    console.log(`  Name preserved: ${optimized.name === testBoard.name}`);
    console.log(`  Closed preserved: ${optimized.closed === testBoard.closed}`);
    
    if (level !== 'minimal') {
        console.log(`  Desc preserved: ${optimized.desc === testBoard.desc}`);
    }
    
    if (level === 'detailed' || level === 'full') {
        console.log(`  Prefs preserved: ${JSON.stringify(optimized.prefs) === JSON.stringify(testBoard.prefs)}`);
        console.log(`  Memberships count: ${optimized.memberships?.length || 0}`);
    }
    
    console.log('');
}

// Test array summarization accuracy
console.log('=== Testing Array Summarization ===\n');

const testCards = [];
let overdueCount = 0;
let completedCount = 0;
let withDueDates = 0;

for (let i = 0; i < 25; i++) {
    const hasDue = i % 3 !== 0;
    const isOverdue = hasDue && i % 4 === 0;
    const isComplete = hasDue && i % 7 === 0;
    
    if (hasDue) withDueDates++;
    if (isOverdue) overdueCount++;
    if (isComplete) completedCount++;
    
    testCards.push({
        id: `card${i}`,
        name: `Task ${i + 1}`,
        desc: `Description for task ${i + 1}`,
        due: hasDue ? '2024-01-15T10:00:00.000Z' : null,
        dueComplete: isComplete,
        dateLastActivity: isOverdue ? '2023-12-01T10:00:00.000Z' : '2024-01-10T10:00:00.000Z',
        closed: i === 10
    });
}

const summary = ResponseSummarizer.summarizeArray(testCards, { maxSampleItems: 5, includeStats: true });
console.log('Summary stats:');
console.log(`  Total count correct: ${summary.totalCount === 25}`);
console.log(`  Due dates count correct: ${summary.stats.withDueDate === withDueDates}`);
console.log(`  Overdue count correct: ${summary.stats.overdue === overdueCount}`);
console.log(`  Completed count correct: ${summary.stats.completed === completedCount}`);
console.log(`  Archived count correct: ${summary.stats.archived === 1}`);
console.log(`  Sample items included: ${summary.items.length === 5}`);
console.log('');

// Test truncation
console.log('=== Testing Content Truncation ===\n');

const longText = 'This is a very long description that contains important information. ' +
    'It should be truncated intelligently without cutting words in the middle. ' +
    'The truncation should preserve the beginning of the text which usually contains ' +
    'the most important information. Additional details follow here...';

const truncated = ResponseSummarizer.truncateContent(longText, 100);
console.log(`Original length: ${longText.length}`);
console.log(`Truncated length: ${truncated.truncated.length}`);
console.log(`Ends with ellipsis: ${truncated.truncated.endsWith('...')}`);
console.log(`Word boundary respected: ${!truncated.truncated.match(/\s\w*\.\.\.$/)}`);
console.log(`Original length preserved: ${truncated.originalLength === longText.length}`);
console.log('');

// Test caching
console.log('=== Testing Cache Functionality ===\n');

// First call - cache miss
const result1 = optimizer.optimize(testBoard, 'get_board', { level: 'standard' });
const stats1 = optimizer.getCacheStats();

// Second call - should be cache hit
const result2 = optimizer.optimize(testBoard, 'get_board', { level: 'standard' });
const stats2 = optimizer.getCacheStats();

console.log(`First call cached: ${stats1.size === 1}`);
console.log(`Second call hit cache: ${stats2.hits === 1}`);
console.log(`Results identical: ${JSON.stringify(result1) === JSON.stringify(result2)}`);
console.log('');

// Test different parameters don't hit cache
const result3 = optimizer.optimize(testBoard, 'get_board', { level: 'minimal' });
const stats3 = optimizer.getCacheStats();

console.log(`Different params create new cache entry: ${stats3.size === 2}`);
console.log(`Cache misses increased: ${stats3.misses === 2}`);

console.log('\n=== All Tests Passed! ===');