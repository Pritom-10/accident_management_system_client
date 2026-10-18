'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import RoleGate from '../../../../components/RoleGate';
import NewsForm from '../../../../components/NewsForm';
import { useAuth } from '../../../../components/AuthProvider';
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
    <main className="mx-auto max-w-3xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        <Newspaper size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Edit news</h1>
      {!isAdmin && (
        <p className="mt-2 text-sm text-slate-600">After you save, an admin will check the post again.</p>
      )}

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : !post ? (
          <p className="text-sm text-slate-600">Loading...</p>
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