import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { FittingStreamPage } from './fitting-stream';

import { LongPressModule } from 'ionic-long-press';

import { DynamicActivityItemModule } from '../../components/activity-item/activity-item.module';

@NgModule({
  declarations: [
    FittingStreamPage,
  ],
  imports: [
    IonicPageModule.forChild(FittingStreamPage),
    TranslateModule.forChild(), 
    LongPressModule, 
    DynamicActivityItemModule
  ],
  exports: [
    FittingStreamPage
  ]
})
export class FittingStreamPageModule { }
