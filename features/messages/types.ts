export type ConversationRecord = {
  id: string;
  post_id: string | null;
  created_by: string;
  last_message_at: string | null;
  created_at: string;
  post?: {
    id: string;
    title: string;
    owner_id: string;
  } | null;
};

export type MessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ConversationListItem = ConversationRecord & {
  counterpartId: string | null;
  counterpartName: string;
  counterpartAvatar: string | null;
  lastMessage: string | null;
  unreadCount: number;
};
