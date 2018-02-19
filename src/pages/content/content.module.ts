import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ContentPage } from './content';

import { LongPressModule } from 'ionic-long-press';



@NgModule({
  declarations: [
    ContentPage,
  ],
  imports: [
    IonicPageModule.forChild(ContentPage),
    TranslateModule.forChild(), 
    LongPressModule
  ],
  exports: [
    ContentPage
  ]
})
export class ContentPageModule { }
