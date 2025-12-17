export interface CarOwnerCarDTO {
  id: string;
  carName: string;
  pricePerDay: number;
  verifyStatus: number;
  blockStatus: number;
  images?: string[];
  createdAt?: Date;
}
