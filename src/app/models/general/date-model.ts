export class DateModel {
    year:number;
    month:number;
    day:number;

    constructor(
        yyyy: number,
        MM: number,
        dd: number) { 
            this.year=yyyy;
            this.month=MM;
            this.day=dd;
        }    
}