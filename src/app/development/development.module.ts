import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { TabViewModule } from 'primeng/tabview';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { MatMenuModule } from '@angular/material/menu';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';

import { DevelopmentRoutingModule } from './development-routing.module';
import { DevelopmentComponent } from './development/development.component';
import { CreateScriptComponent } from './development/create-script/create-script.component';
import { ScriptPropertiesComponent } from './development/script-properties/script-properties.component';
import { DialogModule } from 'primeng/dialog';
import { ParametersComponent } from './development/parameters/parameters.component';
import { EditParameterComponent } from './development/edit-parameter/edit-parameter.component';
import { ScriptVersionsComponent } from './development/script-versions/script-versions.component';
import { OpenScriptComponent } from './development/open-script/open-script.component';
import { ImportScriptComponent } from './development/import-script/import-script.component';
import { ScriptEditorComponent } from './development/script-editor/script-editor.component';
import { RecentFilesComponent } from './development/recent-files/recent-files.component';
import { AutosizeModule } from 'ngx-autosize';
import { ToastModule } from 'primeng/toast';
import { SystemLibraryReferencesComponent } from './development/system-library-references/system-library-references.component';
import { ScriptVersionViewerComponent } from './development/script-versions/script-version-viewer/script-version-viewer.component';
import { TableModule } from 'primeng/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GetLockConfirmationComponent } from './development/get-lock-confirmation/get-lock-confirmation.component';
import { DebugParameterComponent } from './development/debug-parameter/debug-parameter.component';
import { ConnectedItemsConfirmationComponent } from './development/connected-items-confirmation/connected-items-confirmation.component';
import { ReleaseNoteComponent } from './development/release-note/release-note.component';
import { TooltipModule } from 'primeng/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY, MatAutocompleteModule } from '@angular/material/autocomplete';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { ExportScriptComponent } from './development/export-script/export-script.component';
import { DebugScriptEngineComponent } from './development/debug-script-engine/debug-script-engine.component';

export function matAutocompleteScrollStrategyFactory(overlay: Overlay): () => import('@angular/cdk/overlay').ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

@NgModule({
  declarations: [
    DevelopmentComponent,
    CreateScriptComponent,
    ScriptPropertiesComponent,
    ParametersComponent,
    EditParameterComponent,
    ScriptVersionsComponent,
    OpenScriptComponent,
    ImportScriptComponent,
    ScriptEditorComponent,
    RecentFilesComponent,
    SystemLibraryReferencesComponent,
    ScriptVersionViewerComponent,
    GetLockConfirmationComponent,
    DebugParameterComponent,
    ConnectedItemsConfirmationComponent,
    ReleaseNoteComponent,
    ExportScriptComponent,
    DebugScriptEngineComponent,
  ],
  imports: [
    CommonModule,
    DevelopmentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TabViewModule,
    MatDialogModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MenubarModule,
    ButtonModule,
    MatMenuModule,
    FileUploadModule,
    AutosizeModule,
    ToastModule,
    TableModule,
    ScrollingModule,
    OverlayModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    TooltipModule
  ],
  providers: [
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: matAutocompleteScrollStrategyFactory,
      deps: [Overlay],
    },
  ]
})
export class DevelopmentModule { }
