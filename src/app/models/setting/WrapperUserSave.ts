import { ORMSaveUser } from "./ORMSaveUser";
import { ORMUser_Providers } from "./ORMUser_Providers";

export class Wrapper_UserSave {
    userSave: ORMSaveUser;
    lst_user_provider: Array<ORMUser_Providers>;
    lst_user_provider_deleted_ids: Array<number>;

    constructor(user: ORMSaveUser,
        lstProviders: Array<ORMUser_Providers>,
        lstDeletedProviderIds: Array<number>) {

        this.userSave = user;
        this.lst_user_provider = lstProviders;
        this.lst_user_provider_deleted_ids = lstDeletedProviderIds;
    }

}