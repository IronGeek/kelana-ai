'use client';

import Link from "next/link"
import { ChevronDownIcon, PlusIcon, TableIcon, VolleyballIcon } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { TripCard } from "./trip-card"

import { TripSearchRequest, type Trip } from "@/types/trip"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { SubmitEvent, useEffect, useState } from "react"
import { getTrips } from "@/services/trip-service";
import { Pager } from "@/components/pager";
import { cn } from "@/lib/utils";

interface TripViewProps {
  trips: Trip[]
  total?: number
  mode?: 'list' | 'grid'
}

const itemsPerPage = 10;

const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !deepEqual(a[key], b[key])
    ) {
      return false;
    }
  }

  return true;
}

const TripView = ({ trips, total, mode = 'list' }: TripViewProps) => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Trip[]>(trips);
  const [filters, setFilters] = useState({ destination: true, style: true });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(total ?? 0);
  const [query, setQuery] = useState<TripSearchRequest | undefined>(undefined);

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => {
      const value = { ...prev, [key]: !prev[key] };
      if (!value.destination && !value.style) {
        return { destination: true, style: true };
      }

      return value;
    });
  }

  const handleSearch = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);

    const search = formData.get("search")?.toString() ?? '';
    const destination = formData.get("destination") === "true";
    const style = formData.get("style") === "true";

    setQuery({
      search: search.trim(),
      filter: !destination && !style ? undefined : { destination, style }
    });
  };

  useEffect(() => {
    setQuery((prev) => {

      const value = {
        ...prev,
        search: prev?.search ?? '',
        page: { index: currentPage, size: itemsPerPage }
      };

      return deepEqual(prev, value) ? prev : value;
    });
  }, [currentPage]);

  useEffect(() => {
    console.log('query', query);

    getTrips(query).then(({ data, total }) => {
      setList(data ?? []);
      setTotalItems(total);
    }).finally(() => {
      setLoading(false);
    });
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center mb-8">
        <Empty>
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="default">
              <VolleyballIcon className="size-12 grayscale animate-bounce" />
            </EmptyMedia>
            <EmptyTitle className="text-2xl">Loading trips...</EmptyTitle>
            <EmptyDescription className="text-md">
              Please wait while we prepare your travel history.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  } else if (totalItems === 0) {
    return (
      <div className="flex flex-col gap-4 items-center mb-8">
        <Empty>
          <EmptyHeader className="max-w-md">
            <EmptyMedia>
              <TableIcon />
            </EmptyMedia>
            <EmptyTitle className="text-2xl">No trip to display</EmptyTitle>
            <EmptyDescription className="text-md">
              There are no trip yet. Add your first trip to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/">
              <Button className="cursor-pointer">
                <PlusIcon />
                New Trip
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return mode == 'list'
    ? (
      <div className="flex flex-col gap-4 items-center mb-8">
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <input type="hidden" name="destination" value={String(filters.destination)} />
          <input type="hidden" name="style" value={String(filters.style)} />
          <InputGroup className="bg-background rounded-xl h-10">
            <InputGroupInput placeholder="Search Trip" name="search" className="!text-base" />
            <InputGroupAddon align="inline-end" className="gap-1 p-0">
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <InputGroupButton className="rounded-xl h-9" variant="ghost">
                    Filter By
                    <ChevronDownIcon />
                  </InputGroupButton>
                } />
                <DropdownMenuContent align="end" className="[--radius:0.95rem]">
                  <DropdownMenuCheckboxItem
                    checked={filters.destination}
                    onCheckedChange={() => toggleFilter('destination')}
                  >
                    Destination
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.style}
                    onCheckedChange={() => toggleFilter('style')}
                  >
                    Travel Style
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="submit" size="lg" className="cursor-pointer rounded-xl shrink-0 mr-1">
                Search
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </form>
        {list.map((trip, index) => (
          <TripCard key={index} trip={trip} mode={mode} />
        ))}

        <Pager
          current={currentPage}
          size={itemsPerPage}
          total={totalItems}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    )
    : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((trip, index) => (
        <TripCard key={index} trip={trip} mode={mode} />
      ))}
    </div>
}

export { TripView }
