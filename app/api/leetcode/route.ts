import { NextResponse } from 'next/server';

const LEETCODE_CONTEST_API = 'https://leetcode.com/contest/api/list/';

export async function GET() {
  try {
    const res = await fetch(LEETCODE_CONTEST_API, {
      headers: {
        'Content-Type': 'application/json',
        
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch contests' }, { status: res.status });
    }

    const data = await res.json();

    const upcomingContests = data?.upcoming_contests || [];

    return NextResponse.json({ upcomingContests });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
