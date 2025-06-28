/**
 * Checklist Tool Handlers
 * 
 * Implements the handlers for checklist-related tools.
 * Each handler corresponds to a tool defined in checklist-tools.ts.
 */

import { ServiceFactory } from '../services/service-factory.js';
import { getDefaultOptimizationLevel } from '../utils/tool-optimization-params.js';

/**
 * Handlers for checklist-related tools
 */
export const checklistToolHandlers = {
    /**
     * Get a specific checklist by ID
     * @param args - Tool arguments
     * @returns Promise resolving to the checklist
     */
    get_checklist: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_checklist'),
            fields
        };
        
        return checklistService.getChecklist(checklistId, optimization);
    },

    /**
     * Create a new checklist on a card
     * @param args - Tool arguments
     * @returns Promise resolving to the created checklist
     */
    create_checklist: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { cardId, name, pos, idChecklistSource, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('create_checklist'),
            fields
        };
        
        return checklistService.createChecklist(cardId, name, pos, idChecklistSource, optimization);
    },

    /**
     * Update an existing checklist
     * @param args - Tool arguments
     * @returns Promise resolving to the updated checklist
     */
    update_checklist: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, detailLevel, fields, ...updateData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_checklist'),
            fields
        };
        
        return checklistService.updateChecklist(checklistId, updateData, optimization);
    },

    /**
     * Delete a checklist
     * @param args - Tool arguments
     * @returns Promise resolving when deletion is complete
     */
    delete_checklist: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        await checklistService.deleteChecklist(args.checklistId);
        return { success: true, message: 'Checklist deleted successfully' };
    },

    /**
     * Get all checkitems on a checklist
     * @param args - Tool arguments
     * @returns Promise resolving to the checkitems
     */
    get_checkitems: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_checkitems'),
            fields,
            maxItems,
            summarize
        };
        
        return checklistService.getCheckItems(checklistId, optimization);
    },

    /**
     * Create a new checkitem on a checklist
     * @param args - Tool arguments
     * @returns Promise resolving to the created checkitem
     */
    create_checkitem: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, name, pos, checked, due, memberId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('create_checkitem'),
            fields
        };
        
        return checklistService.createCheckItem(
            checklistId,
            name,
            pos,
            checked,
            due,
            memberId,
            optimization
        );
    },

    /**
     * Get a specific checkitem on a checklist
     * @param args - Tool arguments
     * @returns Promise resolving to the checkitem
     */
    get_checkitem: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, checkItemId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_checkitem'),
            fields
        };
        
        return checklistService.getCheckItem(checklistId, checkItemId, optimization);
    },

    /**
     * Update a checkitem on a checklist
     * @param args - Tool arguments
     * @returns Promise resolving to the updated checkitem
     */
    update_checkitem: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, checkItemId, detailLevel, fields, ...updateData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_checkitem'),
            fields
        };
        
        return checklistService.updateCheckItem(checklistId, checkItemId, updateData, optimization);
    },

    /**
     * Delete a checkitem from a checklist
     * @param args - Tool arguments
     * @returns Promise resolving when deletion is complete
     */
    delete_checkitem: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        await checklistService.deleteCheckItem(args.checklistId, args.checkItemId);
        return { success: true, message: 'Checkitem deleted successfully' };
    },

    /**
     * Update the name of a checklist
     * @param args - Tool arguments
     * @returns Promise resolving to the updated checklist
     */
    update_checklist_name: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, name, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_checklist_name'),
            fields
        };
        
        return checklistService.updateName(checklistId, name, optimization);
    },

    /**
     * Update the position of a checklist on a card
     * @param args - Tool arguments
     * @returns Promise resolving to the updated checklist
     */
    update_checklist_position: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, position, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_checklist_position'),
            fields
        };
        
        return checklistService.updatePosition(checklistId, position, optimization);
    },

    /**
     * Get the board a checklist is on
     * @param args - Tool arguments
     * @returns Promise resolving to the board
     */
    get_checklist_board: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_checklist_board'),
            fields
        };
        
        return checklistService.getBoard(checklistId, optimization);
    },

    /**
     * Get the card a checklist is on
     * @param args - Tool arguments
     * @returns Promise resolving to the card
     */
    get_checklist_card: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { checklistId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_checklist_card'),
            fields
        };
        
        return checklistService.getCard(checklistId, optimization);
    },

    /**
     * Update a checkitem's state on a card
     * @param args - Tool arguments
     * @returns Promise resolving to the updated checkitem
     */
    update_checkitem_state_on_card: async (args: any) => {
        const checklistService = ServiceFactory.getInstance().getChecklistService();
        const { cardId, checkItemId, state, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_checkitem_state_on_card'),
            fields
        };
        
        return checklistService.updateCheckItemStateOnCard(cardId, checkItemId, state, optimization);
    }
};
