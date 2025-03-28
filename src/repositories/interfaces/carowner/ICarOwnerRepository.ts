import { ICarOwner } from '../../../models/carowner/carOwnerModel';



interface ICarOwnerRepository{
    
    findUserByEmail(email:string):Promise<ICarOwner|null>
    create(user: Partial<ICarOwner>): Promise<ICarOwner>;
    updateCarOwner(id: string, updatedData: Partial<ICarOwner>): Promise<ICarOwner>; 
    updateRefreshToken(id:string,refreshToken:string): Promise<void>
    updatePassword(id:string,password:string):Promise<void>
    clearRefreshToken(id:string): Promise<void>
    findUserByRefreshToken(refreshToken: string): Promise<ICarOwner | null>
    findById(id:string): Promise<ICarOwner |null>
}


export default ICarOwnerRepository