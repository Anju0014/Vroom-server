// car-status-update.request.dto.ts
export interface UpdateCarVerifyStatusRequestDTO {
  verifyStatus: number;
  rejectionReason?: string;
}

export interface UpdateCarBlockStatusRequestDTO {
  blockStatus: number; 
}
