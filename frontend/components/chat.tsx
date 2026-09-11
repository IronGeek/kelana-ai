"use client";

import { startTransition, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { BanIcon, BotMessageSquareIcon, CheckCheckIcon, CheckIcon, ChevronRightIcon, CopyIcon, ExternalLinkIcon, KeySquareIcon, PencilIcon, SparkleIcon, Strikethrough, TagIcon, Trash2Icon, VerifiedIcon, WandSparklesIcon, XIcon } from "lucide-react"

import { cn, countTokens, delay, formatDate } from "@/lib/utils";
import { deleteConversation, getConversationStatus, sendMessage } from '@/services/chat-service';

import {
  Field,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerProvider, MessageScrollerViewport } from "@/components/ui/message-scroller";
import { MessageAnimated } from "@/components/message-animated";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from '@/components/ui/message';
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from '@/components/ui/select';
import { MarkdownView } from '@/components/markdown';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components//ui/item';
import { Separator } from '@/components/ui/separator';
import { NewChatDialog } from '@/components/dialog/new-chat';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ButtonGroup } from '@/components/ui/button-group';
import { EditChatDialog } from '@/components/dialog/edit-chat';

import type { KeyboardEvent, SubmitEvent } from "react";
import type { ChatMessage, ChatResponse, ChatSource, ChatUserMessage, Conversation } from '@/types/chat';
import { simulateTyping } from '@/lib/message';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from './ui/badge';
import { shortid } from '@/lib/short-uuid';


interface ChatProps {
  className?: string
  conversation?: Conversation
}

function sendMessageMock<T extends ChatMessage>(
  conversationId: string,
  message: T,
  _withKb: boolean = false
): Promise<ChatResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Boolean(Math.floor(Math.random() * 2));

      if (success) {
        resolve({
          success: true,
          data: { ...message, conversation_id: conversationId, created_at: new Date().toISOString() }
        });
      } else {
        resolve({
          success: false,
          error: 'timeout'
        });
      }
    }, 1000);
  })
};

const poolStatus = async (id: string) => {
  const { success, data } = await getConversationStatus(id);
  if (success && data?.pending) {
    await delay(500);

    return poolStatus(id);
  }

  return { success, data };
};

