'use client';

import { Contest } from '@/types/contest';
import { ContestCard } from './contest-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ContestGridProps {
  contests: Contest[];
  loading?: boolean;
}

export function ContestGrid({ contests, loading }: ContestGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-l-4 border-l-gray-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold mb-2">No contests found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later for new contests.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contests.map((contest) => (
        <ContestCard key={contest.id} contest={contest} />
      ))}
    </div>
  );
}