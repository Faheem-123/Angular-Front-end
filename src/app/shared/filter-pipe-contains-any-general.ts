import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
  {
    name: 'list-filter-contains-any-general'
  }
)
export class ListFilterContainsAnyGeneral implements PipeTransform {
  transform(list: any, filters: { [key: string]: any }) {

    debugger;
    if (list == undefined)
      return null;
    return list.filter(item => {

      debugger;
      let a: string;

      let matchingField = Object.keys(filters)
        .find(key =>

          (item[key] == undefined || item[key] == null) ? false : item[key].toString().toLocaleLowerCase().includes(filters[key].toString().toLocaleLowerCase())

        );


      debugger;
      return (matchingField == undefined ? false : true); // true if matches any mentioned fields

    });
  }
}