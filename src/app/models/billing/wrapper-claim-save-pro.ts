import { ClamSavePro } from "./claim-save-pro";
import { ClaimDiagnosisSavePro } from "./claim-diagnosis-save-pro";
import { ClaimProceduresSavePro } from "./claim-procedures-save-pro";
import { ClaimInsuranceSave } from "./claim-insurance-save";

export class WrapperClaimSavePro {
    
    claimSave_Pro:ClamSavePro;
    lstClaimDiagnosisSave_Pro:Array<ClaimDiagnosisSavePro>;
    lstClaimProceduresSave_Pro:Array<ClaimProceduresSavePro>;
    lstClaimInsuranceSave:Array<ClaimInsuranceSave>;

    lstDiagIdsDeleted:Array<number>;
    lstProcIdsDeleted:Array<number>;
    lstInsIdsDeleted:Array<number>;

    constructor(){

    }
}