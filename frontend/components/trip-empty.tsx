'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { CoffeeIcon, RefreshCcwIcon, VolleyballIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TripEmpty = () => {
  const [retryVisible, setRetryVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <VolleyballIcon
            className={
              cn('size-12 grayscale', { 'animate-bounce': !retryVisible })
            }
          />
        </EmptyMedia>
        <EmptyTitle>Generating AI Recommendation</EmptyTitle>
        <EmptyDescription className={cn({ 'animate-pulse': !retryVisible })}>
          { retryVisible
              ? 'Something wrong on our side, the generation takes too long to complete. Would you like to retry?'
              : 'Please wait while we compile your travel itinerary...'
          }
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        { retryVisible ? <Button variant="outline"><RefreshCcwIcon data-icon="inline-start" /> Retry</Button> : null }
      </EmptyContent>
    </Empty>
  )
};

export { TripEmpty };
