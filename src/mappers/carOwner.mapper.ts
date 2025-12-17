import { ICarOwner } from '../models/carowner/carOwnerModel';
import { CarOwnerDTO } from '../dtos/carOwner/carOwner.dto';
import { CarOwnerVerifyListDTO } from '../dtos/carOwner/carOwnerVerify.dto';

export class CarOwnerMapper {
  static toDTO(owner: ICarOwner): CarOwnerDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      altPhoneNumber: owner.altPhoneNumber,
      isVerified: owner.isVerified,
      processStatus: owner.processStatus,
      verifyStatus: owner.verifyStatus,
      blockStatus: owner.blockStatus,
      status: owner.status,
      idVerified: owner.idVerified,
      rejectionReason: owner.rejectionReason,
      profileImage: owner.profileImage,
      createdAt: owner.createdAt,
    };
  }

  static toVerifyDTO(owner: ICarOwner): CarOwnerVerifyListDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      processStatus: owner.processStatus,
      verifyStatus: owner.verifyStatus,
      blockStatus: owner.blockStatus,
      idVerified: owner.idVerified,
      createdAt: owner.createdAt,
    };
  }

  static toDTOList(owners: ICarOwner[]): CarOwnerDTO[] {
    return owners.map(this.toDTO);
  }
}
