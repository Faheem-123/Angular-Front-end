import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
    { 
        name: 'listFilterContainThreeColumns' 
    }
)
//PIPE Description: Search one value in three columns
export class ListFilterContainThreeColumns implements PipeTransform {
  transform(list:any,col1:any,col2:any,col3:any,value:any) { 
     
      if(list== undefined  )
        return null;
      else if(value==undefined || value=="" || value=="all")
      {
        return list;
      }
      else 
      {
         return list.filter(lst => 
            lst[col1].toString().toLowerCase().includes(value.toString().toLowerCase())
            ||
            lst[col2].toString().toLowerCase().includes(value.toString().toLowerCase())
            ||
            lst[col3].toString().toLowerCase().includes(value.toString().toLowerCase())
            );       
         
      }
  }
}