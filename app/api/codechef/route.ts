import { NextResponse } from 'next/server';

const CODECHEF_API = 'https://kontests.net/api/v1/code_chef';

export async function GET() {
  try {
    const res = await fetch(CODECHEF_API, {
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch CodeChef contests' }, { status: res.status });
    }

    const contests = await res.json();

    const now = new Date();
    const upcomingContests = contests.filter(
      (contest: any) => new Date(contest.start_time) > now
    );

    return NextResponse.json({ upcomingContests });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
