// pages/lifecycle/[id].js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LifecycleIndex() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      router.replace(`/lifecycle/${id}/theme`);
    }
  }, [id, router]);

  return <div>Redirecting...</div>;
}
