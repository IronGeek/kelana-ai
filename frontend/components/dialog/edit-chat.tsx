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
import { updateConversation } from "@/services/chat-service";
import { useRouter } from "next/navigation";

interface EditChatDialogProps extends ComponentProps<typeof Dialog> {
  conversation: Conversation
  trigger: ComponentProps<typeof DialogTrigger>["render"];
}

const EditChatDialog = ({ conversation, trigger, ...props }: EditChatDialogProps) => {
  const router = useRouter();
  const [title, setTitle] = useState<string>(conversation.title ?? '')
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    updateConversation(conversation.id, title)
      .then((response) => {
        if (response) {
          startTransition(() => {
            router.refresh();
            setIsOpen(false);
          });
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} {...props}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm" showCloseButton={!submitting}>
        <form onSubmit={handleSubmit}>
          <FieldSet disabled={isPending || submitting}>
            <DialogHeader>
              <DialogTitle>Edit Conversation</DialogTitle>
              <DialogDescription className="text-xs">
                Update the title for the conversation
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label>Title</Label>
                <Input
                  name="title"
                  placeholder="Untitled"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value) }}
                  disabled={submitting} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose className="cursor-pointer" disabled={submitting} render={<Button variant="outline">Cancel</Button>} />
              <Button className="cursor-pointer" type="submit" disabled={submitting} >
                {submitting ? <Spinner data-icon="inline-start" /> : null}
                <span>{submitting ? 'Updating' : 'Update'}</span>
              </Button>
            </DialogFooter>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { EditChatDialog }
