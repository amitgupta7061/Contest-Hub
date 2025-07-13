// app/api/contests/route.tsx

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://competeapi.vercel.app/contests/upcoming/', {
      cache: 'no-store' // avoid caching stale data
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
