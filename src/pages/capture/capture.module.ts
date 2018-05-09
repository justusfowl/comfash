import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { CapturePage } from './capture';

import { DirectivesModule} from '../../directives/directives.module';


@NgModule({
  declarations: [
    CapturePage,
  ],
  imports: [
    IonicPageModule.forChild(CapturePage),
    TranslateModule.forChild(),
    DirectivesModule
  ],
  exports: [
    CapturePage
  ]
})
export class CapturePageModule { }
