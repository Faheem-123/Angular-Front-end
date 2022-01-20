export class TimeModel {   
    hour:number;
    minute:number;    
    
    constructor(
        private hh: number,
        private mm: number) { 
            this.hour=hh;
            this.minute=mm;
        }
}