const Chat = ({ className, conversation }: ChatProps) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const [withKB, setWithKB] = useState(false)
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(conversation?.messages ?? []);

  const waitResponse = async () => {
    if (!conversation?.id) { return; }

    const aiMessageId = shortid();
    setMessages((prev) => [
      ...prev, {
        id: aiMessageId,
        role: "assistant",
        content: ""
      }]);

    const statusId = shortid();
    setMessages((prev) => [
      ...prev, {
        id: statusId,
        role: "status",
        Icon: Spinner,
        content: "Thinking"
      }]);

    try {
      const { success, data } = await poolStatus(conversation.id);
      if (success && !data?.pending) {

        console.log('waitResponse typing', data);
        await simulateTyping(data?.content || '', (content) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content } : msg
            )
          );
        })

        console.log('waitResponse done');
        setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? {
          ...msg,
          created_at: data?.created_at,
          sources: [] as ChatSource[]
        } : msg));
      }
    } catch (err) {
      console.log('waitResponse catch', err)
      setMessages((prev) => prev.map((msg) => msg.id !== aiMessageId ? {
        ...msg,
        error: (err as Error).toString(),
      } : msg));
    } finally {
      console.log('waitResponse finaly')
      setMessages((prev) => prev.filter((msg) => msg.id !== statusId));
    }
  };

  const sendQuestion = async (conversationId: string, question: string, withKB: boolean) => {
    const questionId = shortid();
    try {
      const message: ChatMessage = {
        id: questionId,
        role: 'user',
        content: question
      };

      setMessages((prev) => ([...prev, message]));
      setQuestion('');

      const response = await sendMessage(conversationId, message, withKB);

      if (response?.success) {
        const data = response.data as ChatUserMessage;
        setMessages((prev) => prev.map((msg) => msg.id === data.id ? {
          ...msg,
          created_at: data.created_at
        } : msg));

        await waitResponse();
      } else {
        setMessages((prev) => prev.map((msg) => msg.id === questionId ? {
          ...msg,
          error: response.error,
          created_at: new Date().toISOString()
        } : msg));
      }
    }
    catch (err) {
      setMessages((prev) => prev.map((msg) => msg.id === questionId ? {
        ...msg,
        error: (err as Error).message
      } : msg));
      console.error(err);
    }
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!conversation?.id) { return; }

    setLoading(true);
    sendQuestion(conversation.id, question, withKB)
      .finally(() => {
        setLoading(false);
        requestAnimationFrame(() => { inputRef.current?.focus(); });
      });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()

      formRef.current?.requestSubmit()
    }
  }

  const handleCopy = async (messageId: string, textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedMessageId(messageId)

      // Kembalikan ikon menjadi bentuk semula setelah 2 detik
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    } catch (err) {
      console.error("Gagal menyalin teks: ", err)
    }
  };

  const handleDelete = () => {
    if (conversation?.id) {
      deleteConversation(conversation.id).then(({ success }) => {
        if (success) {
          startTransition(() => { router.replace('/chat'); });
        }
      }).finally(() => {
        setDeleting(false);
        setLoading(false);
      })
    }
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      if (conversation?.id) {
        inputRef.current?.focus();
      }
    });

  }, []);

  return (
    <Card className={cn("w-full gap-0 p-0", className)} size="sm">
      <CardHeader className={cn("items-center border-b !p-2 !px-4", {
        "grid-rows-1!": !(conversation && conversation.id)
      })}>
        {conversation
          ? <Collapsible className="group/collapsible">
            <CardTitle className="w-fit flex items-center gap-2 font-bold">
              <ButtonGroup>
                <EditChatDialog conversation={conversation} trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer items-center">
                    <PencilIcon /> <Separator orientation="vertical" /> {conversation?.title ?? 'Untitled'}
                  </Button>} />
                <CollapsibleTrigger render={
                  <Button type="button" variant="outline" className="cursor-pointer items-center">
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                  </Button>
                } />
              </ButtonGroup>
            </CardTitle>
            <CollapsibleContent>
              {conversation && conversation.id
                ? <CardDescription className="flex text-xs mt-4 divide-x gap-2">
                  <span className="inline-flex gap-2 items-center pr-2"><TagIcon className="w-4 h-4" /> Created {formatDate(conversation.created_at)}</span>
                  <span className="inline-flex gap-2 items-center pr-2"><TagIcon className="w-4 h-4" /> Updated {formatDate(conversation.updated_at)}</span>
                </CardDescription>
                : null}
            </CollapsibleContent>
          </Collapsible>
          : <>&nbsp;</>}
        <CardAction>
          <AlertDialog open={deleting} onOpenChange={setDeleting}>
            <AlertDialogTrigger render={
              <Button
                variant="destructive"
                className="cursor-pointer"
                disabled={loading}
              >
                <Trash2Icon /> Delete
              </Button>
            }/>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Thread?</AlertDialogTitle>
                <AlertDialogDescription className="flex flex-col gap-4" render={<div />}>
                  <div>This action cannot be undone. Are you sure you want to delete this specific thread?</div>
                  <div>
                    <Badge variant="outline" className="inline-flex gap-2 capitalize p-3 font-mono rounded-sm">
                      <KeySquareIcon /><span>{conversation?.id}</span>
                    </Badge>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer" disabled={loading}><XIcon /> Cancel</AlertDialogCancel>
                <AlertDialogAction className="cursor-pointer" disabled={loading} onClick={handleDelete}>
                  <CheckIcon /> Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardAction>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden px-0 border-b">
        {!conversation || messages.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader className="max-w-xl">
              <EmptyMedia>
                <BotMessageSquareIcon size="64" />
              </EmptyMedia>
              <EmptyTitle className="font-bold">No messages yet</EmptyTitle>
              <EmptyDescription>
                <p className="mb-4">Hi, I'm your <strong>KelanaAI</strong> Travel Assistant!</p>
                {!conversation
                  ? <NewChatDialog trigger={
                    <Button
                      size="lg"
                      className="cursor-pointer"
                      disabled={loading}
                    >
                      <SparkleIcon /> New Conversation
                    </Button>} />
                  : null}
                {conversation && messages.length === 0
                  ? <p>Send the first message to get the thread started.</p>
                  : null}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <MessageScrollerProvider scrollPreviousItemPeek={100} autoScroll={true}>
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent className="p-(--card-spacing)">
                  {messages.map((message, i) => {
                    const isAiStreamingThisMessage = i === messages.length - 2
                      && message.role === "assistant"
                      && loading;
                    const isAiFinishedMessage = message.role === "assistant" && !isAiStreamingThisMessage;
                    const isMessageCompleted = isAiFinishedMessage || (message.role === 'user' && message.created_at)

                    return (
                      <MessageAnimated
                        key={message.id}
                        scrollAnchor={message.role === 'user'}
                        isStreaming={isAiStreamingThisMessage}
                        layout
                      >
                        {message.role === 'separator' || message.role === 'status'
                          ? <Marker variant="separator" role={message.role}>
                            {'Icon' in message && message.Icon ? <MarkerIcon><message.Icon /></MarkerIcon> : null}
                            {message.content ? <MarkerContent>{message.content}</MarkerContent> : null}
                          </Marker>
                          : (<>
                            <Message align={message.role === "user" ? "end" : "start"} className="group relative">
                              <MessageAvatar className={cn("self-end overflow-visible", {
                                'mb-2': message.role === 'assistant' && !(message.sources && message.sources.length > 0),
                                'mb-20': message.role === 'assistant' && (message.sources && message.sources.length > 0)
                              })}>
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={message.role === "user" ? "/avatars/user.webp" : "/avatars/assistant.webp"} />
                                  <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                                  <AvatarBadge className={message.role === "user" ? "bg-green-600 dark:bg-green-800" : "bg-blue-600 dark:bg-blue-800"}>
                                    {message.role === 'assistant' ? <VerifiedIcon /> : null}
                                  </AvatarBadge>
                                </Avatar>
                              </MessageAvatar>
                              <MessageContent className="relative group gap-1">
                                <MessageHeader className="text-xs text-zinc-500 dark:text-zinc-400 font-bold hidden">
                                  {message.role === "user" ? "Anda" : "KelanaAI"}
                                </MessageHeader>
                                <Bubble
                                  variant={message.role === "user" ? "muted" : "ghost"}
                                  className="max-w-[92.25%] md:max-w-[94.5%] lg:max-w-[96%] xl:max-w-[97%]"
                                >
                                  <BubbleContent className={
                                    cn("inline-block w-full break-words !border-transparent group-hover:!border-border rounded-none", {
                                      'rounded-l-lg rounded-tr-lg': message.role === 'user',
                                      '!rounded-r-lg !rounded-tl-lg !p-2 border-dashed': message.role === 'assistant',
                                      'line-through text-muted-foreground': message.error
                                    })}>
                                    <div className="whitespace-pre-wrap leading-relaxed inline">
                                      <MarkdownView>{isAiStreamingThisMessage && message.content === '' ? '\u00a0' : (message.content || '')}</MarkdownView>
                                      {isAiStreamingThisMessage && (
                                        <span
                                          className="inline-block w-[1px] h-[1rem] ml-0 bg-blue-500 translate-y-[2px] animate-blink"
                                          aria-hidden="true"
                                          style={{
                                            marginLeft: message.content.endsWith("\n")
                                              ? "0px"
                                              : message.content?.endsWith(" ")
                                                ? '0.45em'
                                                : '1px',
                                            // Gunakan transisi super cepat agar lompatannya terasa tegas dan tidak lembek
                                            transition: "margin-left 0.03s steps(1)"
                                          }}
                                        />
                                      )}
                                    </div>
                                  </BubbleContent>
                                </Bubble>
                                <MessageFooter className="flex items-center gap-0 px-0 py-1 divide-x divide-dotted text-xs text-muted-foreground isolate opacity-50 group-hover:opacity-100 transitions-all duration-150">
                                  <div>
                                    {isMessageCompleted && (<Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => handleCopy(message.id, message.content)}
                                      className="hover:bg-background mr-1 pointer-events-auto cursor-pointer"
                                      title="Copy text"
                                    >
                                      {copiedMessageId === message.id ? (
                                        <>
                                          <CheckIcon className="h-4! w-4!" />
                                          <span className="font-medium">Copied!</span>
                                        </>
                                      ) :
                                        <CopyIcon className="h-4! w-4!" />
                                      }
                                    </Button>
                                    )}
                                  </div>
                                  <div className={
                                    cn("flex items-center h-full gap-2 font-mono text-xs not-first:ml-2", {
                                      'text-red-800': !!message.error
                                    })}>
                                    <span>{message.error ? <XIcon className="text-red-800 h-4 w-4" /> : message.created_at ? <CheckCheckIcon className="text-green-800 h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}</span>
                                    {message.created_at ? <span>{formatDate(message.created_at)}</span> : message.id}
                                  </div>
                                </MessageFooter>
                                {'sources' in message && message.sources && message.sources.length > 0
                                  ? <MessageFooter className="flex flex-wrap items-center gap-2 px-0 py-1 max-w-[95%]">
                                    <Separator className="my-4" />
                                    {message.sources.toSorted((a, b) => b.score - a.score).map((source) => (
                                      <Item
                                        key={source.document_id}
                                        variant="outline"
                                        className="w-fit"
                                        render={
                                          <Link href={source.location ?? '#'} target="_blank" rel="noopener noreferrer">
                                            <ItemContent>
                                              <ItemTitle>{source.title} (score: {source.score.toFixed(2)})</ItemTitle>
                                              <ItemDescription>
                                                {source.document_id}
                                              </ItemDescription>
                                            </ItemContent>
                                            <ItemActions>
                                              <ExternalLinkIcon className="size-4" />
                                            </ItemActions>
                                          </Link>}
                                      />
                                    ))}
                                  </MessageFooter>
                                  : null}
                              </MessageContent>
                            </Message>
                          </>)
                        }
                      </MessageAnimated>
                    )
                  }
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </CardContent>
      <CardFooter className="p-0">
        <form ref={formRef} onSubmit={handleSubmit} className="sticky bottom-0 w-full p-2">
          <FieldSet disabled={!conversation?.id}>
            <FieldGroup>
              <Field>
                <InputGroup className="has-[:disabled]:opacity-100! has-[:disabled]:bg-background! h-auto">
                  <InputGroupTextarea
                    className="min-h-auto"
                    ref={inputRef}
                    id="block-end-textarea"
                    placeholder="Ask anything..."
                    value={question}
                    disabled={loading}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <InputGroupAddon align="block-end">
                    <div className="flex gap-1 items-center">
                      <InputGroupText className="gap-1">
                        Token count: <strong>{countTokens(question)}</strong>
                      </InputGroupText>
                    </div>
                    <div className="flex gap-1 ml-auto items-center">
                      <Select
                        value={String(withKB)}
                        onValueChange={(val) => { setWithKB(val === 'true') }}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full max-w-48">
                          {/* <SelectTrigger className="h-7 border-0 bg-transparent shadow-none focus:ring-0"> */}
                          {withKB ? <><CheckIcon /> Knowledge Base</> : <><BanIcon /> Knowledge Base</>}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="true">Use KB</SelectItem>
                            <SelectItem value="false">Without KB</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <InputGroupButton
                        variant="default"
                        size="sm"
                        className="cursor-pointer"
                        type="submit"
                        disabled={loading || !question.trim()}
                      >
                        {loading ? <Spinner data-icon="inline-start" /> : <WandSparklesIcon data-icon="inline-start" />}
                        {loading ? 'Thinking...' : 'Send'}
                      </InputGroupButton>
                    </div>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardFooter>
    </Card>
  )
}

export { Chat }
export type { ChatProps };
