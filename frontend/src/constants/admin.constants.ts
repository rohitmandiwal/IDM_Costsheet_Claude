// Admin Module Constants - Aligned with Database Schema

// Database Enum: role_type
export const ROLE_TYPES = {
    INITIATOR: 'initiator',
    APPROVER_L1: 'approver_l1',
    APPROVER_L2: 'approver_l2',
    APPROVER_L3: 'approver_l3',
    APPROVER_L4: 'approver_l4',
    APPROVER_L5: 'approver_l5',
    APPROVER_L6: 'approver_l6',
    ADMIN: 'admin',
} as const;

export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES];

// Database Enum: category_type
export const CATEGORY_TYPES = {
    TECHNICAL: 'technical',
    NON_TECHNICAL: 'non_technical',
} as const;

export type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES];

// Display name mappings for UI presentation
// Maps database role identifiers to business-friendly approval designations
export const ROLE_DISPLAY_NAMES: Record<RoleType, string> = {
    [ROLE_TYPES.INITIATOR]: 'Initiator',
    [ROLE_TYPES.APPROVER_L1]: 'IDM Team Lead',
    [ROLE_TYPES.APPROVER_L2]: 'IDM Lead',
    [ROLE_TYPES.APPROVER_L3]: 'Head – Sourcing & Supply Chain',
    [ROLE_TYPES.APPROVER_L4]: 'GTO / COO',
    [ROLE_TYPES.APPROVER_L5]: 'GCO / CFO',
    [ROLE_TYPES.APPROVER_L6]: 'CEO',
    [ROLE_TYPES.ADMIN]: 'Administrator',
};

export const CATEGORY_DISPLAY_NAMES: Record<CategoryType, string> = {
    [CATEGORY_TYPES.TECHNICAL]: 'Technical',
    [CATEGORY_TYPES.NON_TECHNICAL]: 'Non-Technical',
};

// All available roles for dropdowns
export const ALL_ROLES: RoleType[] = [
    ROLE_TYPES.INITIATOR,
    ROLE_TYPES.APPROVER_L1,
    ROLE_TYPES.APPROVER_L2,
    ROLE_TYPES.APPROVER_L3,
    ROLE_TYPES.APPROVER_L4,
    ROLE_TYPES.APPROVER_L5,
    ROLE_TYPES.APPROVER_L6,
    ROLE_TYPES.ADMIN,
];

// Approver roles only (for approval matrix)
export const APPROVER_ROLES: RoleType[] = [
    ROLE_TYPES.APPROVER_L1,
    ROLE_TYPES.APPROVER_L2,
    ROLE_TYPES.APPROVER_L3,
    ROLE_TYPES.APPROVER_L4,
    ROLE_TYPES.APPROVER_L5,
    ROLE_TYPES.APPROVER_L6,
];

// All categories for dropdowns
export const ALL_CATEGORIES: CategoryType[] = [
    CATEGORY_TYPES.TECHNICAL,
    CATEGORY_TYPES.NON_TECHNICAL,
];

// Approval levels (1-6)
export const APPROVAL_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export type ApprovalLevel = typeof APPROVAL_LEVELS[number];

// Department options (aligned with database seed data)
export const DEPARTMENTS = [
    'Sourcing',
    'Procurement',
    'Technology',
    'Supply Chain',
    'Finance',
    'Operations',
    'Executive',
    'IT',
] as const;

export type Department = typeof DEPARTMENTS[number];
