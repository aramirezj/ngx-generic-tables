import { LOCALE_ID, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HIGHLIGHT_OPTIONS, HighlightModule } from 'ngx-highlightjs';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GFConfirmationComponent } from 'projects/ngx-generic-tables/src/lib/components/chips/confirmation.component';
import { GFMasterSelectComponent } from 'projects/ngx-generic-tables/src/lib/components/master-select/master-select.component';
import { GFGenericFormComponent } from 'projects/ngx-generic-tables/src/lib/components/generic-form/generic-form.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { FormsComponent } from './forms/forms.component';
import { ComponentsComponent } from './components/components.component';
import {MatTabsModule} from '@angular/material/tabs';
import { ClassesComponent } from './classes/classes.component';
import { DirectivesComponent } from './directives/directives.component';
import { GFConversionDirective, GFMatErrorMessagesDirective } from 'projects/ngx-generic-tables/src/public-api';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [AppComponent,FormsComponent, ComponentsComponent, ClassesComponent, DirectivesComponent],
  imports: [
    BrowserModule,
    HighlightModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    GFConfirmationComponent,
    GFMasterSelectComponent,
    GFGenericFormComponent,
    ReactiveFormsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    GFConversionDirective,
    MatInputModule,
    MatFormFieldModule,
    GFMatErrorMessagesDirective
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        fullLibraryLoader: async () => await import('highlight.js'),
      },
    },
   // {provide: LOCALE_ID, useValue: 'es-ES' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
