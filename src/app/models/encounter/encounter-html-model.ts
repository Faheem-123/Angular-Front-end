export class EncounterHTMLModel {
    patienId: number;
    chartId: number;
    visitDate: string;
    htmlString: string;


    constructor({ pid, chartid, date, html }: { pid: number; chartid: number; date: string; html: string; }) {
        this.patienId = pid;
        this.chartId = chartid;
        this.visitDate = date;
        this.htmlString = html;
    }
}