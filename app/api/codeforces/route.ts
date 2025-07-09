import { NextResponse } from 'next/server';

const CODEFORCES_API = 'https://codeforces.com/api/contest.list';

export async function GET() {
  try {
    const res = await fetch(CODEFORCES_API, {
      next: { revalidate: 0 } 
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch Codeforces contests' }, { status: res.status });
    }

    const data = await res.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: 'Invalid API response from Codeforces' }, { status: 500 });
    }

    const allContests = data.result;

    
    const upcomingContests = allContests.filter(
      (contest: any) => contest.phase === 'BEFORE'
    );

    return NextResponse.json({ upcomingContests });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
