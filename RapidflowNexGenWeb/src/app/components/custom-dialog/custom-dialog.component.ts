/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: CustomDialogComponent
Description: Provide functionality to generate custom dialog for user to take action on any item if needed.
Location: ./custom-dialog.component.ts
Author: Sheharyar Toor
Version: 1.0.0
Modification history: none
*/

import { Component, OnInit, Inject, NgModule, Compiler, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatExpansionModule, MatToolbarModule, MatCardModule, MatSelectModule, MatRadioModule, MatCheckboxModule } from '@angular/material';
import MainFlatModule from '../../main-flat/main-flat.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { OwlDateTimeModule } from 'ng-pick-datetime';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WorkflowRoutingService } from './../../services/workflow-routing.service';
import { ProcessFormService } from './../../services/process-form.service';
import { ProcessLookupComponent } from './../process-lookup/process-lookup.component';
import { PeoplePickerComponent } from './../people-picker/people-picker.component';
import { DatabaseLookupComponent } from './../database-lookup/database-lookup.component';
import { RepeatingTableComponent } from './../repeating-table/repeating-table.component';
import { FileAttachmentComponent } from './../file-attachment/file-attachment.component';
import { RapidflowService } from './../../services/rapidflow.service';
import { UrlComponent } from './../url/url.component';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { NumberFieldComponent } from '../number-field/number-field.component';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.css']
})
export class CustomDialogComponent implements OnInit {
  @ViewChild('createNew', { read: ViewContainerRef }) container: ViewContainerRef;

  public dialogHtml:any;
  public dialogLogic:any;
  public FormDataJSON = [];

  /**
   * Creates an instance of CustomDialogComponent.
   * @param {MatDialogRef<CustomDialogComponent>} dialogRef 
   * @param {*} data 
   * @memberof CustomDialogComponent
   */
  constructor(public dialogRef: MatDialogRef<CustomDialogComponent>,private compiler: Compiler,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      console.log(this.data);
    }

  /**
   * 
   * 
   * @memberof CustomDialogComponent
   */
  ngOnInit() {

    this.dialogHtml = this.data.dialogHtml;
    this.dialogLogic = this.data.dialogLogic;
    this.FormDataJSON = this.data.FormDataJSON;
    this.addComponent(this.dialogHtml, this.dialogLogic);
  }

  addComponent(formTemplate: string, formComponent: string) {
    try {
      @Component({
        template: formTemplate
      })
      class TemplateComponent {
        public FormDataJSON: object;
        constructor(public a:CustomDialogComponent,
          private dialog: MatDialog,
          private workflowRoutingService: WorkflowRoutingService,
          private processFormService: ProcessFormService,
          private rapidflowService: RapidflowService) {
          this.FormDataJSON = this.a.FormDataJSON;
        }

        /**
         * Triggered when template component is called
         * 
         * @memberof TemplateComponent
         */
        ngOnInit() {
          this.FormDataJSON = this.a.FormDataJSON;
          
        }

        /**
         * Close custom dialog
         * 
         * @memberof TemplateComponent
         */
        closeCustomDialog(){
          this.a.dialogRef.close();
        }

      }    
      @NgModule({ declarations: [TemplateComponent], imports: [MainFlatModule, FlexLayoutModule, MatExpansionModule, FormsModule, MatToolbarModule, MatCardModule, NgbModule, MatSelectModule, OwlDateTimeModule, OwlMomentDateTimeModule, MatRadioModule, MatCheckboxModule] })
      class TemplateModule { }

      const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
      const factory = mod.componentFactories.find((comp) =>
        comp.componentType === TemplateComponent
      );
      let comp = '';
      eval(formComponent)
      const component = this.container.createComponent(factory);
      Object.assign(component.instance, comp);
    } catch (ex) {
    }
  }

  /**
   * 
   * 
   * @param {any} action 
   * @memberof CustomDialogComponent
   */
  closeDialog(action) {
    this.dialogRef.close(action);
  }

}
