/**
 * List Service
 * 
 * Service for interacting with Trello lists.
 * Provides methods for creating, reading, updating, and deleting lists.
 */

import { TrelloService } from './trello-service.js';
import {
    TrelloList,
    CreateListData,
    UpdateListData,
    ListFilters,
    TrelloCard
} from '../types/trello-types.js';
import { RuntimeOptimizationConfig } from '../types/optimization-types.js';
import { responseOptimizer } from '../utils/response-optimizer.js';

/**
 * Service for interacting with Trello lists
 */
export class ListService {
    private trelloService: TrelloService;

    /**
     * Creates a new ListService instance
     * @param trelloService - The TrelloService instance
     */
    constructor(trelloService: TrelloService) {
        this.trelloService = trelloService;
    }

    /**
     * Get a specific list by ID
     * @param listId - ID of the list to retrieve
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the list
     */
    async getList(listId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.get<TrelloList>(`/lists/${listId}`);
        return responseOptimizer.optimize(response, 'get_list', optimization);
    }

    /**
     * Create a new list
     * @param data - List creation data
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the created list
     */
    async createList(data: CreateListData, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.post<TrelloList>('/lists', data);
        return responseOptimizer.optimize(response, 'create_list', optimization);
    }

    /**
     * Update an existing list
     * @param listId - ID of the list to update
     * @param data - List update data
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated list
     */
    async updateList(listId: string, data: UpdateListData, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.put<TrelloList>(`/lists/${listId}`, data);
        return responseOptimizer.optimize(response, 'update_list', optimization);
    }

    /**
     * Archive a list
     * @param listId - ID of the list to archive
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated list
     */
    async archiveList(listId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.put<TrelloList>(`/lists/${listId}/closed`, { value: true });
        return responseOptimizer.optimize(response, 'archive_list', optimization);
    }

    /**
     * Unarchive a list
     * @param listId - ID of the list to unarchive
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated list
     */
    async unarchiveList(listId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.put<TrelloList>(`/lists/${listId}/closed`, { value: false });
        return responseOptimizer.optimize(response, 'unarchive_list', optimization);
    }

    /**
     * Move a list to a different board
     * @param listId - ID of the list to move
     * @param boardId - ID of the destination board
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated list
     */
    async moveListToBoard(listId: string, boardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.put<TrelloList>(`/lists/${listId}/idBoard`, { value: boardId });
        return responseOptimizer.optimize(response, 'move_list_to_board', optimization);
    }

    /**
     * Get all cards in a list
     * @param listId - ID of the list
     * @param filter - Optional filter (all, closed, none, open)
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of cards
     */
    async getCards(listId: string, filter: 'all' | 'closed' | 'none' | 'open' = 'open', optimization?: RuntimeOptimizationConfig): Promise<TrelloCard[]> {
        const response = await this.trelloService.get<TrelloCard[]>(`/lists/${listId}/cards`, { filter });
        return responseOptimizer.optimize(response, 'get_cards_in_list', optimization);
    }

    /**
     * Archive all cards in a list
     * @param listId - ID of the list
     * @returns Promise resolving when the operation is complete
     */
    async archiveAllCards(listId: string): Promise<void> {
        return this.trelloService.post<void>(`/lists/${listId}/archiveAllCards`);
    }

    /**
     * Move all cards in a list to another list
     * @param sourceListId - ID of the source list
     * @param destinationListId - ID of the destination list
     * @param boardId - ID of the board (required by Trello API)
     * @returns Promise resolving when the operation is complete
     */
    async moveAllCards(sourceListId: string, destinationListId: string, boardId: string): Promise<void> {
        return this.trelloService.post<void>(`/lists/${sourceListId}/moveAllCards`, {
            idBoard: boardId,
            idList: destinationListId
        });
    }

    /**
     * Update the position of a list
     * @param listId - ID of the list to update
     * @param position - New position (top, bottom, or a positive number)
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated list
     */
    async updatePosition(listId: string, position: 'top' | 'bottom' | number, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.put<TrelloList>(`/lists/${listId}/pos`, { value: position });
        return responseOptimizer.optimize(response, 'update_list_position', optimization);
    }

    /**
     * Update the name of a list
     * @param listId - ID of the list to update
     * @param name - New name for the list
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated list
     */
    async updateName(listId: string, name: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.put<TrelloList>(`/lists/${listId}/name`, { value: name });
        return responseOptimizer.optimize(response, 'update_list_name', optimization);
    }

    /**
     * Subscribe or unsubscribe from a list
     * @param listId - ID of the list
     * @param subscribed - Whether to subscribe (true) or unsubscribe (false)
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated list
     */
    async updateSubscribed(listId: string, subscribed: boolean, optimization?: RuntimeOptimizationConfig): Promise<TrelloList> {
        const response = await this.trelloService.put<TrelloList>(`/lists/${listId}/subscribed`, { value: subscribed });
        return responseOptimizer.optimize(response, 'subscribe_to_list', optimization);
    }
}
