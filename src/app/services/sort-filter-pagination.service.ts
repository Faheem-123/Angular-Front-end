import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { QueryList } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | '';
export type SortType = 'alpha' | 'numeric' | 'datetime' | 'date' | '';
const rotate: { [key: string]: SortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

export const compareInsuranceTypes = (insType1: string, insType2: string) => {

  let res: number = 0;

  let val1: number = 0;
  let val2: number = 0;

  let ins1 = (insType1 == undefined || insType1 == null) ? '' : insType1.toString().toLowerCase();
  let ins2 = (insType2 == undefined || insType2 == null) ? '' : insType2.toString().toLowerCase();

  switch (ins1) {
    case 'primary':
      val1 = 1;
      break;
    case 'secondary':
      val1 = 2;
      break;
    case 'other':
      val1 = 3;
      break;
    default:
      val1 = 0;
      break;
  }

  switch (ins2) {
    case 'primary':
      val2 = 1;
      break;
    case 'secondary':
      val2 = 2;
      break;
    case 'other':
      val2 = 3;
      break;
    default:
      val2 = 0;
      break;
  }
  res = val1 < val2 ? -1 : val1 > val2 ? 1 : 0
  return res
}

export const compare = (v1, v2, type, formate) => {

  if (type == undefined) {
    return 0;
  }


  let res: number = 0;
  let moment = require('moment-timezone');
  switch (type) {
    case 'alpha':
      debugger;
      let alpha1 = (v1 == undefined || v1 == null) ? '' : v1.toString().toLowerCase();
      let alpha2 = (v2 == undefined || v2 == null) ? '' : v2.toString().toLowerCase();
      res = alpha1 < alpha2 ? -1 : alpha1 > alpha2 ? 1 : 0;
      break;
    case 'numeric':
      debugger;
      let num1 = (v1 == undefined || v1 == null) ? 0 : Number(v1)
      let num2 = (v2 == undefined || v2 == null) ? 0 : Number(v2)

      if (num1 != undefined || num2 != undefined) {
        res = num1 < num2 ? -1 : num1 > num2 ? 1 : 0;
      }
      break;
    case 'datetime':
      debugger;
      //Recomended is YYYY-MM-DD HH:mm:ss.S
      var dt1: Date;
      var dt2: Date;

      if (formate == undefined || formate == "") {
        //formate="YYYY-MM-DD HH:mm:ss.S";
        if (moment(v1).isValid()) {
          dt1 = moment(v1).toDate()
        }
        else {
          dt1 = moment("1900-01-01", "YYYY-MM-DD").toDate();
        }


        if (moment(v2).isValid()) {
          dt2 = moment(v2).toDate();
        }
        else {
          dt2 = moment("1900-01-01", "YYYY-MM-DD").toDate();
        }
      }
      else {
        if (moment(v1, formate, true).isValid()) {
          dt1 = moment(v1, formate).toDate()
        }
        else {
          dt1 = moment("1900-01-01", "YYYY-MM-DD").toDate();
        }


        if (moment(v2, formate, true).isValid()) {
          dt2 = moment(v2, formate).toDate();
        }
        else {
          dt2 = moment("1900-01-01", "YYYY-MM-DD").toDate();
        }
      }
      res = dt1 < dt2 ? -1 : dt1 > dt2 ? 1 : 0

      break;
    case 'date':
      debugger;
      //Recomended is YYYY-MM-DD      
      if (formate == undefined || formate == "") {
        formate = "YYYY-MM-DD";
      }
      var dt1: Date;
      var dt2: Date;

      if (moment(v1, true).isValid()) {
        dt1 = moment(v1).toDate()
      }
      else {
        dt1 = moment("1900-01-01", "YYYY-MM-DD").toDate();
      }


      if (moment(v2, true).isValid()) {
        dt2 = moment(v2).toDate();
      }
      else {
        dt2 = moment("1900-01-01", "YYYY-MM-DD").toDate();
      }


      res = dt1 < dt2 ? -1 : dt1 > dt2 ? 1 : 0


      break;

    default:
      res = v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
      break;
  }

  return res
}

export class PagingOptions {
  page: number;
  pageSize: number;
  constructor(page: number, pageSize: number) {
    this.page = page;
    this.pageSize = pageSize;
  }
}
export class FilterOptions {
  searchTerm: string = '';
  searchFeild: string = '';
  constructor(searchTerm: string, searchFeild: string) {
    this.searchTerm = searchTerm;
    this.searchFeild = searchFeild;
  }
}

export class SortFilterPaginationResult {
  list: Array<any>;
  total: number;

  constructor(lst: Array<any>, total: number) {
    this.list = lst;
    this.total = total;
  }
}

export interface SortEvent {
  column: string;
  direction: SortDirection;
  type: SortType;
  format: string;
}


@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeader {

  @Input() sortable: string;
  @Input() direction: SortDirection = '';
  @Input() type: SortType = '';
  @Input() format: string = '';
  @Input() table: string='';

  @Output() sort = new EventEmitter<SortEvent>();


  rotate() {

    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction, type: this.type, format: this.format });
  }
}


