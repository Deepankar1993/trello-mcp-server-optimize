/**
 * Board Tool Handlers
 * 
 * Implements the handlers for board-related tools.
 * Each handler corresponds to a tool defined in board-tools.ts.
 */

import { ServiceFactory } from '../services/service-factory.js';
import { getDefaultOptimizationLevel } from '../utils/tool-optimization-params.js';

/**
 * Handlers for board-related tools
 */
export const boardToolHandlers = {
    /**
     * Get boards for the authenticated user
     * @param args - Tool arguments
     * @returns Promise resolving to the boards
     */
    get_boards: async (args: any) => {
        const boardService = ServiceFactory.getInstance().getBoardService();
        const { detailLevel, fields, maxItems, summarize, ...params } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_boards'),
            fields,
            maxItems,
            summarize
        };
        
        return boardService.getBoards({ ...params, optimization });
    },

    /**
     * Get a specific board by ID
     * @param args - Tool arguments
     * @returns Promise resolving to the board
     */
    get_board: async (args: any) => {
        const boardService = ServiceFactory.getInstance().getBoardService();
        const { boardId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_board'),
            fields
        };
        
        return boardService.getBoard(boardId, optimization);
    },

    /**
     * Create a new board
     * @param args - Tool arguments
     * @returns Promise resolving to the created board
     */
    create_board: async (args: any) => {
        const boardService = ServiceFactory.getInstance().getBoardService();
        const { detailLevel, fields, ...params } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('create_board'),
            fields
        };
        
        return boardService.createBoard({ ...params, optimization });
    },

    /**
     * Update an existing board
     * @param args - Tool arguments
     * @returns Promise resolving to the updated board
     */
    update_board: async (args: any) => {
        const boardService = ServiceFactory.getInstance().getBoardService();
        const { boardId, detailLevel, fields, ...updateData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_board'),
            fields
        };
        
        return boardService.updateBoard(boardId, { ...updateData, optimization });
    },

    /**
     * Delete a board
     * @param args - Tool arguments
     * @returns Promise resolving when deletion is complete
     */
    delete_board: async (args: any) => {
        if (!args.confirm) {
            throw new Error('Deletion requires confirmation. Set confirm: true to proceed.');
        }

        const boardService = ServiceFactory.getInstance().getBoardService();
        await boardService.deleteBoard(args.boardId);
        return { success: true, message: 'Board deleted successfully' };
    },

    /**
     * Get all lists on a board
     * @param args - Tool arguments
     * @returns Promise resolving to the lists
     */
    get_board_lists: async (args: any) => {
        const boardService = ServiceFactory.getInstance().getBoardService();
        const { boardId, filter, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_board_lists'),
            fields,
            maxItems,
            summarize
        };
        
        return boardService.getLists(boardId, filter, optimization);
    },

    /**
     * Get all members of a board
     * @param args - Tool arguments
     * @returns Promise resolving to the members
     */
    get_board_members: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { boardId, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_board_members'),
            fields,
            maxItems,
            summarize
        };
        
        return memberService.getBoardMembers(boardId, optimization);
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
     * Close (archive) a board
     * @param args - Tool arguments
     * @returns Promise resolving to the updated board
     */
    close_board: async (args: any) => {
        const boardService = ServiceFactory.getInstance().getBoardService();
        const { boardId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('close_board'),
            fields
        };
        
        return boardService.updateBoard(boardId, { closed: true, optimization });
    },

    /**
     * Reopen a closed board
     * @param args - Tool arguments
     * @returns Promise resolving to the updated board
     */
    reopen_board: async (args: any) => {
        const boardService = ServiceFactory.getInstance().getBoardService();
        const { boardId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('reopen_board'),
            fields
        };
        
        return boardService.updateBoard(boardId, { closed: false, optimization });
    }
};
