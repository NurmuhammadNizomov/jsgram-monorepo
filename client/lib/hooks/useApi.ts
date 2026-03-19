import { useQuery, useMutation, QueryKey } from '@tanstack/react-query';
import api from '../api';

export function useApiGet<T>(queryKey: QueryKey, url: string, options?: any) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get<T>(url);
      return data;
    },
    ...options,
  });
}

export function useApiPost<T, V>(url: string, options?: any) {
  return useMutation({
    mutationFn: async (variables: V) => {
      const { data } = await api.post<T>(url, variables);
      return data;
    },
    ...options,
  });
}

export function useApiPut<T, V>(url: string, options?: any) {
  return useMutation({
    mutationFn: async (variables: V) => {
      const { data } = await api.put<T>(url, variables);
      return data;
    },
    ...options,
  });
}

export function useApiDelete<T>(url: string, options?: any) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<T>(url);
      return data;
    },
    ...options,
  });
}
