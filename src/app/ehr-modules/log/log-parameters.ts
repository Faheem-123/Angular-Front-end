import { CallingFromEnum } from "src/app/shared/enum-util";
import { ORMKeyValue } from "src/app/models/general/orm-key-value";

export class LogParameters {

    logMainTitle:string;
    logName:string;
    logDisplayName:string;
    datetimeFrom: string;
    datetimeTo: string;
    datetimeFromFlag: string; // date|datetime
    datetimeToFlag: string;// date|datetime
    userName: string;
    patientId: number;
    PID: string;
    patientName: string;
    enableSearch: boolean = true;    
    lstOtherCriteria: Array<ORMKeyValue>;
    callingFrom: CallingFromEnum;
}