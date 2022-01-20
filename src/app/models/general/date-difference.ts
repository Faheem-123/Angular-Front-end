export class DateDifference {
    years:number;
    months:number;
    days:number;
    hours:number;
    minutes:number;
    seconds:number;

    constructor(
        private yyyy: number,
        private MM: number,
        private dd: number,
        private hh: number,
        private mm: number,
        private ss: number) { 
            this.years=yyyy;
            this.months=MM;
            this.days=dd;
            this.hours=hh;
            this.minutes=mm;
            this.seconds=ss;
        }
}