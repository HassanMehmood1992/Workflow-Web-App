/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: EscapehtmlPipe
Description: Global pipe to escape the provided HTML value.
Location: ./pipes/escapehtml.pipe
Author: Nabil
Version: 1.0.0
Modification history: none
*/

import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'escapehtml'//pipe name
})
export class EscapehtmlPipe implements PipeTransform {
  /**
   * Default constructor with dom sanitizer object dependency injection
   * @param sanitizer 
   */
  constructor(private sanitizer:DomSanitizer){

  }

  transform(value: any): any { 
    //bypass css sanitization of html
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}
