import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  PanelLeft,
  X,
} from 'lucide-react';
import {
  ChatConversation,
  ChatMessage,
  ClassLevel,
  LanguageCode,
} from '../types';
import { t } from '../i18n/translations';

interface AiChatViewProps {
  interfaceLanguage: LanguageCode;
  selectedClass: ClassLevel;
  userId: string;
  isCloudSynced: boolean;
  conversations: ChatConversation[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => string;
  onUpsertConversation: (conv: ChatConversation, syncCloud?: boolean) => void;
  onDeleteConversation: (chatId: string) => void;
  onClearAllConversations: () => void;
}

function formatMessageTime(iso: string, lang: LanguageCode): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const locale = lang === 'bn' ? 'bn-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    return d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function renderFormattedText(content: string) {
  const segments = content.split(/(```[\s\S]*?```)/g);

  return segments.map((segment, segIdx) => {
    if (segment.startsWith('```') && segment.endsWith('```')) {
      const lines = segment.slice(3, -3).trim().split('\n');
      const firstLine = lines[0]?.trim() || '';
      const hasLangTag = /^[a-zA-Z0-9_+-]{1,20}$/.test(firstLine) && lines.length > 1;
      const codeLang = hasLangTag ? firstLine : '';
      const codeBody = hasLangTag ? lines.slice(1).join('\n') : lines.join('\n');

      return (
        <div
          key={segIdx}
          className="my-2.5 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 text-slate-100"
        >
          {codeLang && (
            <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              {codeLang}
            </div>
          )}
          <pre className="p-3 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre">
            <code>{codeBody}</code>
          </pre>
        </div>
      );
    }

    const paragraphs = segment.split(/\n{2,}/g);
    return (
      <div key={segIdx} className="space-y-2.5">
        {paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;
          const lines = trimmed.split('\n');

          return (
            <div key={pIdx} className="space-y-1.5 leading-relaxed">
              {lines.map((line, lIdx) => {
                const cleanLine = line.trim();
                const isBullet = /^[-*•]\s+/.test(cleanLine);
                const isNumbered = /^\d+[.)]\s+/.test(cleanLine);
                const isHeading = /^#{1,3}\s+/.test(cleanLine);

                const rawText = isHeading
                  ? cleanLine.replace(/^#{1,3}\s+/, '')
                  : isBullet
                  ? cleanLine.replace(/^[-*•]\s+/, '')
                  : cleanLine;

                const inlineParts = rawText.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
                const renderedInline = inlineParts.map((part, iIdx) => {
                  if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                    return (
                      <strong key={iIdx} className="font-semibold text-current">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
                    return (
                      <code
                        key={iIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-900 font-mono text-[0.9em]"
                      >
                        {part.slice(1, -1)}
                      </code>
                    );
                  }
                  return <React.Fragment key={iIdx}>{part}</React.Fragment>;
                });

                if (isHeading) {
                  return (
                    <h4 key={lIdx} className="font-semibold text-slate-900 pt-1 text-sm sm:text-base">
                      {renderedInline}
                    </h4>
                  );
                }

                if (isBullet) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-1">
                      <span className="text-slate-500 mt-0.5 shrink-0">•</span>
                      <span>{renderedInline}</span>
                    </div>
                  );
                }

                if (isNumbered) {
                  return (
                    <div key={lIdx} className="pl-1">
                      {renderedInline}
                    </div>
                  );
                }

                return <p key={lIdx}>{renderedInline}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  });
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  interfaceLanguage,
  selectedClass,
  userId,
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onUpsertConversation,
  onDeleteConversation,
  onClearAllConversations,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isWaitingForFirstToken, setIsWaitingForFirstToken] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<{
    chatId: string;
    id: string;
    content: string;
    timestamp: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeConversation = conversations.find((c) => c.chatId === activeChatId) || null;
  const activeMessages = activeConversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeMessages.length, isWaitingForFirstToken, activeChatId]);

  useEffect(() => {
    if (streamingMessage && streamingMessage.chatId === activeChatId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [streamingMessage?.content, activeChatId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [inputText]);

  const handleCopyResponse = async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedMessageId(msg.id);
      setTimeout(() => {
        setCopiedMessageId((prev) => (prev === msg.id ? null : prev));
      }, 2000);
    } catch {
      // Ignore if clipboard blocked
    }
  };

  const executeChatStreamRequest = async (params: {
    targetChatId: string;
    textToSend: string;
    baseHistory: ChatMessage[];
    userMsgToKeep: ChatMessage;
    baseConversation: ChatConversation;
  }) => {
    const { targetChatId, textToSend, baseHistory, userMsgToKeep, baseConversation } = params;

    setIsSending(true);
    setIsWaitingForFirstToken(true);
    setStreamingMessage(null);

    const streamMsgId = `msg_a_stream_${Date.now()}`;
    const streamStartedAt = new Date().toISOString();

    // Concise context: send only the last 8 messages (role + trimmed content)
    const conciseHistory = baseHistory.slice(-8).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 1200),
    }));

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          userId,
          chatId: targetChatId,
          message: textToSend,
          history: conciseHistory,
          replyLanguage: 'auto',
          interfaceLanguage,
          classLevel: selectedClass,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.error ||
            `Request failed (${res.status}). Unable to get a response from Gemini AI right now.`
        );
      }

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedText = '';
        let doneData: {
          chatId?: string;
          title?: string;
          assistantMessage?: ChatMessage;
          modelUsed?: string;
        } | null = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;

            let eventPayload: any = null;
            try {
              eventPayload = JSON.parse(jsonStr);
            } catch {
              continue;
            }

            if (eventPayload.type === 'delta' && typeof eventPayload.text === 'string') {
              accumulatedText += eventPayload.text;
              setIsWaitingForFirstToken(false);
              setStreamingMessage({
                chatId: targetChatId,
                id: streamMsgId,
                content: accumulatedText,
                timestamp: streamStartedAt,
              });
            } else if (eventPayload.type === 'done') {
              doneData = eventPayload;
            } else if (eventPayload.type === 'error') {
              throw new Error(
                eventPayload.error ||
                  'Unable to get a response from Gemini AI right now. Please try again.'
              );
            }
          }
        }

        const finalContent = String(
          doneData?.assistantMessage?.content || accumulatedText || ''
        ).trim();

        if (!finalContent) {
          throw new Error('Gemini AI returned an empty response. Please try again.');
        }

        const assistantMsg: ChatMessage = {
          id: doneData?.assistantMessage?.id || `msg_a_${Date.now()}`,
          role: 'assistant',
          content: finalContent,
          timestamp: doneData?.assistantMessage?.timestamp || new Date().toISOString(),
          language: doneData?.assistantMessage?.language || interfaceLanguage,
          modelUsed: doneData?.modelUsed || doneData?.assistantMessage?.modelUsed,
        };

        setStreamingMessage(null);
        setIsWaitingForFirstToken(false);

        const completedConv: ChatConversation = {
          ...baseConversation,
          title: doneData?.title || baseConversation.title,
          language: assistantMsg.language || baseConversation.language,
          messages: [...baseHistory, userMsgToKeep, assistantMsg],
          updatedAt: assistantMsg.timestamp,
        };

        onUpsertConversation(completedConv, true);
      } else {
        // Fallback if server returned standard JSON
        const response = await res.json();
        setIsWaitingForFirstToken(false);

        const assistantMsg: ChatMessage = {
          id: response.assistantMessage?.id || `msg_a_${Date.now()}`,
          role: 'assistant',
          content: String(response.assistantMessage?.content || ''),
          timestamp: response.assistantMessage?.timestamp || new Date().toISOString(),
          language: response.assistantMessage?.language || interfaceLanguage,
          modelUsed: response.modelUsed || response.assistantMessage?.modelUsed,
        };

        const completedConv: ChatConversation = {
          ...baseConversation,
          title: response.title || baseConversation.title,
          language: assistantMsg.language || baseConversation.language,
          messages: [...baseHistory, userMsgToKeep, assistantMsg],
          updatedAt: assistantMsg.timestamp,
        };

        onUpsertConversation(completedConv, true);
      }
    } catch (err: any) {
      setStreamingMessage(null);
      setIsWaitingForFirstToken(false);
      setErrorMsg(
        err?.message ||
          'Unable to get a response from Gemini AI right now. Please try again.'
      );
      setLastFailedPrompt(textToSend);
    } finally {
      setIsWaitingForFirstToken(false);
      setIsSending(false);
    }
  };

  const sendChatMessage = async (rawPrompt?: string) => {
    const textToSend = (rawPrompt !== undefined ? rawPrompt : inputText).trim();
    if (!textToSend || isSending) return;

    setErrorMsg(null);
    setLastFailedPrompt(null);
    if (rawPrompt === undefined) {
      setInputText('');
    }

    const nowIso = new Date().toISOString();
    let targetChatId = activeChatId;
    let existingConv = conversations.find((c) => c.chatId === targetChatId);

    if (!targetChatId || !existingConv) {
      targetChatId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const initialTitle =
        textToSend.replace(/\s+/g, ' ').slice(0, 60) + (textToSend.length > 60 ? '…' : '');
      existingConv = {
        chatId: targetChatId,
        userId,
        title: initialTitle,
        language: interfaceLanguage,
        messages: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      onSelectChat(targetChatId);
    }

    const optimisticUserMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: nowIso,
    };

    const updatedWithUser: ChatConversation = {
      ...existingConv,
      title:
        existingConv.messages.length === 0
          ? textToSend.replace(/\s+/g, ' ').slice(0, 60) + (textToSend.length > 60 ? '…' : '')
          : existingConv.title,
      messages: [...existingConv.messages, optimisticUserMsg],
      updatedAt: nowIso,
    };

    // Update UI state immediately without redundant cloud write until assistant finishes
    onUpsertConversation(updatedWithUser, false);

    await executeChatStreamRequest({
      targetChatId,
      textToSend,
      baseHistory: existingConv.messages,
      userMsgToKeep: optimisticUserMsg,
      baseConversation: updatedWithUser,
    });
  };

  const handleRetryFailedMessage = async () => {
    if (!lastFailedPrompt || isSending) return;
    const promptToRetry = lastFailedPrompt;
    setErrorMsg(null);
    setLastFailedPrompt(null);

    if (!activeConversation) {
      await sendChatMessage(promptToRetry);
      return;
    }

    const msgs = activeConversation.messages;
    const lastMsg = msgs[msgs.length - 1];
    const baseHistory =
      lastMsg && lastMsg.role === 'user' && lastMsg.content === promptToRetry
        ? msgs.slice(0, -1)
        : msgs;

    const userMsgToKeep: ChatMessage =
      lastMsg && lastMsg.role === 'user' && lastMsg.content === promptToRetry
        ? lastMsg
        : {
            id: `msg_u_${Date.now()}`,
            role: 'user',
            content: promptToRetry,
            timestamp: new Date().toISOString(),
          };

    await executeChatStreamRequest({
      targetChatId: activeConversation.chatId,
      textToSend: promptToRetry,
      baseHistory,
      userMsgToKeep,
      baseConversation: activeConversation,
    });
  };

  const renderHistorySidebarContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 text-slate-900">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            setErrorMsg(null);
            setLastFailedPrompt(null);
            if (isMobileDrawer) setMobileHistoryOpen(false);
          }}
          className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t(interfaceLanguage, 'newChatBtn')}</span>
        </button>

        {isMobileDrawer && (
          <button
            type="button"
            onClick={() => setMobileHistoryOpen(false)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
            aria-label="Close chat history"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {conversations.length > 0 && (
        <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium">{t(interfaceLanguage, 'chatHistoryTitle')}</span>
          <button
            type="button"
            onClick={() => {
              onClearAllConversations();
              setErrorMsg(null);
              setLastFailedPrompt(null);
            }}
            className="text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            {t(interfaceLanguage, 'clearAllChatsBtn')}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {conversations.map((conv) => {
          const isSelected = conv.chatId === activeChatId;
          return (
            <div
              key={conv.chatId}
              className={`group relative rounded-lg transition-colors ${
                isSelected
                  ? 'bg-slate-200/80 text-slate-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-200/40'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectChat(conv.chatId);
                  setErrorMsg(null);
                  setLastFailedPrompt(null);
                  if (isMobileDrawer) setMobileHistoryOpen(false);
                }}
                className="w-full text-left px-3 py-2 pr-8 flex items-center gap-2 text-xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.chatId);
                }}
                title={t(interfaceLanguage, 'deleteChatLabel')}
                aria-label={t(interfaceLanguage, 'deleteChatLabel')}
                className="absolute right-1.5 top-1.5 p-1 rounded text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const displayedMessages: ChatMessage[] =
    streamingMessage && streamingMessage.chatId === activeChatId
      ? [
          ...activeMessages,
          {
            id: streamingMessage.id,
            role: 'assistant',
            content: streamingMessage.content,
            timestamp: streamingMessage.timestamp,
          },
        ]
      : activeMessages;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex h-[calc(100vh-10.5rem)] min-h-[520px] relative">
      {/* Desktop Chat History Sidebar */}
      <div className="hidden md:block w-60 shrink-0 h-full">
        {renderHistorySidebarContent(false)}
      </div>

      {/* Mobile Chat History Drawer */}
      <AnimatePresence>
        {mobileHistoryOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              key="chat-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="fixed inset-0 bg-slate-900/40"
              onClick={() => setMobileHistoryOpen(false)}
            />
            <motion.div
              key="chat-mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-64 max-w-[80vw] h-full z-10 shadow-xl"
            >
              {renderHistorySidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Minimal Chat Screen */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white">
        {/* Minimal Top Header */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileHistoryOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              aria-label="Open chat history"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-900 truncate">
              {activeConversation?.title || t(interfaceLanguage, 'navAiChat')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onNewChat();
              setErrorMsg(null);
              setLastFailedPrompt(null);
              textareaRef.current?.focus();
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t(interfaceLanguage, 'newChatBtn')}</span>
          </button>
        </div>

        {/* Conversation Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-white">
          <div className="max-w-3xl mx-auto space-y-4">
            {displayedMessages.map((msg) => {
              const isUser = msg.role === 'user';
              const isCurrentlyStreaming = streamingMessage?.id === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                    }`}
                  >
                    <div className={isUser ? 'whitespace-pre-wrap leading-relaxed' : ''}>
                      {isUser ? msg.content : renderFormattedText(msg.content)}
                    </div>

                    {!isCurrentlyStreaming && (
                      <div
                        className={`mt-1.5 flex items-center justify-between gap-3 text-[10px] ${
                          isUser ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        <span className="tabular-nums">
                          {formatMessageTime(msg.timestamp, interfaceLanguage)}
                        </span>

                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopyResponse(msg)}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            title={t(interfaceLanguage, 'copyMessageLabel')}
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">
                                  {t(interfaceLanguage, 'copiedBadge')}
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{t(interfaceLanguage, 'copyMessageLabel')}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Small Typing Indicator — Shown ONLY until response streaming begins */}
            {isWaitingForFirstToken && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                </div>
              </div>
            )}

            {/* Error Banner with Retry */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-2 max-w-xl">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-rose-800 leading-relaxed">{errorMsg}</p>
                </div>

                {lastFailedPrompt && (
                  <button
                    type="button"
                    onClick={handleRetryFailedMessage}
                    disabled={isSending}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t(interfaceLanguage, 'retryMessageBtn')}</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Minimal ChatGPT-Style Bottom Input Area */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage();
            }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-end gap-2 rounded-3xl border border-slate-300 bg-white px-3.5 py-1.5 sm:px-4 sm:py-2 focus-within:border-slate-500 transition-colors">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                placeholder="Ask anything"
                disabled={isSending}
                aria-label="Ask anything"
                className="flex-1 bg-transparent py-1 text-sm sm:text-[15px] leading-6 text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none max-h-36 min-h-[28px]"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                aria-label="Send"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 mb-0.5"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
