/**
 * Role & Permission System
 *
 * Two roles today: manager (full access) and couple (read-only).
 * To add a new role: extend Role, add a PermissionSet, export a guard.
 *
 * Access model:
 *   manager → /admin          (no token, URL is the credential)
 *   couple  → /couple/[token] (couple_token stored on events table)
 */

export type Role = "manager" | "couple";

export interface PermissionSet {
  // Events
  canCreateEvent:    boolean;
  canEditEvent:      boolean;
  canViewEvent:      boolean;
  // Guests
  canImportGuests:   boolean;
  canExportGuests:   boolean;
  canAddGuest:       boolean;
  canEditGuest:      boolean;
  canDeleteGuest:    boolean;
  canViewGuests:     boolean;
  // Communication
  canSendInvitation: boolean;
  canSendReminder:   boolean;
  // Analytics
  canViewAnalytics:  boolean;
  canViewInsights:   boolean;
  canViewForecast:   boolean;
  canViewHealthScore:boolean;
  // Seating (future)
  canManageSeating:  boolean;
  canViewSeating:    boolean;
  // Operations
  canViewAllEvents:  boolean;
  canViewTaskQueue:  boolean;
  canViewBI:         boolean;
}

export const PERMISSIONS: Record<Role, PermissionSet> = {
  manager: {
    canCreateEvent:     true,
    canEditEvent:       true,
    canViewEvent:       true,
    canImportGuests:    true,
    canExportGuests:    true,
    canAddGuest:        true,
    canEditGuest:       true,
    canDeleteGuest:     true,
    canViewGuests:      true,
    canSendInvitation:  true,
    canSendReminder:    true,
    canViewAnalytics:   true,
    canViewInsights:    true,
    canViewForecast:    true,
    canViewHealthScore: true,
    canManageSeating:   true,
    canViewSeating:     true,
    canViewAllEvents:   true,
    canViewTaskQueue:   true,
    canViewBI:          true,
  },
  couple: {
    canCreateEvent:     false,
    canEditEvent:       false,
    canViewEvent:       true,
    canImportGuests:    false,
    canExportGuests:    false,
    canAddGuest:        false,
    canEditGuest:       false,
    canDeleteGuest:     false,
    canViewGuests:      true,   // read-only list
    canSendInvitation:  false,
    canSendReminder:    false,
    canViewAnalytics:   true,
    canViewInsights:    true,
    canViewForecast:    true,
    canViewHealthScore: true,
    canManageSeating:   false,
    canViewSeating:     true,
    canViewAllEvents:   false,
    canViewTaskQueue:   false,
    canViewBI:          false,
  },
};

export function can(role: Role, permission: keyof PermissionSet): boolean {
  return PERMISSIONS[role][permission];
}
