import { fetchWithAuth } from "../utils/session";
import { env } from "../lib/config/env";

const backendUrl = env.BACKEND_URL;

export interface Persona {
  id: string;
  name: string;
  personalName?: string; // The actual name of the persona (e.g., "Sarah Chen", "John Smith")
  description: string;
  avatarUrl?: string;
  isActive: boolean;
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields for persona traits
  about?: string;
  traits?: any[];
  painPoints?: any[];
  coreExpertise?: any[];
  communicationStyle?: string;
  keyResponsibility?: any[];
  personaRole?: string;
  _count?: {
    conversations: number;
    messages: number;
  };
  isFavourited?: boolean;
  // Additional properties for frontend compatibility
  role?: string;
  department?: string;
  avatar?: string;
  hasStartChat?: boolean;
}

export interface PersonasResponse {
  status: string;
  message: string;
  data: Persona[];
}

export interface MessageResponse {
  status: string;
  message: string;
  data: {
    reply: string;
    conversationId: string;
    messageId: string; // assistant message ID (backward compatibility)
    assistantMessageId?: string;
    userMessageId?: string;
    suggestedTitle?: string; // AI suggested title for the conversation
  };
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  personaId: string;
  visibility: "PRIVATE" | "SHARED";
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  persona: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  messages: Array<{
    id: string;
    content: string;
    role: "USER" | "ASSISTANT";
    userId?: string; // Add userId for ownership checking
    createdAt: string;
    edited?: boolean;
    reactions?: Array<{
      id: string;
      type: "LIKE" | "DISLIKE";
      userId: string;
      createdAt: string;
    }>;
  }>;
  _count: {
    messages: number;
  };
  /** Optional last message preview if provided by backend */
  lastMessage?: string;
}

export interface ConversationsResponse {
  status: string;
  message: string;
  data: Conversation[];
}
export interface ConversationByIdResponse {
  status: string;
  message: string;
  data: Conversation;
}

export interface VisibilityUpdateResponse {
  status: string;
  message: string;
  data: {
    id: string;
    visibility: "PRIVATE" | "SHARED";
  };
}

export interface ArchiveUpdateResponse {
  status: string;
  message: string;
  data: {
    id: string;
    archived: boolean;
    archivedAt: string | null;
  };
}

export interface EditMessageResponse {
  status: string;
  message: string;
  data: {
    editedMessageId: string;
    assistantMessageId: string;
    assistantMessageContent?: string;
    conversationId: string;
  };
}

