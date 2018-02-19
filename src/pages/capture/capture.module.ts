import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { CapturePage } from './capture';



@NgModule({
  declarations: [
    CapturePage,
  ],
  imports: [
    IonicPageModule.forChild(CapturePage),
    TranslateModule.forChild()
  ],
  exports: [
    CapturePage
  ]
})
export class CapturePageModule { }
