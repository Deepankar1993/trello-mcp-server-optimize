/**
 * Member Service
 * 
 * Service for interacting with Trello members.
 * Provides methods for retrieving and managing members.
 */

import { TrelloService } from './trello-service.js';
import { TrelloMember, TrelloBoard, TrelloCard } from '../types/trello-types.js';
import { RuntimeOptimizationConfig } from '../types/optimization-types.js';
import { responseOptimizer } from '../utils/response-optimizer.js';

/**
 * Service for interacting with Trello members
 */
export class MemberService {
    private trelloService: TrelloService;

    /**
     * Creates a new MemberService instance
     * @param trelloService - The TrelloService instance
     */
    constructor(trelloService: TrelloService) {
        this.trelloService = trelloService;
    }

    /**
     * Get the authenticated member (current user)
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the member
     */
    async getMe(optimization?: RuntimeOptimizationConfig): Promise<TrelloMember> {
        const response = await this.trelloService.get<TrelloMember>('/members/me');
        return responseOptimizer.optimize(response, 'get_me', optimization);
    }

    /**
     * Get a specific member by ID or username
     * @param memberIdOrUsername - ID or username of the member to retrieve
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the member
     */
    async getMember(memberIdOrUsername: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloMember> {
        const response = await this.trelloService.get<TrelloMember>(`/members/${memberIdOrUsername}`);
        return responseOptimizer.optimize(response, 'get_member', optimization);
    }

    /**
     * Get boards that a member belongs to
     * @param memberIdOrUsername - ID or username of the member
     * @param filter - Optional filter (all, closed, members, open, organization, public, starred)
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of boards
     */
    async getMemberBoards(
        memberIdOrUsername: string,
        filter: 'all' | 'closed' | 'members' | 'open' | 'organization' | 'public' | 'starred' = 'all',
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloBoard[]> {
        const response = await this.trelloService.get<TrelloBoard[]>(`/members/${memberIdOrUsername}/boards`, { filter });
        return responseOptimizer.optimize(response, 'get_member_boards', optimization);
    }

    /**
     * Get cards assigned to a member
     * @param memberIdOrUsername - ID or username of the member
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of cards
     */
    async getMemberCards(memberIdOrUsername: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloCard[]> {
        const response = await this.trelloService.get<TrelloCard[]>(`/members/${memberIdOrUsername}/cards`);
        return responseOptimizer.optimize(response, 'get_member_cards', optimization);
    }

    /**
     * Get boards that a member has been invited to
     * @param memberIdOrUsername - ID or username of the member
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of boards
     */
    async getBoardsInvited(memberIdOrUsername: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloBoard[]> {
        const response = await this.trelloService.get<TrelloBoard[]>(`/members/${memberIdOrUsername}/boardsInvited`);
        return responseOptimizer.optimize(response, 'get_boards_invited', optimization);
    }

    /**
     * Get organizations that a member belongs to
     * @param memberIdOrUsername - ID or username of the member
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of organizations
     */
    async getMemberOrganizations(memberIdOrUsername: string, optimization?: RuntimeOptimizationConfig): Promise<any[]> {
        const response = await this.trelloService.get<any[]>(`/members/${memberIdOrUsername}/organizations`);
        return responseOptimizer.optimize(response, 'get_member_organizations', optimization);
    }

    /**
     * Get notifications for the authenticated member
     * @param filter - Optional filter for notification types
     * @param readFilter - Optional filter for read status (all, read, unread)
     * @param limit - Maximum number of notifications to return (max 1000)
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of notifications
     */
    async getNotifications(
        filter?: string,
        readFilter: 'all' | 'read' | 'unread' = 'all',
        limit: number = 50,
        optimization?: RuntimeOptimizationConfig
    ): Promise<any[]> {
        const response = await this.trelloService.get<any[]>('/members/me/notifications', {
            filter,
            read_filter: readFilter,
            limit: Math.min(limit, 1000)
        });
        return responseOptimizer.optimize(response, 'get_notifications', optimization);
    }

    /**
     * Update the authenticated member's information
     * @param data - Member update data
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated member
     */
    async updateMe(data: {
        fullName?: string;
        initials?: string;
        username?: string;
        bio?: string;
        avatarSource?: 'gravatar' | 'upload' | 'none';
        prefs?: {
            colorBlind?: boolean;
            locale?: string;
            minutesBetweenSummaries?: number;
        };
    }, optimization?: RuntimeOptimizationConfig): Promise<TrelloMember> {
        const response = await this.trelloService.put<TrelloMember>('/members/me', data);
        return responseOptimizer.optimize(response, 'update_me', optimization);
    }

    /**
     * Get the authenticated member's avatar
     * @param size - Size of the avatar (30, 50, 170, or original)
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the avatar URL
     */
    async getAvatar(size: 30 | 50 | 170 | 'original' = 'original', optimization?: RuntimeOptimizationConfig): Promise<string> {
        const me = await this.getMe(optimization);
        if (!me.avatarUrl) {
            throw new Error('Member does not have an avatar');
        }

        if (size === 'original') {
            return me.avatarUrl;
        }

        // Construct URL for specific size
        return `${me.avatarUrl}/${size}.png`;
    }

    /**
     * Search for members by name
     * @param query - Search query
     * @param limit - Maximum number of results to return (max 20)
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of members
     */
    async searchMembers(query: string, limit: number = 8, optimization?: RuntimeOptimizationConfig): Promise<TrelloMember[]> {
        const response = await this.trelloService.get<TrelloMember[]>('/search/members', {
            query,
            limit: Math.min(limit, 20)
        });
        return responseOptimizer.optimize(response, 'search_members', optimization);
    }

    /**
     * Get members of a board
     * @param boardId - ID of the board
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of members
     */
    async getBoardMembers(boardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloMember[]> {
        const response = await this.trelloService.get<TrelloMember[]>(`/boards/${boardId}/members`);
        return responseOptimizer.optimize(response, 'get_board_members', optimization);
    }

    /**
     * Get members of an organization
     * @param organizationId - ID of the organization
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of members
     */
    async getOrganizationMembers(organizationId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloMember[]> {
        const response = await this.trelloService.get<TrelloMember[]>(`/organizations/${organizationId}/members`);
        return responseOptimizer.optimize(response, 'get_organization_members', optimization);
    }

    /**
     * Get members assigned to a card
     * @param cardId - ID of the card
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of members
     */
    async getCardMembers(cardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloMember[]> {
        const response = await this.trelloService.get<TrelloMember[]>(`/cards/${cardId}/members`);
        return responseOptimizer.optimize(response, 'get_card_members', optimization);
    }
}
