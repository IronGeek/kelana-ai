"use client"

import { useFormContext, Controller } from 'react-hook-form';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';

import type { ReactNode } from 'react';

interface InputGroupNumberProps {
  name: string
  label: string
  description?: string
  placeholder?: string
  icon?: ReactNode
  min?: number
  max?: number
  step?: number
}

const InputGroupNumber = ({
  name,
  label,
  description,
  placeholder,
  icon,
  min = Number.MIN_VALUE,
  max = Number.MAX_VALUE,
  step = 1
}: InputGroupNumberProps) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext()
  const currentValue = watch(name) ?? min

  const increment = () => {
    if (currentValue < max) {
      setValue(name, currentValue + step, { shouldValidate: true })
    }
  }

  const decrement = () => {
    if (currentValue > min) {
      setValue(name, currentValue - step, { shouldValidate: true })
    }
  }

  return (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel>{label}</FieldLabel>
      <FieldDescription className="italic">{description}</FieldDescription>
      <InputGroup className="bg-white/5 border-white/10 text-white transition-all duration-200 hover:border-white/30 focus-within:ring-2 focus-within:ring-white/40">
        {icon && (
          <InputGroupAddon align="inline-start" className="px-3 text-zinc-400">
            {icon}
          </InputGroupAddon>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <InputGroupInput
              className={cn(
                "bg-transparent border-0 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0",
                "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
              )}
              type="number"
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              value={field.value ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                if (!isNaN(val)) field.onChange(val)
              }}
            />
          )}
        />

        <InputGroupAddon align="inline-end" className="flex items-center gap-1 pr-2">
          <button
            type="button"
            onClick={decrement}
            disabled={currentValue <= min}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-white"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={increment}
            disabled={currentValue >= max}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-white"
          >
            <Plus className="h-3 w-3" />
          </button>
        </InputGroupAddon>

      </InputGroup>
      <FieldError className="text-red-400">
        {errors[name]?.message as string}
      </FieldError>
    </Field>
  )
}

export { InputGroupNumber };
export type { InputGroupNumberProps };
