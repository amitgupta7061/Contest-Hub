import { NextResponse } from 'next/server';

const API_URL = 'https://kontests.net/api/v1/hacker_rank';

export async function GET() {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch HackerRank contests' }, { status: res.status });
    }

    const data = await res.json();
    const now = new Date();

    const upcomingContests = data.filter(
      (contest: any) => new Date(contest.start_time) > now
    );

    return NextResponse.json({ upcomingContests });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
