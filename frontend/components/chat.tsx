"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BanIcon, BotMessageSquareIcon, CheckCheckIcon, CheckIcon, ChevronRightIcon, CopyIcon, ExternalLinkIcon, PencilIcon, SparkleIcon, Strikethrough, TagIcon, VerifiedIcon, WandSparklesIcon, XIcon } from "lucide-react"

import { cn, countTokens, delay, formatDate, uuidv7 } from "@/lib/utils";
import { getConversationStatus, sendMessage } from '@/services/chat-service';

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
  const status = await getConversationStatus(id);
  if (status && status.pending) {
    await delay(500);

    return poolStatus(id);
  }

  return status;
};

const Chat = ({ className, conversation }: ChatProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const [withKB, setWithKB] = useState(false)
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(conversation?.messages ?? []);

  const typeReposponse = async (id: string, message: string, splits: 'char' | 'word' = 'word') => {
    const tokens = message.split(splits === 'char' ? '' : ' ');
    let i = 0
    let content = ""

    const typeCharacter = (done: (() => void)) => {
      if (i < tokens.length) {
        const nextToken = tokens[i];

        // const randClick = Math.floor(Math.random() * 3);
        // if (nextToken === " ") {
        //   playWebAudioSound(spaceBufferRef.current, 0.18, 0.05)
        // } else {
        //   playWebAudioSound(clickBufferRefs[randClick].current, 0.12, 0.06)
        // }

        content += (splits === 'char' || i === 0 ? '' : " ") + nextToken
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          )
        );

        i++
        let nextDelay = 70

        // Berikan jeda berpikir lebih lama jika bertemu titik atau koma (~350ms)
        if ([".", "!", "?", ","].includes(nextToken)) {
          nextDelay = 350
        }
        // Berikan jeda sedikit lebih renggang saat berpindah kata / spasi (~110ms)
        else if (nextToken === " ") {
          nextDelay = 90
        }
        // Berikan variasi acak kecil (micro-timing) pada huruf biasa agar terasa manusiawi
        else {
          // Kecepatan akan bervariasi secara alami antara 60ms hingga 80ms
          nextDelay = nextDelay + (Math.random() * 20 - 10)
        }

        setTimeout(() => typeCharacter(done), nextDelay);
      } else {
        done();
      }
    };

    return new Promise<void>((resolve) => {
      typeCharacter(resolve);
    })
  };

  const waitResponse = async () => {
    if (!conversation?.id) { return; }

    const aiMessageId = uuidv7();
    setMessages((prev) => [
      ...prev, {
        id: aiMessageId,
        role: "assistant",
        content: ""
      }]);

    const statusId = uuidv7();
    setMessages((prev) => [
      ...prev, {
        id: statusId,
        role: "status",
        Icon: Spinner,
        content: "Thinking"
      }]);

    try {
      const result = await poolStatus(conversation.id);
      if (result && !result.pending) {

        console.log('waitResponse typing');
        await typeReposponse(aiMessageId, result.content);

        console.log('waitResponse done');
        setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? {
        ...msg,
          created_at: result.created_at,
          sources: []as ChatSource[]
        } : msg));
      }
    } catch(err) {
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
    const questionId = uuidv7();
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
      }: msg));
      console.error(err);
    }
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!conversation?.id) { return; }

    setLoading(true);
    try {
      sendQuestion(conversation.id, question, withKB);
    }
    finally {
      setLoading(false);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
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

  useEffect(() => {
    requestAnimationFrame(() => {
      if (conversation?.id) {
        inputRef.current?.focus();
      }
    });

  },[]);

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
          : null}
        <CardAction>
          <NewChatDialog trigger={
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={loading}
            >
              <SparkleIcon /> New Conversation
            </Button>} />
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
                Send the first message to get the conversation started. <br />
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
                                    <span>{ message.error ? <XIcon className="text-red-800 h-4 w-4" /> : message.created_at ? <CheckCheckIcon className="text-green-800 h-4 w-4" /> : <CheckIcon className="h-4 w-4"/> }</span>
                                    { message.created_at ? <span>{formatDate(message.created_at)}</span> : message.id }
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
