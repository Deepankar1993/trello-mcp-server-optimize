/**
 * List Tools
 * 
 * Defines the tools for interacting with Trello lists.
 * Each tool includes a name, description, and input schema.
 */

/**
 * Defines the tools related to Trello lists
 * Each tool has a name, description, and input schema following JSON Schema format
 */
import { getOptimizationParamsForOperation, operationTypeMap } from '../utils/tool-optimization-params.js';

export const listTools = [
    {
        name: "get_list",
        description: "Retrieve detailed information about a specific list by ID. Use this when you need comprehensive details about a particular list.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list to retrieve"
                },
                fields: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific fields to include in the response (default: all fields)"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.get_list)},
            required: ["listId"]
        }
    },
    {
        name: "create_list",
        description: "Create a new list on a board. Use this tool when you need to add a new list to a board.",
        inputSchema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Name of the list"
                },
                idBoard: {
                    type: "string",
                    description: "ID of the board the list should belong to"
                },
                pos: {
                    type: ["string", "number"],
                    description: "Position of the list (top, bottom, or a positive number)"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.create_list)},
            required: ["name", "idBoard"]
        }
    },
    {
        name: "update_list",
        description: "Update an existing list with new properties. Use this tool to modify list details or settings.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list to update"
                },
                name: {
                    type: "string",
                    description: "New name for the list"
                },
                closed: {
                    type: "boolean",
                    description: "Whether the list is closed (archived)"
                },
                idBoard: {
                    type: "string",
                    description: "ID of the board the list should belong to"
                },
                pos: {
                    type: ["string", "number"],
                    description: "Position of the list (top, bottom, or a positive number)"
                },
                subscribed: {
                    type: "boolean",
                    description: "Whether the authenticated user is subscribed to the list"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.update_list)},
            required: ["listId"]
        }
    },
    {
        name: "archive_list",
        description: "Archive a list. Use this tool to archive a list without deleting it.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list to archive"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.archive_list)},
            required: ["listId"]
        }
    },
    {
        name: "unarchive_list",
        description: "Unarchive a list. Use this tool to restore a previously archived list.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list to unarchive"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.unarchive_list)},
            required: ["listId"]
        }
    },
    {
        name: "move_list_to_board",
        description: "Move a list to a different board. Use this tool to reorganize lists between boards.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list to move"
                },
                boardId: {
                    type: "string",
                    description: "ID of the destination board"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.move_list_to_board)},
            required: ["listId", "boardId"]
        }
    },
    {
        name: "get_cards_in_list",
        description: "Get all cards in a list. Use this tool to see the contents of a list.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list"
                },
                filter: {
                    type: "string",
                    enum: ["all", "closed", "none", "open"],
                    description: "Filter cards by status (default: open)"
                },
                detailLevel: {
                    type: "string",
                    enum: ["minimal", "standard", "detailed", "full"],
                    description: "Level of detail in response. minimal: only essential fields (id, name, pos), standard: common fields, detailed: most fields, full: all fields (default: standard)"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.get_cards_in_list)},
            required: ["listId"]
        }
    },
    {
        name: "archive_all_cards",
        description: "Archive all cards in a list. Use this tool to quickly archive all cards in a list.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.archive_all_cards)},
            required: ["listId"]
        }
    },
    {
        name: "move_all_cards",
        description: "Move all cards in a list to another list. Use this tool to quickly move all cards from one list to another.",
        inputSchema: {
            type: "object",
            properties: {
                sourceListId: {
                    type: "string",
                    description: "ID of the source list"
                },
                destinationListId: {
                    type: "string",
                    description: "ID of the destination list"
                },
                boardId: {
                    type: "string",
                    description: "ID of the board (required by Trello API)"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.move_all_cards)},
            required: ["sourceListId", "destinationListId", "boardId"]
        }
    },
    {
        name: "update_list_position",
        description: "Update the position of a list on a board. Use this tool to reorder lists on a board.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list"
                },
                position: {
                    type: ["string", "number"],
                    description: "New position for the list (top, bottom, or a positive number)"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.update_list_position)},
            required: ["listId", "position"]
        }
    },
    {
        name: "update_list_name",
        description: "Update the name of a list. Use this tool to rename a list.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list"
                },
                name: {
                    type: "string",
                    description: "New name for the list"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.update_list_name)},
            required: ["listId", "name"]
        }
    },
    {
        name: "subscribe_to_list",
        description: "Subscribe to a list. Use this tool to receive notifications about changes to a list.",
        inputSchema: {
            type: "object",
            properties: {
                listId: {
                    type: "string",
                    description: "ID of the list"
                },
                subscribed: {
                    type: "boolean",
                    description: "Whether to subscribe (true) or unsubscribe (false)"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.subscribe_to_list)},
            required: ["listId", "subscribed"]
        }
    }
];
