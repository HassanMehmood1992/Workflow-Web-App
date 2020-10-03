import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterArrayLookupDialog'
})
export class FilterArrayLookupDialogPipe implements PipeTransform {

  transform(items: any, searchstring: any, cols: any): any {
    let searchColumns = [];
    for(let column in cols){
      let obj = cols[column]; 
      for(let subCol in obj)
      {
        if(subCol.toLowerCase() == "columnheading" && obj[subCol] != undefined){
          if(searchColumns.indexOf(obj["columnName"]) == -1){
            searchColumns.push(obj["columnName"]);
          }
        }
      }
    }
    //default case if the search string do not contan any thing 
    if (searchstring === undefined) return items;
    if(searchstring=== '') return items;
    if(items === undefined) return [];
 
    // array filter function over ridding to filter if filter string is provided
    return items.filter(function(item) {
      for(let property in item){
        if (item[property] === null){
          continue;
        }
        
        //return th object if the object property contain the search string
        if(typeof item[property] == "object" && searchColumns.indexOf(property) != -1){
          for(let i=0;i<item[property].length;i++){
            for(let key in item[property][i]){
              let obj = item[property][i][key];
              if(obj!=null&&obj!=undefined&&obj.toString().toLowerCase().includes(searchstring.toLowerCase())){
                return true;
              }
            }
          }
        }
        else{
          if(searchColumns.indexOf(property) != -1){
            if(item[property]!=null&&item[property]!=undefined&&item[property].toString().toLowerCase().includes(searchstring.toLowerCase())){
              return true;
            }
          }
        }
      }
      return false;
    });
  }

}
