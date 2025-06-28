/**
 * Checklist Service
 * 
 * Service for interacting with Trello checklists.
 * Provides methods for creating, reading, updating, and deleting checklists and checklist items.
 */

import { TrelloService } from './trello-service.js';
import { TrelloChecklist, TrelloCheckItem } from '../types/trello-types.js';
import { RuntimeOptimizationConfig } from '../types/optimization-types.js';
import { responseOptimizer } from '../utils/response-optimizer.js';

/**
 * Service for interacting with Trello checklists
 */
export class ChecklistService {
    private trelloService: TrelloService;

    /**
     * Creates a new ChecklistService instance
     * @param trelloService - The TrelloService instance
     */
    constructor(trelloService: TrelloService) {
        this.trelloService = trelloService;
    }

    /**
     * Get a specific checklist by ID
     * @param checklistId - ID of the checklist to retrieve
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the checklist
     */
    async getChecklist(checklistId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloChecklist> {
        const response = await this.trelloService.get<TrelloChecklist>(`/checklists/${checklistId}`);
        return responseOptimizer.optimize(response, 'get_checklist', optimization);
    }

    /**
     * Create a new checklist on a card
     * @param cardId - ID of the card
     * @param name - Name of the checklist
     * @param pos - Position of the checklist (top, bottom, or a positive number)
     * @param idChecklistSource - ID of a checklist to copy from
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the created checklist
     */
    async createChecklist(
        cardId: string,
        name: string,
        pos?: 'top' | 'bottom' | number,
        idChecklistSource?: string,
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloChecklist> {
        const data: any = {
            idCard: cardId,
            name
        };

        if (pos !== undefined) {
            data.pos = pos;
        }

        if (idChecklistSource) {
            data.idChecklistSource = idChecklistSource;
        }

        const response = await this.trelloService.post<TrelloChecklist>('/checklists', data);
        return responseOptimizer.optimize(response, 'create_checklist', optimization);
    }

    /**
     * Update an existing checklist
     * @param checklistId - ID of the checklist to update
     * @param data - Checklist update data
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated checklist
     */
    async updateChecklist(
        checklistId: string,
        data: {
            name?: string;
            pos?: 'top' | 'bottom' | number;
        },
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloChecklist> {
        const response = await this.trelloService.put<TrelloChecklist>(`/checklists/${checklistId}`, data);
        return responseOptimizer.optimize(response, 'update_checklist', optimization);
    }

    /**
     * Delete a checklist
     * @param checklistId - ID of the checklist to delete
     * @returns Promise resolving when deletion is complete
     */
    async deleteChecklist(checklistId: string): Promise<void> {
        return this.trelloService.delete<void>(`/checklists/${checklistId}`);
    }

    /**
     * Get all checkitems on a checklist
     * @param checklistId - ID of the checklist
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to an array of checkitems
     */
    async getCheckItems(checklistId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloCheckItem[]> {
        const response = await this.trelloService.get<TrelloCheckItem[]>(`/checklists/${checklistId}/checkItems`);
        return responseOptimizer.optimize(response, 'get_checkitems', optimization);
    }

    /**
     * Create a new checkitem on a checklist
     * @param checklistId - ID of the checklist
     * @param name - Name of the checkitem
     * @param pos - Position of the checkitem (top, bottom, or a positive number)
     * @param checked - Whether the checkitem is checked
     * @param due - Due date for the checkitem
     * @param memberId - ID of the member assigned to the checkitem
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the created checkitem
     */
    async createCheckItem(
        checklistId: string,
        name: string,
        pos?: 'top' | 'bottom' | number,
        checked?: boolean,
        due?: string,
        memberId?: string,
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloCheckItem> {
        const data: any = { name };

        if (pos !== undefined) {
            data.pos = pos;
        }

        if (checked !== undefined) {
            data.checked = checked;
        }

        if (due) {
            data.due = due;
        }

        if (memberId) {
            data.idMember = memberId;
        }

        const response = await this.trelloService.post<TrelloCheckItem>(`/checklists/${checklistId}/checkItems`, data);
        return responseOptimizer.optimize(response, 'create_checkitem', optimization);
    }

    /**
     * Get a specific checkitem on a checklist
     * @param checklistId - ID of the checklist
     * @param checkItemId - ID of the checkitem
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the checkitem
     */
    async getCheckItem(checklistId: string, checkItemId: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloCheckItem> {
        const response = await this.trelloService.get<TrelloCheckItem>(`/checklists/${checklistId}/checkItems/${checkItemId}`);
        return responseOptimizer.optimize(response, 'get_checkitem', optimization);
    }

    /**
     * Update a checkitem on a checklist
     * @param checklistId - ID of the checklist
     * @param checkItemId - ID of the checkitem
     * @param data - Checkitem update data
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated checkitem
     */
    async updateCheckItem(
        checklistId: string,
        checkItemId: string,
        data: {
            name?: string;
            state?: 'complete' | 'incomplete';
            pos?: 'top' | 'bottom' | number;
            due?: string | null;
            idMember?: string | null;
        },
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloCheckItem> {
        const response = await this.trelloService.put<TrelloCheckItem>(`/checklists/${checklistId}/checkItems/${checkItemId}`, data);
        return responseOptimizer.optimize(response, 'update_checkitem', optimization);
    }

    /**
     * Delete a checkitem from a checklist
     * @param checklistId - ID of the checklist
     * @param checkItemId - ID of the checkitem to delete
     * @returns Promise resolving when deletion is complete
     */
    async deleteCheckItem(checklistId: string, checkItemId: string): Promise<void> {
        return this.trelloService.delete<void>(`/checklists/${checklistId}/checkItems/${checkItemId}`);
    }

    /**
     * Update the name of a checklist
     * @param checklistId - ID of the checklist
     * @param name - New name for the checklist
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated checklist
     */
    async updateName(checklistId: string, name: string, optimization?: RuntimeOptimizationConfig): Promise<TrelloChecklist> {
        const response = await this.trelloService.put<TrelloChecklist>(`/checklists/${checklistId}/name`, { value: name });
        return responseOptimizer.optimize(response, 'update_checklist_name', optimization);
    }

    /**
     * Update the position of a checklist
     * @param checklistId - ID of the checklist
     * @param pos - New position for the checklist
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated checklist
     */
    async updatePosition(checklistId: string, pos: 'top' | 'bottom' | number, optimization?: RuntimeOptimizationConfig): Promise<TrelloChecklist> {
        const response = await this.trelloService.put<TrelloChecklist>(`/checklists/${checklistId}/pos`, { value: pos });
        return responseOptimizer.optimize(response, 'update_checklist_position', optimization);
    }

    /**
     * Get the board a checklist is on
     * @param checklistId - ID of the checklist
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the board
     */
    async getBoard(checklistId: string, optimization?: RuntimeOptimizationConfig): Promise<any> {
        const response = await this.trelloService.get<any>(`/checklists/${checklistId}/board`);
        return responseOptimizer.optimize(response, 'get_checklist_board', optimization);
    }

    /**
     * Get the card a checklist is on
     * @param checklistId - ID of the checklist
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the card
     */
    async getCard(checklistId: string, optimization?: RuntimeOptimizationConfig): Promise<any> {
        const response = await this.trelloService.get<any>(`/checklists/${checklistId}/cards`);
        return responseOptimizer.optimize(response, 'get_checklist_card', optimization);
    }

    /**
     * Update a checkitem's state on a card
     * @param cardId - ID of the card
     * @param checkItemId - ID of the checkitem
     * @param state - New state for the checkitem
     * @param optimization - Optional optimization configuration
     * @returns Promise resolving to the updated checkitem
     */
    async updateCheckItemStateOnCard(
        cardId: string,
        checkItemId: string,
        state: 'complete' | 'incomplete',
        optimization?: RuntimeOptimizationConfig
    ): Promise<TrelloCheckItem> {
        const response = await this.trelloService.put<TrelloCheckItem>(`/cards/${cardId}/checkItem/${checkItemId}`, { state });
        return responseOptimizer.optimize(response, 'update_checkitem_state_on_card', optimization);
    }
}
