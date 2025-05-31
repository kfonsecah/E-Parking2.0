import { startReminderCron } from '@/lib/cron';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await startReminderCron();
    return NextResponse.json({ message: 'Cron executed' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
