/**
 * Common optimization parameters for tool definitions
 */

export const optimizationParams = {
  detailLevel: {
    type: "string",
    enum: ["minimal", "standard", "detailed", "full"],
    description: "Response detail level. 'minimal' returns only essential fields, 'standard' returns commonly used fields, 'detailed' returns most fields, 'full' returns all fields (default varies by operation type)"
  },
  fields: {
    type: "array",
    items: { type: "string" },
    description: "Specific fields to include in the response. Overrides detailLevel. Use dot notation for nested fields (e.g., 'prefs.permissionLevel')"
  },
  maxItems: {
    type: "number",
    description: "Maximum number of items to return for list operations. Helps reduce response size for large datasets"
  },
  summarize: {
    type: "boolean",
    description: "Return summary information instead of full data for list operations (e.g., '50 cards' instead of full card array)"
  }
};

/**
 * Get optimization parameter set based on operation type
 */
export function getOptimizationParamsForOperation(operationType: 'LIST' | 'DETAIL' | 'ADMIN' | 'ACTION'): Record<string, any> {
  const params: Record<string, any> = {
    detailLevel: { ...optimizationParams.detailLevel }
  };

  // Add fields parameter for all operations
  params.fields = { ...optimizationParams.fields };

  // Add list-specific parameters
  if (operationType === 'LIST') {
    params.maxItems = { ...optimizationParams.maxItems };
    params.summarize = { ...optimizationParams.summarize };
  }

  return params;
}

/**
 * Operation type mapping for smart defaults
 */
export const operationTypeMap: Record<string, 'LIST' | 'DETAIL' | 'ADMIN' | 'ACTION'> = {
  // LIST operations
  get_boards: 'LIST',
  get_board_lists: 'LIST',
  get_board_members: 'LIST',
  get_board_labels: 'LIST',
  get_cards_in_list: 'LIST',
  get_comments: 'LIST',
  get_attachments: 'LIST',
  get_member_boards: 'LIST',
  get_member_cards: 'LIST',
  get_boards_invited: 'LIST',
  get_member_organizations: 'LIST',
  get_notifications: 'LIST',
  search_members: 'LIST',
  get_organization_members: 'LIST',
  get_card_members: 'LIST',
  get_card_labels: 'LIST',
  get_checkitems: 'LIST',

  // DETAIL operations
  get_board: 'DETAIL',
  get_list: 'DETAIL',
  get_card: 'DETAIL',
  get_me: 'DETAIL',
  get_member: 'DETAIL',
  get_avatar: 'DETAIL',
  get_label: 'DETAIL',
  get_checklist: 'DETAIL',
  get_checkitem: 'DETAIL',
  get_checklist_board: 'DETAIL',
  get_checklist_card: 'DETAIL',

  // ADMIN operations
  create_board: 'ADMIN',
  update_board: 'ADMIN',
  delete_board: 'ADMIN',
  create_list: 'ADMIN',
  update_list: 'ADMIN',
  create_card: 'ADMIN',
  update_card: 'ADMIN',
  delete_card: 'ADMIN',
  update_me: 'ADMIN',
  create_label: 'ADMIN',
  update_label: 'ADMIN',
  delete_label: 'ADMIN',
  create_label_on_card: 'ADMIN',
  create_checklist: 'ADMIN',
  update_checklist: 'ADMIN',
  delete_checklist: 'ADMIN',
  create_checkitem: 'ADMIN',
  update_checkitem: 'ADMIN',
  delete_checkitem: 'ADMIN',

  // ACTION operations
  close_board: 'ACTION',
  reopen_board: 'ACTION',
  archive_list: 'ACTION',
  unarchive_list: 'ACTION',
  move_list_to_board: 'ACTION',
  archive_all_cards: 'ACTION',
  move_all_cards: 'ACTION',
  update_list_position: 'ACTION',
  update_list_name: 'ACTION',
  subscribe_to_list: 'ACTION',
  archive_card: 'ACTION',
  unarchive_card: 'ACTION',
  move_card_to_list: 'ACTION',
  add_comment: 'ACTION',
  add_attachment: 'ACTION',
  delete_attachment: 'ACTION',
  add_member: 'ACTION',
  remove_member: 'ACTION',
  add_label: 'ACTION',
  remove_label: 'ACTION',
  set_due_date: 'ACTION',
  set_due_complete: 'ACTION',
  update_label_name: 'ACTION',
  update_label_color: 'ACTION',
  add_label_to_card: 'ACTION',
  remove_label_from_card: 'ACTION',
  update_checklist_name: 'ACTION',
  update_checklist_position: 'ACTION',
  update_checkitem_state_on_card: 'ACTION'
};

/**
 * Get default optimization level for an operation
 */
export function getDefaultOptimizationLevel(operationName: string): string {
  const operationType = operationTypeMap[operationName];
  switch (operationType) {
    case 'LIST':
    case 'ACTION':
      return 'minimal';
    case 'DETAIL':
      return 'standard';
    case 'ADMIN':
      return 'detailed';
    default:
      return 'standard';
  }
}