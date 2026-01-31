# React Query Setup - Usage Guide

## Basic Query Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { projectsApi } from '../api/projects';

export function useProjects(filters = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectsApi.list(filters),
  });
}
```

## Basic Mutation Hook

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { projectsApi } from '../api/projects';

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      // toast.success('Project created!');
    },
  });
}
```

## Usage in Component

```typescript
function ProjectsList() {
  const { data: projects, isLoading, error } = useProjects({ status: 'active' });
  const createProject = useCreateProject();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <button onClick={() => createProject.mutate(newProject)}>
        Create
      </button>
    </div>
  );
}
```

## Query Keys Structure

The query keys follow a hierarchical pattern:
- `queryKeys.projects.all` - Base key for all project queries
- `queryKeys.projects.list(filters)` - List of projects with filters
- `queryKeys.projects.detail(id)` - Single project detail

This allows for:
- Easy invalidation of related queries
- Type safety with TypeScript
- Consistent cache management

## Utilities

### Prefetch Query
```typescript
import { prefetchQuery } from './queryUtils';
import { queryClient } from './queryClient';

await prefetchQuery(queryClient, queryKeys.projects.all, projectsApi.list);
```

### Set Query Data
```typescript
import { setQueryData } from './queryUtils';

setQueryData(queryClient, queryKeys.projects.detail('123'), newProjectData);
```

### Invalidate Multiple Queries
```typescript
import { invalidateMultiple } from './queryUtils';

await invalidateMultiple(queryClient, [
  queryKeys.projects.all,
  queryKeys.applications.all
]);
```
