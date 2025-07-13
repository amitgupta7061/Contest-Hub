'use client';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Trophy, Github, Heart } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">ContestTracker</h1>
            <p className="text-xs text-muted-foreground -mt-1">
              Never miss a contest again
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open('https://github.com/amitgupta7061', '_blank')}
            className="hidden sm:flex"
          >
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open('https://buymeacoffee.com', '_blank')}
            className="hidden sm:flex"
          >
            <Heart className="h-4 w-4 mr-2 text-red-500" />
            Support
          </Button>
          
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}