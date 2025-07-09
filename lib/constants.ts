import { Platform } from '@/types/contest';

export const PLATFORMS: Platform[] = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    color: '#FFA116',
    icon: '🔢'
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    color: '#1F8ACB',
    icon: '🎯'
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    color: '#5B4638',
    icon: '👨‍🍳'
  },
  {
    id: 'hackerrank',
    name: 'HackerRank',
    color: '#00EA64',
    icon: '💻'
  },
  {
    id: 'hackerearth',
    name: 'HackerEarth',
    color: '#323754',
    icon: '🌍'
  },
  {
    id: 'atcoder',
    name: 'AtCoder',
    color: '#FF6B6B',
    icon: '🎪'
  }
];

export const getPlatformInfo = (platformId: string): Platform => {
  return PLATFORMS.find(p => p.id === platformId) || PLATFORMS[0];
};