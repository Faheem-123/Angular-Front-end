import { OperationType, CallingFromEnum } from "src/app/shared/enum-util";

export class OpenedClaimInfo {

    claimId: number;
    patientId: number;
    providerId: number;
    locationId: number;
    dos: string;
    operationType: OperationType;
    deleted: boolean;
    callingFrom: CallingFromEnum;
    providerName: string;
    locationName: string;

    primaryStatus: string;
    secondaryStatus: string;
    otherStatus: string;
    patientStatus: string;


    constructor(claimId: number, paientId: number, provider_id: number, location_id: number,
        dos: string, operationType: OperationType, deleted: boolean, calling_from: CallingFromEnum, proName: string, locName: string,
        priStatus: string, secStatus: string, othStatus: string, patStatus: string


    ) {

        this.claimId = claimId;
        this.patientId = paientId;
        this.providerId = provider_id;
        this.locationId = location_id;
        this.dos = dos;
        this.operationType = operationType;
        this.deleted = deleted;
        this.callingFrom = calling_from;
        this.providerName = proName;
        this.locationName = locName;

        this.primaryStatus = priStatus;
        this.secondaryStatus = secStatus;
        this.otherStatus = othStatus;
        this.patientStatus = patStatus;
    }

}