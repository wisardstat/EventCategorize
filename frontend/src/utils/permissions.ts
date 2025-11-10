/**
 * User role-based permission utilities
 */

import React from 'react';

export type UserRole = 'user' | 'admin' | 'superuser' | 'superuser_md';

export interface User {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
  user_role?: UserRole;
}

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  // Check if we're running in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

/**
 * Check if current user has a specific role
 */
export const hasRole = (requiredRole: UserRole): boolean => {
  const user = getCurrentUser();
  console.log('hasRole called with requiredRole:', requiredRole);
  console.log('hasRole user:', user);
  console.log('hasRole user.user_role:', user?.user_role);
  const result = user?.user_role === requiredRole;
  console.log('hasRole result:', result);
  return result;
};

/**
 * Check if current user has any of the specified roles
 */
export const hasAnyRole = (roles: UserRole[]): boolean => {
  const user = getCurrentUser();
  console.log('hasAnyRole called with roles:', roles);
  console.log('hasAnyRole user:', user);
  console.log('hasAnyRole user.user_role:', user?.user_role);
  const result = user?.user_role ? roles.includes(user.user_role) : false;
  console.log('hasAnyRole result:', result);
  return result;
};

/**
 * Check if current user can access idea_tank menu
 * All roles can access idea_tank menu
 */
export const canAccessIdeaTank = (): boolean => {
  const user = getCurrentUser();
  console.log('canAccessIdeaTank called, user:', user);
  console.log('canAccessIdeaTank user role:', user?.user_role);
  return true; // All roles can access idea_tank
};

/**
 * Check if current user can access idea_score menu
 * Only admin and superuser can access idea_score
 */
export const canAccessIdeaScore = (): boolean => {
  const user = getCurrentUser();
  console.log('canAccessIdeaScore called, user:', user);
  console.log('canAccessIdeaScore user role:', user?.user_role);
  const result = hasAnyRole(['admin', 'superuser']);
  console.log('canAccessIdeaScore result:', result);
  return result;
};

/**
 * Check if current user can access user_list menu
 * Only admin can access user_list
 */
export const canAccessUserList = (): boolean => {
  const user = getCurrentUser();
  console.log('canAccessUserList called, user:', user);
  console.log('canAccessUserList user role:', user?.user_role);
  const result = hasRole('admin');
  console.log('canAccessUserList result:', result);
  return result;
};

/**
 * Check if current user can click "นำเข้าข้อมูล excel" button
 * Only admin and superuser can access this
 */
export const canImportExcel = (): boolean => {
  return hasAnyRole(['admin', 'superuser']);
};

/**
 * Check if current user can click "generate keywords" button
 * Only admin and superuser can access this
 */
export const canGenerateKeywords = (): boolean => {
  return hasAnyRole(['admin', 'superuser']);
};

/**
 * Check if current user can click "บันทึกผลการพิจารณา" button
 * Only admin and superuser can access this
 */
export const canSaveEvaluation = (): boolean => {
  return hasAnyRole(['admin', 'superuser']);
};

/**
 * Check if current user can access idea_tank_import page
 * Only admin and superuser can access this page
 */
export const canAccessIdeaTankImport = (): boolean => {
  return hasAnyRole(['admin', 'superuser']);
};

/**
 * Check if current user can access user_create page
 * Only admin can access this page
 */
export const canAccessUserCreate = (): boolean => {
  return hasRole('admin');
};

/**
 * Check if current user can access answer_analytic page
 * Only admin and superuser can access this page
 */
export const canAccessAnswerAnalytic = (): boolean => {
  return hasAnyRole(['admin', 'superuser']);
};

/**
 * Check if current user can access answer_list page
 * Only admin and superuser can access this page
 */
export const canAccessAnswerList = (): boolean => {
  return hasAnyRole(['admin', 'superuser']);
};

/**
 * Check if current user can access create-question page
 * Only admin and superuser can access this page
 */
export const canAccessCreateQuestion = (): boolean => {
  return hasAnyRole(['admin', 'superuser']);
};

/**
 * Check if current user can access idea_tank_detail page
 * All logged-in users can access this page
 */
export const canAccessIdeaTankDetail = (): boolean => {
  return true; // All logged-in users can access
};

/**
 * Check if current user can access present-answer page
 * Only admin and superuser can access this page
 */
export const canAccessPresentAnswer = (): boolean => {
  return hasAnyRole(['admin', 'superuser']);
};

/**
 * Get user-friendly role name in Thai
 */
export const getRoleNameThai = (role: UserRole): string => {
  switch (role) {
    case 'user':
      return 'User';
    case 'admin':
      return 'Admin';
    case 'superuser':
      return 'Super User';
    case 'superuser_md':
      return 'Super User(MD)';
    default:
      return role;
  }
};

/**
 * Component to render content based on user role
 */
export const RoleBasedContent = ({
  allowedRoles,
  children,
  fallback = null
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {

  if (hasAnyRole(allowedRoles)) {
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement(React.Fragment, null, fallback);
  
};