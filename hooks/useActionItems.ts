import { useState, useEffect } from 'react';
import { apiService, ActionItemDto } from '@/services/api';

export const useActionItems = () => {
  const [actionItems, setActionItems] = useState<ActionItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActionItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await apiService.getActionItems();
      setActionItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch action items');
    } finally {
      setIsLoading(false);
    }
  };

  const createActionItem = async (actionItem: Partial<ActionItemDto>) => {
    try {
      const newItem = await apiService.createActionItem(actionItem);
      setActionItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      throw err;
    }
  };

  const updateActionItem = async (id: number, actionItem: Partial<ActionItemDto>) => {
    try {
      const updatedItem = await apiService.updateActionItem(id, actionItem);
      setActionItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      throw err;
    }
  };

  const deleteActionItem = async (id: number) => {
    try {
      await apiService.deleteActionItem(id);
      setActionItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const toggleActionItemStatus = async (id: number) => {
    const item = actionItems.find(item => item.id === id);
    if (!item) return;

    const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await updateActionItem(id, { status: newStatus });
  };

  useEffect(() => {
    fetchActionItems();
  }, []);

  return {
    actionItems,
    isLoading,
    error,
    fetchActionItems,
    createActionItem,
    updateActionItem,
    deleteActionItem,
    toggleActionItemStatus,
  };
};