# Baseline Metrics - Detailed Analysis

## Overview
- **Measurement Date**: 2025-06-28
- **Total Operations Measured**: 18
- **Total Tokens Consumed**: 7,123
- **Average Tokens per Operation**: 396

## Detailed Operation Metrics

### Critical Priority Operations (>1000 tokens)

#### 1. get_cards_in_list
- **Total Tokens**: 2,103 (29.5% of all tokens)
- **Response Tokens**: 2,087 (99.2% of operation tokens)
- **Response Size**: 6,809 bytes
- **Token Efficiency**: 0.309 tokens/byte
- **Problematic Fields**:
  - `badges` (15% of tokens) - Contains 13 sub-fields for counts
  - `cover` (10% of tokens) - Multiple image URLs and metadata
  - `attachments` array - Full attachment objects
  - `descData` - Rich text formatting metadata
  - `limits` - API rate limit information
- **Optimization Strategy**: Return only core fields (id, name, desc, due, labels, members)
- **Expected Reduction**: 85% (315 tokens target)

#### 2. get_board
- **Total Tokens**: 1,262 (17.7% of all tokens)
- **Response Tokens**: 1,248 (98.9% of operation tokens)
- **Response Size**: 3,773 bytes
- **Token Efficiency**: 0.334 tokens/byte
- **Problematic Fields**:
  - `prefs` (40% of tokens) - 34 preference fields
  - `labelNames` (15% of tokens) - 30 color variations
  - `backgroundImageScaled` (10% of tokens) - 10 image sizes
  - `limits` - Detailed API limits
  - `powerUps` array - Plugin information
- **Optimization Strategy**: Remove prefs, image variants, unused metadata
- **Expected Reduction**: 85% (189 tokens target)

### High Priority Operations (500-1000 tokens)

#### 3. get_card
- **Total Tokens**: 649
- **Key Issues**: badges object, cover images, attachment previews
- **Target**: 97 tokens

#### 4. get_comments
- **Total Tokens**: 614
- **Key Issues**: Full member objects in each comment, action metadata
- **Target**: 92 tokens

#### 5. get_board_lists
- **Total Tokens**: 551
- **Key Issues**: limits object, softLimit, subscription info
- **Target**: 83 tokens

#### 6. get_checklist
- **Total Tokens**: 551
- **Key Issues**: Full checkItems array with all metadata
- **Target**: 83 tokens

### Medium Priority Operations (100-500 tokens)

| Operation | Tokens | Main Issues | Target |
|-----------|---------|-------------|---------|
| get_checkitems | 488 | Redundant member/date info | 73 |
| get_board_labels | 227 | Unused color properties | 34 |
| get_member | 136 | Avatar URLs, prefs | 20 |
| get_me | 129 | Same as get_member | 19 |

### Low Priority Operations (<100 tokens)

| Operation | Tokens | Status |
|-----------|---------|---------|
| get_list | 91 | Acceptable |
| search_members | 71 | Acceptable |
| get_card_labels | 58 | Acceptable |
| get_label | 52 | Acceptable |
| get_member_boards | 50 | Acceptable |
| get_board_members | 49 | Acceptable |
| get_attachments | 21 | Minimal |
| get_card_members | 21 | Minimal |

## Field-Level Token Impact Analysis

### Most Expensive Fields Across All Operations

1. **prefs** (Board/Card preferences)
   - Found in: get_board, get_card
   - Token Impact: 300-500 tokens per occurrence
   - Contains: 30+ nested preference fields

2. **badges** (Card metadata)
   - Found in: get_card, cards in lists
   - Token Impact: 100-150 tokens per card
   - Contains: votes, comments, attachments counts, etc.

3. **backgroundImageScaled** (Board backgrounds)
   - Found in: get_board
   - Token Impact: 100-130 tokens
   - Contains: 10 different image size URLs

4. **labelNames** (Label color names)
   - Found in: get_board
   - Token Impact: 150-200 tokens
   - Contains: 30 color name variations

5. **limits** (API rate limits)
   - Found in: get_board, get_list, get_card
   - Token Impact: 50-80 tokens per occurrence
   - Contains: Detailed rate limit information

## Response Pattern Analysis

### Token Distribution by Response Size
- Small responses (<500 bytes): 0.4-0.5 tokens/byte
- Medium responses (500-2000 bytes): 0.3-0.4 tokens/byte
- Large responses (>2000 bytes): 0.3-0.35 tokens/byte

### Array vs Single Object Responses
- **Array responses** average 3x more tokens than single objects
- **Nested arrays** (e.g., cards with checklists) have exponential token growth
- **Empty arrays** still consume 1-2 tokens

## Optimization Recommendations by Phase

### Phase 1: Quick Wins (Days 1-3)
1. Filter `prefs` from all board operations
2. Remove `backgroundImageScaled` from board responses
3. Minimize `badges` to essential counts only
4. Strip `limits` from all responses

**Expected Impact**: 40-50% token reduction

### Phase 2: Structural Changes (Days 4-7)
1. Implement field whitelisting per operation
2. Create minimal/standard/full response modes
3. Add response transformation layer
4. Optimize array responses with pagination

**Expected Impact**: Additional 30-35% reduction

### Phase 3: Advanced Optimization (Week 2)
1. Implement response caching
2. Add field-level configuration
3. Create operation-specific optimizers
4. Add compression for large responses

**Expected Impact**: Final 10-15% reduction

## Total Expected Outcome
- **Current State**: 7,123 tokens (396 avg/operation)
- **After Phase 1**: ~3,500 tokens (195 avg/operation)
- **After Phase 2**: ~1,500 tokens (83 avg/operation)
- **After Phase 3**: ~1,070 tokens (59 avg/operation)
- **Total Reduction**: 85% (6,053 tokens saved)