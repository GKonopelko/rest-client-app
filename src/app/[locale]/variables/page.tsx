import LazyLoader from '@/components/LazyLoader/LazyLoader';

export default function AppVariablesPage() {
  return (
    <LazyLoader
      component="VariablesPage"
      loadingMessage="Loading Variables Manager..."
      suspenseMessage="Initializing Variables..."
    />
  );
}
