import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
  {
    name: 'listFilterGeneralNotIn'
  }
)
export class ListFilterGeneralNotIn implements PipeTransform {
  transform(list: any, filters: { [key: string]: any }) {


    if (list == undefined)
      return null;
    return list.filter(item => {

      let matchingField = Object.keys(filters)
        .find(key =>
          (item[key] == undefined || item[key] == null) ? false :  item[key].toString() == filters[key].toString()
        );

      return !matchingField; // true if all fields not matches

    });
  }
}