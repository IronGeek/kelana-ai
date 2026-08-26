import { Ref } from "react";
import { Trip } from "@/types/trip";

interface TripDetailProps {
  trip: Trip
  ref?: Ref<HTMLDivElement>
}

const TripDetail = ({ trip, ref }: TripDetailProps) => {
  return (
    <div ref={ref} className="w-full bottom-0 bg-background pt-4">
      <div className="mx-auto w-full max-w-screen-2xl divide-y space-y-4 rounded-tl-lg rounded-tr-lg p-4">
        <div className="text-2xl">AI Recommendation</div>
        <div className="flex flex-col items-center justify-between gap-4 pb-2 sm:flex-row font-bold">
          <div>Destination: {trip.destination}</div>
          <div>Budget: USD {trip.budget}</div>
        </div>
        <div className="w-full max-w-screen-2xl">
          <pre>
            <code className="whitespace-pre-wrap">
              {trip.recommendation}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export { TripDetail };
export type { TripDetailProps };
