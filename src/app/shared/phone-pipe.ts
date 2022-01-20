import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
  {
    name: 'phonePipe'
  }
)
export class PhonePipe implements PipeTransform {
  transform(phoneNo) {


    if (phoneNo == undefined)
      return phoneNo;

    var value = phoneNo.toString().trim().replace(/[^\d]/g, "");//replace(/[\. ,:-]+/g, "");

    if (value.match(/[^0-9]/)) {
      return phoneNo;
    }

    if (value.length == 10) {
      return "(" + value.slice(0, 3) + ") " + value.slice(3, 6) + "-" + value.slice(6, 10);
    }
    else if (value.length == 11)// Without Conutry Code
    {
      return "(" + value.slice(1, 4) + ") " + value.slice(4, 7) + "-" + value.slice(7, 11);
    }


    else return phoneNo;
  }
}