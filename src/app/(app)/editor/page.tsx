import { auth } from '@/infrastructure/auth/authConfig';
import { EditorShell } from '@/presentation/components/editor/EditorShell';
import { getComponent } from '@/lib/actions/components';

interface EditorPageProps {
  searchParams: Promise<{ draft?: string; new?: string }>;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const session = await auth();
  const { draft: draftId, new: isNewParam } = await searchParams;

  const initialDraft = draftId
    ? await getComponent(draftId).catch(() => null)
    : null;

  return (
    <EditorShell
      userName={session?.user?.name ?? 'Developer'}
      userImage={session?.user?.image ?? null}
      initialDraft={initialDraft ?? undefined}
      isNew={isNewParam === '1'}
    />
  );
}
