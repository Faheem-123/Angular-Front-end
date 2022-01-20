import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable() 
export class EncounterFaxObservable {
    
    searchCriteria:any;

    getHtml: Subject<any> = new Subject<any>();

    constructor()  {
        this.getHtml.subscribe((value) => {
            this.searchCriteria = value
        });
    }

    EncountergetHtml(search:any) {
        this.getHtml.next(search);
    }
}