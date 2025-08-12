import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useRefresh() {
  const router = useRouter();

  const refresh = useCallback(() => {
    // Refresh the current page
    router.refresh();
  }, [router]);

  const refreshAll = useCallback(() => {
    // Force a hard refresh of the entire application
    window.location.reload();
  }, []);

  return { refresh, refreshAll };
}
