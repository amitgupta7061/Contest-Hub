export interface Contest {
  id: string;
  name: string;
  platform: 'leetcode' | 'codeforces' | 'codechef' | 'hackerrank' | 'hackerearth' | 'atcoder';
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  url: string;
  phase: 'BEFORE' | 'CODING' | 'FINISHED';
  type?: string;
}

export interface Platform {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface FilterOptions {
  platforms: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
}