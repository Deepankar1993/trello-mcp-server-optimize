/**
 * Card Tool Handlers
 * 
 * Implements the handlers for card-related tools.
 * Each handler corresponds to a tool defined in card-tools.ts.
 */

import { ServiceFactory } from '../services/service-factory.js';
import { getDefaultOptimizationLevel } from '../utils/tool-optimization-params.js';

/**
 * Handlers for card-related tools
 */
export const cardToolHandlers = {
    /**
     * Get a specific card by ID
     * @param args - Tool arguments
     * @returns Promise resolving to the card
     */
    get_card: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_card'),
            fields
        };
        
        return cardService.getCard(cardId, optimization);
    },

    /**
     * Create a new card
     * @param args - Tool arguments
     * @returns Promise resolving to the created card
     */
    create_card: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { detailLevel, fields, ...createData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('create_card'),
            fields
        };
        
        return cardService.createCard(createData, optimization);
    },

    /**
     * Update an existing card
     * @param args - Tool arguments
     * @returns Promise resolving to the updated card
     */
    update_card: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, detailLevel, fields, ...updateData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_card'),
            fields
        };
        
        return cardService.updateCard(cardId, updateData, optimization);
    },

    /**
     * Delete a card
     * @param args - Tool arguments
     * @returns Promise resolving when deletion is complete
     */
    delete_card: async (args: any) => {
        if (!args.confirm) {
            throw new Error('Deletion requires confirmation. Set confirm: true to proceed.');
        }

        const cardService = ServiceFactory.getInstance().getCardService();
        await cardService.deleteCard(args.cardId);
        return { success: true, message: 'Card deleted successfully' };
    },

    /**
     * Archive a card
     * @param args - Tool arguments
     * @returns Promise resolving to the updated card
     */
    archive_card: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('archive_card'),
            fields
        };
        
        return cardService.archiveCard(cardId, optimization);
    },

    /**
     * Unarchive a card
     * @param args - Tool arguments
     * @returns Promise resolving to the updated card
     */
    unarchive_card: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('unarchive_card'),
            fields
        };
        
        return cardService.unarchiveCard(cardId, optimization);
    },

    /**
     * Move a card to a different list
     * @param args - Tool arguments
     * @returns Promise resolving to the updated card
     */
    move_card_to_list: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, listId, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('move_card_to_list'),
            fields
        };
        
        return cardService.moveCardToList(cardId, listId, optimization);
    },

    /**
     * Add a comment to a card
     * @param args - Tool arguments
     * @returns Promise resolving to the created comment
     */
    add_comment: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, text, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('add_comment'),
            fields
        };
        
        return cardService.addComment(cardId, text, optimization);
    },

    /**
     * Get comments on a card
     * @param args - Tool arguments
     * @returns Promise resolving to the comments
     */
    get_comments: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_comments'),
            fields,
            maxItems,
            summarize
        };
        
        return cardService.getComments(cardId, optimization);
    },

    /**
     * Add an attachment to a card
     * @param args - Tool arguments
     * @returns Promise resolving to the created attachment
     */
    add_attachment: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, url, name, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('add_attachment'),
            fields
        };
        
        return cardService.addAttachment(cardId, url, name, optimization);
    },

    /**
     * Get attachments on a card
     * @param args - Tool arguments
     * @returns Promise resolving to the attachments
     */
    get_attachments: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_attachments'),
            fields,
            maxItems,
            summarize
        };
        
        return cardService.getAttachments(cardId, optimization);
    },

    /**
     * Delete an attachment from a card
     * @param args - Tool arguments
     * @returns Promise resolving when deletion is complete
     */
    delete_attachment: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        await cardService.deleteAttachment(args.cardId, args.attachmentId);
        return { success: true, message: 'Attachment deleted successfully' };
    },

    /**
     * Add a member to a card
     * @param args - Tool arguments
     * @returns Promise resolving when the operation is complete
     */
    add_member: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        await cardService.addMember(args.cardId, args.memberId);
        return { success: true, message: 'Member added to card successfully' };
    },

    /**
     * Remove a member from a card
     * @param args - Tool arguments
     * @returns Promise resolving when the operation is complete
     */
    remove_member: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        await cardService.removeMember(args.cardId, args.memberId);
        return { success: true, message: 'Member removed from card successfully' };
    },

    /**
     * Add a label to a card
     * @param args - Tool arguments
     * @returns Promise resolving when the operation is complete
     */
    add_label: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        await labelService.addLabelToCard(args.cardId, args.labelId);
        return { success: true, message: 'Label added to card successfully' };
    },

    /**
     * Remove a label from a card
     * @param args - Tool arguments
     * @returns Promise resolving when the operation is complete
     */
    remove_label: async (args: any) => {
        const labelService = ServiceFactory.getInstance().getLabelService();
        await labelService.removeLabelFromCard(args.cardId, args.labelId);
        return { success: true, message: 'Label removed from card successfully' };
    },

    /**
     * Set the due date for a card
     * @param args - Tool arguments
     * @returns Promise resolving to the updated card
     */
    set_due_date: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, due, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('set_due_date'),
            fields
        };
        
        return cardService.updateCard(cardId, { due }, optimization);
    },

    /**
     * Mark a card's due date as complete or incomplete
     * @param args - Tool arguments
     * @returns Promise resolving to the updated card
     */
    set_due_complete: async (args: any) => {
        const cardService = ServiceFactory.getInstance().getCardService();
        const { cardId, dueComplete, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('set_due_complete'),
            fields
        };
        
        return cardService.updateCard(cardId, { dueComplete }, optimization);
    }
};
