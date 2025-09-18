export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  joinedDate: string;
  hobbies?: string[];
  city?: string;
  country?: string;
  profilePhoto?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  totalReviews: number;
  image?: string;
}

export interface Review {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  images?: string[];
  createdAt: string;
}

export interface CreateReviewData {
  locationId: string;
  rating: number;
  text: string;
  images?: string[];
}