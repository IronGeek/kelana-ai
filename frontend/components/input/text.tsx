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
      <FieldLabel className="font-bold">{label}</FieldLabel>
      <FieldDescription className="italic">{description}</FieldDescription>
      <InputGroup>
        {icon && (
          <InputGroupAddon align="inline-start" className="px-3">
            {icon}
          </InputGroupAddon>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <InputGroupInput
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
