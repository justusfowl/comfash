import { NgModule } from '@angular/core';
import { CommentGridDirective } from './comment-grid/comment-grid';
import { LongPressDirective } from './long-press/long-press';
@NgModule({
	declarations: [CommentGridDirective,
    LongPressDirective], 
	imports: [],
	exports: [CommentGridDirective,
    LongPressDirective]
})
export class DirectivesModule {}
