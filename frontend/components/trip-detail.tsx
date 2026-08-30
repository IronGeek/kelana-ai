'use client';
import { Ref, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Markdown } from '@/components/markdown';
import { TripEmpty } from '@/components/trip-empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { Trip } from '@/types/trip';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { AppWindowIcon, CaseSensitiveIcon, ChevronLeftCircleIcon, CodeIcon, CodeXmlIcon, HashIcon, MonitorSmartphoneIcon, SignatureIcon } from 'lucide-react';
import { Button } from './ui/button';

interface TripDetailProps {
  trip: Trip
  ref?: Ref<HTMLDivElement>
}

const TripDetail = ({ trip, ref }: TripDetailProps) => {
  const router = useRouter();
  const [handwritten, setHandwritten] = useState(false)

  return (
    <>
      <div ref={ref} className="border shadow-lg rounded-md mb-4">
        <div className="flex items-center p-4">
          <div className="flex-1">
            <Link href="/trips">
              <Button
                className="cursor-pointer text-lg gap-2 text-muted-foreground hover:text-black"
                variant="link"
                onClick={router.back}>
                <ChevronLeftCircleIcon className="size-8" />
                <span className="sr-only">Prev</span>
                Back to Trips
              </Button>
            </Link>
          </div>
        </div>
        <Tabs defaultValue="html" >
          <div className="flex flex-col md:flex-row items-stretch justify-between bg-secondary gap-4 p-4">
            <div className="flex flex-col md:flex-row md:divide-x border-b-1 md:border-b-0 pb-4 md:pb-0 items-center gap-3">
              <dl className="inline-flex gap-2 justify-center divide-x">
                <div className="flex flex-col md:flex-row items-center md:items-baseline text-center gap-3 pr-4">
                  <dt className="text-xs uppercase">Destination</dt><dd className="font-bold">{trip.destination}</dd>
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-baseline text-center gap-3 pl-1 pr-4">
                  <dt className="text-xs uppercase">Budget</dt><dd className="font-bold">${trip.budget?.toFixed(2)}</dd>
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-baseline text-center gap-3 pl-1">
                  <dt className="text-xs uppercase">Category</dt><dd className="font-bold">{trip.category}</dd>
                </div>
              </dl>
            </div>
            <div className="flex items-center justify-center gap-3">
              <ToggleGroup
                variant="outline"
                className="inline-flex -space-x-px border-dotted rounded-md shadow-sm gap-0"
                defaultValue={["regular"]}
                onValueChange={(val) => {
                  const value = val && val[val.length - 1];
                  if (value) {
                    setHandwritten(value === 'handwritten');
                  }
                }}
                disabled={!trip.recommendation}
              >
                <ToggleGroupItem
                  className="rounded-r-none data-[pressed]:bg-background data-[pressed]:text-foreground cursor-pointer"
                  value="regular"
                  pressed={!handwritten}
                >
                  <CaseSensitiveIcon className="h-4 w-4" />
                </ToggleGroupItem>

                <ToggleGroupItem
                  className="rounded-r-md rounded-l-none data-[pressed]:bg-background data-[pressed]:text-foreground cursor-pointer"
                  value="handwritten"
                  pressed={handwritten}
                >
                  <SignatureIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <TabsList>
                <TabsTrigger className="cursor-pointer" value="html" disabled={!trip.recommendation}>
                  <MonitorSmartphoneIcon /> Display
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="markdown" disabled={!trip.recommendation}>
                  <CodeIcon /> Source
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <div className="p-8">
            {trip.recommendation
              ? (
                <>
                  <TabsContent value="html">
                    <Markdown.View
                      className="text-shadow-xs"
                      fontScale={handwritten ? 1.1250 : 1}
                      handwritten={handwritten}
                      transparent={true}
                    >
                      {trip.recommendation}
                    </Markdown.View>
                  </TabsContent>
                  <TabsContent value="markdown">
                    <Markdown.Text>
                      {trip.recommendation}
                    </Markdown.Text>
                  </TabsContent>
                </>
              )
              : <TripEmpty trip={trip} />
            }
          </div>
        </Tabs>
      </div>
      <div className="flex gap-4 divide-x px-4 text-xs justify-center text-muted-foreground">
        <code className="pr-4">ID {trip.id}</code>
        <code className="pr-4">CR {trip.created_at}</code>
        <code className="">UP {trip.updated_at}</code>
      </div>
    </>
  );
};

export { TripDetail };
export type { TripDetailProps };
