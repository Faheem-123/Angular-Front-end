import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
    {
        name: 'listFilterWithNumericCondition',
        pure: false
    }
)
export class listFilterWithNumericCondition implements PipeTransform {
    transform(list: any, col: any, condition: any, value: any) {

       
        if (list == undefined)
            return null;
        else if (col == undefined || condition == undefined || value == undefined) {
            return list;
        }
        else {

            let val = Number(value);
            let lstFiltered: any;

            if (val == undefined || val == NaN) {
                return null;
            }

            switch (condition) {
                case "<":
                    lstFiltered = list.filter(lst =>
                        Number(lst[col]) < Number(value)
                    );
                    break;
                case "<=":
                    lstFiltered = list.filter(lst =>
                        Number(lst[col]) <= Number(value)
                    );
                    break;
                case ">":
                    lstFiltered = list.filter(lst =>
                        Number(lst[col]) > Number(value)
                    );
                    break;
                case ">=":
                    lstFiltered = list.filter(lst =>
                        Number(lst[col]) >= Number(value)
                    );
                    break;
                case "=":
                    lstFiltered = list.filter(lst =>
                        Number(lst[col]) == Number(value)
                    );
                    break;
                case "!=":
                    lstFiltered = list.filter(lst =>
                        Number(lst[col]) != Number(value)
                    );
                    break;

                default:
                    break;
            }

            return lstFiltered
        }
    }
}