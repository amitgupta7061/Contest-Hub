'use client';

import { FilterOptions } from '@/types/contest';
import { PLATFORMS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContestFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function ContestFilters({ filters, onFiltersChange }: ContestFiltersProps) {
  const handlePlatformChange = (platformId: string, checked: boolean) => {
    const newPlatforms = checked
      ? [...filters.platforms, platformId]
      : filters.platforms.filter(p => p !== platformId);
    
    onFiltersChange({
      ...filters,
      platforms: newPlatforms
    });
  };

  const handleSearchChange = (searchQuery: string) => {
    onFiltersChange({
      ...filters,
      searchQuery
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      platforms: [],
      dateRange: { start: null, end: null },
      searchQuery: ''
    });
  };

  const hasActiveFilters = filters.platforms.length > 0 || 
                          filters.dateRange.start || 
                          filters.dateRange.end || 
                          filters.searchQuery.length > 0;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search Contests
          </Label>
          <Input
            id="search"
            placeholder="Search by name..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Platforms */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Platforms</Label>
          <div className="space-y-2">
            {PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.id}
                  checked={filters.platforms.includes(platform.id)}
                  onCheckedChange={(checked) => 
                    handlePlatformChange(platform.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={platform.id} 
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <span>{platform.icon}</span>
                  {platform.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
                      !filters.dateRange.start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.start ? (
                      format(filters.dateRange.start, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.start || undefined}
                    onSelect={(date) => handleDateRangeChange('start', date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
                      !filters.dateRange.end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.end ? (
                      format(filters.dateRange.end, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.end || undefined}
                    onSelect={(date) => handleDateRangeChange('end', date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}