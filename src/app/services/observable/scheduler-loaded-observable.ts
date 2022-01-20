import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable() 
export class SchedulerLoadedObservable {
    
    isSchedulerLoaded: boolean;

    isSchedulerLoadedChange: Subject<boolean> = new Subject<boolean>();

    constructor()  {
        this.isSchedulerLoadedChange.subscribe((value) => {
            this.isSchedulerLoaded = value
        });
    }

    schedulerLoadedSuccessfully() {
        this.isSchedulerLoadedChange.next(true);
    }
}