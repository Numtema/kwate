export type ProfileRecord = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  zone: string | null;
  phone: string | null;
  phone_verified: boolean;
  bio: string | null;
  rating_average: number | null;
  rating_count: number;
  created_at: string;
  updated_at: string;
};
