export type Contest = {
  id: string;
  name: string;
  platform: 'codeforces' | 'leetcode' | 'codechef' | 'hackerrank' | 'hackerearth' | 'atcoder';
  startTime: string;
  endTime: string;
  duration: number;
  url: string;
  phase: 'BEFORE' | 'ONGOING' | 'FINISHED';
  type: string;
};


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