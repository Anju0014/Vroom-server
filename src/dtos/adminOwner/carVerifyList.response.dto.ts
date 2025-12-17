// car-verify-list.response.dto.ts
export interface CarVerifyListItemDTO {
  id: string;
  carName: string;
  ownerId: string;
  verifyStatus: number;
  blockStatus: number;
  rejectionReason?: string;
  createdAt?: Date;
}

export interface CarVerifyListResponseDTO {
  cars: CarVerifyListItemDTO[];
  total: number;
}
