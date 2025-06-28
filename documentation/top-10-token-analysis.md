# Top 10 Token-Consuming Operations Analysis

## Executive Summary
Based on baseline measurements of 18 Trello MCP operations, we've identified the top 10 token consumers. Two operations alone (`get_cards_in_list` and `get_board`) account for 47% of total token usage across all measured operations.

## Top 10 Operations Ranked by Token Consumption

### 1. **get_cards_in_list** - 2,103 tokens
- **Category**: Card
- **Response Size**: 6,809 bytes
- **Token Distribution**: 99% in response (2,087 tokens)
- **Key Issue**: Returns full card objects for all cards in a list
- **Optimization Potential**: 85% reduction possible by filtering card fields

### 2. **get_board** - 1,262 tokens
- **Category**: Board
- **Response Size**: 3,773 bytes
- **Token Distribution**: 99% in response (1,248 tokens)
- **Key Issue**: Board preferences (`prefs`) contribute ~40% of tokens
- **Optimization Potential**: 75% reduction by removing prefs, backgroundImageScaled, labelNames

### 3. **get_card** - 649 tokens
- **Category**: Card
- **Response Size**: 1,970 bytes
- **Token Distribution**: 97% in response (629 tokens)
- **Key Issue**: Includes badges, attachments metadata, and detailed timestamps
- **Optimization Potential**: 70% reduction possible

### 4. **get_comments** - 614 tokens
- **Category**: Card
- **Response Size**: 2,036 bytes
- **Token Distribution**: 97% in response (594 tokens)
- **Key Issue**: Returns full member objects and action metadata
- **Optimization Potential**: 60% reduction by simplifying member data

### 5. **get_board_lists** - 551 tokens
- **Category**: Board
- **Response Size**: 1,593 bytes
- **Token Distribution**: 97% in response (537 tokens)
- **Key Issue**: Returns all list metadata including limits and preferences
- **Optimization Potential**: 65% reduction possible

### 6. **get_checklist** - 551 tokens
- **Category**: Checklist
- **Response Size**: 1,610 bytes
- **Token Distribution**: 97% in response (533 tokens)
- **Key Issue**: Includes full checkitems array with all metadata
- **Optimization Potential**: 50% reduction by streamlining checkitem data

### 7. **get_checkitems** - 488 tokens
- **Category**: Checklist
- **Response Size**: 1,435 bytes
- **Token Distribution**: 96% in response (470 tokens)
- **Key Issue**: Redundant data when used with get_checklist
- **Optimization Potential**: Could be merged with get_checklist

### 8. **get_board_labels** - 227 tokens
- **Category**: Board
- **Response Size**: 637 bytes
- **Token Distribution**: 94% in response (213 tokens)
- **Key Issue**: Returns unused color variations
- **Optimization Potential**: 40% reduction possible

### 9. **get_member** - 136 tokens
- **Category**: Member
- **Response Size**: 357 bytes
- **Token Distribution**: 94% in response (128 tokens)
- **Key Issue**: Includes avatar URLs and preferences
- **Optimization Potential**: 30% reduction possible

### 10. **get_me** - 129 tokens
- **Category**: Member
- **Response Size**: 357 bytes
- **Token Distribution**: 99% in response (128 tokens)
- **Key Issue**: Duplicate of get_member functionality
- **Optimization Potential**: Similar to get_member

## Token Distribution Analysis

### By Operation Type
- **List Operations** (returning arrays): Average 1,327 tokens
  - get_cards_in_list: 2,103 tokens
  - get_board_lists: 551 tokens
- **Single Entity Reads**: Average 454 tokens
  - get_board: 1,262 tokens
  - get_card: 649 tokens
  - get_checklist: 551 tokens

### By Category
1. **Card Operations**: 682 avg tokens (highest)
2. **Board Operations**: 522 avg tokens
3. **Checklist Operations**: 520 avg tokens
4. **Member Operations**: 105 avg tokens
5. **List Operations**: 91 avg tokens
6. **Label Operations**: 55 avg tokens (lowest)

## Critical Findings

### 1. **The 80/20 Rule Applies**
- Top 2 operations (11% of total) consume 47% of all tokens
- Top 5 operations (28% of total) consume 72% of all tokens
- Optimizing just these 5 operations would yield massive improvements

### 2. **Response Token Dominance**
- Average: 98% of tokens are in responses
- Request tokens are negligible (1-20 tokens per request)
- All optimization efforts should focus on response filtering

### 3. **Field Bloat Patterns**
Consistently problematic fields across operations:
- `prefs` - Board/card preferences (often 30+ fields)
- `badges` - Card metadata (votes, comments, attachments counts)
- `limits` - API rate limit information
- `backgroundImageScaled` - 10 different image size URLs
- `labelNames` - 30 color name variations
- `nodeId`, `templateGallery` - Internal Trello metadata

### 4. **Array Operations Are Expensive**
Operations returning arrays have the highest token counts:
- get_cards_in_list: 2,103 tokens for ~3 cards
- get_board_lists: 551 tokens for ~3 lists
- Each array item includes full object details

## Optimization Strategy

### Phase 1: Quick Wins (Top 5 Operations)
1. **get_cards_in_list**: Implement field filtering to return only essential card properties
2. **get_board**: Remove prefs, backgroundImageScaled, labelNames
3. **get_card**: Filter badges, limits, and redundant metadata
4. **get_comments**: Simplify member objects to just id/username
5. **get_board_lists**: Remove limits and preferences

### Phase 2: Systematic Optimization
1. Implement configurable detail levels (minimal, standard, detailed, full)
2. Create field whitelists for each operation
3. Add response transformation layer
4. Implement caching for frequently accessed data

### Expected Impact
- **Current Average**: 396 tokens/operation
- **After Top 5 Optimization**: ~200 tokens/operation (50% reduction)
- **After Full Optimization**: ~59 tokens/operation (85% reduction)
- **Total Token Savings**: 6,055 tokens across 18 operations

## Recommendations

1. **Immediate Action**: Start with get_cards_in_list and get_board optimizations
2. **Configuration System**: Design flexible field selection mechanism
3. **Testing Priority**: Focus on high-traffic operations first
4. **Documentation**: Create field importance guide for each operation
5. **Backwards Compatibility**: Maintain "full" response option