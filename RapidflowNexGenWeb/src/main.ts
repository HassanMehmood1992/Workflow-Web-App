/*
* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: Main
Description: Main typescript file of the application.
Location: src/main.ts
Author: Genered by Angular Cli
Version: 1.0.0
Modification history: none
*/

//required imports
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

//enable production mode
if (environment.production) {
  enableProdMode();
}

//bootstrap app module
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
