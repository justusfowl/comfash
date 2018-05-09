import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { TagCreatePage } from './tag-create';

@NgModule({
  declarations: [
    TagCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(TagCreatePage),
    TranslateModule.forChild()
  ],
  exports: [
    TagCreatePage
  ]
})
export class TagCreatePageModule { }
