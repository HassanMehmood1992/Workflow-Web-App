/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SocketProvider
Description: Class to perform all socket related operations for the project.
Location: ./services/socket.service
Author: Arsalan
Version: 1.0.0
Modification history: none
*/

import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ReplaySubject } from 'rxjs';
import 'rxjs/Rx';
declare var jquery:any;
declare var $ :any;

/*
  Generated class for the SocketProvider provider.
*/
@Injectable()
export class SocketProvider {

  private static callbacks = {};
  private static appServer: string = '';
  private static ws = null;
  public static ServerConnected:boolean;
  private currentCallbackId: number = 0;
  private _navToNotification = new ReplaySubject;
  private static rejectTimeout:any;
  // Observable navItem stream
  navToNotification$ = this._navToNotification.asObservable();
  
  

  constructor(private http: Http) {
    //call check periodically and try establishing connection if not connected
    this.setUrl(environment.SERVER_SOCKET_URL);
    
    SocketProvider.ServerConnected=false

    this.check()
    setInterval(this.check, 5000);
    
  }

  /**
   * Try establishing connection if not connected
   */
  check() {
    // SocketProvider.releaseMissedResponses();
    
    if (!SocketProvider.ws || SocketProvider.ws.readyState === 3) {
      SocketProvider.start();
    }
    else{
     }
  };


  /**
* Release the callbackIDs of synchronization socket calls whose responses are not recieved 
*/
  // static releaseMissedResponses() {
  //   Object.keys(SocketProvider.callbacks).forEach(function (key: any, index) {
  //     // key: the name of the object key
  //     // index: the ordinal position of the key within the object
 
  //       let diff: any = Math.floor((Math.abs(Date.parse(new Date(SocketProvider.callbacks[key].time).toString()) - Date.parse(new Date().toString())) / 1000));
  //       if (diff >= 60) {
  //         SocketProvider.callbacks[key].reject('NoConnection');
  //         delete SocketProvider.callbacks[key];
  //         SocketProvider.start();
  //       }
       
   
  //   });
  // }


  /**
   * Setters
   */
  setUrl(serverSocketURL) {
    SocketProvider.appServer = serverSocketURL;
  };

  /**
   * Getters
   */
  returnsocket() {
    return SocketProvider.ws;
  };
  getAppServer() {
    return SocketProvider.appServer;
  };

  start() {
    SocketProvider.start();
  };

  /**
   * Start the web socket
   */
  static start() {
    if (this.appServer !== '') {
      try {
        SocketProvider.ws = new WebSocket(this.appServer);
      } catch (ex) {         
      }

      //on-open event listener..
      SocketProvider.ws.onopen = function () {
         SocketProvider.ServerConnected=true
      };

      //on-message event listener..
      SocketProvider.ws.onmessage = function (message) {
        SocketProvider.listener(message.data);
      };

      //on-close event listener..
      SocketProvider.ws.onclose = function () {

         SocketProvider.ServerConnected=false
         if(window.location.href.indexOf('/form/')!=-1||window.location.href.indexOf('/submissions')!=-1||window.location.href.indexOf('/tasks')!=-1||window.location.href.indexOf('/Lookup/')!=-1||window.location.href.indexOf('/login')!=-1)
         {
         
         }
        //Upon closing, resolve all callbacks to avoid a socket call promise not resolving...
        //resolve as 'NoConnection' and deletes 20 previous socket calls with sent = true..
        for (var i = this.currentCallbackId; i >= (this.currentCallbackId - 20); i--) {
          if (i < 0) {
            break;
          }
          if (this.callbacks[i])//if not undefined..
          {
            if (this.callbacks[i].sent === true) {
              this.callbacks[i].reject({stack:"NoConnection"});
              SocketProvider.ServerConnected=false
              delete this.callbacks[i];
            }
          }
        }
      };

      //on-error event listener..
      SocketProvider.ws.onerror = function () {
      };
    }
  };

