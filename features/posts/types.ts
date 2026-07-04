export type PostType = 'service' | 'echange' | 'vente';
export type PostStatus = 'draft' | 'active' | 'paused' | 'sold' | 'blocked' | 'deleted';

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export type PostMedia = {
  id: string;
  post_id: string;
  owner_id?: string;
  bucket?: string;
  public_url: string | null;
  object_key: string;
  mime_type: string | null;
  size_bytes?: number | null;
  sort_order: number;
};

export type PublicProfile = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  zone: string | null;
  phone_verified: boolean;
  rating_average: number | null;
  rating_count: number;
};

export type PostRecord = {
  id: string;
  owner_id: string;
  category_id: string;
  type: PostType;
  title: string;
  description: string;
  price_label: string | null;
  zone: string;
  status: PostStatus;
  contact_locked: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  media?: PostMedia[] | null;
};

export type PostView = PostRecord & {
  author: PublicProfile | null;
  saved?: boolean;
};

export type CreatePostInput = {
  type: PostType;
  title: string;
  description: string;
  priceLabel?: string | null;
  zone: string;
  files?: File[];
};

export type ContactDetails = {
  display_name: string;
  phone: string;
  phone_verified: boolean;
};
