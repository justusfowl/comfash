import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { FittingStreamPage } from './fitting-stream';

import { LongPressModule } from 'ionic-long-press';


@NgModule({
  declarations: [
    FittingStreamPage,
  ],
  imports: [
    IonicPageModule.forChild(FittingStreamPage),
    TranslateModule.forChild(), 
    LongPressModule
  ],
  exports: [
    FittingStreamPage
  ]
})
export class FittingStreamPageModule { }
