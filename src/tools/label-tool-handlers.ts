/**
 * Label Tool Handlers
 * 
 * Implements the handlers for label-related tools.
 * Each handler corresponds to a tool defined in label-tools.ts.
 */

import { ServiceFactory } from '../services/service-factory.js';
import { getDefaultOptimizationLevel } from '../utils/tool-optimization-params.js';

/**
 * Handlers for label-related tools
 */
export const labelToolHandlers = {
    /**
     * Get a specific label by ID
     * @param args - Tool arguments
     * @returns Promise resolving to the label
     */
    get_label: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        const { labelId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_label'),
            fields
        };
        
        return labelService.getLabel(labelId, optimization);
    },

    /**
     * Create a new label on a board
     * @param args - Tool arguments
     * @returns Promise resolving to the created label
     */
    create_label: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        const { boardId, name, color, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('create_label'),
            fields
        };
        
        return labelService.createLabel(boardId, name, color, optimization);
    },

    /**
     * Update an existing label
     * @param args - Tool arguments
     * @returns Promise resolving to the updated label
     */
    update_label: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        const { labelId, detailLevel, fields, ...updateData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_label'),
            fields
        };
        
        return labelService.updateLabel(labelId, updateData, optimization);
    },

    /**
     * Delete a label
     * @param args - Tool arguments
     * @returns Promise resolving when deletion is complete
     */
    delete_label: async (args: any) => {
        if (!args.confirm) {
            throw new Error('Deletion requires confirmation. Set confirm: true to proceed.');
        }

        const labelService = ServiceFactory.getInstance().getLabelService();
        await labelService.deleteLabel(args.labelId);
        return { success: true, message: 'Label deleted successfully' };
    },

    /**
     * Get all labels on a board
     * @param args - Tool arguments
     * @returns Promise resolving to the labels
     */
    get_board_labels: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        const { boardId, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_board_labels'),
            fields,
            maxItems,
            summarize
        };
        
        return labelService.getBoardLabels(boardId, optimization);
    },

    /**
     * Update the name of a label
     * @param args - Tool arguments
     * @returns Promise resolving to the updated label
     */
    update_label_name: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        const { labelId, name, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_label_name'),
            fields
        };
        
        return labelService.updateName(labelId, name, optimization);
    },

    /**
     * Update the color of a label
     * @param args - Tool arguments
     * @returns Promise resolving to the updated label
     */
    update_label_color: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        const { labelId, color, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_label_color'),
            fields
        };
        
        return labelService.updateColor(labelId, color, optimization);
    },

    /**
     * Create a new label directly on a card
     * @param args - Tool arguments
     * @returns Promise resolving to the created label
     */
    create_label_on_card: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        const { cardId, name, color, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('create_label_on_card'),
            fields
        };
        
        return labelService.createLabelOnCard(cardId, name, color, optimization);
    },

    /**
     * Get all labels on a card
     * @param args - Tool arguments
     * @returns Promise resolving to the labels
     */
    get_card_labels: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        const { cardId, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_card_labels'),
            fields,
            maxItems,
            summarize
        };
        
        return labelService.getCardLabels(cardId, optimization);
    },

    /**
     * Add a label to a card
     * @param args - Tool arguments
     * @returns Promise resolving when the operation is complete
     */
    add_label_to_card: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        await labelService.addLabelToCard(args.cardId, args.labelId);
        return { success: true, message: 'Label added to card successfully' };
    },

    /**
     * Remove a label from a card
     * @param args - Tool arguments
     * @returns Promise resolving when the operation is complete
     */
    remove_label_from_card: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        await labelService.removeLabelFromCard(args.cardId, args.labelId);
        return { success: true, message: 'Label removed from card successfully' };
    }
};
