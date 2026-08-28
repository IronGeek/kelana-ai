"use client"

import {
  BabyIcon,
  BackpackIcon,
  BalloonIcon,
  BinocularsIcon,
  CalendarClockIcon,
  ChefHatIcon,
  ChessQueenIcon,
  CoffeeIcon,
  DollarSignIcon,
  GemIcon,
  HandbagIcon,
  HandCoinsIcon,
  HeartHandshakeIcon,
  MapPinIcon,
  MountainSnowIcon,
  PizzaIcon,
  SparklesIcon,
  SportShoeIcon,
  StarIcon,
  TentTreeIcon,
  TicketPercentIcon,
  UsersIcon,
  UtensilsIcon,
  VolleyballIcon,
  WalletIcon,
} from 'lucide-react';
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from '@/components/ui/field';
import { Spinner } from "@/components/ui/spinner"

import { Separator } from '@/components/ui/separator';
import { toast } from "@/components/ui/toast"
import { InputGroupNumber } from '@/components/input/number';
import { InputGroupText } from '@/components/input/text';
import { InputGroupToggle } from '@/components/input/toggle';
import { Trip } from '@/types/trip';

const travelStyles = [
  { value: 'backpacker', icon: <BackpackIcon /> },
  { value: 'budget', icon: <HandCoinsIcon /> },
  { value: 'cheap', icon: <TicketPercentIcon /> },
  { value: 'low-cost', icon: <WalletIcon /> },
  { value: 'luxury', icon: <HandbagIcon /> },
  { value: 'premium', icon: <GemIcon /> },
  { value: 'high-end', icon: <ChessQueenIcon /> },
  { value: 'five-star', icon: <StarIcon /> },
  { value: 'family', icon: <UsersIcon /> },
  { value: 'children', icon: <BabyIcon /> },
  { value: 'kids', icon: <BalloonIcon /> },
  { value: 'couple', icon: <HeartHandshakeIcon /> },
  { value: 'foodie', icon: <CoffeeIcon /> },
  { value: 'culinary', icon: <UtensilsIcon /> },
  { value: 'restaurant', icon: <ChefHatIcon /> },
  { value: 'eat', icon: <PizzaIcon /> },
  { value: 'adventure', icon: <BinocularsIcon /> },
  { value: 'hiking', icon: <MountainSnowIcon /> },
  { value: 'outdoor', icon: <TentTreeIcon /> },
  { value: 'active', icon: <SportShoeIcon /> },
];

const travelFormSchema = z.object({
  destination: z.string().nonempty("Destination is required"),
  budget: z
    .number({ error: "Budget must be number" })
    .min(1, { error: "Budget must be greater than 0" }),
  days: z
    .number({ error: "Jumlah must be number" })
    .min(1, { error: "Minimim travel duration is 1 day" }),
  travel_style: z.array(z.enum(travelStyles.map((o) => o.value) as string[], { error: "Pick a travel style" })),
})

type TravelFormValues = z.infer<typeof travelFormSchema>
interface TravelFormProps {
  onTrip: (trip: Trip | null) => void
}

const TravelForm = ({ onTrip }: TravelFormProps) => {
  const methods = useForm({
    resolver: zodResolver(travelFormSchema),
    mode: "onTouched",
    defaultValues: {
      destination: '',
      budget: 0,
      days: 1,
      travel_style: [],
    },
  });
  const { handleSubmit, formState: { isSubmitting } } = methods;
  const onSubmit = async (data: TravelFormValues) => {
    try {
      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_URL}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        toast.add({
          type: "error",
          title: "Error",
          description: 'Cannot generate plan, please try again later.',
        });
      } else {
        onTrip(await response.json() as Trip);

        toast.add({
          type: "success",
          title: "New Travel Plan",
          description: `Travel plan for ${data.destination} created at ${new Date().toLocaleString()}`,
        });
      }
    } catch (error) {
      toast.add({
        type: "error",
        description: "Failed creating travel plan.",
        priority: "high",
      });
      onTrip(null);
    }
  };

  return (
    <>
      <Card className="w-full shadow-2xl border-white/10 bg-black/50  text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:shadow-black/60">
        <CardHeader className="text-center">
          <CardTitle className="flex justify-center items-center gap-2 text-4xl"><VolleyballIcon className="w-8 h-8" /><span className="font-logo">KelanaAI</span></CardTitle>
          <CardDescription className="text-xl">
            Your AI-powered Travel Assistant
          </CardDescription>
        </CardHeader>
        <CardContent >
          <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldSet disabled={isSubmitting}>
              <InputGroupText
                name="destination"
                label="Destination"
                description="Your destination country/ city"
                placeholder="e.g. Japan"
                icon = {<MapPinIcon className="h-4 w-4" />}
              />
              <FieldGroup className="grid grid-cols-2 gap-4">
                <InputGroupNumber
                  name="budget"
                  label="Budget (USD)"
                  description="The travel budget"
                  placeholder="e.g. 2000"
                  icon = {<DollarSignIcon className="h-4 w-4" />}
                  min={0}
                  step={10}
                />
                <InputGroupNumber
                  name="days"
                  label="Duration (days)"
                  description="The travel duration"
                  placeholder="e.g. 5"
                  icon = {<CalendarClockIcon className="h-4 w-4" />}
                  min={0}
                />
              </FieldGroup>
              <InputGroupToggle
                name="travel_style"
                label="Travel Style"
                description="How would you describe this trip"
                values={travelStyles}
              />
              <Separator className="my-2" />
              <Field className="pb-2">
                <Button className="w-full h-10 font-semibold bg-white text-black hover:bg-zinc-100 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] active:scale-[0.98] py-6 cursor-pointer" type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner data-icon="inline-start" /> : <SparklesIcon data-icon="inline-start" />}
                  {isSubmitting ? "Processing..." : "Generate Plan"}
                </Button>
                <Button onClick={() => onSubmit({ destination: 'Japan', budget: 2000, days: 5, travel_style: [] })}>
                  Test
                </Button>
                <FieldDescription className="text-center">
                  Having trouble? <a href="#">Contact support</a>
                </FieldDescription>
              </Field>
            </FieldSet>
          </form>
          </FormProvider>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 py-2 text-center">
        Powered by <a className="font-bold" href="https://aws.amazon.com/bedrock/" target="_blank">Amazon Bedrock</a>{" "}
      </FieldDescription>
    </>
  )
}

export { TravelForm };
