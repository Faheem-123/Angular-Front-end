import { unwatchFile } from "fs";
import { DateTimeFormat, DateTimeUtil } from "./date-time-util";
import { ValidatorFn, AbstractControl } from "@angular/forms";

export class CustomValidators {


    static requiredWhenBoolean(requiredControlName, controlToCheckName) {

        return (control) => {

            let required = control.get(requiredControlName).value;
            let toCheck = control.get(controlToCheckName).value;

            return (required != null && required != undefined && required != "") || (!toCheck)
                ? null
                : { requiredWhen: true, controlName: requiredControlName }; //control.get(requiredControlName).setErrors({ requiredWhen: true });// 

        };
    }

    static requiredWhenNotBoolean(requiredControlName, controlToCheckName) {

        return (control) => {

            let required = control.get(requiredControlName).value;
            let toCheck = control.get(controlToCheckName).value;

            return (required != null && required != undefined && required != "") || (toCheck)
                ? null
                : { requiredWhen: true, controlName: requiredControlName }; //control.get(requiredControlName).setErrors({ requiredWhen: true });// 

        };
    }

    static requiredWhenOneOptionWithValue(requiredControlName: string, controlToCheckName: string, controlToCheckValue: any) {

        return (control) => {

            let required = control.get(requiredControlName).value;
            let toCheck = control.get(controlToCheckName).value;


            let result = (required != null && required != undefined && required != "") || (toCheck != controlToCheckValue)
                ? null
                : { requiredWhen: true, controlName: requiredControlName }; //control.get(requiredControlName).setErrors({ requiredWhen: true });// 


            return result;

        };
    }

    static requiredWhenTwoOptionWithValue(requiredControlName, controlToCheckName1, controlToCheckValue1, controlToCheckName2, controlToCheckValue2) {

        return (control) => {

            let required = control.get(requiredControlName).value;
            let toCheck1 = control.get(controlToCheckName1).value;
            let toCheck2 = control.get(controlToCheckName2).value;

            let result = (required != null && required != undefined && required != "") || (toCheck1 != controlToCheckValue1) || (toCheck2 != controlToCheckValue2)
                ? null
                : { requiredWhen: true, controlName: requiredControlName }; //control.get(requiredControlName).setErrors({ requiredWhen: true });// 

            return result;

        };
    }


    static requiredDateTime(dateControlName, timeControlName) {

        return (control) => {

            let dt = control.get(dateControlName).value;
            let tm = control.get(timeControlName).value;

            if ((dt == null || dt == undefined) && (tm == null || tm == undefined)) {
                return null;
            }
            else if ((dt != null || dt != undefined) && (tm != null || tm != undefined)) {
                let datetime;
                if (dt.year == undefined && dt.month == undefined && dt.day == undefined) {
                    datetime = dt + ' ' + String("00" + tm.hour).slice(-2) + ':' + String("00" + tm.minute).slice(-2);
                }
                else {
                    datetime = String("00" + dt.month).slice(-2) + '/' + String("00" + dt.day).slice(-2) + '/' + dt.year + ' ' + String("00" + tm.hour).slice(-2) + ':' + String("00" + tm.minute).slice(-2);
                }

                var moment = require('moment-timezone');
                moment.tz.setDefault("America/Wisconsin");
                if (!(moment(datetime, "MM/DD/YYY HH:mm", true).isValid())) {
                    //return null;
                    //return control.get(dateControlName).setErrors({ requiredDateTime: true });//  { requiredDateTime: true }       
                    return { requiredDateTime: true, controlName: dateControlName }
                }
                else {
                    return null;
                }
            }
            else {
                //debugger;
                //return control.get(dateControlName).setErrors({ requiredDateTime: true });//{ requiredDateTime: true }
                return { requiredDateTime: true, controlName: dateControlName }
            }

        };
    }

