'use client';

import { Newspaper } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import NewsForm from '../../../components/NewsForm';
import { useAuth } from '../../../components/AuthProvider';
import { PageHero } from '../../../components/ui/kit';

function Writer() {
  const { user } = useAuth();
  const isAdmin = user.roles.includes('admin');

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <PageHero
        icon={<Newspaper size={24} />}
        tone="indigo"
        eyebrow={isAdmin ? 'Goes live at once' : 'An admin will read it first'}
        title="Write news"
        subtitle={isAdmin ? 'Your story goes live as soon as you publish it.' : 'Your story will be checked by an admin before it goes live.'}
      />
      <div className="mt-6">
        <NewsForm isAdmin={isAdmin} />
      </div>
    </main>
  );
}

export default function WriteNewsPage() {
  return (
    <RoleGate roles={['admin', 'journalist']} deniedText="Only admins and journalists can write news.">
      <Writer />
    </RoleGate>
  );
}