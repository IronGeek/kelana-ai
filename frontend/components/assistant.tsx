"use client";

import { useRef, useState } from 'react';
import { BanIcon, BotMessageSquareIcon, CheckIcon, CopyIcon, ExternalLinkIcon, SparkleIcon, VerifiedIcon, WandSparklesIcon } from "lucide-react"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { askQuestion } from "@/services/trip-service";
import { Spinner } from "./ui/spinner";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerProvider, MessageScrollerViewport } from "@/components/ui/message-scroller";
import { MessageAnimated } from "@/components/message-animated";
import { cn, countTokens, formatDate, uuidv7 } from "@/lib/utils";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from '@/components/ui/message';
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from '@/components/ui/select';
import { MarkdownView } from '@/components/markdown';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components//ui/item';
import { Separator } from '@/components/ui/separator';

import type { ComponentType, KeyboardEvent, SubmitEvent } from "react";
import Link from 'next/link';

interface Thread {
  id: string,
  messages: ChatMessage[]
}

type ChatSource = {
  title: string
  document_id: string
  location: string
  metadata: Record<string, string>
  score: number
};
type ChatMessage = {
  id: string
  role: "user" | "assistant" | "separator"
  content: string
  time: Date
  sources?: ChatSource[]
} | {
  id: string
  role: 'separator'
  content?: string
} | {
  id: string
  role: 'status'
  Icon: ComponentType,
  content?: string
};

interface AssistantProps {
  className?: string
  muted?: boolean
  thread?: Thread
}

const Assistant = ({ className, muted = true, thread }: AssistantProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const [withKB, setWithKB] = useState(false)
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(question, withKB);

    setLoading(true);
    setMessages((prev) => ([...prev, {
      id: uuidv7(),
      role: 'user',
      content: question,
      time: new Date()
    }]));
    setQuestion('');

    const aiMessageId = uuidv7()
    setMessages((prev) => [
      ...prev, {
        id: aiMessageId,
        role: "assistant",
        content: "",
        time: new Date()
      }]);

    const statusId = uuidv7();
    setMessages((prev) => [
      ...prev, {
        id: statusId,
        role: "status",
        Icon: Spinner,
        content: "Thinking"
      }]);

    askQuestion(question, withKB)
      .then((response) => {
        if (response.success) {
          const { answer, sources } = response.data;
          console.log(answer, sources);

          setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? {
            ...msg,
            content: answer,
            time: new Date(),
            sources: sources as unknown as ChatSource[]
          } : msg));
        }
      })
      .finally(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== statusId));
        setLoading(false);

        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
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

  const handleNewThread = () => {
    setMessages([]);
  }

  return (
    <Card className={cn("w-full gap-0 p-0", className)} size="sm">
      <CardHeader className="border-b !p-2 !px-4">
        <CardTitle className="flex items-center gap-2 font-bold">AI Assistant</CardTitle>
        <CardDescription>
          {thread ? <Badge className="font-mono">{thread.id}</Badge> : null}
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={loading}
            onClick={handleNewThread}
          >
            <SparkleIcon /> New Thread
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden px-0 border-b">
        {messages.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader className="max-w-xl">
              <EmptyMedia>
                <BotMessageSquareIcon size="64" />
              </EmptyMedia>
              <EmptyTitle className="font-bold">No messages yet</EmptyTitle>
              <EmptyDescription>
                Hi, I'm your <strong>KelanaAI</strong> Travel Assistant! <br />
                You can ask me anything you wan't to know about your trip. <br />
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
                                      '!rounded-r-lg !rounded-tl-lg !p-2 border-dashed': message.role === 'assistant'
                                    })}>
                                    <div className="whitespace-pre-wrap leading-relaxed inline">
                                      {isAiStreamingThisMessage && message.content === '' ? '\u00a0' : <MarkdownView>{message.content}</MarkdownView>}
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
                                    {isAiFinishedMessage && (<Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => handleCopy(message.id, message.content)}
                                      className="border-0 mr-1 pointer-events-auto cursor-pointer"
                                      title="Copy text"
                                    >
                                      {copiedMessageId === message.id ? (
                                        <>
                                          <CheckIcon />
                                          <span className="font-medium">Copied!</span>
                                        </>
                                      ) :
                                        <CopyIcon />
                                      }
                                    </Button>
                                    )}
                                  </div>
                                  <div className="flex items-center h-full px-2 font-mono capitalize">{formatDate(message.time)}</div>
                                </MessageFooter>
                                {message.sources && message.sources.length > 0
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
          <FieldSet>
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

export { Assistant }
export type { AssistantProps };
