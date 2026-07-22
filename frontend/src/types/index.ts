export interface Vehicle {
  id: string;
  maker: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  vehicleId: string;
  amount: number;
  purchasedAt: string;
  user: { email: string };
  vehicle: { maker: string; model: string };
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
