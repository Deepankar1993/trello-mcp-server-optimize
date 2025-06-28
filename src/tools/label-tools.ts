/**
 * Label Tools
 * 
 * Defines the tools for interacting with Trello labels.
 * Each tool includes a name, description, and input schema.
 */

/**
 * Defines the tools related to Trello labels
 * Each tool has a name, description, and input schema following JSON Schema format
 */
import { getOptimizationParamsForOperation, operationTypeMap } from '../utils/tool-optimization-params.js';

export const labelTools = [
    {
        name: "get_label",
        description: "Retrieve detailed information about a specific label by ID. Use this when you need comprehensive details about a particular label.",
        inputSchema: {
            type: "object",
            properties: {
                labelId: {
                    type: "string",
                    description: "ID of the label to retrieve"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.get_label)},
            required: ["labelId"]
        }
    },
    {
        name: "create_label",
        description: "Create a new label on a board. Use this tool when you need to add a new label to a board for categorizing cards.",
        inputSchema: {
            type: "object",
            properties: {
                boardId: {
                    type: "string",
                    description: "ID of the board"
                },
                name: {
                    type: "string",
                    description: "Name of the label"
                },
                color: {
                    type: ["string", "null"],
                    enum: ["green", "yellow", "orange", "red", "purple", "blue", "sky", "lime", "pink", "black", null],
                    description: "Color of the label, or null for no color"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.create_label)},
            required: ["boardId", "name", "color"]
        }
    },
    {
        name: "update_label",
        description: "Update an existing label with new properties. Use this tool to modify a label's name or color.",
        inputSchema: {
            type: "object",
            properties: {
                labelId: {
                    type: "string",
                    description: "ID of the label to update"
                },
                name: {
                    type: "string",
                    description: "New name for the label"
                },
                color: {
                    type: ["string", "null"],
                    enum: ["green", "yellow", "orange", "red", "purple", "blue", "sky", "lime", "pink", "black", null],
                    description: "New color for the label, or null for no color"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.update_label)},
            required: ["labelId"]
        }
    },
    {
        name: "delete_label",
        description: "Permanently delete a label. Use this tool with caution as deletion cannot be undone.",
        inputSchema: {
            type: "object",
            properties: {
                labelId: {
                    type: "string",
                    description: "ID of the label to delete"
                },
                confirm: {
                    type: "boolean",
                    description: "Confirmation flag to prevent accidental deletion"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.delete_label)},
            required: ["labelId", "confirm"]
        }
    },
    {
        name: "get_board_labels",
        description: "Get all labels on a board. Use this tool to see the available labels on a board.",
        inputSchema: {
            type: "object",
            properties: {
                boardId: {
                    type: "string",
                    description: "ID of the board"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.get_board_labels)},
            required: ["boardId"]
        }
    },
    {
        name: "update_label_name",
        description: "Update the name of a label. Use this tool to rename a label.",
        inputSchema: {
            type: "object",
            properties: {
                labelId: {
                    type: "string",
                    description: "ID of the label"
                },
                name: {
                    type: "string",
                    description: "New name for the label"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.update_label_name)},
            required: ["labelId", "name"]
        }
    },
    {
        name: "update_label_color",
        description: "Update the color of a label. Use this tool to change the color of a label.",
        inputSchema: {
            type: "object",
            properties: {
                labelId: {
                    type: "string",
                    description: "ID of the label"
                },
                color: {
                    type: ["string", "null"],
                    enum: ["green", "yellow", "orange", "red", "purple", "blue", "sky", "lime", "pink", "black", null],
                    description: "New color for the label, or null for no color"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.update_label_color)},
            required: ["labelId", "color"]
        }
    },
    {
        name: "create_label_on_card",
        description: "Create a new label directly on a card. Use this tool to add a new label to a card without adding it to the board first.",
        inputSchema: {
            type: "object",
            properties: {
                cardId: {
                    type: "string",
                    description: "ID of the card"
                },
                name: {
                    type: "string",
                    description: "Name of the label"
                },
                color: {
                    type: ["string", "null"],
                    enum: ["green", "yellow", "orange", "red", "purple", "blue", "sky", "lime", "pink", "black", null],
                    description: "Color of the label, or null for no color"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.create_label_on_card)},
            required: ["cardId", "name", "color"]
        }
    },
    {
        name: "get_card_labels",
        description: "Get all labels on a card. Use this tool to see the labels applied to a card.",
        inputSchema: {
            type: "object",
            properties: {
                cardId: {
                    type: "string",
                    description: "ID of the card"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.get_card_labels)},
            required: ["cardId"]
        }
    },
    {
        name: "add_label_to_card",
        description: "Add a label to a card. Use this tool to categorize a card with an existing label.",
        inputSchema: {
            type: "object",
            properties: {
                cardId: {
                    type: "string",
                    description: "ID of the card"
                },
                labelId: {
                    type: "string",
                    description: "ID of the label to add"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.add_label_to_card)},
            required: ["cardId", "labelId"]
        }
    },
    {
        name: "remove_label_from_card",
        description: "Remove a label from a card. Use this tool to update the categorization of a card.",
        inputSchema: {
            type: "object",
            properties: {
                cardId: {
                    type: "string",
                    description: "ID of the card"
                },
                labelId: {
                    type: "string",
                    description: "ID of the label to remove"
                }
            ,
                ...getOptimizationParamsForOperation(operationTypeMap.remove_label_from_card)},
            required: ["cardId", "labelId"]
        }
    }
];