function matches(element: any, term: string, colum: string) {


  let res: boolean = false;

  if (element == undefined || element[colum] == undefined || element[colum] == null) {
    res = false;
  }
  else {
    res = element[colum].toLowerCase().includes(term.toLowerCase())
  }
  /*
return country.name.toLowerCase().includes(term)
  || pipe.transform(country.area).includes(term)
  || pipe.transform(country.population).includes(term);
  */

  return res;
}


function sort(sortEvent: SortEvent, lst: Array<any>, headers: QueryList<NgbdSortableHeader>,table:string): Array<any> {


  debugger;
  // resetting other headers
  if (headers != undefined) {
    headers.forEach(header => {
      if (table==header.table && (sortEvent == undefined || header.sortable !== sortEvent.column)) {
        header.direction = '';
      }
    });

  }

  // sorting 

  if (sortEvent == undefined || sortEvent.direction === '') {
    lst = lst;
  } else {
    lst = [...lst].sort((a, b) => {


      const res = compare(a[sortEvent.column], b[sortEvent.column], sortEvent.type, sortEvent.format);

      return sortEvent.direction === 'asc' ? res : -res;
    });
  }



  return lst;
}


export class SortFilterPaginationService {



  search(lstSource: Array<any>, headers: QueryList<NgbdSortableHeader>, sortEvent: SortEvent, filterOptions: FilterOptions, pagingOptions: PagingOptions,table:string): SortFilterPaginationResult {

    debugger;



    let sortFilterPaginationResult: SortFilterPaginationResult;
    if (lstSource != undefined) {

      // 1. sort
      let lstProcessed = sort(sortEvent, lstSource, headers,table);

      // 2. filter
      if (filterOptions != undefined && filterOptions.searchTerm != '' && filterOptions.searchFeild != '') {
        lstProcessed = lstProcessed.filter(element => matches(element, filterOptions.searchTerm, filterOptions.searchFeild));
      }
      let total = lstProcessed.length;

      // 3. paginate
      if (pagingOptions != undefined) {
        lstProcessed = lstProcessed.slice((pagingOptions.page - 1) * pagingOptions.pageSize, (pagingOptions.page - 1) * pagingOptions.pageSize + pagingOptions.pageSize);
      }

      sortFilterPaginationResult = new SortFilterPaginationResult(lstProcessed, total);
    }
    else {

      // resetting other headers
      if (headers != undefined) {
        headers.forEach(header => {
          if (sortEvent == undefined || header.sortable !== sortEvent.column) {
            header.direction = '';
          }
        });
      }


      sortFilterPaginationResult = new SortFilterPaginationResult(lstSource, 0);
    }

    return sortFilterPaginationResult;

  }


  sortInsuranceByType(lst: Array<any>): Array<any> {
    lst = [...lst].sort((a, b) => {
      const res = compareInsuranceTypes(a['insurace_type'], b['insurace_type']);

      return res;
    });


    debugger;
    return lst;

  }
}
