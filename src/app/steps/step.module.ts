import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { StepRoutingModule } from './step-routing.module';
import { StepComponent } from '../steps/step.component';
/*PRIMENG COMPONENTS */
import { ReactiveFormsModule } from '@angular/forms';
import {StepsModule} from 'primeng/steps';
import {CheckboxModule} from 'primeng/checkbox';
import {TreeModule} from 'primeng/tree';
import {CalendarModule} from 'primeng/calendar';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {
  SharedModule
  } from '../shared';

@NgModule({
  imports: [
    CommonModule,
    StepRoutingModule,
    StepsModule,
    CheckboxModule,
    TreeModule,
    ReactiveFormsModule,
    CalendarModule,
    ScrollPanelModule,
    SharedModule

  ],
  exports: [StepComponent],
  declarations: [ StepComponent]   
})
export class StepModule { }          
