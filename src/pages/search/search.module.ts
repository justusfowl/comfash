import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SearchPage } from './search';

import { LinkUsernameModule } from "../../components/link-username/link-username.module";

@NgModule({
  declarations: [
    SearchPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchPage),
    TranslateModule.forChild(),
    LinkUsernameModule
  ],
})
export class SearchPageModule {}
