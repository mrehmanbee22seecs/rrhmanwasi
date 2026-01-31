import { QueryClient } from '@tanstack/react-query';

// Type-safe query keys for all entities
export const queryKeys = {
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    stats: () => [...queryKeys.projects.all, 'stats'] as const,
  },
  
  // Applications
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.applications.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.applications.all, 'detail', id] as const,
    byVolunteer: (volunteerId: string) => [...queryKeys.applications.lists(), { volunteerId }] as const,
    byProject: (projectId: string) => [...queryKeys.applications.lists(), { projectId }] as const,
  },
  
  // Volunteers
  volunteers: {
    all: ['volunteers'] as const,
    lists: () => [...queryKeys.volunteers.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.volunteers.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.volunteers.all, 'detail', id] as const,
    profile: (id: string) => [...queryKeys.volunteers.all, 'profile', id] as const,
    hours: (id: string) => [...queryKeys.volunteers.all, 'hours', id] as const,
  },
  
  // Organizations (NGOs & Corporates)
  organizations: {
    all: ['organizations'] as const,
    lists: () => [...queryKeys.organizations.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.organizations.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.organizations.all, 'detail', id] as const,
    documents: (id: string) => [...queryKeys.organizations.all, 'documents', id] as const,
  },
  
  // Payments
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.payments.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.payments.all, 'detail', id] as const,
    approvals: () => [...queryKeys.payments.all, 'approvals'] as const,
    history: (orgId: string) => [...queryKeys.payments.all, 'history', orgId] as const,
  },
  
  // Admin
  admin: {
    all: ['admin'] as const,
    vetting: () => [...queryKeys.admin.all, 'vetting'] as const,
    auditLogs: (filters: Record<string, any>) => [...queryKeys.admin.all, 'audit-logs', { filters }] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    settings: () => [...queryKeys.admin.all, 'settings'] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => [...queryKeys.notifications.all, 'list', userId] as const,
    unreadCount: (userId: string) => [...queryKeys.notifications.all, 'unread', userId] as const,
  },
  
  // Activity Feed
  activity: {
    all: ['activity'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.activity.all, 'list', { filters }] as const,
  },
} as const;

// Helper to invalidate all queries for an entity
export const invalidateQueries = {
  projects: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
  applications: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.applications.all }),
  volunteers: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.volunteers.all }),
  organizations: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all }),
  payments: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
  notifications: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
};
