import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ImgCollectionPage } from './imgCollection';
import { LongPressModule } from 'ionic-long-press';

@NgModule({
  declarations: [
    ImgCollectionPage,
  ],
  imports: [
    IonicPageModule.forChild(ImgCollectionPage),
    TranslateModule.forChild(),
    LongPressModule
  ],
  exports: [
    ImgCollectionPage
  ]
}) 
export class ImgCollectionPageModule { }
