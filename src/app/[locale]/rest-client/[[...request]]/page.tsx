import LazyLoader from '@/components/LazyLoader/LazyLoader';

export default function AppRestClientPage() {
  return (
    <LazyLoader
      component="RestClientPage"
      loadingMessage="Loading REST Client..."
      suspenseMessage="Initializing REST Client..."
    />
  );
}
