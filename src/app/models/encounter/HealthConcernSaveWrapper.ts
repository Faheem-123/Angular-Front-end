import { ORMSavehealthconcern } from "./ORMSavehealthconcern";
import { ORMSavehealthconcerndetail } from "./ORMSavehealthconcerndetail";

export class HealthConcernSaveWrapper {

    operation:string;
    concern:ORMSavehealthconcern;
    lst_detail:Array<ORMSavehealthconcerndetail>;
}