export interface FileUploadRequest {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface FileUploadResponse {
  status: string;
  message: string;
  data: {
    presignedUrl: string;
    fileId: string;
  };
}

export interface ReactionRequest {
  type: "LIKE" | "DISLIKE";
}

export interface ReactionResponse {
  status: string;
  message: string;
  data: {
    messageId: string;
    type: "LIKE" | "DISLIKE";
    action: "added" | "removed" | "updated";
    toggled: boolean;
  };
}

export interface SharedConversationResponse {
  status: string;
  message: string;
  data: {
    conversationId: string;
    persona: {
      name: string;
      description: string;
    };
    messages: Array<{
      role: "USER" | "ASSISTANT";
      content: string;
      fileUrl: string | null;
    }>;
  };
}

export interface ShareableLinkResponse {
  status: string;
  message: string;
  data: {
    url: string;
    expiresAt: string;
  };
}

export interface ChatSession {
  sessionId: string;
  conversation: Conversation;
  persona: Persona;
  user: {
    id: string;
    email: string;
    name: string;
  };
  messages: Array<{
    id: string;
    content: string;
    role: "USER" | "ASSISTANT";
    createdAt: string;
    edited?: boolean;
    reactions?: Array<{
      id: string;
      type: "LIKE" | "DISLIKE";
      userId: string;
      createdAt: string;
    }>;
  }>;
}

/**
 * Get all personas with optional favourites filter
 * @param favouritesOnly - Filter to show only favourited personas
 * @returns Promise<PersonasResponse>
 */
export const getPersonas = async (
  favouritesOnly?: boolean
): Promise<PersonasResponse> => {
  const queryParams = favouritesOnly ? "?favouritesOnly=true" : "";
  const res = await fetchWithAuth(`${backendUrl}/api/personas${queryParams}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch personas");
  }

  return await res.json();
};

/**
 * Get persona by ID
 * @param personaId - The persona ID
 * @returns Promise<Persona>
 */
export const getPersonaById = async (personaId: string): Promise<Persona> => {
  const res = await fetchWithAuth(`${backendUrl}/api/personas/${personaId}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch persona");
  }

  const data = await res.json();
  return data.data;
};

/**
 * Toggle persona favourite status
 * @param personaId - The persona ID
 * @returns Promise<{ isFavourited: boolean }>
 */
export const toggleFavourite = async (
  personaId: string
): Promise<{ isFavourited: boolean }> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/personas/${personaId}/favourite`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to toggle favourite");
  }

  const data = await res.json();
  return data.data;
};

/**
 * Send message to persona
 * @param personaId - The persona ID
 * @param message - The message to send
 * @param conversationId - Optional conversation ID for existing conversations
 * @param fileId - Optional file ID for file attachments
 * @returns Promise<MessageResponse>
 */
export const sendMessageToPersona = async (
  personaId: string,
  message: string,
  conversationId?: string,
  fileId?: string
): Promise<MessageResponse> => {
  const payload: any = { message };

  if (conversationId) {
    payload.conversationId = conversationId;
  }

  if (fileId) {
    payload.fileId = fileId;
  }

  const res = await fetchWithAuth(
    `${backendUrl}/api/personas/${personaId}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to send message");
  }

  return await res.json();
};

/**
 * Get conversations for the current user
 * @param archived - Whether to get archived conversations
 * @returns Promise<ConversationsResponse>
 */
export const getConversations = async (
  archived?: boolean
): Promise<ConversationsResponse> => {
  const queryParams = archived ? "?archived=true" : "";
  const res = await fetchWithAuth(
    `${backendUrl}/api/conversations${queryParams}`
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch conversations");
  }

  return await res.json();
};

/**
 * Get a specific conversation with all messages
 * @param conversationId - The conversation ID to fetch
 * @returns Promise<ConversationsResponse>
 */
export const getConversationById = async (
  conversationId: string
): Promise<ConversationByIdResponse> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/conversations/${conversationId}`
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch conversation");
  }

  return await res.json();
};

/**
 * Update conversation visibility
 * @param conversationId - The conversation ID
 * @param visibility - New visibility setting (PRIVATE or SHARED)
 * @returns Promise<VisibilityUpdateResponse>
 */
export const updateConversationVisibility = async (
  conversationId: string,
  visibility: "PRIVATE" | "SHARED"
): Promise<VisibilityUpdateResponse> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/conversations/${conversationId}/visibility`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visibility }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Failed to update conversation visibility"
    );
  }

  return await res.json();
};

/**
 * Toggle conversation archive status
 * @param conversationId - The conversation ID
 * @param archived - Archive status (true to archive, false to unarchive)
 * @returns Promise<ArchiveUpdateResponse>
 */
