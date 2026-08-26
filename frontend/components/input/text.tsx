"use client"

import { useFormContext, Controller } from 'react-hook-form';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'

import type { ReactNode } from 'react';

interface InputGroupTextProps {
  name: string
  label: string
  description?: string
  placeholder?: string
  icon?: ReactNode
}

const InputGroupText = ({
  name,
  label,
  description,
  placeholder,
  icon
}: InputGroupTextProps) => {
  const { control, formState: { errors } } = useFormContext()

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
              className="bg-transparent border-0 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              type="text"
              placeholder={placeholder}
              {...field}
            />
          )}
        />
      </InputGroup>
      <FieldError className="text-red-400">
        {errors[name]?.message as string}
      </FieldError>
    </Field>
  )
}

export { InputGroupText };
export type { InputGroupTextProps };
