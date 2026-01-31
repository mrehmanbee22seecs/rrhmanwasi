import { describe, it, expect } from '@jest/globals';
import { queryClient } from '../queryClient';
import { queryKeys } from '../queryKeys';

describe('React Query Setup', () => {
  it('should have correct default options', () => {
    const defaults = queryClient.getDefaultOptions();
    
    expect(defaults.queries?.staleTime).toBe(5 * 60 * 1000);
    expect(defaults.queries?.gcTime).toBe(10 * 60 * 1000);
    expect(defaults.queries?.retry).toBe(3);
  });
  
  it('should generate correct query keys for projects', () => {
    const projectsKey = queryKeys.projects.list({ status: 'active' });
    expect(projectsKey).toEqual(['projects', 'list', { filters: { status: 'active' } }]);
    
    const projectKey = queryKeys.projects.detail('123');
    expect(projectKey).toEqual(['projects', 'detail', '123']);
  });

  it('should generate correct query keys for applications', () => {
    const applicationsKey = queryKeys.applications.list({ status: 'pending' });
    expect(applicationsKey).toEqual(['applications', 'list', { filters: { status: 'pending' } }]);
    
    const applicationKey = queryKeys.applications.detail('456');
    expect(applicationKey).toEqual(['applications', 'detail', '456']);
  });

  it('should generate correct query keys for volunteers', () => {
    const volunteersKey = queryKeys.volunteers.list({ verified: true });
    expect(volunteersKey).toEqual(['volunteers', 'list', { filters: { verified: true } }]);
    
    const volunteerKey = queryKeys.volunteers.detail('789');
    expect(volunteerKey).toEqual(['volunteers', 'detail', '789']);
  });
});