export const toggleConversationArchive = async (
  conversationId: string,
  archived: boolean
): Promise<ArchiveUpdateResponse> => {
  try {
    console.log("=== FRONTEND: Archive toggle start ===");
    console.log("Input:", { conversationId, archived });

    const url = `${backendUrl}/api/conversations/${conversationId}/archive`;
    const body = JSON.stringify({ archived });

    console.log("Making request to:", url);
    console.log("Request body:", body);

    const res = await fetchWithAuth(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    console.log("Response status:", res.status);
    console.log("Response ok:", res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Response error text:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { message: errorText };
      }

      console.error("Archive toggle failed:", errorData);
      throw new Error(
        errorData.message ||
          errorData.error ||
          "Failed to update conversation archive status"
      );
    }

    const responseData = await res.json();
    console.log("Archive toggle response:", responseData);
    console.log("=== FRONTEND: Archive toggle success ===");

    return responseData;
  } catch (error) {
    console.error("=== FRONTEND: Archive toggle error ===");
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Edit a user message and branch the conversation
 * @param messageId - The message ID to edit
 * @param content - New message content
 * @returns Promise<EditMessageResponse>
 */
export const editMessage = async (
  messageId: string,
  content: string
): Promise<EditMessageResponse> => {
  const res = await fetchWithAuth(`${backendUrl}/api/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to edit message");
  }

  return await res.json();
};

/**
 * Request file upload URL for conversation
 * @param conversationId - The conversation ID
 * @param fileData - File data (filename, mimeType, sizeBytes)
 * @returns Promise<FileUploadResponse>
 */
export const requestFileUpload = async (
  conversationId: string,
  fileData: FileUploadRequest
): Promise<FileUploadResponse> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/conversations/${conversationId}/files`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fileData),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to request file upload URL");
  }

  return await res.json();
};

/**
 * Toggle message reaction
 * @param messageId - The message ID
 * @param type - Reaction type (LIKE or DISLIKE)
 * @returns Promise<ReactionResponse>
 */
export const toggleMessageReaction = async (
  messageId: string,
  type: "LIKE" | "DISLIKE"
): Promise<ReactionResponse> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/messages/${messageId}/reactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to toggle message reaction");
  }

  return await res.json();
};

/**
 * Get shared conversation by token (public endpoint)
 * @param token - The shared conversation token
 * @returns Promise<SharedConversationResponse>
 */
export const getSharedConversation = async (
  token: string
): Promise<SharedConversationResponse> => {
  const res = await fetch(`${backendUrl}/p/${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to get shared conversation");
  }

  return await res.json();
};

/**
 * Create or refresh shareable link for conversation
 * @param conversationId - The conversation ID
 * @param expiresInDays - Days until expiration (optional, default: 30)
 * @returns Promise<ShareableLinkResponse>
 */
export const createShareableLink = async (
  conversationId: string,
  expiresInDays?: number
): Promise<ShareableLinkResponse> => {
  const payload: { expiresInDays?: number } = {};
  if (expiresInDays) {
    payload.expiresInDays = expiresInDays;
  }

  const res = await fetchWithAuth(
    `${backendUrl}/api/conversations/${conversationId}/share`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create shareable link");
  }

  return await res.json();
};

export const getChatSessionById = async (
  sessionId: string
): Promise<ChatSession> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/chat-sessions/${sessionId}`
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch chat session");
  }
  const data = await res.json();
  return data.data;
};

export const getUserChatSessions = async (): Promise<ChatSession[]> => {
  const res = await fetchWithAuth(`${backendUrl}/api/chat-sessions`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch chat sessions");
  }
  const data = await res.json();
  return data.data as ChatSession[];
};

/**
 * Clear all conversations for the current user
 */
export const clearAllConversations = async (): Promise<{
  status: string;
  message: string;
  data: { deletedConversations: number; deletedMessages: number };
}> => {
  const res = await fetchWithAuth(`${backendUrl}/api/conversations/clear`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to clear conversations");
  }
  return await res.json();
};

/**
 * Update conversation title
 * @param conversationId - Conversation ID to update
 * @param title - New title for the conversation
 * @returns Promise with updated conversation data
 */
export const updateConversationTitle = async (
  conversationId: string,
  title: string
): Promise<{ status: string; data: Conversation; message: string }> => {
  try {
    const response = await fetchWithAuth(
      `/api/conversations/${conversationId}/title`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update title: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating conversation title:", error);
    throw error;
  }
};
