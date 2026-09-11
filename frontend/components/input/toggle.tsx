"use client"

import { useFormContext, Controller } from 'react-hook-form';
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
  PersonStandingIcon,
  PizzaIcon,
  SparklesIcon,
  SportShoeIcon,
  StarIcon,
  TentTreeIcon,
  TicketPercentIcon,
  UserPlusIcon,
  UsersIcon,
  UtensilsIcon,
  VolleyballIcon,
  WalletIcon,
} from 'lucide-react';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import type { ReactNode } from 'react';

interface InputGroupToggleProps {
  name: string
  label: string
  description?: string
  values?: readonly string[]
}

const stylesIcons: Record<string, ReactNode> = {
  'backpacker': <BackpackIcon />,
  'budget': <HandCoinsIcon />,
  'cheap': <TicketPercentIcon />,
  'low-cost': <WalletIcon />,
  'luxury': <HandbagIcon />,
  'premium': <GemIcon />,
  'high-end': <ChessQueenIcon />,
  'five-star': <StarIcon />,
  'family': <UsersIcon />,
  'adult': <UserPlusIcon />,
  'children': <BabyIcon />,
  'kids': <BalloonIcon />,
  'couple': <HeartHandshakeIcon />,
  'foodie': <CoffeeIcon />,
  'culinary': <UtensilsIcon />,
  'restaurant': <ChefHatIcon />,
  'eat': <PizzaIcon />,
  'adventure': <BinocularsIcon />,
  'hiking': <MountainSnowIcon />,
  'outdoor': <TentTreeIcon />,
  'active': <SportShoeIcon />,
};

const InputGroupToggle = ({
  name,
  label,
  description,
  values = []
}: InputGroupToggleProps) => {
  const { control, formState: { errors } } = useFormContext()

  return (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel className="font-bold">{label}</FieldLabel>
      <FieldDescription className="italic">{description}</FieldDescription>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <ToggleGroup
            className="flex flex-wrap gap-2 max-w justify-start"
            variant="outline"
            spacing={2}
            multiple={true}
            value={field.value ?? []}
            onValueChange={(val) => {
              field.onChange(val);
            }}
          >
            {values.map((val) => (
              <ToggleGroupItem
                key={val}
                value={val}
                aria-label={val}
                className="data-[pressed]:bg-primary data-[pressed]:text-primary-foreground cursor-pointer"
              >
                {stylesIcons[val]} <span className="leading-none capitalize">{val}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      />
      <FieldError className="text-red-400">
        {errors[name]?.message as string}
      </FieldError>
    </Field>
  )
}

export { InputGroupToggle };
export type { InputGroupToggleProps };
