'use client';

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { CalendarClockIcon, DollarSignIcon, MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import { InputGroupText } from "@/components/input/text";
import { Spinner } from "@/components/ui/spinner";

import type { ComponentProps } from "react"
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import { UserProfile } from "@/types/trip";
import { generateTrip, travelStyles } from "@/services/trip-service";
import { toast } from "@/components/ui/toast";
import { InputGroupNumber } from "@/components/input/number";
import { InputGroupToggle } from "@/components//input/toggle";

interface NewTripDialogProps extends ComponentProps<typeof Dialog> {
  trigger: ComponentProps<typeof DialogTrigger>["render"];
}

const travelFormSchema = z.object({
  destination: z.string().nonempty("Destination is required"),
  budget: z
    .number({ error: "Budget must be number" })
    .min(1, { error: "Budget must be greater than 0" }),
  days: z
    .number({ error: "Jumlah must be number" })
    .min(1, { error: "Minimim travel duration is 1 day" }),
  styles: z.array(z.enum(travelStyles, { error: "Pick a travel style" })),
})

type TravelFormValues = z.infer<typeof travelFormSchema>
interface NewTripDialogProps extends ComponentProps<typeof Dialog> {
  profile?: UserProfile
  nativeButton?: boolean
}

const NewTripDialog = ({ trigger, nativeButton, ...props }: NewTripDialogProps) => {
  const methods = useForm({
      resolver: zodResolver(travelFormSchema),
      mode: "onTouched",
      defaultValues: {
        destination: '',
        budget: 1000,
        days: 1,
        styles: [],
      },
    });

  const { handleSubmit, formState: { isSubmitting } } = methods;
  const onSubmit = async (request: TravelFormValues) => {
      let tripId = null;
      try {
        const { success, data } = await generateTrip(request);

        if (!success) {
          toast.add({
            type: "error",
            title: "Error",
            description: 'Cannot generate plan, please try again later.',
          });
        } else if (data) {

          toast.add({
            type: "success",
            title: "New Travel Plan",
            description: `Travel plan for ${data.destination} created at ${new Date().toLocaleString()}`,
          });

          tripId = data.id;
        }
      } catch (error) {
        if (isRedirectError(error)) throw error;

        toast.add({
          type: "error",
          description: `Failed creating travel plan: ${error}`,
          priority: "high",
        });
      }

      if (tripId) { redirect(`/trips/details/${tripId}`); }
    };

  return (
    <Dialog {...props}>
      <DialogTrigger nativeButton={nativeButton} render={trigger} />
      <DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
        <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet className="gap-6" disabled={isSubmitting}>
            <DialogHeader className="gap-0">
              <DialogTitle className="text-xl">New Trip</DialogTitle>
              <DialogDescription>
                Plan your next travel
              </DialogDescription>
            </DialogHeader>
            <InputGroupText
                name="destination"
                label="Destination"
                description="Your destination country/ city"
                placeholder="e.g. Japan"
                icon={<MapPinIcon className="h-4 w-4" />}
              />
            <FieldGroup className="grid grid-cols-2 gap-4">
              <InputGroupNumber
                name="budget"
                label="Budget (USD)"
                description="The travel budget"
                placeholder="e.g. 2000"
                icon={<DollarSignIcon className="h-4 w-4" />}
                min={0}
                step={10}
              />
              <InputGroupNumber
                name="days"
                label="Duration (days)"
                description="The travel duration"
                placeholder="e.g. 5"
                icon={<CalendarClockIcon className="h-4 w-4" />}
                min={0}
              />
            </FieldGroup>
            <InputGroupToggle
              name="styles"
              label="Travel Style"
              description="How would you describe this trip"
              values={travelStyles}
            />
            <DialogFooter>
              <DialogClose className="cursor-pointer" disabled={isSubmitting} render={<Button variant="outline">Cancel</Button>} />
              <Button className="cursor-pointer" type="submit" disabled={isSubmitting} >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null }
                <span>{isSubmitting ? 'Creating' : 'Create'}</span>
              </Button>
            </DialogFooter>
          </FieldSet>
        </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export { NewTripDialog }
