/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: SortListsService
Description: Provide functionality to sort a provided list in the provided order.
Location: ./services/sort-lists.service
Author: Amir Hussain
Version: 1.0.0
Modification history: none
*/

import { Injectable } from '@angular/core';
import * as moment from 'moment';

/**
 * Service Decorator
 * 
 * @export
 * @class SortListsService
 */
@Injectable()
export class SortListsService {
    /**
     * Creates an instance of SortListsService.
     * @memberof SortListsService
     */
    constructor() { }

    /**
     * Receives array and sort object and returns the sorted array
     * 
     * @param {any} array 
     * @param {any} sortObject 
     * @returns sortedArray
     * @memberof SortListsService
     */
    sort(array, sortObject) {
        let sortedArray: any;

        var SortArrayFunction = new sortFunc(array)
        SortArrayFunction.keySort(sortObject)

        sortedArray = SortArrayFunction.items

        return sortedArray
    }
}
function sortFunc(tobeSorteditems) {
    this.items = tobeSorteditems
}
    /**
 * prototype of the funciton sortFunction to receive the sort object and sort the items
 * 
 * @param {any} keys 
 * @returns 
 */
sortFunc.prototype.keySort = function (keys) {

    keys = keys || {};

    // via
    // http://stackoverflow.com/questions/5223/length-of-javascript-object-ie-associative-array
    // getting keys to sort with
    var obLen = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key))
                size++;
        }
        return size;
    };

  
    // varifying if the current item of array have the property to sort with
    var obIx = function (obj, ix) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (size == ix)
                    return key;
                size++;
            }
        }
        return false;
    };

    // sorting the item based on value type
   // receives two value and order to sort in  
    var keySort = function (a, b, d) {
        d = d !== null ? d : 1;
        if (a == b)
            return 0;
        // the case for people picker values
        if (Array.isArray(a) && Array.isArray(b) && a[0].DisplayName != undefined && b[0].DisplayName) {
            return a[0].DisplayName > b[0].DisplayName ? 1 * d : -1 * d;

        }
        // the case for integer values
        if (isNumeric(a) || isNumeric(b)) {
            return a > b ? 1 * d : -1 * d;

        }
        // case for date picker field
        if (Date.parse(a)) {
            var c = moment.utc(a).local().format('YYYY -MM-DD HH:mm  Z');
            var e = moment.utc(b).local().format('YYYY -MM-DD HH:mm  Z');
            return c > e ? 1 * d : -1 * d;
        } else {
            // case for any value converted to string
            if (a == undefined || b == undefined) {
                return 1;

            } else {
                a = a.toLowerCase(); // this breaks numbers
                b = b.toLowerCase();
                return a > b ? 1 * d : -1 * d;

            }

        }

    };

    // return length of keys in current object
    var KL = obLen(keys);

    if (!KL) return this.sort(keySort);

    // set keys sort values as 1 or -1 or 0
    for (var k in keys) {
        // asc unless desc or skip
        keys[k] =
            keys[k] == 'desc' || keys[k] == -1 ? -1
                : (keys[k] == 'skip' || keys[k] === 0 ? 0
                    : 1);
    }

    /**
     * checks if the value is numeric
     * 
     * @param {any} n 
     * @returns 
     */
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // sort the items by passing item one buy one
    this.items.sort(function (a, b) {
        var sorted = 0, ix = 0;

        while (sorted === 0 && ix < KL) {
            var k = obIx(keys, ix);
            if (k) {
                var abc = k.split('.')

               //if key is pointing towards another key present inside the value of that key
                if (abc.length > 1) {
                    let def = k.split('[')
                    if (def.length > 1) {
                        var dir = keys[k];
                        sorted = keySort(a[def[0]][0][abc[1]], b[def[0]][0][abc[1]], dir);
                        ix++;
                    } else {
                        var dir = keys[k];
                        sorted = keySort(a[abc[0]][abc[1]], b[abc[0]][abc[1]], dir);
                        ix++;

                    }

                } else {
                    var dir = keys[k];
                    sorted = keySort(a[k], b[k], dir);
                    ix++;
                }
            }
        }
        return sorted;
    });
    return this;
};
