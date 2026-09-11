'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { RefreshCcwIcon, VolleyballIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateRecommendation, getRecommendationStatus } from '@/services/trip-service';
import { Trip, TripResponse } from '@/types/trip';
import { useRouter } from 'next/navigation';

interface TripEmptyProps {
  trip?: Trip
}

const poolStatus = (id: string, done: (recommendation?: string | null) => void) => {
  getRecommendationStatus(id)
    .then(({ success, data }) => {
      if (success) {
        if (data?.pending) {
          setTimeout(() => { poolStatus(id, done); }, 1000);
        } else {
          done(data?.recommendation);
        }
      } else {
        done();
      }
    });
};

const TripEmpty = ({ trip }: TripEmptyProps) => {
  const router = useRouter();
  const [retry, setRetry] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const generate = useCallback(() => {
    if (!trip?.id || trip.recommendation) { return; }

    setRetry(false);
    setMessage('Please wait while we compile your travel itinerary...');

    const timer = setTimeout(() => {
      setMessage('Something wrong on our side, the generation takes too long to complete. Would you like to retry?');
      setRetry(true);
    }, 10000);

    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => { reject(new Error('timeout')) }, 10000);
    })

    Promise.race([generateRecommendation(trip.id), timeout])
      .then((result) => {
        const { success, data } = result as TripResponse;

        if (!success || !data) {
          setMessage('Something wrong on our side. Would you like to retry?');
          setRetry(true);
        } else {
          if (data.pending) {
            poolStatus(trip.id, (recommendation) => {
              if (recommendation) {
                setMessage(null);
                clearTimeout(timer);

                router.refresh();
              }
            });
          } else if ('pending' in data) {
            setMessage(null);
            clearTimeout(timer);

            router.refresh();
          }
        }
      }).catch(() => {
        setMessage('Something wrong on our side, the generation takes too long to complete. Would you like to retry?');
        setRetry(true);
      });

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => generate(), [generate]);

  return (
    <Empty className="min-h-[calc(100%-4rem)] min-w-md">
      <EmptyHeader>
        <EmptyMedia variant="default">
          <VolleyballIcon
            className={
              cn('size-12 grayscale', { 'animate-bounce': !retry })
            }
          />
        </EmptyMedia>
        <EmptyTitle>Generating AI Recommendation</EmptyTitle>
        <EmptyDescription className={cn({ 'animate-pulse': !retry })}>
          {message
            ? <span>{message}</span>
            : null
          }
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="min-w-md">
        {trip && retry
          ?<div>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={generate}
            >
              <RefreshCcwIcon data-icon="inline-start" /> Retry
            </Button>
            <p className="mt-4 p-2 text-muted-foreground border-t border-dashed italic">Please wait at least 30s from previous attempt...</p>
          </div>
          : null}
      </EmptyContent>
    </Empty>
  )
};

export { TripEmpty };
