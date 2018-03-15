import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { FittingStreamPage } from './fitting-stream';

@NgModule({
  declarations: [
    FittingStreamPage,
  ],
  imports: [
    IonicPageModule.forChild(FittingStreamPage),
    TranslateModule.forChild()
  ],
  exports: [
    FittingStreamPage
  ]
})
export class FittingStreamPageModule { }
