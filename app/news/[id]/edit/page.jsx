'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import RoleGate from '../../../../components/RoleGate';
import NewsForm from '../../../../components/NewsForm';
import { useAuth } from '../../../../components/AuthProvider';
import { Skeleton } from '../../../../components/blood/ui';
import { PageHero } from '../../../../components/ui/kit';
import { API_BASE, apiFetch } from '../../../../lib/api';

function Editor() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`${API_BASE}/news/${id}/manage`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not load this post');
        setPost(data);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const isAdmin = user.roles.includes('admin');

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <PageHero
        icon={<Newspaper size={24} />}
        tone="indigo"
        eyebrow={isAdmin ? 'Changes save at once' : 'It will be checked again'}
        title="Edit news"
        subtitle={isAdmin ? 'Update the story, then save.' : 'After you save, an admin will check the post again.'}
      />

      <div className="mt-6">
        {error ? (
          <p className="rounded-2xl bg-rose-50 p-5 text-sm text-rose-700">{error}</p>
        ) : !post ? (
          <Skeleton className="h-96" />
        ) : (
          <NewsForm post={post} isAdmin={isAdmin} />
        )}
      </div>
    </main>
  );
}

export default function EditNewsPage() {
  return (
    <RoleGate roles={['admin', 'journalist']} deniedText="Only admins and journalists can edit news.">
      <Editor />
    </RoleGate>
  );
}