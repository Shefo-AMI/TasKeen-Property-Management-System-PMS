import React from 'react';
import { canAccessSection, hasPermission } from '../utils/alzahi-company-setup';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ShieldAlert } from 'lucide-react';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  userRole: string;
  section?: string;
  permission?: string;
  fallback?: React.ReactNode;
}

/**
 * Role-Based Access Control Component
 * Shows content only if user has required permissions
 */
export function RoleBasedAccess({ 
  children, 
  userRole, 
  section, 
  permission, 
  fallback 
}: RoleBasedAccessProps) {
  // Check section access
  if (section && !canAccessSection(userRole, section)) {
    return fallback ? <>{fallback}</> : (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <Alert className="max-w-md">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            You don't have permission to access this section. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Check specific permission
  if (permission && !hasPermission(userRole, permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
}

interface RestrictedButtonProps {
  userRole: string;
  permission: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Button that's disabled if user lacks permission
 */
export function RestrictedButton({ 
  userRole, 
  permission, 
  children, 
  onClick, 
  className 
}: RestrictedButtonProps) {
  const hasAccess = hasPermission(userRole, permission);
  
  return (
    <button
      onClick={hasAccess ? onClick : undefined}
      disabled={!hasAccess}
      className={className}
      title={hasAccess ? undefined : 'You do not have permission for this action'}
    >
      {children}
    </button>
  );
}
