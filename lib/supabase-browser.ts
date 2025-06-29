// /lib/supabase-browser.ts

'use client'

// Create a mock Supabase client for demo mode
export const supabase = {
  auth: {
    getUser: async () => {
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem('blvckwall_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          return { data: { user: userData }, error: null };
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      
      // Return demo user if no user in localStorage
      return { 
        data: { 
          user: { 
            id: 'demo-user-id', 
            email: 'demo@blvckwall.ai',
            user_metadata: {
              name: 'Demo User'
            }
          } 
        }, 
        error: null 
      };
    },
    getSession: async () => {
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem('blvckwall_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          return { 
            data: { 
              session: { 
                user: userData 
              } 
            }, 
            error: null 
          };
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      
      // Return demo session if no user in localStorage
      return { 
        data: { 
          session: { 
            user: { 
              id: 'demo-user-id', 
              email: 'demo@blvckwall.ai',
              user_metadata: {
                name: 'Demo User'
              }
            } 
          } 
        }, 
        error: null 
      };
    },
    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      // Create a demo user
      const user = {
        id: `user_${Date.now()}`,
        email,
        user_metadata: {
          name: email.split('@')[0]
        }
      };
      
      // Save to localStorage
      localStorage.setItem('blvckwall_user', JSON.stringify(user));
      
      return { 
        data: { 
          user,
          session: { user }
        }, 
        error: null 
      };
    },
    signUp: async ({ email, password, options }: any) => {
      // Create a demo user
      const user = {
        id: `user_${Date.now()}`,
        email,
        user_metadata: options?.data || {
          name: email.split('@')[0]
        }
      };
      
      // Save to localStorage
      localStorage.setItem('blvckwall_user', JSON.stringify(user));
      
      return { 
        data: { 
          user,
          session: { user }
        }, 
        error: null 
      };
    },
    signOut: async () => {
      // Remove from localStorage
      localStorage.removeItem('blvckwall_user');
      
      return { error: null };
    },
    updateUser: async ({ data }: any) => {
      // Get current user
      const storedUser = localStorage.getItem('blvckwall_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const updatedUser = {
            ...userData,
            user_metadata: {
              ...userData.user_metadata,
              ...data
            }
          };
          
          // Save updated user
          localStorage.setItem('blvckwall_user', JSON.stringify(updatedUser));
          
          return { data: { user: updatedUser }, error: null };
        } catch (error) {
          console.error('Error updating user:', error);
        }
      }
      
      return { error: new Error('User not found') };
    }
  },
  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: () => {
                // Get data from localStorage
                const key = `blvckwall_${value}_${table}`;
                const storedData = localStorage.getItem(key);
                if (storedData) {
                  try {
                    const data = JSON.parse(storedData);
                    if (Array.isArray(data)) {
                      const item = data.find(item => item[column] === value);
                      return { data: item || null, error: null };
                    }
                  } catch (error) {
                    console.error(`Error parsing ${table} data:`, error);
                  }
                }
                
                return { data: null, error: null };
              },
              order: () => {
                return {
                  limit: () => {
                    // Get data from localStorage for the current user
                    const storedUser = localStorage.getItem('blvckwall_user');
                    if (storedUser) {
                      try {
                        const userData = JSON.parse(storedUser);
                        const key = `blvckwall_${userData.id}_${table}`;
                        const storedData = localStorage.getItem(key);
                        if (storedData) {
                          const data = JSON.parse(storedData);
                          if (Array.isArray(data)) {
                            const filteredData = data.filter(item => item[column] === value);
                            return { data: filteredData, error: null };
                          }
                        }
                      } catch (error) {
                        console.error(`Error parsing ${table} data:`, error);
                      }
                    }
                    
                    return { data: [], error: null };
                  }
                };
              }
            };
          },
          order: () => {
            return {
              limit: (limit: number) => {
                // Get data from localStorage for the current user
                const storedUser = localStorage.getItem('blvckwall_user');
                if (storedUser) {
                  try {
                    const userData = JSON.parse(storedUser);
                    const key = `blvckwall_${userData.id}_${table}`;
                    const storedData = localStorage.getItem(key);
                    if (storedData) {
                      const data = JSON.parse(storedData);
                      if (Array.isArray(data)) {
                        return { data: data.slice(0, limit), error: null };
                      }
                    }
                  } catch (error) {
                    console.error(`Error parsing ${table} data:`, error);
                  }
                }
                
                return { data: [], error: null };
              }
            };
          }
        };
      },
      insert: (items: any[]) => {
        return {
          select: () => {
            return {
              single: () => {
                // Get current user
                const storedUser = localStorage.getItem('blvckwall_user');
                if (storedUser) {
                  try {
                    const userData = JSON.parse(storedUser);
                    const key = `blvckwall_${userData.id}_${table}`;
                    
                    // Get existing data
                    const storedData = localStorage.getItem(key);
                    const existingData = storedData ? JSON.parse(storedData) : [];
                    
                    // Add new item
                    const newItem = {
                      ...items[0],
                      id: `${table.slice(0, -1)}_${Date.now()}`,
                      created_at: new Date().toISOString(),
                      user_id: userData.id
                    };
                    
                    // Save updated data
                    const updatedData = [newItem, ...existingData];
                    localStorage.setItem(key, JSON.stringify(updatedData));
                    
                    return { data: newItem, error: null };
                  } catch (error) {
                    console.error(`Error inserting ${table} data:`, error);
                  }
                }
                
                return { error: new Error('User not found') };
              }
            };
          }
        };
      },
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => {
            return {
              select: () => {
                return {
                  single: () => {
                    // Get current user
                    const storedUser = localStorage.getItem('blvckwall_user');
                    if (storedUser) {
                      try {
                        const userData = JSON.parse(storedUser);
                        const key = `blvckwall_${userData.id}_${table}`;
                        
                        // Get existing data
                        const storedData = localStorage.getItem(key);
                        if (storedData) {
                          const existingData = JSON.parse(storedData);
                          
                          // Find and update item
                          const updatedData = existingData.map((item: any) => {
                            if (item[column] === value) {
                              return { ...item, ...updates };
                            }
                            return item;
                          });
                          
                          // Save updated data
                          localStorage.setItem(key, JSON.stringify(updatedData));
                          
                          // Return updated item
                          const updatedItem = updatedData.find((item: any) => item[column] === value);
                          return { data: updatedItem, error: null };
                        }
                      } catch (error) {
                        console.error(`Error updating ${table} data:`, error);
                      }
                    }
                    
                    return { error: new Error('Item not found') };
                  }
                };
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            // Get current user
            const storedUser = localStorage.getItem('blvckwall_user');
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                const key = `blvckwall_${userData.id}_${table}`;
                
                // Get existing data
                const storedData = localStorage.getItem(key);
                if (storedData) {
                  const existingData = JSON.parse(storedData);
                  
                  // Filter out item
                  const updatedData = existingData.filter((item: any) => item[column] !== value);
                  
                  // Save updated data
                  localStorage.setItem(key, JSON.stringify(updatedData));
                  
                  return { error: null };
                }
              } catch (error) {
                console.error(`Error deleting ${table} data:`, error);
              }
            }
            
            return { error: new Error('Item not found') };
          }
        };
      }
    };
  }
};
