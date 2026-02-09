// AI Chat Service - Comunicación con el microservicio de agente de ventas con IA
const AI_API_URL = "http://localhost:8002";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
}

export const aiChatService = {
  /**
   * Envía un mensaje al agente de IA
   * @param message - El mensaje del usuario en lenguaje natural
   * @param conversationId - ID de la conversación actual (opcional para el primer mensaje)
   * @returns Respuesta del agente y el conversation_id
   */
  sendMessage: async (
    message: string,
    conversationId?: string | null
  ): Promise<ChatResponse> => {
    const payload: ChatRequest = {
      message,
      conversation_id: conversationId || null,
    };

    try {
      const response = await fetch(`${AI_API_URL}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "No se pudo conectar con el agente de IA. Verifica que el servicio esté corriendo en el puerto 8002."
        );
      }
      throw error;
    }
  },

  /**
   * Obtiene el conversation_id almacenado en localStorage
   */
  getStoredConversationId: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("ai_conversation_id");
  },

  /**
   * Guarda el conversation_id en localStorage
   */
  saveConversationId: (conversationId: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ai_conversation_id", conversationId);
  },

  /**
   * Elimina el conversation_id de localStorage (para iniciar nueva conversación)
   */
  clearConversationId: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("ai_conversation_id");
  },

  /**
   * Obtiene el historial de mensajes almacenado en localStorage
   */
  getStoredMessages: (): ChatMessage[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("ai_chat_messages");
    if (!stored) return [];
    try {
      const messages = JSON.parse(stored);
      // Convertir timestamps de string a Date
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch {
      return [];
    }
  },

  /**
   * Guarda el historial de mensajes en localStorage
   */
  saveMessages: (messages: ChatMessage[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ai_chat_messages", JSON.stringify(messages));
  },

  /**
   * Limpia el historial de mensajes de localStorage
   */
  clearMessages: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("ai_chat_messages");
  },
};
