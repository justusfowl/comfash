import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FeedbackPage } from './feedback';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FeedbackPage,
  ],
  imports: [
    IonicPageModule.forChild(FeedbackPage),
    TranslateModule.forChild()
  ],
})
export class FeedbackPageModule {}
