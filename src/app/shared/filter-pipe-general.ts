import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
  {
    name: 'list-filter-general'
  }
)
export class ListFilterGeneral implements PipeTransform {
  transform(list: any, filters: { [key: string]: any }) {


    if (list == undefined)
      return null;
    return list.filter(item => {

      let notMatchingField = Object.keys(filters)
        .find(key => {
          debugger;
          return  item[key].toString() != filters[key].toString()
        }
        );

      return !notMatchingField; // true if matches all fields

    });
  }
}