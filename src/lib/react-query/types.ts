import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Base query options
 */
export type QueryOptions<TData, TError = Error> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

/**
 * Base mutation options
 */
export type MutationOptions<TData, TVariables, TError = Error> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn'
>;

/**
 * API Response wrapper type
 */
export interface ApiResponse<T> {
  data: T;
  error?: Error;
  status?: number;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Filter params (generic)
 */
export interface FilterParams {
  search?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Combined query params
 */
export interface QueryParams extends PaginationParams, FilterParams {}
