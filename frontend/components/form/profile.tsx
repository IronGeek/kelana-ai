'use client';

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { UserProfile } from "@/types/trip"
import { Separator } from "../ui/separator"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  profile: UserProfile
}

const ProfileForm = ({ profile }: ProfileFormProps) => {
  const router = useRouter();

  return (
    <form className="px-4 max-w-lg">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="form-email">Email</FieldLabel>
          <Input id="form-email" type="email" defaultValue={profile.email} readOnly={true} />
          <FieldDescription>
            We&apos;ll never share your email with anyone.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="form-name">Name</FieldLabel>
          <Input
            id="form-name"
            type="text"
            defaultValue={profile.name ?? null}
            required
          />
          <FieldDescription>
            This is not your username.
          </FieldDescription>
        </Field>
        <Field>
          <Separator />
        </Field>
        <Field orientation="horizontal">
          <Button type="button" className="cursor-pointer" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">Update</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export { ProfileForm };
export type { ProfileFormProps }
