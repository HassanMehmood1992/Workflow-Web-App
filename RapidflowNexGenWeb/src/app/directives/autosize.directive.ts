/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AutosizeDirective
Description: Provide functionality to auto expand and resize the provided textarea field.
Location: ./directives/autosize.directive.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/
import { Input, AfterViewInit, ElementRef, HostListener, Directive } from '@angular/core';

@Directive({
  selector: '[appAutosize]'
})
export class AutosizeDirective {

  /**
   * Creates an instance of AutosizeDirective.
   * @param {ElementRef} element 
   * @memberof AutosizeDirective
   */
  constructor(public element: ElementRef) {
    this.el = element.nativeElement;
    this._clientWidth = this.el.clientWidth;
  }

  private el: HTMLElement; // Global variable of the class to store the native HTML element for the auto size directive
  private _minHeight: string; // Global variable of the class to store the min heaigh of native HTML element for the auto size directive
  private _maxHeight: string; // Global variable of the class to store the max height of native HTML element for the auto size directive
  private _lastHeight: number; // Global variable of the class to store the last height of native HTML element for the auto size directive
  private _clientWidth: number; // Global variable of the class to store the client width of native HTML element for the auto size directive

  @Input('minHeight')
  get minHeight(): string {
    return this._minHeight;
  }
  set minHeight(val: string) {
    this._minHeight = val;
    this.updateMinHeight();
  }

  @Input('maxHeight')
  get maxHeight(): string {
    return this._maxHeight;
  }
  set maxHeight(val: string) {
    this._maxHeight = val;
    this.updateMaxHeight();
  }

  @HostListener('window:resize', ['$event.target'])
    onResize(textArea: HTMLTextAreaElement): void {
      // Only apply adjustment if element width had changed.
      if (this.el.clientWidth === this._clientWidth) {
        return
      };
      this._clientWidth = this.element.nativeElement.clientWidth;
      this.adjust();
    }

  @HostListener('blur', ['$event.target'])
    onInput(textArea: HTMLTextAreaElement): void {
      this.adjust();
    }


  /**
   * Function called after the auto size directive has been called
   * 
   * @memberof AutosizeDirective
   */
  ngAfterViewInit(): void {
    // set element resize allowed manually by user
    const style = window.getComputedStyle(this.el, null);
    if (style.resize === 'both') {
      this.el.style.resize = 'horizontal';
    } else if (style.resize === 'vertical') {
      this.el.style.resize = 'none';
    }
    this.updateMinHeight();
    this.updateMaxHeight();
    // run first adjust
    this.adjust();
  }

  /**
   * Function called to adjust the textarea size based on width and value
   * 
   * @returns {void} 
   * @memberof AutosizeDirective
   */
  adjust(): void {
    // perform height adjustments after input changes, if height is different
    if (this.el.style.height == this.element.nativeElement.scrollHeight + 'px') {
      return;
    }
    this.el.style.overflow = 'hidden';
    this.el.style.height = 'auto';
    if(this.element.nativeElement.value == undefined || this.element.nativeElement.value == ""){
      this.el.style.height = '34px';
    }
    else if(this.element.nativeElement.value != ""){
      let minHeight = 0;
      if(this.el.style.minHeight == '34px'){
        minHeight = 34;
      }
      if(minHeight+18 >= this.el.scrollHeight || this.element.nativeElement.parentNode.parentNode.localName == "app-number-field" || this.element.nativeElement.parentNode.localName == "span"){
        if(this.element.nativeElement.parentNode.localName == "span" || this.element.nativeElement.parentNode.parentNode.localName == "app-number-field"){
          if(this.el["textLength"]*2.5 < Math.ceil(this.el.scrollWidth/3) && this.el.clientHeight <= this.el.scrollHeight){
            this.el.style.height = '34px';
          }
          else{
            this.el.style.height = this.el.scrollHeight + 'px';
          }
        }
        else{
          if(this.el["textLength"]*2.5 < Math.ceil(this.el.scrollWidth/3) && this.el.clientHeight <= this.el.scrollHeight){
            this.el.style.height = '34px';
          }
          else{
            this.el.style.height = this.el.scrollHeight + 'px';
          }
        }
      }
      else{
        this.el.style.height = this.el.scrollHeight + 'px';
      }
    }
    else{
        this.el.style.height = this.el.scrollHeight + 'px';
    }
    this.el.style.resize = 'none';
  }

  /**
   * Function called to update the min height of the html field
   * 
   * @memberof AutosizeDirective
   */
  updateMinHeight(): void {
    // Set textarea min height if input defined
    this.el.style.minHeight = '34px';
  }

  /**
   * Function called to update the max height of the html field
   * 
   * @memberof AutosizeDirective
   */
  updateMaxHeight(): void {
    // Set textarea max height if input defined
    this.el.style.maxHeight = 'auto';
  }

}
