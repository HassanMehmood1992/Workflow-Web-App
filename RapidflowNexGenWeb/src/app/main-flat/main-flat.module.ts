/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: MainFlatModule
Description: Module for the application which stores references of all the components and plugins used in the project other than login related components and plugins.
Location: ./main-flat/main-flat.module
Author: Nabil, Amir, Sheharyar
Version: 1.0.0
Modification history: none
*/


//import statements for components, services, directives, angular modules and third party modules
import { NgModule } from '@angular/core';
import { CommonModule, NgIf, NgClass, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainComponent } from '../components/main/main.component';
import { ProcessComponent } from '../components/process/process.component';
import { ProcesWrapperComponent } from '../components/proces-wrapper/proces-wrapper.component';
import { MyPendingTasksComponent } from '../components/my-pending-tasks/my-pending-tasks.component';
import { WorkflowsComponent } from '../components/workflows/workflows.component';
import { SubmissionsComponent } from '../components/submissions/submissions.component';
import { ReportsComponent } from '../components/reports/reports.component';
import { PivotsComponent } from '../components/pivots/pivots.component';
import { AddonsComponent } from '../components/addons/addons.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { FormComponent } from '../components/form/form.component';
import { ProcessMatricsComponent } from '../components/process-matrics/process-matrics.component';
import { PivotPageComponent } from '../components/pivot-page/pivot-page.component';
import { ProcessDirectoryComponent } from '../components/process-directory/process-directory.component';
import { DiagnosticLoggingApplicationComponent } from '../components/diagnostic-logging/diagnostic-logging-application/diagnostic-logging-application.component';
import { ApplicationErrorLogsComponent } from '../components/application-error-logs/application-error-logs.component';
import { UserAndDevicesComponent } from '../components/user-and-devices/user-and-devices.component';
import { PlatformSettingsComponent } from '../components/platform-settings/platform-settings.component';
import { GeneralSettingsComponent } from '../components/general-settings/general-settings.component';
import { ApplicationSettingsComponent } from '../components/application-settings/application-settings.component';
import { DiagnosticLoggingProcessComponent } from '../components/diagnostic-logging/diagnostic-logging-process/diagnostic-logging-process.component';
import { ProcessAdminPannelComponent, ViewPermissionsDialogComponent, EditUsersDialogComponent } from '../components/process-admin-pannel/process-admin-pannel.component';
import { ProcessErrorLogsComponent } from '../components/process-error-logs/process-error-logs.component';
import { ProcessGeneralSettingsComponent } from '../components/process-general-settings/process-general-settings.component';
import { ProcessUserSettingComponent } from '../components/process-user-setting/process-user-setting.component';
import { ProcessLookupPageComponent } from '../components/process-lookup-page/process-lookup-page.component';
import { ProcessLookupsComponent } from '../components/process-lookups/process-lookups.component';
import { AddonPageComponent } from '../components/addon-page/addon-page.component';
import { ReportPageComponent, DetailsReportDialogComponent } from '../components/report-page/report-page.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CdkTableModule } from '@angular/cdk/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule, MatListModule, MatInputModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatSliderModule, MatToolbarModule, MatSidenavModule, MatIconModule, MatTabsModule, MatMenuModule, MatDialogModule, MatCardModule, MatExpansionModule, MatDatepickerModule, MatNativeDateModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule, MatSlideToggleModule } from '@angular/material';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';
import { NgxPaginationModule } from 'ngx-pagination';
import { ChartsModule } from 'ng2-charts';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HeaderComponent } from '../components/header/header.component';
import { FormatdatePipe } from '../pipes/formatdate.pipe';
import { EscapehtmlPipe } from '../pipes/escapehtml.pipe';
import { TileListComponent } from '../components/tile-list/tile-list.component';
import { PeoplePickerDialogComponent } from '../components/people-picker/people-picker-dialog/people-picker-dialog.component';
import { DecodeUriComponentPipe } from '../pipes/decode-uri-component.pipe';
import { BadgeCountPipe } from '../pipes/badge-count.pipe';
import { PublishPivotDialogComponent } from '../components/publish-pivot-dialog/publish-pivot-dialog.component';
import { NotificationDialogComponent } from '../components/notifications/notification-dialog/notification-dialog.component';
import { FilterArrayPipe } from '../pipes/filter-array.pipe';
import { PendingAccessDialogComponent } from '../components/main/pending-access-dialog/pending-access-dialog.component';
import { AccessRequestComponent } from '../components/process-directory/access-request/access-request.component';
import { OutOfOfficeDialogComponent } from '../components/out-of-office-dialog/out-of-office-dialog.component';
import { ProxyApproverDialogComponent } from '../components/proxy-approver-dialog/proxy-approver-dialog.component';
import { DataFilterDialogComponent } from '../components/data-filter-dialog/data-filter-dialog.component';
import { PeoplePickerComponent } from '../components/people-picker/people-picker.component';
import { DatabaseLookupComponent } from '../components/database-lookup/database-lookup.component';
import { RepeatingTableComponent } from '../components/repeating-table/repeating-table.component';
import { DatabaseLookupDialogComponent } from '../components/database-lookup/database-lookup-dialog/database-lookup-dialog.component';
import { FileAttachmentComponent } from '../components/file-attachment/file-attachment.component';
import { KeysPipe } from '../pipes/keys.pipe';
import { ApprovalDialogComponent } from '../components/approval-dialog/approval-dialog.component';
import { ErrorLogsViewComponent } from '../components/error-logs-view/error-logs-view.component';
import { UpdateErrorlogDialogComponent } from '../components/update-errorlog-dialog/update-errorlog-dialog.component';
import { LookupApprovalDialogComponent } from '../components/lookup-approval-dialog/lookup-approval-dialog.component';
import { AccessRequestApprovalDialogComponent } from '../components/access-request-approval-dialog/access-request-approval-dialog.component';
import { DiagnosticLogToggleComponent } from '../components/diagnostic-logging/diagnostic-log-toggle/diagnostic-log-toggle.component';
import { DiagnosticLoggingSetDialogComponent } from '../components/diagnostic-logging/diagnostic-logging-set-dialog/diagnostic-logging-set-dialog.component';
import { ErrorReportingDialogComponent } from '../components/error-reporting-dialog/error-reporting-dialog.component';
import { AutosizeDirective } from '../directives/autosize.directive';
import { NavBarComponent } from '../components/header/nav-bar/nav-bar.component';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { SetAlertDialogComponent } from '../components/set-alert-dialog/set-alert-dialog.component';
import { ProcessLookupComponent } from '../components/process-lookup/process-lookup.component';
import { ProcessLookupItemComponent } from '../components/process-lookup-page/process-lookup-item/process-lookup-item.component';
import { ProcessLookupDialogComponent } from '../components/process-lookup/process-lookup-dialog/process-lookup-dialog.component';
import { ProcessLookupImportComponent } from '../components/process-lookup-page/process-lookup-import/process-lookup-import.component';
import { WorkflowRoutingService } from '../services/workflow-routing.service';
import { ProcessDataService } from '../services/process-data.service';
import { ProcessFormService } from '../services/process-form.service';
import { ExcelExportService } from '../services/excel-export.service';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DateTimePickerComponent } from '../components/date-time-picker/date-time-picker.component';
import { NumberFieldComponent } from '../components/number-field/number-field.component';
import { CurrencyMaskModule } from 'ng2-currency-mask'
import { FormatOffsetDatePipe } from '../pipes/format-offset-date.pipe';
import { FileUploadProgressDialogComponent } from '../components/file-upload-progress-dialog/file-upload-progress-dialog.component';
import { AuthenticateUserDialogComponent } from '../components/authenticate-user-dialog/authenticate-user-dialog.component';
import { UrlComponent } from '../components/url/url.component';
import { UrlDialogComponent } from '../components/url/url-dialog/url-dialog.component';
import { SortListsService } from './../services/sort-lists.service';
import { FilterArrayLookupDialogPipe } from '../pipes/filter-array-lookup-dialog.pipe';
import { CustomDialogComponent } from '../components/custom-dialog/custom-dialog.component';

