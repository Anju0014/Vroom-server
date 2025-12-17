// owner-status-update.request.dto.ts
export interface UpdateOwnerVerifyStatusRequestDTO {
  verifyStatus: number; // -1 | 1
  rejectionReason?: string;
}

export interface UpdateOwnerBlockStatusRequestDTO {
  blockStatus: number; // 0 | 1
}
