'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/infrastructure/auth/authConfig';
import { PrismaComponentRepository } from '@/infrastructure/repositories/PrismaComponentRepository';
import { canAddComponent, PLANS } from '@/presentation/constants/plans';
import type { PlanKey } from '@/presentation/constants/plans';

const repo = new PrismaComponentRepository();

// ── Helpers ─────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user;
}

function revalidateAll() {
  revalidatePath('/drafts');
  revalidatePath('/components');
  revalidatePath('/dashboard');
}

// ── Actions ──────────────────────────────────────────────────────────────────

export async function getComponents() {
  const user = await requireSession();
  return repo.findByUserId(user.id);
}

export async function getDraftComponents() {
  const user = await requireSession();
  return repo.findByUserIdAndStatus(user.id, 'DRAFT');
}

export async function getSavedComponents() {
  const user = await requireSession();
  return repo.findByUserIdAndStatus(user.id, 'SAVED');
}

export async function createComponent(data: {
  name:        string;
  liquidCode:  string;
  cssCode:     string;
  jsCode:      string;
  schemaJson?: string;
  method:      'MANUAL' | 'AI_GENERATED';
  status?:     'DRAFT' | 'SAVED';
}) {
  const user  = await requireSession();
  const plan  = (user.plan ?? 'FREE') as PlanKey;
  const count = await repo.countByUserId(user.id);

  if (!canAddComponent(plan, count)) {
    const limit = PLANS[plan].componentsLimit;
    throw new Error(`Component limit reached (${limit} on ${plan} plan). Upgrade to add more.`);
  }

  const component = await repo.create({
    userId:     user.id,
    name:       data.name.trim() || 'Untitled Component',
    liquidCode: data.liquidCode,
    cssCode:    data.cssCode,
    jsCode:     data.jsCode,
    schemaJson: data.schemaJson ?? '{}',
    method:     data.method,
    status:     data.status ?? 'DRAFT',
  });

  revalidateAll();
  return component;
}

export async function updateComponent(
  id: string,
  data: Partial<{ name: string; liquidCode: string; cssCode: string; jsCode: string; schemaJson: string }>,
) {
  const user = await requireSession();
  const component = await repo.update(id, user.id, data);
  revalidateAll();
  return component;
}

export async function promoteComponent(id: string) {
  const user = await requireSession();
  const component = await repo.update(id, user.id, { status: 'SAVED' });
  revalidateAll();
  return component;
}

export async function demoteComponent(id: string) {
  const user = await requireSession();
  const component = await repo.update(id, user.id, { status: 'DRAFT' });
  revalidateAll();
  return component;
}

export async function deleteComponent(id: string) {
  const user = await requireSession();
  await repo.delete(id, user.id);
  revalidateAll();
}

export async function getComponent(id: string) {
  const user = await requireSession();
  return repo.findById(id, user.id);
}

export async function getComponentCount(): Promise<number> {
  const user = await requireSession();
  return repo.countByUserId(user.id);
}
