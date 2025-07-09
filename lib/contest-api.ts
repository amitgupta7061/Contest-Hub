import { Contest } from '@/types/contest';

const CODEFORCES_API = 'https://codeforces.com/api/contest.list';
const LEETCODE_API = 'https://leetcode.com/api/problems/all/';

// Mock data for demonstration - in production, you'd fetch from actual APIs
const mockContests: Contest[] = [
  {
    id: '1',
    name: 'Weekly Contest 378',
    platform: 'leetcode',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    duration: 90,
    url: 'https://leetcode.com/contest/weekly-contest-378/',
    phase: 'BEFORE',
    type: 'Weekly Contest'
  },
  {
    id: '2',
    name: 'Codeforces Round 912 (Div. 2)',
    platform: 'codeforces',
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    duration: 120,
    url: 'https://codeforces.com/contest/1903',
    phase: 'BEFORE',
    type: 'Div. 2'
  },
  {
    id: '3',
    name: 'January Cook-Off 2024',
    platform: 'codechef',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 150 * 60 * 1000).toISOString(),
    duration: 150,
    url: 'https://www.codechef.com/COOK158',
    phase: 'BEFORE',
    type: 'Cook-Off'
  },
  {
    id: '4',
    name: 'World CodeSprint 13',
    platform: 'hackerrank',
    startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000).toISOString(),
    duration: 180,
    url: 'https://www.hackerrank.com/contests/world-codesprint-13',
    phase: 'BEFORE',
    type: 'CodeSprint'
  },
  {
    id: '5',
    name: 'February Circuits 24',
    platform: 'hackerearth',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 240 * 60 * 1000).toISOString(),
    duration: 240,
    url: 'https://www.hackerearth.com/challenges/competitive/february-circuits-24/',
    phase: 'BEFORE',
    type: 'Circuits'
  },
  {
    id: '6',
    name: 'AtCoder Beginner Contest 335',
    platform: 'atcoder',
    startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 100 * 60 * 1000).toISOString(),
    duration: 100,
    url: 'https://atcoder.jp/contests/abc335',
    phase: 'BEFORE',
    type: 'ABC'
  }
];

export async function fetchContests(): Promise<Contest[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, you would fetch from actual APIs here
  // For now, return mock data
  return mockContests;
}

export async function fetchCodeforcesContests(): Promise<Contest[]> {
  try {
    const response = await fetch(CODEFORCES_API);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result
        .filter((contest: any) => contest.phase === 'BEFORE')
        .map((contest: any) => ({
          id: contest.id.toString(),
          name: contest.name,
          platform: 'codeforces' as const,
          startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
          endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000).toISOString(),
          duration: contest.durationSeconds / 60,
          url: `https://codeforces.com/contest/${contest.id}`,
          phase: 'BEFORE' as const,
          type: contest.type
        }));
    }
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error);
  }
  
  return [];
}