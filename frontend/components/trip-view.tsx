'use client';

import { SubmitEvent, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, ChevronDownIcon, KeySquareIcon, PlusIcon, TableIcon, VolleyballIcon, XIcon } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { TripCard } from "@/components/trip-card"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pager } from "@/components/pager";
import { NewTripDialog } from "@/components/dialog/new-trip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { deleteTrip, tripItemsPerPage } from "@/services/trip-service";
import { cn } from "@/lib/utils";

import type { Trip } from "@/types/trip"

interface TripViewProps {
  className?: string
  trips: Trip[]
  search?: string
  total?: number
  page?: number
  mode?: 'list' | 'grid'
}

const TripView = ({ className, trips, search, total, page, mode = 'list' }: TripViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({ destination: true, style: true });
  const [deleteId, setDeleteId] = useState<string | null>(null)

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

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteTrip(deleteId).then(({ success }) => {
        if (success) {
          startTransition(() => { router.refresh(); });
        }
      }).finally(() => {
        setDeleteId(null);
      })
    }
  }


  const totalItems = (total ?? 0);

  if (isPending) {
    return (
      <div className={cn("w-full gap-0 p-0", className)}>
        <Empty className="h-full">
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
  } else if (totalItems === 0 && search === '') {
    return (
      <div className={cn("w-full gap-0 p-0", className)}>
        <Empty className="h-full">
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
            <NewTripDialog trigger={
              <Button
                className="cursor-pointer"
                disabled={isPending}
              >
                <PlusIcon /> New Trip
              </Button>} />
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return mode == 'list'
    ? (
      <div className="@container flex flex-col gap-4 mb-8">
        <div className="flex gap-2 items-center justify-center">
        <form onSubmit={handleSearch} className="w-full">
          <input type="hidden" name="destination" value={String(filters.destination)} />
          <input type="hidden" name="style" value={String(filters.style)} />
          <InputGroup className="bg-background h-10 w-full">
            <InputGroupInput placeholder="Search Trip" name="search" defaultValue={search} />
            <InputGroupAddon align="inline-end" className="gap-1 p-0">
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <InputGroupButton className="h-9" variant="ghost">
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
              <Button type="submit" variant="outline" size="lg" className="cursor-pointer shrink-0 mr-1.5 p-4">
                Search
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </form>
        <NewTripDialog trigger={
          <Button
            size="lg"
            className="cursor-pointer rounded-lg p-4"
          >
          <PlusIcon /> New Trip
        </Button>} />
        </div>
        {trips ? trips.map((trip, index) => (
          <TripCard key={index} trip={trip} mode={mode} onDelete={setDeleteId} />
        )) : null}

        <Pager
          current={page ?? 1}
          size={tripItemsPerPage}
          total={totalItems}
          onPageChange={(page) => handlePageChange(page)}
        />
        <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
              <AlertDialogDescription className="flex flex-col gap-4" render={<div />}>
                <div>This action cannot be undone. Are you sure you want to delete this specific trip?</div>
                <div>
                  <Badge variant="outline" className="inline-flex gap-2 capitalize p-3 font-mono rounded-sm">
                    <KeySquareIcon /><span>{deleteId}</span>
                  </Badge>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer"><XIcon /> Cancel</AlertDialogCancel>
              <AlertDialogAction className="cursor-pointer" onClick={handleConfirmDelete}>
                <CheckIcon /> Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
    : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {trips.map((trip, index) => (
        <TripCard key={index} trip={trip} mode={mode} />
      ))}
    </div>
}

export { TripView };
