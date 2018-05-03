
import { 
  Component, Input, OnInit, OnDestroy, 
  ViewChild, ViewContainerRef,
  ComponentFactoryResolver, ComponentRef, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';

import { PopoverController } from 'ionic-angular';
import { Vote, Session } from '../../models/datamodel';
import { Api, AuthService, UtilService, VoteHandlerService } from '../../providers/providers';

@Component({
  selector: 'session-tile',

  template: `
      <div #container ></div>
  `
})
export class DynamicSessionTileComponent implements OnInit, OnChanges {

  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  @Input()
  context: any;
  
  @Input()
  index: any;

  @Output()
  onCommentClick = new EventEmitter<any>();

  @Output()
  onVoteClick = new EventEmitter<any>();

  @Output()
  onTagsClick = new EventEmitter<any>();

  @Output()
  onSessionRemoveClick = new EventEmitter<any>();

  protected myInstance : any;

  private mappings = {
      'online': SessionTileComponentOnline,
      'local': SessionTileComponentLocal
  };

  private componentRef: ComponentRef<{}>;

  constructor(
      private componentFactoryResolver: ComponentFactoryResolver) {
  }

  getComponentType(typeName: string) {
      let inputType;
      if (typeName.indexOf("/") > -1){
          inputType = typeName.substring(0,typeName.indexOf("/"));
      }else{
          inputType = typeName;
      }
      
      let type = this.mappings[inputType];
      return type || SessionItemComponentUnknown;
  }

  ngOnInit() {

    let isSessionTmp = this.context.flagIsTmp;
    let type; 

    if (isSessionTmp){
      type = "local"
    }else{
      type = "online"
    }

    let componentType = this.getComponentType(type);
    
    // note: componentType must be declared within module.entryComponents
    let factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    this.componentRef = this.container.createComponent(factory);


    // set component context
    let instance = <DynamicSessionTile> this.componentRef.instance;
    
    instance.session = this.context;
    instance.index = this.index;

    instance.onCommentClick.subscribe(value => this.handleCommentClicked(value));
    instance.onVoteClick.subscribe(value => this.handleVoteClicked(value));
    instance.onTagsClick.subscribe(value => this.handleTagsClicked(value));
    instance.onSessionRemoveClick.subscribe(value => this.handleSessionRemove(value));

    this.myInstance = instance;

  }

  ngOnChanges(changes : SimpleChanges){

    console.log(JSON.stringify(changes));
    console.log(changes);
    if (changes["context"] && this.myInstance){
        this.myInstance.session = changes["context"].currentValue;
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

}

export abstract class DynamicSessionTile {
  
  @Output()
  onCommentClick = new EventEmitter<any>();

  @Output()
  onVoteClick = new EventEmitter<any>();

  @Output()
  onTagsClick = new EventEmitter<any>();

  @Output()
  onSessionRemoveClick = new EventEmitter<any>();

  session: any;
  index : any;
  flagIsTmp : boolean = false; 
  itemSessionPath : any;
  totalCnt : number;
  height : number;
  showsComments : boolean = false;
  
}

@Component({
  selector: 'session-tile-online',
  templateUrl: './session-tile.online.html'
})
export class SessionTileComponentOnline extends DynamicSessionTile {

  constructor(
      public util : UtilService, 
      public popoverCtrl : PopoverController, 
      public auth : AuthService, 
      public api : Api, 
      public voteHdl : VoteHandlerService
  ) {

      super();

  }

  hasSessionCloseClicked(context){
      this.onSessionRemoveClick.emit(context)
  }

  hasTagsClicked(context){
      this.onTagsClick.emit(context);
  }

  getItemSessionPath(session : Session){
    return this.util.wrapHostBase(session.sessionItemPath);
  }

  isCompared(session : Session){
    if (this.api.compareSessionIds.indexOf(session.getId()) != -1){
      return true;
    }else{
      return false;
    }
  }


  
}

@Component({
  selector: 'session-tile-local',
  templateUrl: './session-tile.local.html'
})
export class SessionTileComponentLocal extends DynamicSessionTile {

  constructor(
    public util : UtilService, 
    public popoverCtrl : PopoverController, 
    public auth : AuthService, 
    public api : Api, 
    public voteHdl : VoteHandlerService
  ) {
    super();
}

isCompared(session : Session){
  if (this.api.compareSessionIds.indexOf(session.getId()) != -1){
    return true;
  }else{
    return false;
  }
}

getItemSessionPathImg(session : Session){

  try{
    let resource = session.sessionItemPath;

    if (resource.substring(0,4) != "data"){
      resource = "data:*/*;base64," + resource;
    }
  
    return this.util.sanitizeResource(resource);
  }catch(err){
    return null;
  }
  
}

getItemSessionPath(session : Session){
  let resource = "data:" + session.sessionItemType + ";base64," + session.sessionItemPath;
  
  return this.util.sanitizeStyle(resource);
}
  
}
@Component({
  selector: 'unknown-component',
  template: `<div style="position: absolute; top: 20%; color: red;">Unknown component</div>`
})
export class SessionItemComponentUnknown extends DynamicSessionTile {}


