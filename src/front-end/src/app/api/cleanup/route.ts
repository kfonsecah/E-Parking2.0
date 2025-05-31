import { startCleanupCron } from '@/lib/cleanup';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await startCleanupCron();
    return NextResponse.json({ message: 'Cleanup done' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
