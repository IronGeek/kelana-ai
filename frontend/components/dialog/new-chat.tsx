'use client';

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
import { Field, FieldGroup, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState, useTransition, type ComponentProps, type SubmitEvent } from "react"
import { Spinner } from "../ui/spinner";
import { createConversation } from "@/services/chat-service";
import { useRouter } from "next/navigation";

interface NewChatDialogProps extends ComponentProps<typeof Dialog> {
  trigger: ComponentProps<typeof DialogTrigger>["render"];
}

const NewChatDialog = ({ trigger, ...props }: NewChatDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString();

    setSubmitting(true);

    createConversation(title)
      .then((response) => {
        const newId = response?.id
        if (newId) {
          startTransition(() => {
            router.push(`/chat/${newId}`);
          });
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Dialog {...props}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm" showCloseButton={!submitting}>
        <form onSubmit={handleSubmit}>
          <FieldSet disabled={isPending || submitting}>
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
              <DialogDescription className="text-xs">
                Set the title for the new conversation
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label>Title</Label>
                <Input name="title" defaultValue="" disabled={submitting} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose className="cursor-pointer" disabled={submitting} render={<Button variant="outline">Cancel</Button>} />
              <Button className="cursor-pointer" type="submit" disabled={submitting} >
                {submitting ? <Spinner data-icon="inline-start" /> : null}
                <span>{submitting ? 'Creating' : 'Create'}</span>
              </Button>
            </DialogFooter>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { NewChatDialog }
