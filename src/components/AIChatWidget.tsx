"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import {
  aiChatService,
  type ChatMessage as ChatMessageType,
} from "@/lib/services/ai-chat.service";
import { cn } from "@/lib/utils";

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar conversación guardada al montar
  useEffect(() => {
    const storedConversationId = aiChatService.getStoredConversationId();
    const storedMessages = aiChatService.getStoredMessages();
    
    if (storedConversationId) {
      setConversationId(storedConversationId);
    }
    
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }
  }, []);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiChatService.sendMessage(
        userMessage.content,
        conversationId
      );

      const agentMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: response.response,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, agentMessage];
      setMessages(updatedMessages);
      setConversationId(response.conversation_id);

      // Guardar en localStorage
      aiChatService.saveConversationId(response.conversation_id);
      aiChatService.saveMessages(updatedMessages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al comunicarse con el agente de IA"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    aiChatService.clearConversationId();
    aiChatService.clearMessages();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setError(null);
    }
  };

  return (
    <>
      {/* Botón flotante (FAB) */}
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 z-50",
          isOpen && "scale-0"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Widget de chat */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-4 right-4 md:bottom-6 md:right-6",
            "w-[calc(100vw-32px)] md:w-96",
            "max-h-[calc(100dvh-32px)] md:max-h-[700px]",
            "h-[600px] bg-background/95 border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden",
            "animate-in slide-in-from-bottom-6 duration-500 ease-out fill-mode-forwards"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/95 to-primary/80 text-primary-foreground backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/20 p-2 rounded-full">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">Asistente de Ventas</h3>
                <span className="text-[10px] opacity-80 uppercase tracking-wider font-medium">Siempre activo</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewConversation}
                  className="h-8 w-8 hover:bg-primary-foreground/20 rounded-full transition-colors"
                  title="Nueva conversación"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className="h-8 w-8 hover:bg-primary-foreground/20 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mensajes */}
          <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
            <div className="p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <div className="bg-primary/5 p-4 rounded-full mb-4">
                    <MessageCircle className="h-10 w-10 text-primary opacity-40" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">¡Bienvenido!</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Soy tu asistente inteligente. Pregúntame sobre productos, ofertas o disponibilidad en tiempo real.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-3 text-muted-foreground mb-6 animate-pulse pl-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-xs font-medium tracking-wide">Escribiendo...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </>
              )}
            </div>
          </ScrollArea>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-t border-destructive/20">
              {error}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Hacer una pregunta..."
                  disabled={isLoading}
                  className="pr-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 transition-all resize-none min-h-[44px] max-h-[120px]"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-[44px] w-[44px] rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
