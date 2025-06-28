# Token Measurement Test Scenarios

## High-Priority Operations for Baseline Testing

### Board Operations (Expected High Token Usage)
1. **get_board** - Full board details with all metadata
2. **get_board_lists** - All lists on a board (potential for large responses)
3. **get_board_members** - Member information
4. **get_board_labels** - Label definitions

### Card Operations (Variable Token Usage)
5. **get_card** - Single card with full details
6. **create_card** - Standard card creation
7. **get_cards_in_list** - Multiple cards (high volume potential)
8. **update_card** - Card modification

### List Operations (Medium Token Usage)
9. **get_list** - List details
10. **create_list** - List creation

### Member Operations (Low-Medium Token Usage)
11. **get_me** - Current user info
12. **search_members** - Member search results

### Label/Checklist Operations (Low Token Usage)  
13. **get_label** - Label details
14. **get_checklist** - Checklist with items

## Test Board Setup Requirements

For consistent baseline measurements, we need:
- **Test Board ID**: Use existing Trello MCP Optimizations board (ID: uh0a5437)
- **Sample Lists**: With varying card counts (empty, few cards, many cards)
- **Sample Cards**: With different complexity levels (minimal, with checklists, with attachments)

## Measurement Categories

### By Token Volume (Expected)
- **High (1000+ tokens)**: get_board, get_board_lists, get_cards_in_list (large lists)
- **Medium (100-1000 tokens)**: get_card, create_card, get_board_members  
- **Low (<100 tokens)**: get_list, get_label, simple operations

### By Operation Type
- **Read Operations**: get_board, get_card, get_list, get_me
- **List Operations**: get_board_lists, get_cards_in_list, search_members
- **Write Operations**: create_card, update_card, create_list
- **Search Operations**: search_members

## Baseline Measurement Goals

1. **Identify Token Hotspots**: Operations using >1000 tokens
2. **Categorize by Usage Pattern**: Read vs List vs Write operations
3. **Document Response Verbosity**: Which fields contribute most to token count
4. **Establish Optimization Targets**: 60-90% reduction opportunities

## Next Steps After Baseline

1. Analyze which response fields are rarely needed
2. Identify opportunities for response filtering
3. Design configurable detail levels (minimal/standard/detailed/full)
4. Implement smart defaults based on operation context