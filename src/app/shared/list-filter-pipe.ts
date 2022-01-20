import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
    { 
        name: 'listFilter' 
    }
)
export class ListFilterPipe implements PipeTransform {
  transform(list:any,col:any,value:any) { 
      if(list== undefined  )
        return null;
      else if(value==undefined || value=="" || value=="all")
      {
        return list;
      }
      else 
      {
         return list.filter(lst =>  
          (lst[col] == undefined || lst[col] == null) ? false :         
          lst[col].toString().toLowerCase()===value.toString().toLowerCase()
          );       
         //return list.filter(lst => lst[col].toString().toLowerCase().includes(value.toString().toLowerCase()));
      }
  }
}