    static matchPassword(passwordControlName, confirmPasswordControlName) {

        return (control) => {
            let password = control.get(passwordControlName).value; // to get value in input tag
            let confirmPassword = control.get(confirmPasswordControlName).value; // to get value in input tag

            if (password != confirmPassword) {
                //console.log('false');
                //return control.get(confirmPasswordControlName).setErrors({ matchPassword: true })
                return { matchPassword: true }; //control.get(requiredControlName).setErrors({ requiredWhen: true });// ;
            } else {
                // console.log('true');
                return null
            }
        };
    }

    /*

    static validDate(dateControlName, nullAllowed: boolean) {


        return (control) => {


            var moment = require('moment-timezone');
            moment.tz.setDefault("America/Los_Angeles");

            let dt = control.get(dateControlName).value; // to get value in input tag

            let year;//= moment(dt,"MM/DD/YYYY").year();

            let datetime;
            if (dt == null || dt == undefined || dt == "") {
                if (nullAllowed) {
                    return null;
                }
                else {
                    //return control.get(dateControlName).setErrors({ validDate: true })
                    return { validDate: true, controlName: dateControlName }
                }
            }

            if (dt.year == undefined && dt.month == undefined && dt.day == undefined) {
                datetime = dt
                year = moment(dt, "MM/DD/YYYY").year();
            }
            else {
                datetime = String("00" + dt.month).slice(-2) + '/' + String("00" + dt.day).slice(-2) + '/' + dt.year;
                year = dt.year;
            }

            let isValid = moment(dt, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, true).isValid();
            if (!isValid || year < 1900) {
                return { validDate: true, controlName: dateControlName };
            }
            else {
                return null;
            }
        };
    }
    */

    /*
    static validDateWithFormat(dateControlName: any, dtFormat: DateTimeFormat, nullAllowed: boolean) {


        return (control) => {


            debugger;
            var moment = require('moment-timezone');
            moment.tz.setDefault("America/Los_Angeles");

            let dt = control.get(dateControlName).value; // to get value in input tag

            let year;//= moment(dt,"MM/DD/YYYY").year();

            //let datetime;
            if (dt == null || dt == undefined || dt == "") {
                if (nullAllowed) {
                    return null;
                }
                else {
                    //return control.get(dateControlName).setErrors({ validDate: true })
                    return { invalidDate: true, controlName: dateControlName }
                }
            }

            let isValid = moment(dt, dtFormat, true).isValid();
            if (isValid) {

                dt = moment(dt, dtFormat, true).toDate();

                var mt = moment(dt);
                dt = mt.format(DateTimeFormat.DATEFORMAT_MM_DD_YYYY);


                if (dt.year == undefined && dt.month == undefined && dt.day == undefined) {
                    // datetime = dt
                    year = moment(dt, dtFormat).year();
                }
                else {
                    // datetime = String("00" + dt.month).slice(-2) + '/' + String("00" + dt.day).slice(-2) + '/' + dt.year;
                    year = dt.year;
                }

                if (year < 1900) {
                    //return control.get(dateControlName).setErrors({ validDate: true })
                    return { invalidDate: true, controlName: dateControlName }
                }
                else {
                    return null
                }
            }
            else {
                return { invalidDate: true, controlName: dateControlName }
            }


        };
    }
    */

    static requiredEither(control1, control2, groupName) {

        return (control) => {

            let val1 = control.get(control1).value;
            let val2 = control.get(control2).value;

            let a = (val1 != null && val1 != undefined && val1 != "") || (val2 != null && val2 != undefined && val2 != "")

            return (val1 != null && val1 != undefined && val1 != "") || (val2 != null && val2 != undefined && val2 != "")
                ? null
                : { requiredWhen: true, groupName: groupName };

        };
    }

    static requiredAnyOfControl(lstControls, groupName) {

        return (control) => {

            let isValid: boolean = false;


            for (let controlName of lstControls) {
                let controlValue = control.get(controlName).value;
                if (controlValue != null && controlValue != undefined && controlValue != "") {
                    isValid = true;
                    break;
                }
            }
            return isValid ? null : { requiredWhen: true, groupName: groupName };
        };
    }

