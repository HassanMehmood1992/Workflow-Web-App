/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: EncryptionService
Description: Global service to encrypt/decrypt the provided data.
Location: ./services/encryption.service
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/

import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js/crypto-js.js';

/**
 * Service Decorator
 * 
 * @export
 * @class EncryptionService
 */
@Injectable()
export class EncryptionService {

   /**
    * Creates an instance of EncryptionService.
    * @memberof EncryptionService
    */
   constructor() {
    
   }
   /**
    * Method to return the encrypted string
    * 
    * @param {string} data 
    * @returns 
    * @memberof EncryptionService
    */
   encryptData(data:string){
    let key:string = CryptoJS.enc.Utf8.parse('0807060504030201');
    let iv:string = CryptoJS.enc.Utf8.parse('0807060504030201');
    //encryption using Crypto js
    let encryptedData:string = CryptoJS.AES.encrypt(data, key, { iv: iv, keySize: 128 / 8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encryptedData.toString();
    
   }
   /**
    * Method to return the decrypted string
    * 
    * @param {string} encrypteddata 
    * @returns 
    * @memberof EncryptionService
    */
   decryptData(encrypteddata:string)
   {
    let key:string = CryptoJS.enc.Utf8.parse('0807060504030201');
    let iv:string = CryptoJS.enc.Utf8.parse('0807060504030201');
    //decryption using Crypto js
    let DecrypticData:string = CryptoJS.AES.decrypt(encrypteddata, key, { iv: iv, keySize: 128 / 8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
    return DecrypticData.toString()
   }

}
