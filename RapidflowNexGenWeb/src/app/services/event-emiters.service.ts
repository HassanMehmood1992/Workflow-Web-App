/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: EventEmiterService
Description: Global service to communicate meta data between components and is disposed after usage.
Location: ./services/event-emiters.service
Author: Amir
Version: 1.0.0
Modification history: none
*/

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
/**
 * Service Decorator
 * 
 * @export
 * @class EventEmiterService
 */
@Injectable()
export class EventEmiterService {

  // initial value of Behaviour message to always return a value on subscription even if it hasn’t received a next() 
  private messageSource=new BehaviorSubject<object>({"Type":"ProcessCount",Value:{ "ProcessID":0,"TasKCount":0,"NotificationCount":0}})
  
  // the message to broadcast observed by multiple components
  currentMessage=this.messageSource.asObservable().share();
  /**
   * Creates an instance of EventEmiterService.
   * @memberof EventEmiterService
   */
  constructor() { }

  /**
   *  retrieve the last value of the subject in message source which is observed by current message
   * 
   * @param {object} message 
   * @memberof EventEmiterService
   */
  
  changeMessage(message:object){
    this.messageSource.next(message)
  }
 

}
