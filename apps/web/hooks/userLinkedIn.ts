import axiosInstance from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

export const useUserLinkedIn = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-linkedin'],
    queryFn: () => axiosInstance.get('/api/linkedin/status'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    data,
    isLoading,
    error,
  }
}
