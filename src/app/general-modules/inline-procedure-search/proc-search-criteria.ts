import { ProcedureSearchType } from "src/app/shared/enum-util";

export class ProcedureSearchCriteria {
    criteria:string;
    searchType:ProcedureSearchType;
    dos:string = "";
    providerId:number;// for my list
}