import { QueryClient } from '@tanstack/react-query';

/**
 * Default error handler for queries
 */
export function handleQueryError(error: any) {
  const message = error?.message || 'An error occurred';
  console.error('Query error:', error);
  
  // Don't show toast for 404s or cancelled queries
  if (error?.code === 'PGRST116' || error?.name === 'AbortError') {
    return;
  }
  
  // Note: toast from 'sonner' can be added when needed
  // toast.error(message);
}

/**
 * Default success handler for mutations
 */
export function handleMutationSuccess(message: string) {
  // Note: toast from 'sonner' can be added when needed
  // toast.success(message);
  console.log('Mutation success:', message);
}

/**
 * Default error handler for mutations
 */
export function handleMutationError(error: any, fallbackMessage = 'Operation failed') {
  const message = error?.message || fallbackMessage;
  console.error('Mutation error:', error);
  // Note: toast from 'sonner' can be added when needed
  // toast.error(message);
}

/**
 * Prefetch a query
 */
export async function prefetchQuery<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

/**
 * Set query data manually
 */
export function setQueryData<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  data: T
) {
  queryClient.setQueryData(queryKey, data);
}

/**
 * Get query data
 */
export function getQueryData<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[]
): T | undefined {
  return queryClient.getQueryData(queryKey);
}

/**
 * Invalidate multiple query keys
 */
export async function invalidateMultiple(
  queryClient: QueryClient,
  queryKeys: readonly unknown[][]
) {
  await Promise.all(
    queryKeys.map(key => 
      queryClient.invalidateQueries({ queryKey: key })
    )
  );
}
