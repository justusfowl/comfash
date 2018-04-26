import { 
    Component, Input, OnInit, OnDestroy, 
    ViewChild, ViewContainerRef,
    ComponentFactoryResolver, ComponentRef, Output, EventEmitter
  } from '@angular/core';

import { PopoverController } from 'ionic-angular';
import { Vote } from '../../models/datamodel';
import { Api, AuthService, UtilService } from '../../providers/providers';

  @Component({
    selector: 'activity-item',

    template: `
        <div #container ></div>
    `
  })
  export class DynamicActivityItemComponent implements OnInit, OnDestroy {
  
    @ViewChild('container', { read: ViewContainerRef })
    container: ViewContainerRef;
  
    @Input()
    context: any;

    @Input()
    index: any;
    
    @Input()
    type: any; 

    @Output()
    onCommentClick = new EventEmitter<any>();

    @Output()
    onVoteClick = new EventEmitter<any>();

    @Output()
    onTagsClick = new EventEmitter<any>();
  
    @Output()
    onSessionRemoveClick = new EventEmitter<any>();

    private mappings = {
        '1': VoteSessionItemComponentActivity, 
        '2' : CommentSessionItemComponentActivity
    };
  
    private componentRef: ComponentRef<{}>;
  
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver) {
    }
  
    getComponentType(typeName: string) {
        
        let type = this.mappings[typeName];
        return type || SessionItemComponentUnknown;
    }
  
    ngOnInit() {


        if (this.type) {

            let componentType = this.getComponentType(this.type);
            
            // note: componentType must be declared within module.entryComponents
            let factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
            this.componentRef = this.container.createComponent(factory);


            // set component context
            let instance = <DynamicActivityItem> this.componentRef.instance;
            
            instance.context = this.context;
            instance.index = this.index;

            instance.onCommentClick.subscribe(value => this.handleCommentClicked(value));
            instance.onVoteClick.subscribe(value => this.handleVoteClicked(value));
            instance.onTagsClick.subscribe(value => this.handleTagsClicked(value));
            instance.onSessionRemoveClick.subscribe(value => this.handleSessionRemove(value));

        }
    }

    handleCommentClicked(value){
        this.onCommentClick.emit(value)
    }

    handleVoteClicked(value){
        this.onVoteClick.emit(value)
    }

    handleTagsClicked(value){
        this.onTagsClick.emit(value)
    }

    handleSessionRemove(value){
        this.onSessionRemoveClick.emit(value)
    }
  
    ngOnDestroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }
    }
  
  }
  
  export abstract class DynamicActivityItem {
    
    @Output()
    onCommentClick = new EventEmitter<any>();

    @Output()
    onVoteClick = new EventEmitter<any>();

    @Output()
    onTagsClick = new EventEmitter<any>();

    @Output()
    onSessionRemoveClick = new EventEmitter<any>();

    context: any;
    index : any;
    flagIsTmp : boolean = false; 
    itemSessionPath : any;
    totalCnt : number;
    height : number;
    showsComments : boolean = false;
    
  }
  
  @Component({
    selector: 'activity-item-vote',
    templateUrl: './activity-item.vote.html'
  })
  export class VoteSessionItemComponentActivity extends DynamicActivityItem {
  

    constructor(
        public util : UtilService, 
        public popoverCtrl : PopoverController, 
        public auth : AuthService, 
        public api : Api
    ) {

        super();

    }

    showReactions(ev: any, session: any){

        let hasVote = false;
        
        if (session.myVote){
          hasVote = true;
        }
     
        let reactions = this.popoverCtrl.create('ReactionsPage', {
          "hasVote" : hasVote
        });
    
        reactions.onDidDismiss((voteType : number) => {

                this.onVoteClick.emit(voteType);

        });
    
        reactions.present({
            ev: ev
        });
    
    }

    testClick(event){
        console.log("testclick");
        console.log(event)
    }

    
  }

  @Component({
    selector: 'activity-item-comment',
    templateUrl: './activity-item.comment.html'
  })
  export class CommentSessionItemComponentActivity extends DynamicActivityItem {
  

    constructor(
        public util : UtilService, 
        public popoverCtrl : PopoverController, 
        public auth : AuthService, 
        public api : Api
    ) {

        super();

    }

    showReactions(ev: any, session: any){

        let hasVote = false;
        
        if (session.myVote){
          hasVote = true;
        }
     
        let reactions = this.popoverCtrl.create('ReactionsPage', {
          "hasVote" : hasVote
        });
    
        reactions.onDidDismiss((voteType : number) => {

                this.onVoteClick.emit(voteType);
            
        });
    
        reactions.present({
            ev: ev
        });
    
    }

    testClick(event){
        console.log("testclick");
        console.log(event)
    }

    
  }
  
  @Component({
    selector: 'unknown-component',
    template: `<div style="position: absolute; top: 20%; color: red;">Unknown component</div>`
  })
  export class SessionItemComponentUnknown extends DynamicActivityItem {}