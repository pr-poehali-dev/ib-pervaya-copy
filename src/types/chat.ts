export type ChatThreadType = "tenant" | "support"; // к тенанту или в техподдержку
export type ChatThreadStatus = "new" | "in_progress" | "resolved";
export type ChatRole = "student" | "admin" | "manager" | "sales_manager" | "superadmin" | "support";

export interface ChatAttachment {
  id: number;
  name: string;
  size: number; // bytes
  type: "image" | "file";
  url: string; // mock url
}

export interface ChatMessage {
  id: number;
  threadId: number;
  authorId: string; // user identifier (email или id)
  authorName: string;
  authorRole: ChatRole;
  text: string;
  attachments: ChatAttachment[];
  createdAt: string; // ISO
  isRead: boolean;
}

export interface ChatThread {
  id: number;
  type: ChatThreadType;
  status: ChatThreadStatus;
  subject: string; // тема обращения
  fromUserId: string;
  fromUserName: string;
  fromUserRole: ChatRole;
  tenantId?: number; // к какому тенанту относится
  tenantName?: string;
  assignedToId?: string; // кому назначен (менеджер тенанта или специалист ТП)
  assignedToName?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  unreadCount: number; // непрочитанных для текущего получателя
}
