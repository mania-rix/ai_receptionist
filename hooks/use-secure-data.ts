/**
 * Custom hook for secure data operations
 */
import { useState, useCallback } from 'react';
import { useStorage } from '@/contexts/storage-context';
import { useToast } from '@/hooks/use-toast';
import { 
  createItem, 
  readItem, 
  updateItem, 
  deleteItem, 
  listItems,
  DATA_CATEGORIES
} from '@/lib/data-manager';

export function useSecureData<T = any>(category: string) {
  const { currentUser, isAuthenticated } = useStorage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get user ID for storage
  const getUserId = useCallback(() => {
    return currentUser?.id || 'demo-user-id';
  }, [currentUser]);
  
  // Create item
  const create = useCallback(async (data: Omit<T, 'id'>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      const result = await createItem(category, data, userId);
      
      toast({
        title: 'Item created',
        description: 'Your item has been created successfully',
      });
      
      return result as T;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to create item';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [category, getUserId, toast]);
  
  // Read item
  const read = useCallback((id: string): T | null => {
    try {
      const userId = getUserId();
      return readItem(category, id, userId) as T;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to read item';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    }
  }, [category, getUserId, toast]);
  
  // Update item
  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      const result = await updateItem(category, id, updates, userId);
      
      toast({
        title: 'Item updated',
        description: 'Your item has been updated successfully',
      });
      
      return result as T;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to update item';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [category, getUserId, toast]);
  
  // Delete item
  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      await deleteItem(category, id, userId);
      
      toast({
        title: 'Item deleted',
        description: 'Your item has been deleted successfully',
      });
      
      return true;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to delete item';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [category, getUserId, toast]);
  
  // List items
  const list = useCallback((): T[] => {
    try {
      const userId = getUserId();
      return listItems(category, userId) as T[];
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to list items';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return [];
    }
  }, [category, getUserId, toast]);
  
  return {
    create,
    read,
    update,
    remove,
    list,
    isLoading,
    error
  };
}

// Predefined hooks for common data types
export function useKnowledgeBase() {
  return useSecureData(DATA_CATEGORIES.KB_ARTICLES);
}

export function useVideoSummaries() {
  return useSecureData(DATA_CATEGORIES.VIDEO_SUMMARIES);
}

export function useConversationTemplates() {
  return useSecureData(DATA_CATEGORIES.CONVERSATION_TEMPLATES);
}

export function useComplianceScripts() {
  return useSecureData(DATA_CATEGORIES.COMPLIANCE_SCRIPTS);
}

export function useAgentProfiles() {
  return useSecureData(DATA_CATEGORIES.AGENT_PROFILES);
}

export function useCustomerInteractions() {
  return useSecureData(DATA_CATEGORIES.CUSTOMER_INTERACTIONS);
}