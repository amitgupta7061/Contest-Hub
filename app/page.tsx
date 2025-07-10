'use client';

import { useState, useEffect, useMemo } from 'react';
import { Contest, FilterOptions } from '@/types/contest';
import { fetchContests } from '@/lib/contest-api';
import { Header } from '@/components/header';
import { ContestFilters } from '@/components/contest-filters';
import { ContestGrid } from '@/components/contest-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AllContests from '@/components/contestdata';

export default function Home() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    platforms: [],
    dateRange: { start: null, end: null },
    searchQuery: ''
  });

  const loadContests = async () => {
    setLoading(true);
    try {
      const fetchedContests = await fetchContests();
      setContests(fetchedContests);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  const filteredContests = useMemo(() => {
    return contests.filter(contest => {
      // Platform filter
      if (filters.platforms.length > 0 && !filters.platforms.includes(contest.platform)) {
        return false;
      }

      // Search filter
      if (filters.searchQuery && !contest.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }

      // Date range filter
      const contestDate = new Date(contest.startTime);
      if (filters.dateRange.start && contestDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && contestDate > filters.dateRange.end) {
        return false;
      }

      return true;
    });
  }, [contests, filters]);

  const stats = useMemo(() => {
    const totalContests = filteredContests.length;
    const today = new Date();
    const todayContests = filteredContests.filter(contest => {
      const contestDate = new Date(contest.startTime);
      return contestDate.toDateString() === today.toDateString();
    }).length;
    const thisWeekContests = filteredContests.filter(contest => {
      const contestDate = new Date(contest.startTime);
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return contestDate >= today && contestDate <= weekFromNow;
    }).length;

    return { totalContests, todayContests, thisWeekContests };
  }, [filteredContests]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AllContests />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Programming Contests
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track upcoming contests from LeetCode, Codeforces, CodeChef, and more platforms in one place.
            Never miss a contest again!
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-4 text-center">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-primary">{stats.totalContests}</div>
                    <div className="text-sm text-muted-foreground">Total Contests</div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-600">{stats.todayContests}</div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">{stats.thisWeekContests}</div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Refresh Button */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button onClick={loadContests} disabled={loading} size="lg">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Contests'}
            </Button>
            
            {lastUpdated && (
              <Badge variant="secondary" className="text-xs">
                Updated {lastUpdated.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ContestFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Contest Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                  Upcoming Contests
                </h2>
                <Badge variant="outline" className="text-sm">
                  {filteredContests.length} {filteredContests.length === 1 ? 'contest' : 'contests'}
                </Badge>
              </div>
            </div>
            
            <ContestGrid 
              contests={filteredContests}
              loading={loading}
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-20 border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              Built with ❤️ for the competitive programming community
            </p>
            <p>
              Data sourced from official contest platforms • Updates every 5 minutes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}