'use client';

import Link from "next/link"
import { ChevronDownIcon, PlusIcon, TableIcon, VolleyballIcon } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { TripCard } from "./trip-card"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { SubmitEvent, useState, useTransition } from "react"
import { Pager } from "@/components/pager";
import { useRouter, useSearchParams } from "next/navigation";

import type { Trip } from "@/types/trip"
import { tripItemsPerPage } from "@/services/trip-service";

interface TripViewProps {
  trips: Trip[]
  search?: string
  total?: number
  page?: number
  mode?: 'list' | 'grid'
}

const TripView = ({ trips, search, total, page, mode = 'list' }: TripViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({ destination: true, style: true });

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
    const params = new URLSearchParams(searchParams.toString());
    const formData = new FormData(e.currentTarget);

    const search = formData.get("search")?.toString() ?? '';
    const destination = formData.get("destination") === "true";
    const style = formData.get("style") === "true";

    if (search) {
      params.set('query', search);
    } else {
      params.delete('query');
    }

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `/trips?${queryString}` : '/trips');
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const queryString = params.toString();
    const path = page > 1 ? `/trips/page/${page}` : '/trips';

    startTransition(() => {
      router.push(queryString ? `${path}?${queryString}` : path);
    });
  };

  const totalItems = (total ?? 0);

  if (isPending) {
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
        <div className="flex gap-2 items-center justify-center">
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <input type="hidden" name="destination" value={String(filters.destination)} />
          <input type="hidden" name="style" value={String(filters.style)} />
          <InputGroup className="bg-background rounded-xl h-10">
            <InputGroupInput placeholder="Search Trip" name="search" defaultValue={search} />
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
        <Link href="/">
          <Button size="lg" className="cursor-pointer rounded-lg">
            <PlusIcon /> New Trip
          </Button>
        </Link>
        </div>
        {trips ? trips.map((trip, index) => (
          <TripCard key={index} trip={trip} mode={mode} />
        )) : null}

        <Pager
          current={page ?? 1}
          size={tripItemsPerPage}
          total={totalItems}
          onPageChange={(page) => handlePageChange(page)}
        />
      </div>
    )
    : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {trips.map((trip, index) => (
        <TripCard key={index} trip={trip} mode={mode} />
      ))}
    </div>
}

export { TripView };
