import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ContentPage } from './content';


import { DynamicSessionItemModule } from '../../components/session-item/session-item.module';

@NgModule({
  declarations: [
    ContentPage
  ],
  imports: [
    IonicPageModule.forChild(ContentPage),
    TranslateModule.forChild(), 
    DynamicSessionItemModule
  ],
  exports: [
    ContentPage
  ]
})
export class ContentPageModule { }
