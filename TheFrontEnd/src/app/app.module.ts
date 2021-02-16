import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent, Safe} from './app.component';
import {FormsModule} from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule, MatExpansionModule,
  MatGridListModule,
  MatInputModule,
  MatProgressBarModule,
  MatToolbarModule,
  MatRadioModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    Safe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatRadioModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    HttpClientModule,
    HttpClientXsrfModule,
    MatProgressBarModule,
    MatGridListModule,
    MatToolbarModule,
    MatExpansionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