    static requiredAnyOfControlWhenOptionWithValue(lstControls, controlToCheck, value, groupName) {

        return (control) => {


            let controlToCheckValue = control.get(controlToCheck).value;
            if (controlToCheckValue == value) {
                let isValid: boolean = false;


                for (let controlName of lstControls) {
                    let controlValue = control.get(controlName).value;
                    if (controlValue != null && controlValue != undefined && controlValue != "") {
                        isValid = true;
                        break;
                    }
                }

                return isValid ? null : { requiredWhen: true, groupName: groupName };
            }
            else
                return null;


        };
    }

    static requiredAnyOfControlWhenOptionWithMultipleValue(lstControls, controlToCheck, lstValues, groupName) {

        return (control) => {

            let controlToCheckValue = control.get(controlToCheck).value;

            for (let value of lstValues) {
                if (controlToCheckValue == value) {
                    let isValid: boolean = false;


                    for (let controlName of lstControls) {
                        let controlValue = control.get(controlName).value;
                        if (controlValue != null && controlValue != undefined && controlValue != "") {
                            isValid = true;
                            break;
                        }
                    }

                    return isValid ? null : { requiredWhen: true, groupName: groupName };
                }
            }
            return null;

        };
    }

    static requiredWhenAnyOfMultipleValues(requiredControlName, controlToCheckName, lstVlauesToMatch) {
        return (control) => {


            let controlToCheckValue = control.get(controlToCheckName).value;

            for (let value of lstVlauesToMatch) {

                if (controlToCheckValue == value) {

                    let isValid: boolean = false;

                    let controlValue = control.get(requiredControlName).value;
                    if (controlValue != null && controlValue != undefined && controlValue != "") {
                        isValid = true;
                        break;
                    }

                    return isValid ? null : { required: true };
                }
            }
            return null;

        };
    }

    static requiredWhenNotNull(requiredControlName, controlToCheckName) {
        return (control) => {


            let controlToCheckValue = control.get(controlToCheckName).value;

            if (controlToCheckValue != null && controlToCheckValue != undefined && controlToCheckValue != "") {
                let controlValue = control.get(requiredControlName).value;
                if (controlValue == null || controlValue == undefined || controlValue == "") {
                    return { required: true };
                }
            }
            return null;
        };
    }
}

export function datetimeValidator(dateTimeFormat: DateTimeFormat): ValidatorFn {



    return (control: AbstractControl): { [key: string]: any } | null => {

        let isValid = true;

        var moment = require('moment-timezone');
        moment.tz.setDefault("America/Los_Angeles");

        let dt = control.value; // to get value in input tag

        if (dt != null && dt != undefined && dt != "") {


            // in case of Model
            if (dt.year != undefined && dt.month != undefined && dt.day != undefined) {

                if (dt.year > 1900 && dt.year <= 9999 && dt.month >= 1 && dt.month <= 12 && dt.day >= 1 && dt.day <= 31) {

                    switch (dateTimeFormat) {
                        case DateTimeFormat.DATEFORMAT_MM_DD_YYYY:
                            dt = String("00" + dt.month).slice(-2) + '/' + String("00" + dt.day).slice(-2) + '/' + String("0000" + dt.year).slice(-4);
                            break;
                        case DateTimeFormat.DATEFORMAT_YYYY_MM_DD:
                            dt = String("0000" + dt.year).slice(-4) + '-' + String("00" + dt.month).slice(-2) + '-' + String("00" + dt.day).slice(-2);
                            break;
                        default:
                            break;
                    }
                }
                else {
                    dt = "";
                }
            }

            isValid = moment(dt, dateTimeFormat, true).isValid();

            if (isValid) {

                let dateValue: Date = moment(dt, dateTimeFormat, true).toDate();

                if (dateValue.getFullYear() > 1900) {
                    isValid = true;
                }
                else {
                    isValid = false;
                }
            }

        }
        return isValid ? null : { 'invalidDate': { value: control.value } };
    };
}