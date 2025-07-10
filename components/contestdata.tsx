'use client';

import { useEffect } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

const sources = [
  '/api/codeforces',
  '/api/codechef',
  '/api/leetcode',
  '/api/atcoder',
  '/api/hackerrank',
  '/api/hackerearth'
];

export default function AllContests() {
  useEffect(() => {
    async function fetchAllContests() {
      try {
        const responses = await Promise.all(
          sources.map(endpoint =>
            fetch(`${BASE_URL}${endpoint}`).then(res => res.json())
          )
        );

        const allContests = responses
          .flatMap(data => data.upcomingContests || [])
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

        console.log('✅ All Upcoming Contests:', allContests);
      } catch (error) {
        console.error('❌ Failed to fetch contests:', error);
      }
    }

    fetchAllContests();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Check the console for contest data</h2>
    </div>
  );
}