  /**
   * Send message over the socket
   * @param request 
   */
  sendRequest(request) {
    let promise = new Promise((resolve, reject) => {
      var callbackId = this.getCallbackId();
      SocketProvider.callbacks[callbackId] = {
        time: new Date(),
        resolve: resolve,
        reject: reject,
        sent: false
      };
      request.callBackId = callbackId;
      SocketProvider.waitForSocketConnection(SocketProvider.ws, 0, callbackId, (socketConnected, callBackId) => {
        try {
          if (!socketConnected) {
            SocketProvider.callbacks[callBackId].reject({stack:"NoConnection"});
            if(window.location.href.indexOf('/form/')!=-1||window.location.href.indexOf('/submissions')!=-1||window.location.href.indexOf('/tasks')!=-1||window.location.href.indexOf('/Lookup/')!=-1||window.location.href.indexOf('/login')!=-1)
            {
             
            }
            
            SocketProvider.ServerConnected=false
            delete SocketProvider.callbacks[callBackId];
          }
          else {
             SocketProvider.ws.send(JSON.stringify(request));
            SocketProvider.callbacks[callbackId].sent = true;
            SocketProvider.ServerConnected=true
            if(request.methodName == "workflowProgress"){
              this._navToNotification.next(true);
            }
            else{
              this._navToNotification.next(false);
            }
            SocketProvider.rejectTimeout= setTimeout(()=> {
              SocketProvider.callbacks[callBackId].reject({stack:"TimeoutError"});
              delete SocketProvider.callbacks[callBackId];
          }, 60000);
          }
        } catch (e) {
          SocketProvider.callbacks[callBackId].reject(e);
          delete SocketProvider.callbacks[callBackId];
        }
      });
    });
    return promise;
  };

  /**
   * Handler for incoming messages
   * @param payload 
   */
  static listener(payload) {
    //extract the callbackId from string in case the json is malformed
    var callbackId = payload.match(/\[{"callBackId":"(\d+)/i)[1];

    try {
      var data = JSON.parse(payload);
      var messageObj = data[0];

      //If an object exists with callback_id in our callbacks object, resolve it
     if(SocketProvider.callbacks[messageObj.callBackId]){
       clearTimeout(SocketProvider.rejectTimeout)
      SocketProvider.callbacks[messageObj.callBackId].resolve(messageObj.data);
      delete SocketProvider.callbacks[messageObj.callBackId];
     }
      

    } catch (e) {
      SocketProvider.callbacks[callbackId].reject(e); //callback id cannot be extracted..
      delete SocketProvider.callbacks[callbackId];
    }
  };

  /**
   * Create a new callback ID for a request
   */
  getCallbackId() {
    this.currentCallbackId += 1;
    //flush the callbackids..
    if (this.currentCallbackId > 10000) {
      this.currentCallbackId = 0;
    }
    return this.currentCallbackId;
  };

  /**
   * Call the websocket service
   * with the provided payload
   * @param methodName 
   * @param parameterObj 
   */
  callWebSocketService(methodName, parameterObj): any {
    var request = {
    operationType: parameterObj.operationType,
    methodName: methodName,
    parameterObj: JSON.stringify(parameterObj)
    };
    var promise = this.sendRequest(request);
    return promise;
    };

  /**
   * Wait until the connection is made. Resolve with
   * error if connection attempts exceed the number
   * specified in 'ENV.SOCKET_CONNECTION_RETRIES'
   * @param socket 
   * @param retries 
   * @param callBackId 
   * @param callback 
   */
  static waitForSocketConnection(socket, retries, callBackId, callback) {
    setTimeout(
      function () {
        if (socket) {
          if (socket.readyState === 1) {
            if (callback !== null) {
              callback(true, callBackId);
            }
            return;
          }
          else {
            if (retries >= environment.SOCKET_CONNECTION_RETRIES) {
              callback(false, callBackId);
              return;
            }
            retries++;
            SocketProvider.waitForSocketConnection(socket, retries, callBackId, callback);
          }
        }
      }, 1000); // wait 5 milisecond for the connection...
  };
}
