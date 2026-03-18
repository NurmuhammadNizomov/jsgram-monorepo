import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import api from '../api';

// Generic GET hook
export function useApiGet<T>(
  queryKey: QueryKey,
  url: string,
  options?: any
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get<T>(url);
      return data;
    },
    ...options,
  });
}

// Generic POST hook
export function useApiPost<T, V>(
  url: string,
  options?: any
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: V) => {
      const { data } = await api.post<T>(url, variables);
      return data;
    },
    onSuccess: () => {
      // Kerakli query larni invalidate qilish
      queryClient.invalidateQueries();
    },
    ...options,
  });
}

// Generic PUT hook
export function useApiPut<T, V>(
  url: string,
  options?: any
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: V) => {
      const { data } = await api.put<T>(url, variables);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
}

// Generic DELETE hook
export function useApiDelete<T>(
  url: string,
  options?: any
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<T>(url);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
}
