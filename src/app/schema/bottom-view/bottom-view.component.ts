import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import * as _ from 'lodash';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-bottom-view',
  templateUrl: './bottom-view.component.html',
  styleUrls: ['./bottom-view.component.css']
})
export class BottomViewComponent implements OnInit, OnChanges {
  array;
  depth;

  @Input()
  get modelData() { return this.modelData; }
  set modelData(val) {
    this.modelDataChanged(val);
  }

  @Input()
  set depthOption(val) {
    this.depth = val;
    console.log(val);
  }


  @ViewChild('bottomDiagram', { static: true }) public bottomDiagramComponent: DiagramComponent;

  public initDiagram(): go.Diagram {

    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      _widthFactor: 1,
      grid: $(go.Panel, 'Grid',
        { gridCellSize: new go.Size(100, 100) },
        $(go.Shape, 'LineH', { stroke: 'lightgray' }),
        $(go.Shape, 'LineV', { stroke: 'lightgray' })
      ),
      model: $(go.GraphLinksModel,
        {
          linkFromPortIdProperty: 'fromPort',
          linkToPortIdProperty: 'toPort',
          nodeKeyProperty: 'uuid',
          linkKeyProperty: 'uuid',
          // copyNodeDataFunction: (data, model) => {
          //   const newdata = Object.assign({}, data);
          //   return newdata;
          // },
        }
      )
    });


    dia.undoManager.isEnabled = true;
    dia.toolManager.draggingTool.isGridSnapEnabled = true;
    dia.toolManager.draggingTool.gridSnapCellSpot = go.Spot.Center;
    dia.toolManager.resizingTool.isGridSnapEnabled = true;
    dia.animationManager.isEnabled = true;
    dia.commandHandler.archetypeGroupData = { uuid: 'Group', isGroup: true };
    dia.initialScale = 0.2;

    const groupFill = 'rgba(128,128,128,0.2)';
    const groupStroke = 'black';
    const dropFill = 'rgba(128,255,255,0.2)';
    const dropStroke = 'red';


    dia.nodeTemplateMap.add('busbarx', $(go.Node, 'Auto',
      {
        zOrder: 100,
        resizable: true, resizeObjectName: 'SHAPE',
        locationSpot: new go.Spot(0, 0, 50, 50),
      },
      // always save/load the point that is the top-left corner of the node, not the location
      new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      // this is the primary thing people see
      $(go.Shape, 'Rectangle',
        {
          name: 'SHAPE',
          fill: 'blue',
          minSize: new go.Size(20, 100),
          desiredSize: new go.Size(20, 200),  // initially 1x1 cell
          maxSize: new go.Size(20, NaN),  // initially 1x1 cell
          strokeWidth: 2
        },
        // new go.Binding('fill', 'color'),
        new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
    ));  // end Node



    dia.nodeTemplateMap.add('busbary', $(go.Node, 'Auto',
      {
        zOrder: 99,
        resizable: true, resizeObjectName: 'SHAPE',
        locationSpot: new go.Spot(0, 0, 50, 50),

      },
      // always save/load the point that is the top-left corner of the node, not the location
      new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      // this is the primary thing people see
      $(go.Shape, 'Rectangle',
        {
          name: 'SHAPE',
          fill: 'blue',
          minSize: new go.Size(100, 20),
          desiredSize: new go.Size(200, 20),  // initially 1x1 cell
          maxSize: new go.Size(NaN, 20),  // initially 1x1 cell
          strokeWidth: 2
        },
        // new go.Binding('fill', 'color'),
        new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),

    ));  // end Node
    // define the Node template
    dia.groupTemplateMap.add('outerProfile',
      $(go.Group, 'Vertical',
        {
          layerName: 'Background',
          //  resizable: true, resizeObjectName: 'SHAPE',
          //  movable: true,
          // because the gridSnapCellSpot is Center, offset the Group's location
          locationSpot: new go.Spot(0, 0, 50, 50),
        },
        // always save/load the point that is the top-left corner of the node, not the location
        new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'Rectangle',  // the rectangular shape around the members
          {
            name: 'SHAPE',
            fill: groupFill,
            stroke: groupStroke,
            minSize: new go.Size(200, 200),
            maxSize: new go.Size(2200, 2200)
          },
          new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
          new go.Binding('fill', 'isHighlighted', (h) => { return h ? dropFill : groupFill; }).ofObject(),
          new go.Binding('stroke', 'isHighlighted', (h) => { return h ? dropStroke : groupStroke; }).ofObject()),
      ));

    return dia;
  }

  public diagramNodeData: Array<go.ObjectData> = [

  ];
  public diagramLinkData: Array<go.ObjectData> = [

  ];
  public diagramDivClassName: string = 'bottomDiagramDiv';
  public diagramModelData = { prop: 'value' };
  public skipsDiagramUpdate = false;

  // When the diagram model changes, update app data to reflect those changes
  public diagramModelChange = function (changes: go.IncrementalData) {
    // when setting state here, be sure to set skipsDiagramUpdate: true since GoJS already has this update
    // (since this is a GoJS model changed listener event function)
    // this way, we don't log an unneeded transaction in the Diagram's undoManager history
    this.skipsDiagramUpdate = true;

    this.diagramNodeData = DataSyncService.syncNodeData(changes, this.diagramNodeData);
    this.diagramLinkData = DataSyncService.syncLinkData(changes, this.diagramLinkData);
    this.diagramModelData = DataSyncService.syncModelData(changes, this.diagramModelData);
  };




  constructor(private cdr: ChangeDetectorRef) {
  }

  modelDataChanged(val) {
    if (!this.depth) {
      return;
    }
    if (typeof val.change === 'undefined' || typeof val.change === null) { return; }
    if (typeof val.change.insertedNodeKeys === null || typeof val.change.insertedNodeKeys === 'undefined') {


      // alert('undefined')        // existing node changes


      val.change.modifiedNodeData.forEach(element => {
        if (element.category === 'outerProfile') {
          const size = element.size.split(' ')[0] + ' ' + this.depth.option.total;

          const node = this.bottomDiagramComponent.diagram.findNodeForKey(element.uuid);
          const tempNode = node;
          this.bottomDiagramComponent.diagram.model.startTransaction('deleted node');
          this.bottomDiagramComponent.diagram.model.setDataProperty(node.data, 'size', size);
          this.bottomDiagramComponent.diagram.model.setDataProperty(node.data, 'mainSize', element.size);
          this.bottomDiagramComponent.diagram.model.setDataProperty(node.data, 'pos', element.pos);
          this.bottomDiagramComponent.diagram.model.setDataProperty(node.data, 'loc', element.loc);
          this.bottomDiagramComponent.diagram.model.commitTransaction('deleted node');
          this.bottomDiagramComponent.diagram.model.nodeDataArray.forEach(ele => {
            if (ele.group === element.uuid) {
              if (ele.category === 'busbary') {
                const pos = element.pos.split(' ');
                const a = parseInt(pos[1], 0) + parseInt(this.depth.option.busbar, 0);
                const node1 = this.bottomDiagramComponent.diagram.findNodeForKey(ele.uuid);
                this.bottomDiagramComponent.diagram.model.startTransaction('deleted node');
                this.bottomDiagramComponent.diagram.model.setDataProperty(node1.data, 'size', element.size.split(' ')[0]);
                this.bottomDiagramComponent.diagram.model.setDataProperty(node1.data, 'pos', pos[0] + ' ' + a,);
                this.bottomDiagramComponent.diagram.model.commitTransaction('deleted node');
              } else if (ele.category === 'busbarx') {
                // const x = parseInt(tempNode.data.pos.split(' ')[0] ) 
                // const node1 = this.bottomDiagramComponent.diagram.findNodeForKey(ele.uuid);
                // this.bottomDiagramComponent.diagram.model.startTransaction('deleted node');
                // this.bottomDiagramComponent.diagram.model.setDataProperty(node1.data, 'pos', pos[0] + ' ' + a,);
                // this.bottomDiagramComponent.diagram.model.commitTransaction('deleted node');
              }

            }
          })
        }
      });
    } else {
      // new node comes
      val.change.modifiedNodeData.forEach(element => {
        if (element.category === 'outerProfile') {
          const size = element.size.split(' ');
          const obj = {
            category: 'outerProfile',
            isGroup: true,
            selectedOption: null,
            size: size[0] + ' ' + this.depth.option.total,
            pos: element.pos,
            text: element.text,
            type: element.type,
            uuid: element.uuid,
            mainSize: element.size,
          }
          const pos = element.pos.split(' ');
          const a = parseInt(pos[1], 0) + parseInt(this.depth.option.busbar, 0);
          this.bottomDiagramComponent.diagram.model.addNodeData(obj);
          const temp = {
            category: 'busbary',
            size: size[0] + ' ' + 20,
            pos: pos[0] + ' ' + a,
            uuid: this.uniqueKey(),
            group: element.uuid
          }
          this.bottomDiagramComponent.diagram.model.addNodeData(temp);
        } else {

          const group = this.bottomDiagramComponent.diagram.findNodeForKey(element.group);
          const groupSize = group.data.mainSize.split(' ');
          const groupPos = group.data.pos.split(' ');
          const nodeSize = element.size.split(' ');
          const nodePos = element.pos.split(' ');

         const sizeDiff = parseInt(groupSize[1], 0) - parseInt(nodeSize[1], 0);

         const posDiff = parseInt(nodePos[1], 0) - parseInt(groupPos[1], 0);

         if(sizeDiff === posDiff) {
          const temp = {
            category: 'busbarx',
            size: 20 + ' ' + this.depth.option.total,
            pos: nodePos[0] + ' ' + parseInt(groupPos[1], 0),
            uuid: this.uniqueKey(),
            group: element.uuid
          }
          const temp1 = {
            category: 'busbarx',
            size: 20 + ' ' + this.depth.option.total,
            pos: ( parseInt(nodePos[0], 0) + parseInt(nodeSize[1], 0)) + ' ' + parseInt(groupPos[1], 0),
            uuid: this.uniqueKey(),
            group: element.uuid
          }
          this.bottomDiagramComponent.diagram.model.addNodeData(temp);
          this.bottomDiagramComponent.diagram.model.addNodeData(temp1);
          // alert('bottom touch');
         } else {
         //  alert('not touch');
         }
         // console.log(element);
        }

      });

    }
    // console.log(this.myDiagramComponent.diagram.model.toJson());



  }

  uniqueKey() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    const uuid = s4() + s4() + s4();
    return uuid;
  };

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log('value changed', this.modelData);
  }
  public ngAfterViewInit() {
    this.cdr.detectChanges(); // IMPORTANT: without this, Angular will throw ExpressionChangedAfterItHasBeenCheckedError (dev mode only)

    const appComp: BottomViewComponent = this;
    // listener for inspector
    this.bottomDiagramComponent.diagram.addDiagramListener('ChangedSelection', function (e) {
      if (e.diagram.selection.count === 0) {
        // appComp.selectedNode = null;
      }
      const node = e.diagram.selection.first();
      if (node instanceof go.Node) {
        // appComp.selectedNode = node;
      } else {
        //  appComp.selectedNode = null;
      }
    });
  } // end ngAfterViewInit


  public handleInspectorChange(newNodeData) {
    const key = newNodeData.key;
    // find the entry in nodeDataArray with this key, replace it with newNodeData
    let index = null;
    for (let i = 0; i < this.diagramNodeData.length; i++) {
      const entry = this.diagramNodeData[i];
      if (entry.key && entry.key === key) {
        index = i;
      }
    }

    if (index >= 0) {
      // here, we set skipsDiagramUpdate to false, since GoJS does not yet have this update
      this.skipsDiagramUpdate = false;
      this.diagramNodeData[index] = _.cloneDeep(newNodeData);
    }
  }


}

