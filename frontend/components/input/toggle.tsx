"use client"

import { useFormContext, Controller } from 'react-hook-form';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import type { ReactNode } from 'react';

interface InputGroupToggleProps {
  name: string
  label: string
  description?: string
  values?: readonly { value: string, icon: ReactNode }[]
}

const InputGroupToggle = ({
  name,
  label,
  description,
  values = []
}: InputGroupToggleProps) => {
  const { control, formState: { errors } } = useFormContext()

  return (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel>{label}</FieldLabel>
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
            {values.map((o) => (
              <ToggleGroupItem
                key={o.value}
                value={o.value}
                aria-label={o.value}
                className="data-[pressed]:bg-primary data-[pressed]:text-primary-foreground cursor-pointer"
              >
                {o.icon} <span className="leading-none capitalize">{o.value}</span>
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
