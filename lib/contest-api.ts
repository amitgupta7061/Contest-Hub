import { Contest } from '@/types/contest';

const COMPETE_API = 'https://competeapi.vercel.app/contests/upcoming/';

export async function fetchContests(): Promise<Contest[]> {
  try {
    const response = await fetch(COMPETE_API, { cache: 'no-store' });
    const data = await response.json();

    // Convert to your internal Contest[] format
    const contests: Contest[] = data.map((contest: any) => {
      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);
      
      // Calculate duration from start and end time (in minutes)
      const durationInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      return {
        id: contest.title + contest.site, // Unique string ID
        name: contest.title,
        platform: contest.site.toLowerCase() as Contest['platform'],
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationInMinutes > 0 ? durationInMinutes : 120, // Default 2 hours if invalid
        url: contest.url,
        phase: 'BEFORE',
        type: 'General'
      };
    });

    return contests;
  } catch (error) {
    console.error('Failed to fetch contests:', error);
    return [];
  }
}
