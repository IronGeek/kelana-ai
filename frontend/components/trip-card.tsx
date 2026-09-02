import Link from 'next/link';
import * as React from "react"
import { Calendar, Wallet, Footprints, Train, ImageOff, ImageOffIcon, PlaneTakeoffIcon, PlaneIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button"
import { Trip } from "@/types/trip"
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface TripCardProps {
  trip: Trip
  mode?: 'list' | 'grid',
  imageUrl?: string
}

const getVariant = (variant: string): string | undefined => {
  switch (variant) {
    case 'Standard':
      return 'bg-green-800 text-white';
      break;
    case 'Backpacker':
      return 'bg-blue-800 text-white';
      break;
    case 'Luxury':
      return 'bg-red-800 text-white';
  default:

    return undefined;
  }
}

const TripCard = ({
  trip,
  imageUrl,
  mode = 'list'
}: TripCardProps) => {
  const imgSrc = imageUrl ?? '/images/trip.webp';

  return (
    mode == 'list'
      ? (
        <Card className="flex flex-row max-w-[560px] w-full overflow-hidden rounded-md p-4">
          <CardHeader className="[container-type:normal] [container-name:none] auto-rows-auto p-0">
            <CardTitle className="h-full flex items-center justify-center"><PlaneIcon className="w-12 h-12" /></CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="flex gap-4">
              <div className="text-lg font-bold">{trip.destination}</div>
              <Badge className={cn('p-3', getVariant(trip.category))}>{trip.category}</Badge>
            </div>
            <div className="flex gap-4">
              <div>{trip.days} days</div><div>USD {trip.budget.toFixed(2)}</div>
            </div>
            { trip.travel_style?.length > 0
              ? (<>
                  <Separator className="w-auto" />
                  <div className="flex flex-wrap gap-2">
                  {
                    trip.travel_style.map((style) => (
                      <Badge key={style} variant="secondary" className="capitalize p-3">{style}</Badge>)
                    )
                  }
                </div>
              </>)
              : null
            }
          </CardContent>
          <CardFooter className="flex-col items-center justify-center p-0">
            <Link href={`/trips/details/${trip.id}`}>
              <Button className="w-full cursor-pointer">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )
      : (
        <Card className="w-full max-w-[280px] overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md p-0">
          {/* 🖼️ Header Image Section */}
          <div className="relative h-32 w-full bg-muted">
            <img
              src={imgSrc}
              alt={trip.destination}
              className="h-full w-full object-cover"
            />
            <span className="absolute top-2 left-2 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-sm uppercase tracking-wide">
              {trip.category}
            </span>
          </div>

          {/* 📝 Dense Content Area (Replaces padded sections with a uniform layout) */}
          <div className="p-3">
            {/* Title */}
            <h3 className="truncate text-sm font-bold text-primary" title={trip.destination}>
              {trip.destination}
            </h3>

            {/* Subtitle / Recommendation */}
            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/80">
              {trip.recommendation || "Tailored travel itinerary."}
            </p>

            {/* 📊 Tiny Info Grid */}
            <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
              {/* Duration */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                <span className="truncate">{trip.days} Days</span>
              </div>

              {/* Transport */}
              <div className="flex items-center gap-1.5 min-w-0 capitalize">
                <Train className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{trip.transport}</span>
              </div>

              {/* Total Budget */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Wallet className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="truncate font-semibold text-foreground">${trip.budget}</span>
              </div>

              {/* Daily Budget */}
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex h-3.5 w-3.5 items-center justify-center font-bold text-[10px] text-emerald-500 border border-emerald-500 rounded shrink-0">D</div>
                <span className="truncate">${trip.daily_budget}/d</span>
              </div>
            </div>

            {/* Style Banner */}
            <div className="mt-2.5 flex items-center gap-1.5 border-t pt-2 text-[11px] text-muted-foreground">
              <Footprints className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">Style: <strong className="text-foreground">{trip.travel_style}</strong></span>
            </div>

            {/* ➡️ Action Button */}
            <Link href={`/trips/details/${trip.id}`}>
              <Button
                className="mt-3 h-8 w-full text-xs font-medium cursor-pointer"
              >
                View Details
              </Button>
            </Link>
          </div>
        </Card>
      )
  )
}

export { TripCard }
export type { TripCardProps };
