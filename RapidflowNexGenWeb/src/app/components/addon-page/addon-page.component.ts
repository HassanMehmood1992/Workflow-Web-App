/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AddonPageComponent
Description: Provide functionality to view the specific addon based on addon id provided via url. The view contains dynamically generated views based on process logic.
Location: ./addon-page.component.ts
Author: Nabil Shahid
Version: 1.0.0
Modification history: none
*/
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit,ViewChild,ViewContainerRef, NgModule, Compiler } from '@angular/core';
import { AppModule } from '../../app.module';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common'; 
import {SocketProvider} from '../../services/socket.service';
import { RapidflowService } from '../../services/rapidflow.service';
import { DataFilterDialogComponent } from '../data-filter-dialog/data-filter-dialog.component';
import { MatDialog, MatProgressBarModule } from '@angular/material';
import MainFlatModule from '../../main-flat/main-flat.module';
import  'moment';

declare var moment;//moment var declaration 
declare var $;//jquery var declaration
 
/**
  * component decorator
  */
@Component({
  selector: 'app-addon-page',
  templateUrl: './addon-page.component.html',
  styleUrls: ['./addon-page.component.css']
})
export class AddonPageComponent implements OnInit {
  navArray:any//array containing previous states information for navigating back 
  currentProcessID: number;//current selected process id
  currentAddOnID:number;//current selected add on id
  addonLoading:boolean=true;//add on loading or loaded flag to show or hide loading bar
  noPermission:boolean=false;//flag set true if user has no permission to show no permission message
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;//containier to render dynamic add on content

  /**
  * Default constructor with dependency injection of all necessary objects and services 
  */
  constructor(private compiler: Compiler,private rapidflowService:RapidflowService,private dataFilterDialog: MatDialog,private router :Router,private route:ActivatedRoute) { 
    
  }

  /**
  * open data filter in effect dialog to show user that the data is trimmed 
  */
  showDataFilterDialog(): void {
    let dialogRef = this.dataFilterDialog.open(DataFilterDialogComponent, {
      width: '300px',
      height:'145px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /**
   * go back to previous state
   * @param to 
   */
  goback(to){
    if(to=="process"){
      this.router.navigate(['main','process', this.currentProcessID, 'home', 'tasks']);
    }else{
      this.router.navigate(['main','process', this.currentProcessID, 'home','addons']);
    }
  }

  /**
  * component initialization lifecycle hook which retrieves current selected addon definition and data
  */
  ngOnInit() {
    try{
      this.route.params.subscribe(params => {
        this.currentAddOnID = parseInt(params['AddOnID']);  
      });
      this.route.parent.params.subscribe(params => {
        this.currentProcessID = parseInt(params['ProcessID']);  
        this.navArray=[{urlBack: ['main','process', this.currentProcessID, 'home', 'addons'],urlImage:['main','process', this.currentProcessID, 'home', 'addons'],imagesrc:'assets\\images\\process_menu\\Addons_Selected.png',text:'Addons'},{urlBack: ['main','process', this.currentProcessID, 'home', 'addons'],urlImage:"",imagesrc:'',text:'Add on'}] 
      });
      
      //retrieve addon data api call
      this.rapidflowService.retrieveAddOnDataWCF(this.currentProcessID,this.currentAddOnID)
      .subscribe((response)=>{
        try{
          this.addonLoading=false;
          let addOnObjectJSON=JSON.parse(response.json());
          //set no permission message if no permission is retunred from the api call
          if(addOnObjectJSON[0].AddonDetails=="NoPermission")
          {
            this.noPermission=true;
            this.addonLoading = false;
            return;
          }
          //set dynamic components and template
          let template='<mat-progress-bar *ngIf="addonLoading" class="loaderStyle" mode="query"></mat-progress-bar>'+decodeURIComponent(addOnObjectJSON[0].AddonDetails.AddonTemplate);
          let component=decodeURIComponent(addOnObjectJSON[0].AddonDetails.AddonComponent);
          this.addComponent(template,component);

          //set addon title
          this.navArray[1].text=addOnObjectJSON[0].AddonHeader.Title
        }
        catch(ex)
        {
          //add on rendering logic error handler
          this.rapidflowService.ShowErrorMessage("ngOnInit-Addon Page Component", "Platform", ex.message, ex.stack, "An error occured while rendering add on ", "N/A",this.currentProcessID,true);  
        } 
      },(error: any) => {
        //web service call failure error handler
        this.navArray[1].text=""
        this.rapidflowService.ShowErrorMessage("retrieveAddOnDataWCF-Add On Page component", "Process", "Error occured while executing api call", error, "An error occured while retrieveAddOnDataWCF", " RapidflowServices.retrieveAddOnDataWCF",this.currentProcessID,false);
      });
    }
    catch(error){
      //ngOnInit lifecycle hook error handler
      this.rapidflowService.ShowErrorMessage("ngOnInit-Addon Page Component", "Platform", error.message, error.stack, "An error occured while rendering add on ", "N/A",this.currentProcessID,true);  
    }
  }

  /**
  * function to add and render dynamic add on template and component
  */
  private addComponent(templateCurrent: string, component1: string) {
    @Component({

      template: templateCurrent
    })
    //dynamic template component class
    class TemplateComponent {
      currentUser:any=JSON.parse(window.localStorage['User']);//current logged in user
      addonLoading:boolean=true;//addon loading or loaded flag for dynamic component
      constructor(private socket:SocketProvider,private rapidflowService:RapidflowService) {
      }

      /**
       * After dynamic view initialiaztion lifecycle event
      */
      ngAfterViewInit() {
        //start socket service
        this.socket.start();
        this.performAddOnLoadOperations();
      }

      /**
      * add on load event life cycle hook overwritten from dynamic logic
      */
      performAddOnLoadOperations(){
      }

    /**
     * show event loading function can be owerwritten from dynamic logic
     * @param message 
     * @param timeout 
     */
      showLoading(message: String, timeout: Number) {  
      }

      /**
      * hide loading function which can be called from dynamic logic
      */
      hideLoading() {
        this.addonLoading=false;
      }
    }


    /**
    * dynamic module decorator with declarations and imports 
    */
    @NgModule({ declarations: [TemplateComponent], imports: [MainFlatModule, FormsModule,MatProgressBarModule] })
    class TemplateModule { }

    try{
      const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
      const factory = mod.componentFactories.find((comp) =>
        comp.componentType === TemplateComponent
      );
      let comp = '';
      //dynamic component logic evaluation
      eval(component1)
      const component = this.container.createComponent(factory);
      Object.assign(component.instance, comp);
    }
    catch(error){
      //add on evaluation handler error
      this.rapidflowService.ShowErrorMessage("ngOnInit-Addon Page Component", "Platform", error.message, error.stack, "An error occured while rendering add on ", "N/A",this.currentProcessID,true);  
    }
     
  }
 

}
