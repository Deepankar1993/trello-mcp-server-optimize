/**
 * List Tool Handlers
 * 
 * Implements the handlers for list-related tools.
 * Each handler corresponds to a tool defined in list-tools.ts.
 */

import { ServiceFactory } from '../services/service-factory.js';
import { getDefaultOptimizationLevel } from '../utils/tool-optimization-params.js';

/**
 * Handlers for list-related tools
 */
export const listToolHandlers = {
    /**
     * Get a specific list by ID
     * @param args - Tool arguments
     * @returns Promise resolving to the list
     */
    get_list: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_list'),
            fields
        };
        
        return listService.getList(listId, optimization);
    },

    /**
     * Create a new list on a board
     * @param args - Tool arguments
     * @returns Promise resolving to the created list
     */
    create_list: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { detailLevel, fields, ...createData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('create_list'),
            fields
        };
        
        return listService.createList(createData, optimization);
    },

    /**
     * Update an existing list
     * @param args - Tool arguments
     * @returns Promise resolving to the updated list
     */
    update_list: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, detailLevel, fields, ...updateData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_list'),
            fields
        };
        
        return listService.updateList(listId, updateData, optimization);
    },

    /**
     * Archive a list
     * @param args - Tool arguments
     * @returns Promise resolving to the updated list
     */
    archive_list: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('archive_list'),
            fields
        };
        
        return listService.archiveList(listId, optimization);
    },

    /**
     * Unarchive a list
     * @param args - Tool arguments
     * @returns Promise resolving to the updated list
     */
    unarchive_list: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('unarchive_list'),
            fields
        };
        
        return listService.unarchiveList(listId, optimization);
    },

    /**
     * Move a list to a different board
     * @param args - Tool arguments
     * @returns Promise resolving to the updated list
     */
    move_list_to_board: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, boardId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('move_list_to_board'),
            fields
        };
        
        return listService.moveListToBoard(listId, boardId, optimization);
    },

    /**
     * Get all cards in a list
     * @param args - Tool arguments
     * @returns Promise resolving to the cards
     */
    get_cards_in_list: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, filter, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_cards_in_list'),
            fields,
            maxItems,
            summarize
        };
        
        return listService.getCards(listId, filter, optimization);
    },

    /**
     * Archive all cards in a list
     * @param args - Tool arguments
     * @returns Promise resolving when operation is complete
     */
    archive_all_cards: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        await listService.archiveAllCards(args.listId);
        return { success: true, message: 'All cards in the list have been archived' };
    },

    /**
     * Move all cards in a list to another list
     * @param args - Tool arguments
     * @returns Promise resolving when operation is complete
     */
    move_all_cards: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        await listService.moveAllCards(args.sourceListId, args.destinationListId, args.boardId);
        return { success: true, message: 'All cards have been moved to the destination list' };
    },

    /**
     * Update the position of a list on a board
     * @param args - Tool arguments
     * @returns Promise resolving to the updated list
     */
    update_list_position: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, position, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_list_position'),
            fields
        };
        
        return listService.updatePosition(listId, position, optimization);
    },

    /**
     * Update the name of a list
     * @param args - Tool arguments
     * @returns Promise resolving to the updated list
     */
    update_list_name: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, name, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_list_name'),
            fields
        };
        
        return listService.updateName(listId, name, optimization);
    },

    /**
     * Subscribe to a list
     * @param args - Tool arguments
     * @returns Promise resolving to the updated list
     */
    subscribe_to_list: async (args: any) => {
        const listService = ServiceFactory.getInstance().getListService();
        const { listId, subscribed, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('subscribe_to_list'),
            fields
        };
        
        return listService.updateSubscribed(listId, subscribed, optimization);
    }
};
