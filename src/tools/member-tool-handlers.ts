/**
 * Member Tool Handlers
 * 
 * Implements the handlers for member-related tools.
 * Each handler corresponds to a tool defined in member-tools.ts.
 */

import { ServiceFactory } from '../services/service-factory.js';
import { getDefaultOptimizationLevel } from '../utils/tool-optimization-params.js';

/**
 * Handlers for member-related tools
 */
export const memberToolHandlers = {
    /**
     * Get the authenticated member (current user)
     * @param args - Tool arguments
     * @returns Promise resolving to the member
     */
    get_me: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_me'),
            fields
        };
        
        return memberService.getMe(optimization);
    },

    /**
     * Get a specific member by ID or username
     * @param args - Tool arguments
     * @returns Promise resolving to the member
     */
    get_member: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { memberIdOrUsername, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_member'),
            fields
        };
        
        return memberService.getMember(memberIdOrUsername, optimization);
    },

    /**
     * Get boards that a member belongs to
     * @param args - Tool arguments
     * @returns Promise resolving to the boards
     */
    get_member_boards: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { memberIdOrUsername, filter, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_member_boards'),
            fields,
            maxItems,
            summarize
        };
        
        return memberService.getMemberBoards(memberIdOrUsername, filter, optimization);
    },

    /**
     * Get cards assigned to a member
     * @param args - Tool arguments
     * @returns Promise resolving to the cards
     */
    get_member_cards: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { memberIdOrUsername, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_member_cards'),
            fields,
            maxItems,
            summarize
        };
        
        return memberService.getMemberCards(memberIdOrUsername, optimization);
    },

    /**
     * Get boards that a member has been invited to
     * @param args - Tool arguments
     * @returns Promise resolving to the boards
     */
    get_boards_invited: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { memberIdOrUsername, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_boards_invited'),
            fields,
            maxItems,
            summarize
        };
        
        return memberService.getBoardsInvited(memberIdOrUsername, optimization);
    },

    /**
     * Get organizations that a member belongs to
     * @param args - Tool arguments
     * @returns Promise resolving to the organizations
     */
    get_member_organizations: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { memberIdOrUsername, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_member_organizations'),
            fields,
            maxItems,
            summarize
        };
        
        return memberService.getMemberOrganizations(memberIdOrUsername, optimization);
    },

    /**
     * Get notifications for the authenticated member
     * @param args - Tool arguments
     * @returns Promise resolving to the notifications
     */
    get_notifications: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { filter, readFilter, limit, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_notifications'),
            fields,
            maxItems: maxItems || limit,
            summarize
        };
        
        return memberService.getNotifications(filter, readFilter, limit, optimization);
    },

    /**
     * Update the authenticated member's information
     * @param args - Tool arguments
     * @returns Promise resolving to the updated member
     */
    update_me: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { detailLevel, fields, ...updateData } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('update_me'),
            fields
        };
        
        return memberService.updateMe(updateData, optimization);
    },

    /**
     * Get the authenticated member's avatar
     * @param args - Tool arguments
     * @returns Promise resolving to the avatar URL
     */
    get_avatar: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { size, detailLevel, fields } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_avatar'),
            fields
        };
        
        return memberService.getAvatar(size, optimization);
    },

    /**
     * Search for members by name
     * @param args - Tool arguments
     * @returns Promise resolving to the members
     */
    search_members: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { query, limit, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('search_members'),
            fields,
            maxItems: maxItems || limit,
            summarize
        };
        
        return memberService.searchMembers(query, limit, optimization);
    },

    /**
     * Get members of a board
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
     * Get members of an organization
     * @param args - Tool arguments
     * @returns Promise resolving to the members
     */
    get_organization_members: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { organizationId, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_organization_members'),
            fields,
            maxItems,
            summarize
        };
        
        return memberService.getOrganizationMembers(organizationId, optimization);
    },

    /**
     * Get members assigned to a card
     * @param args - Tool arguments
     * @returns Promise resolving to the members
     */
    get_card_members: async (args: any) => {
        const memberService = ServiceFactory.getInstance().getMemberService();
        const { cardId, detailLevel, fields, maxItems, summarize } = args;
        
        // Apply smart default if no detail level specified
        const optimization = {
            level: detailLevel || getDefaultOptimizationLevel('get_card_members'),
            fields,
            maxItems,
            summarize
        };
        
        return memberService.getCardMembers(cardId, optimization);
    }
};