//moment date and time formats constant to be while converting dates
export const MY_MOMENT_FORMATS = {
  parseInput: 'l LT',
  fullPickerInput: 'DD-MMM-YYYY hh:mm A',
  datePickerInput: 'DD-MMM-YYYY',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

//module decorator
@NgModule({
  
  //modules to import
  imports: [
    CommonModule,
    NgbModule,
    NgbModule.forRoot(),
    CdkTableModule,
    OwlDateTimeModule,
    OwlMomentDateTimeModule,
    CurrencyMaskModule,
    MatCheckboxModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    HttpModule,
    MatTableModule,
    MatPaginatorModule,
    MatSliderModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatCardModule,
    MomentModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    NgxPaginationModule,
    ChartsModule,
    ReactiveFormsModule,
    MatSelectModule,
    InfiniteScrollModule,
    MatSlideToggleModule,
    FlexLayoutModule,
    CdkTableModule,

    //routing cofiguration of module routes
    RouterModule.forChild([{
      path: '',
      component: MainComponent,
      children: [
        {//main homepage node
          path: "process/:ProcessID",
          component: ProcessComponent,
          children: [//homepage child routes
            {
              path: "home",
              component: ProcesWrapperComponent,
              children: [
                {
                  path: "tasks", component: MyPendingTasksComponent
                },
                {
                  path: "forms", component: WorkflowsComponent
                },
                {
                  path: "submissions", component: SubmissionsComponent
                },
                {
                  path: "reports", component: ReportsComponent
                },
                {
                  path: "pivots", component: PivotsComponent
                },
                {
                  path: "addons", component: AddonsComponent
                },
                {
                  path: "notifications", component: NotificationsComponent
                }

              ]
            },
            {
              path: "form/:WorkflowID/:FormID",
              component: FormComponent,
            },
            {
              path: "ProcessMatrics",
              component: ProcessMatricsComponent,
            },
            {
              path: 'pivot/:PivotID',
              component: PivotPageComponent
            },
            {
              path: 'report/:ReportID',
              component: ReportPageComponent
            },
            {
              path: 'addOn/:AddOnID',
              component: AddonPageComponent
            },
            {
              path: 'Lookups',
              component: ProcessLookupsComponent
            },
            {
              path: 'Lookup/:LookupID',
              component: ProcessLookupPageComponent
            },
            {
              path: 'ErrorLogs',
              component: ProcessErrorLogsComponent
            },
            {//process settings node
              path: 'ProcessSettings',
              component: ProcessUserSettingComponent,
              children: [//process settings child routes
                {
                  path: "general",
                  component: ProcessGeneralSettingsComponent
                }, {
                  path: "accessmanagement",
                  component: ProcessAdminPannelComponent
                }, {
                  path: "errorlogs",
                  component: ProcessErrorLogsComponent
                }, {
                  path: "diagnostics",
                  component: DiagnosticLoggingProcessComponent
                }
              ]
            },
            {
              path: 'AccessManagement',
              component: ProcessAdminPannelComponent
            },
            {
              path: 'DiagnosticLogs',
              component: DiagnosticLoggingProcessComponent
            }

          ]
        },
        {//application settings node
          path: "applicationSettings",
          component: ApplicationSettingsComponent,
          children: [//application setting child routes
            {
              path: "general",
              component: GeneralSettingsComponent
            }, {
              path: "platform",
              component: PlatformSettingsComponent
            }, {
              path: "userdevices",
              component: UserAndDevicesComponent
            }, {
              path: "errorlogs",
              component: ApplicationErrorLogsComponent
            }, {
              path: "diagnostics",
              component: DiagnosticLoggingApplicationComponent
            }
          ]
        },
        {
          path: "processDirectory",
          component: ProcessDirectoryComponent
        }

      ]
    },
    
          {//invalid paths 
            path: "**",
            redirectTo: "processDirectory"
          }])
  ],

  //components declaration to use within modules
  declarations: [
    MainComponent,
    ProcessLookupComponent,
    ProcessLookupItemComponent,
    ProcessLookupDialogComponent,
    DateTimePickerComponent,
    ProcessLookupImportComponent,
    ViewPermissionsDialogComponent,
    NumberFieldComponent,
    FileUploadProgressDialogComponent,
    AuthenticateUserDialogComponent,
    UrlComponent,
    UrlDialogComponent,
    EditUsersDialogComponent,
    ProcessComponent,
    ProcesWrapperComponent,
    MyPendingTasksComponent,
    WorkflowsComponent,
    SubmissionsComponent,
    ReportsComponent,
    PivotsComponent,
    AddonsComponent,
    NotificationsComponent,
    FormComponent,
    ProcessMatricsComponent,
    PivotPageComponent,
    ProcessDirectoryComponent,
    DiagnosticLoggingApplicationComponent,
    ApplicationErrorLogsComponent,
    UserAndDevicesComponent,
    PlatformSettingsComponent,
    GeneralSettingsComponent,
    ApplicationSettingsComponent,
    DiagnosticLoggingProcessComponent,
    ProcessAdminPannelComponent,
    ProcessErrorLogsComponent,
    ProcessGeneralSettingsComponent,
    ProcessUserSettingComponent,
    ProcessLookupPageComponent,
    ProcessLookupsComponent,
    AddonPageComponent,
    ReportPageComponent,
    HeaderComponent,
    FormatdatePipe,
    FormatOffsetDatePipe,
    EscapehtmlPipe,
    TileListComponent,
    DecodeUriComponentPipe,
    PeoplePickerDialogComponent,
    BadgeCountPipe,
    DetailsReportDialogComponent,
    PublishPivotDialogComponent,
    NotificationDialogComponent,
    FilterArrayPipe,
    FilterArrayLookupDialogPipe,
    PendingAccessDialogComponent,
    AccessRequestComponent,
    OutOfOfficeDialogComponent,
    ProxyApproverDialogComponent,
    DataFilterDialogComponent,
    PeoplePickerComponent,
    DatabaseLookupComponent,
    RepeatingTableComponent,
    DatabaseLookupDialogComponent,
    FileAttachmentComponent,
    KeysPipe,
    ApprovalDialogComponent,
    ConfirmationDialogComponent,
    ErrorLogsViewComponent,
    UpdateErrorlogDialogComponent,
    LookupApprovalDialogComponent,
    AccessRequestApprovalDialogComponent,
    DiagnosticLogToggleComponent,
    DiagnosticLoggingSetDialogComponent,
    AutosizeDirective,
    NavBarComponent,
    ConfirmationDialogComponent,
    SetAlertDialogComponent,
    CustomDialogComponent
  ],

  //services to be used withing module
  providers: [
    HeaderComponent,
    WorkflowRoutingService,
    ProcessDataService,
    KeysPipe,
    ProcessFormService,
    SortListsService,
    ExcelExportService,
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS }

  ],

  //components, modules and services to export for using in other modules while importing
  exports: [PeoplePickerDialogComponent,
    ProcessLookupComponent,
    PeoplePickerComponent,
    RepeatingTableComponent,
    DatabaseLookupComponent,
    DateTimePickerComponent,
    FileAttachmentComponent,
    UrlComponent,
    DetailsReportDialogComponent,
    MatCardModule,
    MatInputModule,
    MatToolbarModule,
    KeysPipe,
    NgbModule,
    MatSelectModule,
    NgIf,
    NgClass,
    NgFor, OwlDateTimeModule,
    OwlMomentDateTimeModule, NumberFieldComponent,
    CurrencyMaskModule, AutosizeDirective, FormatOffsetDatePipe],

    //components that render in modal dialog
  entryComponents: [
    DetailsReportDialogComponent,
    PublishPivotDialogComponent,
    NotificationDialogComponent,
    ProcessLookupItemComponent,
    ProcessLookupImportComponent,
    PendingAccessDialogComponent,
    AccessRequestComponent,
    OutOfOfficeDialogComponent,
    ProxyApproverDialogComponent,
    DataFilterDialogComponent,
    UpdateErrorlogDialogComponent,
    DiagnosticLoggingSetDialogComponent,
    ConfirmationDialogComponent,
    LookupApprovalDialogComponent,
    AccessRequestApprovalDialogComponent,
    UpdateErrorlogDialogComponent,
    PeoplePickerDialogComponent,
    ProcessLookupDialogComponent,
    DatabaseLookupDialogComponent,
    ApprovalDialogComponent,
    ViewPermissionsDialogComponent,
    SetAlertDialogComponent,
    EditUsersDialogComponent,
    FileUploadProgressDialogComponent,
    AuthenticateUserDialogComponent,
    UrlDialogComponent,
    CustomDialogComponent
  ]
})

//export module class to import in other modules
export default class MainFlatModule { }
