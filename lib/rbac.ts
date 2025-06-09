// Role-Based Access Control utilities
import { createServerSupabaseClient } from './supabase';

export type UserRole = 'admin' | 'manager' | 'staff' | 'hr' | 'compliance' | 'viewer';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
  manager: [
    { resource: 'agents', action: 'create' },
    { resource: 'agents', action: 'read' },
    { resource: 'agents', action: 'update' },
    { resource: 'calls', action: 'read' },
    { resource: 'analytics', action: 'read' },
    { resource: 'events', action: 'create' },
    { resource: 'events', action: 'read' },
    { resource: 'events', action: 'update' },
    { resource: 'hr_requests', action: 'read' },
    { resource: 'hr_requests', action: 'update' },
  ],
  staff: [
    { resource: 'calls', action: 'create' },
    { resource: 'calls', action: 'read' },
    { resource: 'agents', action: 'read' },
    { resource: 'events', action: 'read' },
  ],
  hr: [
    { resource: 'hr_requests', action: 'read' },
    { resource: 'hr_requests', action: 'update' },
    { resource: 'calls', action: 'read' },
  ],
  compliance: [
    { resource: 'compliance_scripts', action: 'create' },
    { resource: 'compliance_scripts', action: 'read' },
    { resource: 'compliance_scripts', action: 'update' },
    { resource: 'call_analytics', action: 'read' },
    { resource: 'calls', action: 'read' },
  ],
  viewer: [
    { resource: 'calls', action: 'read' },
    { resource: 'analytics', action: 'read' },
    { resource: 'events', action: 'read' },
  ],
};

export class RBACManager {
  async getUserRoles(userId: string, cookies: any): Promise<UserRole[]> {
    const supabase = createServerSupabaseClient(cookies);
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return ['viewer']; // Default role
    }

    const roles = data?.map(r => r.role as UserRole) || ['viewer'];
    return roles.length > 0 ? roles : ['viewer'];
  }

  async hasPermission(
    userId: string, 
    resource: string, 
    action: 'create' | 'read' | 'update' | 'delete',
    cookies: any
  ): Promise<boolean> {
    const roles = await this.getUserRoles(userId, cookies);
    
    for (const role of roles) {
      const permissions = DEFAULT_PERMISSIONS[role];
      
      // Check for wildcard permission (admin)
      if (permissions.some(p => p.resource === '*' && p.action === action)) {
        return true;
      }
      
      // Check for specific resource permission
      if (permissions.some(p => p.resource === resource && p.action === action)) {
        return true;
      }
    }
    
    return false;
  }

  async assignRole(assignerId: string, userId: string, role: UserRole, cookies: any): Promise<void> {
    const supabase = createServerSupabaseClient(cookies);
    
    // Check if assigner has admin role
    const assignerRoles = await this.getUserRoles(assignerId, cookies);
    if (!assignerRoles.includes('admin')) {
      throw new Error('Only admins can assign roles');
    }
    
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role,
        assigned_by: assignerId,
      });

    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }
  }

  async removeRole(removerId: string, userId: string, role: UserRole, cookies: any): Promise<void> {
    const supabase = createServerSupabaseClient(cookies);
    
    // Check if remover has admin role
    const removerRoles = await this.getUserRoles(removerId, cookies);
    if (!removerRoles.includes('admin')) {
      throw new Error('Only admins can remove roles');
    }
    
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) {
      throw new Error(`Failed to remove role: ${error.message}`);
    }
  }

  getHighestRole(roles: UserRole[]): UserRole {
    const roleHierarchy: UserRole[] = ['admin', 'manager', 'hr', 'compliance', 'staff', 'viewer'];
    
    for (const role of roleHierarchy) {
      if (roles.includes(role)) {
        return role;
      }
    }
    
    return 'viewer';
  }
}

export const rbacManager = new RBACManager();

// Middleware helper for API routes
export async function requirePermission(
  userId: string,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete',
  cookies: any
) {
  const hasPermission = await rbacManager.hasPermission(userId, resource, action, cookies);
  
  if (!hasPermission) {
    throw new Error(`Insufficient permissions: ${action} ${resource}`);
  }
}