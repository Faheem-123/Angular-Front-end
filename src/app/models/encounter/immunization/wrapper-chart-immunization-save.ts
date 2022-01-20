import { ORMChartImmunizationSave } from "./orm-chart-immunization-save";
import { ORMChartImmunizationVISSave } from "./orm-chart-immunization-vis-save";

export class WrapperImmunizationSave {
   
    chartImmunizationSave:ORMChartImmunizationSave;
    lstChartImmunizationVISSave:Array<ORMChartImmunizationVISSave>;
    lstVISIdsDeleted:Array<number>;
    locationId:number;

    constructor(objImmunizationSave: ORMChartImmunizationSave, lstVISSave: Array<ORMChartImmunizationVISSave>, lstDeleted: Array<number>,locId:number) {

        this.chartImmunizationSave = objImmunizationSave;
        this.lstChartImmunizationVISSave = lstVISSave;
        this.lstVISIdsDeleted = lstDeleted;
        this.locationId=locId;
    }

}