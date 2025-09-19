import LazyLoader from '@/components/LazyLoader/LazyLoader';

export default function AppHistoryPage() {
  return (
    <LazyLoader
      component="HistoryPage"
      loadingMessage="Loading History..."
      suspenseMessage="Initializing History..."
    />
  );
}
