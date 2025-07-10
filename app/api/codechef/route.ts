import { NextResponse } from 'next/server';

const API = 'https://kontests.net/api/v1/code_chef';

export async function GET() {
  try {
    const res = await fetch(API, { next: { revalidate: 0 } });
    const contests = await res.json();

    const upcomingContests = contests.filter((c: any) => c.status === 'BEFORE');

    return NextResponse.json({ upcomingContests });
  } catch (err) {
    console.error('CodeChef API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
