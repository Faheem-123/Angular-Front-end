import { Injectable } from '@angular/core';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { DateDifference } from 'src/app/models/general/date-difference';

@Injectable({
  providedIn: 'root'
})
export class ClaimRulesService {

  constructor(private dateTimeUtil:DateTimeUtil) { }

  validateDiagnosisRules(dos:Date, diagElement:any,patientInfo:any){

    let dobDate = this.dateTimeUtil.getDateTimeFromString(patientInfo.dob, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    //let dosDate = this.dateTimeUtil.getDateTimeFromString(dos, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    let ageWrtDos:DateDifference = this.dateTimeUtil.calculateDateDiferrence(dobDate, dos);

    debugger;
    let ageCriteriaNotMet: boolean = false;
    let genderCriteriaNotMet: boolean = false;
    let strMsg = "";

    if (diagElement.condition_gender != undefined && diagElement.condition_gender != "") {

      let genderCondition: string = "";

      if (diagElement.condition_gender.toUpperCase() == "M" || diagElement.condition_gender.toUpperCase() == "MALE") {
        genderCondition = "M"
      }
      if (diagElement.condition_gender.toUpperCase() == "F" || diagElement.condition_gender.toUpperCase() == "FEMALE") {
        genderCondition = "F"
      }


      if (genderCondition.toUpperCase() != "BOTH"
        && genderCondition.toUpperCase() != patientInfo.gender_code.toUpperCase()
      ) {

        genderCriteriaNotMet = true;
      }
    }
    if (diagElement.condition_age != undefined && diagElement.condition_age != "") {

      let ageCondition: Array<string> = diagElement.condition_age.toString().split("~");

      if (ageCondition.length > 0) {

        let operator: string = ageCondition[0]; //Expected value <,>,between
        let ageRange: Array<string> = ageCondition[1].toString().split("^"); //Expected value 4-6,19
        let ageUnit: string = ageCondition[2];// expected value Y, M        

        let age1: number = Number(ageRange[0]);
        let age2: number;

        if (ageRange.length > 1) {
          age2 = Number(ageRange[1]);
        }


        switch (operator.toLowerCase()) {
          case ">":
            if (ageUnit.toUpperCase() == "Y") {

              if ((ageWrtDos.years < age1)
                || (ageWrtDos.years == age1 && (ageWrtDos.months > 0 || ageWrtDos.days > 0))
              ) {
                ageCriteriaNotMet = true;
              }

            }
            else if (ageUnit.toUpperCase() == "M") {

              if ((((ageWrtDos.years * 12) + ageWrtDos.months) < age1)
                || (((ageWrtDos.years * 12) + ageWrtDos.months) == age1 && ageWrtDos.days > 0)
              ) {
                ageCriteriaNotMet = true;
              }

            }

            break;
          case "<":

            if (ageUnit.toUpperCase() == "Y") {

              if (ageWrtDos.years >= age1) {
                ageCriteriaNotMet = true;
              }

            }
            else if (ageUnit.toUpperCase() == "M") {

              if (((ageWrtDos.years * 12) + ageWrtDos.months) >= age1) {
                ageCriteriaNotMet = true;
              }

            }
            break;
          case "between":

            if (ageUnit.toUpperCase() == "Y") {

              if ((ageWrtDos.years < age1) || (ageWrtDos.years > age2)
                || (ageWrtDos.years == age2 && (ageWrtDos.months > 0 || ageWrtDos.days > 0))
              ) {
                ageCriteriaNotMet = true;
              }

            }
            else if (ageUnit.toUpperCase() == "M") {

              if ((((ageWrtDos.years * 12) + ageWrtDos.months) < age1)
                || (((ageWrtDos.years * 12) + ageWrtDos.months) > age2)
                || (((ageWrtDos.years * 12) + ageWrtDos.months) == age2 && ageWrtDos.days > 0)
              ) {
                ageCriteriaNotMet = true;
              }
            }
            break;

          default:
            break;
        }
      }
    }


    if (ageCriteriaNotMet) {
      if (strMsg != "")
        strMsg += " and ";

      strMsg += "age";
    }
    if (genderCriteriaNotMet) {

      if (strMsg != "")
        strMsg += " and ";

      strMsg += "gender";
    }


    if (strMsg != "") {
      strMsg = "Diagnose Code " + diagElement.diag_code + " is not Valid for patient " + strMsg;      

      return strMsg;
    }
    else {
      return undefined;
    }

  }  
}
