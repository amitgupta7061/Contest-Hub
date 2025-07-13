import { Contest } from '@/types/contest';

const COMPETE_API = 'https://competeapi.vercel.app/contests/upcoming/';

export async function fetchContests(): Promise<Contest[]> {
  try {
    const response = await fetch(COMPETE_API, { cache: 'no-store' });
    const data = await response.json();

    // Convert to your internal Contest[] format
    const contests: Contest[] = data.map((contest: any) => ({
      id: contest.title + contest.site, // Unique string ID
      name: contest.title,
      platform: contest.site.toLowerCase() as Contest['platform'],
      startTime: new Date(contest.startTime).toISOString(),
      endTime: new Date(contest.endTime).toISOString(),
      duration: contest.duration / 60,
      url: contest.url,
      phase: 'BEFORE',
      type: 'General'
    }));

    return contests;
  } catch (error) {
    console.error('Failed to fetch contests:', error);
    return [];
  }
}
