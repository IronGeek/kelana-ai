import Link from 'next/link';
import { Calendar, Wallet, Footprints, Train, PlaneIcon, TagIcon, EyeIcon, Trash2Icon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button"
import { Trip } from "@/types/trip"
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { CategoryBadge, getCategoryVariant } from '@/components/category-badge';

interface TripCardProps {
  trip: Trip
  mode?: 'list' | 'grid',
  imageUrl?: string
  onDelete?: (id: string) => void
}

const TripCard = ({
  trip,
  imageUrl,
  onDelete,
  mode = 'list'
}: TripCardProps) => {
  const imgSrc = imageUrl ?? '/images/trip.webp';

  return (
    mode == 'list'
      ? (
        <Card className="grid grid-cols-[max-content_1fr] @lg:grid-cols-[max-content_1fr_max-content] w-full overflow-hidden rounded-md p-0 gap-0">
          <CardHeader
            className={cn("relative [container-type:normal] [container-name:none] auto-rows-auto pr-[calc(var(--card-spacing)*1.5)] rounded-none zigzag-right badge-number", getCategoryVariant(trip.category))}
            data-number={trip.row_num}
          >
            <CardTitle className="h-full flex items-center justify-center">
              <PlaneIcon strokeWidth={1} className="w-12 h-12" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            <div className="flex gap-4">
              <div className="text-lg font-bold">{trip.destination}</div>
              <CategoryBadge category={trip.category} />
            </div>
            <div className="flex gap-4">
              <div>{trip.days} days</div><div>USD {trip.budget.toFixed(2)}</div>
            </div>
            {trip.styles?.length > 0
              ? (<>
                <Separator className="w-auto" />
                <div className="flex flex-wrap gap-2">
                  {
                    trip.styles.map((style) => (
                      <Badge key={style} variant="secondary" className="capitalize p-3">
                        <TagIcon data-icon="inline-start" /> {style}
                      </Badge>)
                    )
                  }
                </div>
              </>)
              : null
            }
          </CardContent>
          <CardFooter className="flex-col items-center justify-center border-t @lg:border-l border-dashed rounded-none gap-1 p-4! col-span-2 @lg:col-span-1">
            <Link className="w-full" href={`/trips/details/${trip.id}`}>
              <Button className="w-full cursor-pointer">
                <EyeIcon data-icon="inline-start" /> Details
              </Button>
            </Link>
            <Button variant="destructive" className="w-full cursor-pointer" onClick={() => onDelete?.(trip.id)}>
              <Trash2Icon data-icon="inline-start" /> Delete
            </Button>
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
              <span className="truncate">Style: <strong className="text-foreground">{trip.styles}</strong></span>
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
