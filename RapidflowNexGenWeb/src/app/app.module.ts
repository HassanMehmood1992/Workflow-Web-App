/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: AppModule
Description: Module for the application which stores references of all the login related components and plugins used in the project.
Location: ./main-flat/main-flat.module
Author: Nabil, Amir, Sheharyar
Version: 1.0.0
Modification history: none
*/


//import statements for components, services, directives, angular modules and third party modules
import { AppComponent } from "./app.component";
import { LoginComponent } from "./components/login/login.component";
import { RedirectUrlComponent } from "./components/redirect-url/redirect-url.component";
import { NgModule } from "@angular/core";
import { BrowserModule, Title } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpModule } from "@angular/http";
import { MatDialogModule, MatListModule, MatIconRegistry } from "@angular/material";
import { FormsModule } from "@angular/forms";
import { RouterModule, PreloadAllModules } from "@angular/router";
import { RapidflowService } from "./services/rapidflow.service";
import { EncryptionService } from "./services/encryption.service";
import { EventEmiterService } from "./services/event-emiters.service";
import { SocketProvider } from "./services/socket.service";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { AlertDialogComponent } from "./components/alert-dialog/alert-dialog.component";
import { ErrorReportingDialogComponent } from "./components/error-reporting-dialog/error-reporting-dialog.component";
import { ProgressDialogComponent } from "./components/progress-dialog/progress-dialog.component";



//module decorator
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RedirectUrlComponent,
    AlertDialogComponent,
    ErrorReportingDialogComponent,
    ProgressDialogComponent
  ],

  //modules to import
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    MatDialogModule,
    FormsModule,
    MatListModule,
    //routing cofiguration of module routes
    RouterModule.forRoot([
      {
        path: 'login',
        component: LoginComponent
      }
      , {
        path: 'sharedurl',
        component: RedirectUrlComponent
      },
      {
        path: 'main',
        //lazy load main-flat module
        loadChildren: './main-flat/main-flat.module'
      },
      {//for empty paths
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {//invalid paths 
        path: "**",
        redirectTo: "login"
      }
    ], {//preload all modules on login form
        preloadingStrategy: PreloadAllModules
      }
    ),
  ],
   //components that render in modal dialog
  entryComponents: [
    AlertDialogComponent,
    ErrorReportingDialogComponent,
    ProgressDialogComponent

  ],
  //services to be used withing module and by child modules
  providers: [
    RapidflowService,
    EncryptionService,
    EventEmiterService,
    SocketProvider,
    MatIconRegistry,
    Title,
    //use hash location strategy for paths
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  exports: [
  ],
  //component to load of application start
  bootstrap: [AppComponent]
})
export class AppModule { }
