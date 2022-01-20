export class SchedulerViewParm {
    app_date: string;
    location_id: number;
    provider_id: number;
    patient_search_value: string;
    refresh: boolean = false;

    constructor(date: string, locId: number, proId: number, searchVal: string, ref: boolean) {
        this.app_date = date;
        this.location_id = locId;
        this.provider_id = proId;
        this.patient_search_value = searchVal;
        this.refresh = ref;
    }
}