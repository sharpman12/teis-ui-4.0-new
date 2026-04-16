import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from './components/pagination.component';
import { CollapseComponent } from './components/collapse.component';
import { TimeframeComponent } from './components/filter/timeframe/timeframe.component';
import { SearchComponent } from './components/filter/search/search.component';
import { CalendarModule } from 'primeng/calendar';
import { DisplayTimeframeComponent } from './components/filter/display-timeframe/display-timeframe.component';
import { EditExpressionComponent } from './components/filter/edit-expression/edit-expression.component';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { TextareaAutosizeDirective } from './directive/textarea-autosize.directive';
import { ReplaceString } from './pipe/replace.pipe';
import { TrimtextPipe } from './pipe/trimtext.pipe';
import { MasktextPipe } from './pipe/masktext.pipe';
import { HighlightSearch } from './pipe/highlight.pipe';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SearchFilterPipe } from './pipe/search-filter.pipe';
import { SplitstrPipe } from './pipe/splitstr.pipe';
import { ResizableDirective } from './directive/resizable.directive';
import { SearchItemPipe } from './pipe/search-item.pipe';
import { InformationComponent } from './components/information/information.component';
import { SessionConfirmationComponent } from './components/session-confirmation/session-confirmation.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // HttpModule,
    HttpClientModule,
    RouterModule,
    CalendarModule,
    TooltipModule,
    OverlayPanelModule
  ],
  declarations: [
    PaginationComponent,
    CollapseComponent,
    TimeframeComponent,
    SearchComponent,
    DisplayTimeframeComponent,
    EditExpressionComponent,
    ConfirmationComponent,
    TextareaAutosizeDirective,
    ReplaceString,
    TrimtextPipe,
    MasktextPipe,
    HighlightSearch,
    SearchFilterPipe,
    SplitstrPipe,
    ResizableDirective,
    SearchItemPipe,
    InformationComponent,
    SessionConfirmationComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // HttpModule,
    HttpClientModule,
    RouterModule,
    PaginationComponent,
    TimeframeComponent,
    SearchComponent,
    DisplayTimeframeComponent,
    EditExpressionComponent,
    ConfirmationComponent,
    TextareaAutosizeDirective,
    ReplaceString,
    TrimtextPipe,
    MasktextPipe,
    HighlightSearch,
    OverlayPanelModule,
    SearchFilterPipe,
    SplitstrPipe,
    ResizableDirective,
    SearchItemPipe,
    InformationComponent
  ]
})
export class SharedModule { }
