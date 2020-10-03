/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: FormatDatePipe
Description: Global pipe to return formated date.
Location: ./pipes/formatdate.pipe
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
/**
 *Pipe Decorator
 * 
 * @export
 * @class FormatdatePipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'formatdate'
})
export class FormatdatePipe implements PipeTransform {
/**
 * Get the date string and return formated date string
 * 
 * @param {*} [date] 
 * @param {*} [args] 
 * @returns {*} 
 * @memberof FormatdatePipe
 */
transform(date?: any, args?: any): any {
    if (date) {

        // converting to date from the provided date string
        var oneDay = 24 * 60 * 60 * 1000;
        var secondDate = new Date(date);
        var firstDate = new Date();
        var diffDays = Math.floor(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
   
        // case to return the complete date of the date is before a week
        if (diffDays > 7) {  
            var dateB = moment(date);
            return dateB.format('DD-MMM-YYYY').toUpperCase();
        } else {
              // case to to return time only if the date found as todays date
            if (diffDays ==0) {
                var dateB = moment(date);
                return dateB.format('LT')
            
            }else
            // case to retun week day if the date found winthin  current week
             if (diffDays>=1) {
                var dateB = moment(date);
                return dateB.format('dddd');
            }
        }
    }
    return '';
    }
}
