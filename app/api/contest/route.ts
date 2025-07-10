import { NextResponse } from 'next/server';

const sources = [
  '/api/codeforces',
  '/api/codechef',
  '/api/leetcode',
  '/api/atcoder',
  '/api/hackerrank',
  '/api/hackerearth'
];

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const contestFetches = sources.map(source =>
      fetch(`${baseUrl}${source}`).then(res => res.json())
    );

    const results = await Promise.all(contestFetches);

    // Flatten and merge all contests
    const allContests = results
      .flatMap(data => data?.upcomingContests || [])
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return NextResponse.json({ contests: allContests });
  } catch (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
  }
}
