/**
 * Label Service
 * 
 * Service for interacting with Trello labels.
 * Provides methods for creating, reading, updating, and deleting labels.
 */

import { TrelloService } from './trello-service.js';
import { TrelloLabel } from '../types/trello-types.js';
import { RuntimeOptimizationConfig } from '../types/optimization-types.js';
import { responseOptimizer } from '../utils/response-optimizer.js';

/**
 * Service for interacting with Trello labels
 */
export class LabelService {
    private trelloService: TrelloService;

    /**
     * Creates a new LabelService instance
     * @param trelloService - The TrelloService instance
     */
    constructor(trelloService: TrelloService) {
        this.trelloService = trelloService;
    }

    /**
     * Get a specific label by ID
     * @param labelId - ID of the label to retrieve
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the label
     */
    async getLabel(labelId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloLabel> {
        const response = await this.trelloService.get<TrelloLabel>(`/labels/${labelId}`);
        return responseOptimizer.optimize(response, 'get_label', optimization);
    }

    /**
     * Create a new label on a board
     * @param boardId - ID of the board
     * @param name - Name of the label
     * @param color - Color of the label
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the created label
     */
    async createLabel(
        boardId: string,
        name: string,
        color: 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'blue' | 'sky' | 'lime' | 'pink' | 'black' | null,
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloLabel> {
        const response = await this.trelloService.post<TrelloLabel>('/labels', {
            idBoard: boardId,
            name,
            color
        });
        return responseOptimizer.optimize(response, 'create_label', optimization);
    }

    /**
     * Update an existing label
     * @param labelId - ID of the label to update
     * @param data - Label update data
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated label
     */
    async updateLabel(
        labelId: string,
        data: {
            name?: string;
            color?: 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'blue' | 'sky' | 'lime' | 'pink' | 'black' | null;
        },
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloLabel> {
        const response = await this.trelloService.put<TrelloLabel>(`/labels/${labelId}`, data);
        return responseOptimizer.optimize(response, 'update_label', optimization);
    }

    /**
     * Delete a label
     * @param labelId - ID of the label to delete
     * @returns Promise resolving when deletion is complete
     */
    async deleteLabel(labelId: string): Promise<void> {
        return this.trelloService.delete<void>(`/labels/${labelId}`);
    }

    /**
     * Get all labels on a board
     * @param boardId - ID of the board
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of labels
     */
    async getBoardLabels(boardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloLabel[]> {
        const response = await this.trelloService.get<TrelloLabel[]>(`/boards/${boardId}/labels`);
        return responseOptimizer.optimize(response, 'get_board_labels', optimization);
    }

    /**
     * Update the name of a label
     * @param labelId - ID of the label to update
     * @param name - New name for the label
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated label
     */
    async updateName(labelId: string, name: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloLabel> {
        const response = await this.trelloService.put<TrelloLabel>(`/labels/${labelId}/name`, { value: name });
        return responseOptimizer.optimize(response, 'update_label_name', optimization);
    }

    /**
     * Update the color of a label
     * @param labelId - ID of the label to update
     * @param color - New color for the label
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated label
     */
    async updateColor(
        labelId: string,
        color: 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'blue' | 'sky' | 'lime' | 'pink' | 'black' | null,
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloLabel> {
        const response = await this.trelloService.put<TrelloLabel>(`/labels/${labelId}/color`, { value: color });
        return responseOptimizer.optimize(response, 'update_label_color', optimization);
    }

    /**
     * Create a label directly on a card
     * @param cardId - ID of the card
     * @param name - Name of the label
     * @param color - Color of the label
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the created label
     */
    async createLabelOnCard(
        cardId: string,
        name: string,
        color: 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'blue' | 'sky' | 'lime' | 'pink' | 'black' | null,
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloLabel> {
        const response = await this.trelloService.post<TrelloLabel>(`/cards/${cardId}/labels`, {
            name,
            color
        });
        return responseOptimizer.optimize(response, 'create_label_on_card', optimization);
    }

    /**
     * Get all labels on a card
     * @param cardId - ID of the card
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of labels
     */
    async getCardLabels(cardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloLabel[]> {
        const response = await this.trelloService.get<TrelloLabel[]>(`/cards/${cardId}/labels`);
        return responseOptimizer.optimize(response, 'get_card_labels', optimization);
    }

    /**
     * Add a label to a card
     * @param cardId - ID of the card
     * @param labelId - ID of the label to add
     * @returns Promise resolving when the operation is complete
     */
    async addLabelToCard(cardId: string, labelId: string): Promise<void> {
        return this.trelloService.post<void>(`/cards/${cardId}/idLabels`, {
            value: labelId
        });
    }

    /**
     * Remove a label from a card
     * @param cardId - ID of the card
     * @param labelId - ID of the label to remove
     * @returns Promise resolving when the operation is complete
     */
    async removeLabelFromCard(cardId: string, labelId: string): Promise<void> {
        return this.trelloService.delete<void>(`/cards/${cardId}/idLabels/${labelId}`);
    }
}
