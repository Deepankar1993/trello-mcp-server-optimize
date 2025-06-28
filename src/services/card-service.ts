/**
 * Card Service
 * 
 * Service for interacting with Trello cards.
 * Provides methods for creating, reading, updating, and deleting cards.
 */

import { TrelloService } from './trello-service.js';
import {
    TrelloCard,
    CreateCardData,
    UpdateCardData,
    CardFilters,
    TrelloCheckItem,
    TrelloChecklist,
    TrelloAttachment,
    TrelloLabel
} from '../types/trello-types.js';
import { RuntimeOptimizationConfig } from '../types/optimization-types.js';
import { responseOptimizer } from '../utils/response-optimizer.js';

/**
 * Service for interacting with Trello cards
 */
export class CardService {
    private trelloService: TrelloService;

    /**
     * Creates a new CardService instance
     * @param trelloService - The TrelloService instance
     */
    constructor(trelloService: TrelloService) {
        this.trelloService = trelloService;
    }

    /**
     * Get a specific card by ID
     * @param cardId - ID of the card to retrieve
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the card
     */
    async getCard(cardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloCard> {
        const response = await this.trelloService.get<TrelloCard>(`/cards/${cardId}`);
        return responseOptimizer.optimize(response, 'get_card', optimization);
    }

    /**
     * Create a new card
     * @param data - Card creation data
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the created card
     */
    async createCard(data: CreateCardData, optimization?: RuntimeOptimizationConfig): Promise<TrelloCard> {
        const response = await this.trelloService.post<TrelloCard>('/cards', data);
        return responseOptimizer.optimize(response, 'create_card', optimization);
    }

    /**
     * Update an existing card
     * @param cardId - ID of the card to update
     * @param data - Card update data
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated card
     */
    async updateCard(cardId: string, data: UpdateCardData, optimization?: RuntimeOptimizationConfig): Promise<TrelloCard> {
        const response = await this.trelloService.put<TrelloCard>(`/cards/${cardId}`, data);
        return responseOptimizer.optimize(response, 'update_card', optimization);
    }

    /**
     * Delete a card
     * @param cardId - ID of the card to delete
     * @returns Promise resolving when deletion is complete
     */
    async deleteCard(cardId: string): Promise<void> {
        return this.trelloService.delete<void>(`/cards/${cardId}`);
    }

    /**
     * Archive a card
     * @param cardId - ID of the card to archive
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated card
     */
    async archiveCard(cardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloCard> {
        return this.updateCard(cardId, { closed: true }, optimization);
    }

    /**
     * Unarchive a card
     * @param cardId - ID of the card to unarchive
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated card
     */
    async unarchiveCard(cardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloCard> {
        return this.updateCard(cardId, { closed: false }, optimization);
    }

    /**
     * Move a card to a different list
     * @param cardId - ID of the card to move
     * @param listId - ID of the destination list
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated card
     */
    async moveCardToList(cardId: string, listId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloCard> {
        return this.updateCard(cardId, { idList: listId }, optimization);
    }

    /**
     * Add a member to a card
     * @param cardId - ID of the card
     * @param memberId - ID of the member to add
     * @returns Promise resolving to the updated card
     */
    async addMember(cardId: string, memberId: string): Promise<TrelloCard> {
        return this.trelloService.post<TrelloCard>(`/cards/${cardId}/idMembers`, { value: memberId });
    }

    /**
     * Remove a member from a card
     * @param cardId - ID of the card
     * @param memberId - ID of the member to remove
     * @returns Promise resolving to the updated card
     */
    async removeMember(cardId: string, memberId: string): Promise<TrelloCard> {
        return this.trelloService.delete<TrelloCard>(`/cards/${cardId}/idMembers/${memberId}`);
    }

    /**
     * Add a label to a card
     * @param cardId - ID of the card
     * @param labelId - ID of the label to add
     * @returns Promise resolving to the updated card
     */
    async addLabel(cardId: string, labelId: string): Promise<TrelloCard> {
        return this.trelloService.post<TrelloCard>(`/cards/${cardId}/idLabels`, { value: labelId });
    }

    /**
     * Remove a label from a card
     * @param cardId - ID of the card
     * @param labelId - ID of the label to remove
     * @returns Promise resolving to the updated card
     */
    async removeLabel(cardId: string, labelId: string): Promise<TrelloCard> {
        return this.trelloService.delete<TrelloCard>(`/cards/${cardId}/idLabels/${labelId}`);
    }

    /**
     * Add a comment to a card
     * @param cardId - ID of the card
     * @param text - Comment text
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the created comment
     */
    async addComment(cardId: string, text: string, optimization?: RuntimeOptimizationConfig): Promise<any> {
        const response = await this.trelloService.post<any>(`/cards/${cardId}/actions/comments`, { text });
        return responseOptimizer.optimize(response, 'add_comment', optimization);
    }

    /**
     * Get all comments on a card
     * @param cardId - ID of the card
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of comments
     */
    async getComments(cardId: string, optimization?: RuntimeOptimizationConfig): Promise<any[]> {
        const response = await this.trelloService.get<any[]>(`/cards/${cardId}/actions`, { filter: 'commentCard' });
        return responseOptimizer.optimize(response, 'get_comments', optimization);
    }

    /**
     * Get all attachments on a card
     * @param cardId - ID of the card
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of attachments
     */
    async getAttachments(cardId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloAttachment[]> {
        const response = await this.trelloService.get<TrelloAttachment[]>(`/cards/${cardId}/attachments`);
        return responseOptimizer.optimize(response, 'get_attachments', optimization);
    }

    /**
     * Add an attachment to a card
     * @param cardId - ID of the card
     * @param url - URL of the attachment
     * @param name - Optional name for the attachment
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the created attachment
     */
    async addAttachment(cardId: string, url: string, name?: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloAttachment> {
        const response = await this.trelloService.post<TrelloAttachment>(`/cards/${cardId}/attachments`, { url, name });
        return responseOptimizer.optimize(response, 'add_attachment', optimization);
    }

    /**
     * Delete an attachment from a card
     * @param cardId - ID of the card
     * @param attachmentId - ID of the attachment to delete
     * @returns Promise resolving when deletion is complete
     */
    async deleteAttachment(cardId: string, attachmentId: string): Promise<void> {
        return this.trelloService.delete<void>(`/cards/${cardId}/attachments/${attachmentId}`);
    }

    /**
     * Get all checklists on a card
     * @param cardId - ID of the card
     * @returns Promise resolving to an array of checklists
     */
    async getChecklists(cardId: string): Promise<TrelloChecklist[]> {
        return this.trelloService.get<TrelloChecklist[]>(`/cards/${cardId}/checklists`);
    }

    /**
     * Add a checklist to a card
     * @param cardId - ID of the card
     * @param name - Name of the checklist
     * @returns Promise resolving to the created checklist
     */
    async addChecklist(cardId: string, name: string): Promise<TrelloChecklist> {
        return this.trelloService.post<TrelloChecklist>(`/cards/${cardId}/checklists`, { name });
    }

    /**
     * Get a specific checklist item on a card
     * @param cardId - ID of the card
     * @param checkItemId - ID of the checklist item
     * @returns Promise resolving to the checklist item
     */
    async getCheckItem(cardId: string, checkItemId: string): Promise<TrelloCheckItem> {
        return this.trelloService.get<TrelloCheckItem>(`/cards/${cardId}/checkItem/${checkItemId}`);
    }

    /**
     * Update a checklist item on a card
     * @param cardId - ID of the card
     * @param checkItemId - ID of the checklist item
     * @param state - New state for the checklist item
     * @returns Promise resolving to the updated checklist item
     */
    async updateCheckItemState(cardId: string, checkItemId: string, state: 'complete' | 'incomplete'): Promise<TrelloCheckItem> {
        return this.trelloService.put<TrelloCheckItem>(`/cards/${cardId}/checkItem/${checkItemId}`, { state });
    }

    /**
     * Get all labels on a card
     * @param cardId - ID of the card
     * @returns Promise resolving to an array of labels
     */
    async getLabels(cardId: string): Promise<TrelloLabel[]> {
        const card = await this.getCard(cardId);
        return card.labels || [];
    }

    /**
     * Set the due date for a card
     * @param cardId - ID of the card
     * @param due - Due date (ISO string or null to remove)
     * @returns Promise resolving to the updated card
     */
    async setDueDate(cardId: string, due: string | null): Promise<TrelloCard> {
        return this.updateCard(cardId, { due });
    }

    /**
     * Set the due complete status for a card
     * @param cardId - ID of the card
     * @param dueComplete - Whether the due date is complete
     * @returns Promise resolving to the updated card
     */
    async setDueComplete(cardId: string, dueComplete: boolean): Promise<TrelloCard> {
        return this.updateCard(cardId, { dueComplete });
    }
}
