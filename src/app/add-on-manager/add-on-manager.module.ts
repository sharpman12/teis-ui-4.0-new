import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddOnManagerRoutingModule } from './add-on-manager-routing.module';
import { AddOnManagerComponent } from './add-on-manager/add-on-manager.component';
import { AddOnAdaptersComponent } from './add-on-manager/add-on-adapters/add-on-adapters.component';
import { AddOnIdentifiersComponent } from './add-on-manager/add-on-identifiers/add-on-identifiers.component';
import { AddOnPluginsComponent } from './add-on-manager/add-on-plugins/add-on-plugins.component';
import { AddOnWebServicesComponent } from './add-on-manager/add-on-web-services/add-on-web-services.component';
import { AddOnApplicationServicesComponent } from './add-on-manager/add-on-application-services/add-on-application-services.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { A11yModule } from "@angular/cdk/a11y";
import { NgSelectModule } from '@ng-select/ng-select';
import { AddOnSearchComponent } from './add-on-manager/add-on-search/add-on-search.component';


@NgModule({
  declarations: [
    AddOnManagerComponent,
    AddOnAdaptersComponent,
    AddOnIdentifiersComponent,
    AddOnPluginsComponent,
    AddOnWebServicesComponent,
    AddOnApplicationServicesComponent,
    AddOnSearchComponent
  ],
  imports: [
    CommonModule,
    AddOnManagerRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    A11yModule,
    NgSelectModule
]
})
export class AddOnManagerModule { }
