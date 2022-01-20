import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable() 
export class PatientSearchObservable {
    
    searchCriteria:any;

    performSearch: Subject<any> = new Subject<any>();

    constructor()  {
        this.performSearch.subscribe((value) => {
            this.searchCriteria = value
        });
    }

    searchPatient(search:any) {
        debugger;
        this.performSearch.next(search);
    }
}