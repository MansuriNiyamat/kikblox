import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import * as _ from 'lodash';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { OuterProfiledialogComponent } from './outerProfile/outerProfiledialog.component';
import {JSONDialogComponent} from './jsondialog/dialog.component';
import { SchemaService } from './service/schema.service';

@Component({
  selector: 'app-schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SchemaComponent implements AfterViewInit {

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent: DiagramComponent;
  @ViewChild('myPalette', { static: true }) public myPaletteComponent: PaletteComponent;

  squarex;
  squarey;
  rectanglex;
  rectangley;
  finalTable = [];

  bottomData;
  depthOption;

  

  private _jsonURL = 'assets/data.json';

  public oDivClassName = 'myOverviewDiv';

  public observedDiagram = null;

  // currently selected node; for inspector
  public selectedNode: go.Node | null = null;

  public diagramNodeData: Array<go.ObjectData> = [
    // { key: "G1", isGroup: true, pos: "0 0", size: "1100 600" },
  ];
  public diagramLinkData: Array<go.ObjectData> = [];
  public diagramDivClassName = 'myDiagramDiv';
  public diagramModelData = { prop: 'value' };
  public skipsDiagramUpdate = false;

  
  public paletteNodeData: Array<go.ObjectData> = [
    { uuid: '9874ceba1dad', text: '', color: 'red', size: '20 500', type: 'square', category: 'busbarx' },
    { uuid: '5432ceba1dad', text: '', color: 'red', size: '400 20', type: 'square', category: 'busbary' },
    { uuid: '4279ceba1dad', text: 'Door', color: '#eeebe1', size: '200 200', type: 'square', category: 'door' },
    { uuid: '2541ceba1dad', text: 'Cover', color: '#eeebe1', size: '200 200', type: 'rectangle', category: 'cover' },
    { uuid: '6549ceba1dad', text: 'Cable Chamber', color: '#eeebe1', size: '200 200', type: 'rectangle', category: 'cableChamber' },
    { uuid: '5231ceba1dad', text: 'Cover with Louver', color: '#eeebe1', size: '200 200', type: 'rectangle', category: 'coverwithlouver' },
    { uuid: '3514ceba1dad', text: 'Outer Profile', color: '#81D4FA', isGroup: true, size: '500 1000', type: 'rectangle', category: 'outerProfile', selectedOption: null, pos: '0 0' },
  ];

  public paletteLinkData: Array<go.ObjectData> = [

  ];
  public paletteModelData = { prop: 'val' };
  public paletteDivClassName = 'myPaletteDiv';


  // initialize diagram / templates
  public initDiagram(): go.Diagram {
    const self = this;
    const $ = go.GraphObject.make;
    const uniqueKey = () => {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      const uuid = s4() + s4() + s4();
      return uuid;
    };
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
          makeUniqueKeyFunction: uniqueKey,
          copyNodeDataFunction: (data, model) => {
            const newdata = Object.assign({}, data);
            return newdata;
          },
        }
      )
    });
    // dia.model.makeUniqueKeyFunction = (model, data) => {
    //   function s4() {
    //     return Math.floor((1 + Math.random()) * 0x10000)
    //         .toString(16)
    //         .substring(1);
    // }
    // const uuid = s4() + s4() + s4();
    // return uuid;
    // };
    // dia.model.copyNodeDataFunction = (data, model) => {
    //   const newdata = Object.assign({}, data);
    //   return newdata;
    // }
    dia.undoManager.isEnabled = true;
    dia.toolManager.draggingTool.isGridSnapEnabled = true;
    dia.toolManager.draggingTool.gridSnapCellSpot = go.Spot.Center;
    dia.initialScale = 0.2;
    dia.toolManager.resizingTool.isGridSnapEnabled = true;
    dia.animationManager.isEnabled = true;
    dia.commandHandler.archetypeGroupData = { uuid: 'Group', isGroup: true };

    const highlightGroup = (grp, show) => {
      if (!grp) return false;
      // check that the drop may really happen into the Group
      const tool = grp.diagram.toolManager.draggingTool;
      grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
      return grp.isHighlighted;
    }
   const doorImage = new Image(1000, 1000);
   doorImage.src = 'assets/door2.jpg';
   const doorImageBrush = $(go.Brush, 'Pattern', { pattern: doorImage });

   const louverImage = new Image(1000, 1000);
   louverImage.src = 'assets/louver.jpg';
   const louverImageBrush = $(go.Brush, 'Pattern', { pattern: louverImage });


   dia.nodeTemplateMap.add('busbarx', $(go.Node, 'Auto',
   {
     zOrder: 100,
     resizable: true, resizeObjectName: 'SHAPE',
     // because the gridSnapCellSpot is Center, offset the Node's location
     locationSpot: new go.Spot(0, 0, 10, 0),
     // provide a visual warning about dropping anything onto an "item"
    //  mouseDragEnter: (e, node: any) => {
    //    e.handled = true;
    //   // node.findObject('SHAPE').fill = 'red';
    //    e.diagram.currentCursor = 'not-allowed';
    //    highlightGroup(node.containingGroup, false);
    //  },
    //  mouseDragLeave: (e, node: any) => {
    //    node.updateTargetBindings();
    //  },
    //  mouseDrop: (e, node) => {  // disallow dropping anything onto an "item"
    //    node.diagram.currentTool.doCancel();
    //  }
   },
   // always save/load the point that is the top-left corner of the node, not the location
   new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
   // this is the primary thing people see
   $(go.Shape, 'Rectangle',
     {
       name: 'SHAPE',
       fill: 'red',
       minSize: new go.Size(20, 100),
       desiredSize: new go.Size(20, 200),  // initially 1x1 cell
       maxSize: new go.Size(20, NaN),  // initially 1x1 cell
       strokeWidth: 2
     },
    // new go.Binding('fill', 'color'),
     new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
   // with the textual key in the middle
   $(go.TextBlock,
     {
       alignment: go.Spot.Center,
       editable: true,
       margin: 5,
       font: 'bold 20px sans-serif',
       stroke: '#404040'
     },
     new go.Binding('text', 'text').makeTwoWay())
 ));  // end Node



 dia.nodeTemplateMap.add('busbary', $(go.Node, 'Auto',
   {
     zOrder: 99,
     resizable: true, resizeObjectName: 'SHAPE',
     // because the gridSnapCellSpot is Center, offset the Node's location
     locationSpot: new go.Spot(0, 0, 10, 10),
     // provide a visual warning about dropping anything onto an "item"
    //  mouseDragEnter: (e, node: any) => {
    //    e.handled = true;
    //   // node.findObject('SHAPE').fill = 'red';
    //    e.diagram.currentCursor = 'not-allowed';
    //    highlightGroup(node.containingGroup, false);
    //  },
    //  mouseDragLeave: (e, node: any) => {
    //    node.updateTargetBindings();
    //  },
    //  mouseDrop: (e, node) => {  // disallow dropping anything onto an "item"
    //    node.diagram.currentTool.doCancel();
    //  }
   },
   // always save/load the point that is the top-left corner of the node, not the location
   new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
   // this is the primary thing people see
   $(go.Shape, 'Rectangle',
     {
       name: 'SHAPE',
       fill: 'red',
       minSize: new go.Size(100, 20),
       desiredSize: new go.Size(200, 20),  // initially 1x1 cell
       maxSize: new go.Size(NaN, 20),  // initially 1x1 cell
       strokeWidth: 2
     },
    // new go.Binding('fill', 'color'),
     new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
   // with the textual key in the middle
   $(go.TextBlock,
     {
       alignment: go.Spot.Center,
       editable: true,
       margin: 5,
       font: 'bold 20px sans-serif',
       stroke: '#404040'
     },
     new go.Binding('text', 'text').makeTwoWay())
 ));  // end Node
    // define the Node template
    dia.nodeTemplateMap.add('door', $(go.Node, 'Auto',
        {
          zOrder:1,
          resizable: true, resizeObjectName: 'SHAPE',
          // because the gridSnapCellSpot is Center, offset the Node's location
          locationSpot: new go.Spot(0, 0, 50, 50),
          // provide a visual warning about dropping anything onto an "item"
          mouseDragEnter: (e, node: any) => {
            e.handled = true;
           // node.findObject('SHAPE').fill = 'red';
            e.diagram.currentCursor = 'not-allowed';
            highlightGroup(node.containingGroup, false);
          },
          mouseDragLeave: (e, node: any) => {
            node.updateTargetBindings();
          },
          mouseDrop: (e, node) => {  // disallow dropping anything onto an "item"
          const node1 = node.diagram.selection.first();
          if(node1.data.category === 'busbary' || node1.data.category === 'busbarx') {
      
          } else {
            node.diagram.currentTool.doCancel();
          }
          }
        },
        // always save/load the point that is the top-left corner of the node, not the location
        new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
        // this is the primary thing people see
        $(go.Shape, 'Rectangle',
          {
            name: 'SHAPE',
            fill: doorImageBrush,
            minSize: new go.Size(100, 100),
            desiredSize: new go.Size(100, 100),  // initially 1x1 cell
            strokeWidth: 7
          },
         // new go.Binding('fill', 'color'),
          new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
        // with the textual key in the middle
        $(go.TextBlock,
          {
            alignment: go.Spot.Center,
            editable: true,
            margin: 5,
            font: 'bold 36px sans-serif',
            stroke: '#404040'
          },
          new go.Binding('text', 'text').makeTwoWay())
      ));  // end Node



       // define the Node template
    dia.nodeTemplateMap.add('cover', $(go.Node, 'Auto',
    {
      zOrder:1,
      resizable: true, resizeObjectName: 'SHAPE',
      // because the gridSnapCellSpot is Center, offset the Node's location
      locationSpot: new go.Spot(0, 0, 50, 50),
      // provide a visual warning about dropping anything onto an "item"
      mouseDragEnter: (e, node: any) => {
        e.handled = true;
       // node.findObject('SHAPE').fill = 'red';
        e.diagram.currentCursor = 'not-allowed';
        highlightGroup(node.containingGroup, false);
      },
      mouseDragLeave: (e, node: any) => {
        node.updateTargetBindings();
      },
      mouseDrop: (e, node) => {  // disallow dropping anything onto an "item"
      const node1 = node.diagram.selection.first();
      if(node1.data.category === 'busbary' || node1.data.category === 'busbarx') {
  
      } else {
        node.diagram.currentTool.doCancel();
      }
      }
    },
    // always save/load the point that is the top-left corner of the node, not the location
    new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
    // this is the primary thing people see
    $(go.Shape, 'Rectangle',
      {
        name: 'SHAPE',
        fill: doorImageBrush,
        minSize: new go.Size(100, 100),
        desiredSize: new go.Size(100, 100),  // initially 1x1 cell
        strokeWidth: 7
      },
     // new go.Binding('fill', 'color'),
      new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
    // with the textual key in the middle
    $(go.TextBlock,
      {
        alignment: go.Spot.Center,
        editable: true,
        margin: 5,
        font: 'bold 36px sans-serif',
        stroke: '#404040'
      },
      new go.Binding('text', 'text').makeTwoWay())
  ));  // end Node



   // define the Node template
   dia.nodeTemplateMap.add('cableChamber', $(go.Node, 'Auto',
   {
    zOrder:1,
     resizable: true, resizeObjectName: 'SHAPE',
     // because the gridSnapCellSpot is Center, offset the Node's location
     locationSpot: new go.Spot(0, 0, 50, 50),
     // provide a visual warning about dropping anything onto an "item"
     mouseDragEnter: (e, node: any) => {
       e.handled = true;
      // node.findObject('SHAPE').fill = 'red';
       e.diagram.currentCursor = 'not-allowed';
       highlightGroup(node.containingGroup, false);
     },
     mouseDragLeave: (e, node: any) => {
       node.updateTargetBindings();
     },
     mouseDrop: (e, node) => {  // disallow dropping anything onto an "item"
     const node1 = node.diagram.selection.first();
     if(node1.data.category === 'busbary' || node1.data.category === 'busbarx') {
 
     } else {
       node.diagram.currentTool.doCancel();
     }
     }
   },
   // always save/load the point that is the top-left corner of the node, not the location
   new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
   // this is the primary thing people see
   $(go.Shape, 'Rectangle',
     {
       name: 'SHAPE',
       fill: doorImageBrush,
       minSize: new go.Size(100, 100),
       desiredSize: new go.Size(100, 100),  // initially 1x1 cell
       strokeWidth: 7
     },
    // new go.Binding('fill', 'color'),
     new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
   // with the textual key in the middle
   $(go.TextBlock,
     {
       alignment: go.Spot.Center,
       editable: true,
       margin: 5,
       font: 'bold 36px sans-serif',
       stroke: '#404040'
     },
     new go.Binding('text', 'text').makeTwoWay())
 ));  // end Node


  // define the Node template
  dia.nodeTemplateMap.add('coverwithlouver', $(go.Node, 'Auto',
  {
    zOrder:1,
    resizable: true, resizeObjectName: 'SHAPE',
    // because the gridSnapCellSpot is Center, offset the Node's location
    locationSpot: new go.Spot(0, 0, 50, 50),
    // provide a visual warning about dropping anything onto an "item"
    mouseDragEnter: (e, node: any) => {
      e.handled = true;
     // node.findObject('SHAPE').fill = 'red';
      e.diagram.currentCursor = 'not-allowed';
      highlightGroup(node.containingGroup, false);
    },
    mouseDragLeave: (e, node: any) => {
      node.updateTargetBindings();
    },
    mouseDrop: (e, node) => {  // disallow dropping anything onto an "item"
    const node1 = node.diagram.selection.first();
    if(node1.data.category === 'busbary' || node1.data.category === 'busbarx') {

    } else {
      node.diagram.currentTool.doCancel();
    }
    }
  },
  // always save/load the point that is the top-left corner of the node, not the location
  new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
  // this is the primary thing people see
  $(go.Shape, 'Rectangle',
    {
      name: 'SHAPE',
      fill: louverImageBrush,
      minSize: new go.Size(100, 100),
      desiredSize: new go.Size(100, 100),  // initially 1x1 cell
      strokeWidth: 7
    },
   // new go.Binding('fill', 'color'),
    new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
  // with the textual key in the middle
  $(go.TextBlock,
    {
      alignment: go.Spot.Center,
      editable: true,
      margin: 5,
      font: 'bold 20px sans-serif',
      stroke: 'white'
    },
    new go.Binding('text', 'text').makeTwoWay())
));  // end Node


    const groupFill = 'rgba(128,128,128,0.2)';
    const groupStroke = 'black';
    const dropFill = 'rgba(128,255,255,0.2)';
    const dropStroke = 'red';


    dia.groupTemplateMap.add('outerProfile',
      $(go.Group, 'Vertical',
        {
          layerName: 'Background',
          resizable: true, resizeObjectName: 'SHAPE',
          movable: true,
          // because the gridSnapCellSpot is Center, offset the Group's location
          locationSpot: new go.Spot(0, 0, 50, 50),
        },
        // always save/load the point that is the top-left corner of the node, not the location
        new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        { // what to do when a drag-over or a drag-drop occurs on a Group
          mouseDragEnter: (e, grp, prev) => {
            if (!highlightGroup(grp, true)) e.diagram.currentCursor = 'not-allowed'; else e.diagram.currentCursor = '';
          },
          mouseDragLeave: (e, grp: any, next) => { highlightGroup(grp, false); },
          mouseDrop: (e, grp: any) => {
            const ok = grp.addMembers(grp.diagram.selection, true);
            if (!ok) grp.diagram.currentTool.doCancel();
          }
        },
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
        $(go.Shape,
          {
            minSize: new go.Size(NaN, 100),
            maxSize: new go.Size(NaN, 100)
          },
          new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
        ),$(go.TextBlock,
          {
            alignment: go.Spot.Center,
            editable: true,
            margin: 5,
            font: 'bold 36px sans-serif',
            stroke: '#404040'
          },
          new go.Binding('text', 'text').makeTwoWay())
      ));

    dia.commandHandler.memberValidation = (grp, node) => {
      if (grp instanceof go.Group && node instanceof go.Group) return false;  // cannot add Groups to Groups
      // but dropping a Group onto the background is always OK
      return true;
    };

    // what to do when a drag-drop occurs in the Diagram's background
    dia.mouseDragOver = (e) => {
      if (!false) {
        // OK to drop a group anywhere or any Node that is a member of a dragged Group
        const tool = e.diagram.toolManager.draggingTool;
        if (!tool.draggingParts.all((p) => {
          return p instanceof go.Group || (!p.isTopLevel && tool.draggingParts.contains(p.containingGroup));
        })) {
          e.diagram.currentCursor = 'not-allowed';
        } else {
          e.diagram.currentCursor = '';
        }
      }
    };

    dia.mouseDrop = (e) => {
      if (false) {
        // when the selection is dropped in the diagram's background,
        // make sure the selected Parts no longer belong to any Group
        if (!e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true)) {
          e.diagram.currentTool.doCancel();
        }
      } else {
        // disallow dropping any regular nodes onto the background, but allow dropping "racks",
        // including any selected member nodes
        if (!e.diagram.selection.all((p) => {
          return p instanceof go.Group || (!p.isTopLevel && p.containingGroup.isSelected);
        })) {
          e.diagram.currentTool.doCancel();
        }
      }
    };

    // dia.model = new go.GraphLinksModel([
    //   linkFromPortIdProperty: 'fromPort',
    //   linkToPortIdProperty: 'toPort',
    //   nodeKeyProperty: 'uuid',
    //   linkKeyProperty: 'uuid'
    // ]);

    return dia;
  }
  // When the diagram model changes, update app data to reflect those changes
  public diagramModelChange(changes: go.IncrementalData) {
   // console.log(this.myDiagramComponent.diagram.model.nodeDataArray);

    this.bottomData ={ change: changes, model: this.myDiagramComponent.diagram.model } ;

    // when setting state here, be sure to set skipsDiagramUpdate: true since GoJS already has this update
    // (since this is a GoJS model changed listener event function)
    // this way, we don't log an unneeded transaction in the Diagram's undoManager history
    this.skipsDiagramUpdate = true;

    this.diagramNodeData = DataSyncService.syncNodeData(changes, this.diagramNodeData);
    this.diagramLinkData = DataSyncService.syncLinkData(changes, this.diagramLinkData);
   // this.diagramModelData = DataSyncService.syncModelData(changes, this.diagramModelData);
  //  console.log(this.myDiagramComponent.diagram.model.nodeDataArray);
  };



  public initPalette(): go.Palette {

    const $ = go.GraphObject.make;
    const uniqueKey = () => {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      const uuid = s4() + s4() + s4();
      return uuid;
    };
    const palette = $(go.Palette, {
      model: $(go.GraphLinksModel,
        {
          nodeKeyProperty: 'uuid',
          linkKeyProperty: 'uuid',
          makeUniqueKeyFunction: uniqueKey
        }),
    layout: $(go.GridLayout, { wrappingColumn: 1 })
    },
    );

    const highlightGroup = (grp, show) => {
      if (!grp) return false;
      // check that the drop may really happen into the Group
      const tool = grp.diagram.toolManager.draggingTool;
      grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
      return grp.isHighlighted;
    }
    palette.model.makeUniqueKeyFunction = (model, data) => {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      const uuid = s4() + s4() + s4();
      return uuid;
    }
    palette.initialScale = 0.2;
    palette.nodeTemplate =
      $(go.Node, 'Auto',
        {
         // resizable: true, resizeObjectName: 'SHAPE',
          // because the gridSnapCellSpot is Center, offset the Node's location
          locationSpot: new go.Spot(0, 0, 50, 50),
          // provide a visual warning about dropping anything onto an "item"
        },
        // always save/load the point that is the top-left corner of the node, not the location
       // new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
        // this is the primary thing people see
        $(go.Shape, 'Rectangle',
          {
            name: 'SHAPE',
            fill: 'white',
            minSize: new go.Size(300, 300),
            desiredSize: new go.Size(100, 100)  // initially 1x1 cell
          },
          new go.Binding('fill', 'color'),
          new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
        // with the textual key in the middle
        $(go.TextBlock,
          { alignment: go.Spot.Center, font: 'bold 36px sans-serif' },
          new go.Binding('text', 'text'))
      );  // end Node
      const groupFill = 'rgba(128,128,128,0.2)';
      const groupStroke = 'black';
      const dropFill = 'rgba(128,255,255,0.2)';
      const dropStroke = 'red';
      palette.groupTemplateMap.add('outerProfile',
      $(go.Group, 'Vertical',
        {
          layerName: 'Background',
         // resizable: true, resizeObjectName: 'SHAPE',
         // movable: true,
          // because the gridSnapCellSpot is Center, offset the Group's location
          locationSpot: new go.Spot(0, 0, 50, 50),
        },
        // always save/load the point that is the top-left corner of the node, not the location
        new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        // { // what to do when a drag-over or a drag-drop occurs on a Group
        //   mouseDragEnter: (e, grp, prev) => {
        //     if (!highlightGroup(grp, true)) e.diagram.currentCursor = 'not-allowed'; else e.diagram.currentCursor = '';
        //   },
        //   mouseDragLeave: (e, grp: any, next) => { highlightGroup(grp, false); },
        //   mouseDrop: (e, grp: any) => {
        //     const ok = grp.addMembers(grp.diagram.selection, true);
        //     if (!ok) grp.diagram.currentTool.doCancel();
        //   }
       // },
        $(go.Shape, 'Rectangle',  // the rectangular shape around the members
          {
            name: 'SHAPE',
            fill: groupFill,
            stroke: groupStroke,
            minSize: new go.Size(300, 300),
            maxSize: new go.Size(2200, 2200)
          },
          new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
        //  new go.Binding('fill', 'isHighlighted', (h) => { return h ? dropFill : groupFill; }).ofObject(),
         // new go.Binding('stroke', 'isHighlighted', (h) => { return h ? dropStroke : groupStroke; }).ofObject()
         ),
        $(go.Shape,
          {
            minSize: new go.Size(NaN, 100),
            maxSize: new go.Size(NaN, 100)
          },
          new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
        ),
      ));
    palette.model = $(go.GraphLinksModel,
      {
        nodeKeyProperty: 'uuid',
        linkKeyProperty: 'uuid'
      });
    return palette;
  }
  public paletteModelChange = function (changes: go.IncrementalData) {
    this.paletteNodeData = DataSyncService.syncNodeData(changes, this.paletteNodeData);
    this.paletteLinkData = DataSyncService.syncLinkData(changes, this.paletteLinkData);
    this.paletteModelData = DataSyncService.syncModelData(changes, this.paletteModelData);
  };

  constructor(private cdr: ChangeDetectorRef, public http: HttpClient, private dialog: MatDialog) {
    this.getJSON().subscribe(data => {
      // console.log(data.Sheet1.filter);

      this.squarex = data.Sheet1.filter(item => {
        return item.Iteams === 'Square X';
      });
      this.squarey = data.Sheet1.filter(item => {
        return item.Iteams === 'Square Y';
      });
      this.rectanglex = data.Sheet1.filter(item => {
        return item.Iteams === 'Rectagle X';
      });
      this.rectangley = data.Sheet1.filter(item => {
        return item.Iteams === 'Rectagle Y';
      });

    });
  }


  public depthSelection() {
    const dialogRef = this.dialog.open(OuterProfiledialogComponent, {
      data: '',
      width: '70em',
      height: '50em'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.depthOption = result;
      // this.myDiagramComponent.diagram.model.startTransaction('deleted node');
      // this.myDiagramComponent.diagram.model.setDataProperty(node.data, 'selectedOption', result);
      // this.myDiagramComponent.diagram.model.commitTransaction('deleted node');
    });
  }
  public calculate() {
    this.finalTable = [];
    const jsonData = this.myDiagramComponent.diagram.model.nodeDataArray;
    jsonData.forEach(element => {
      if (element.type === 'square') {
        this.finalTable.push(this.square(element));
      } else if (element.type === 'rectangle') {
        this.finalTable.push(this.rectangle(element));
      }
    });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: this.finalTable,
      width: '60em',
      height: '40em'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Table Closed')
    });
  }
  private square(element) {
    const temp = element.size.split(' ');
    temp[0] = Number(temp[0]);
    temp[1] = Number(temp[1]);

    let x = this.squarex.filter(item => {
      return parseInt(item.Size, 0) === (temp[0] / 1);
    });

    let y = this.squarey.filter(item => {
      return parseInt(item.Size, 0) === (temp[1] / 1);
    });
    x = x[0];
    y = y[0];
    const obj = {
      item: element.text,
      x: temp[0] / 1,
      y: temp[1] / 1,
      item1: Number(parseInt(x['Iteam 1'], 0) + parseInt(y['Iteam 1'], 0)),
      item2: Number(parseInt(x['Iteam 2'], 0) + parseInt(y['Iteam 2'], 0)),
      item3: Number(parseInt(x['Iteam 3'], 0) + parseInt(y['Iteam 3'], 0)),
      item4: Number(parseInt(x['Iteam 4'], 0) + parseInt(y['Iteam 4'], 0)),
      item5: Number(parseInt(x['Iteam 5'], 0) + parseInt(y['Iteam 5'], 0)),
    };
    return obj;
  }
  private rectangle(element) {
    const temp = element.size.split(' ');
    temp[0] = parseInt(temp[0], 0);
    temp[1] = parseInt(temp[1], 0);

    let x = this.rectanglex.filter(item => {
      return parseInt(item.Size, 0) === (temp[0] / 1);
    });

    let y = this.rectangley.filter(item => {
      return parseInt(item.Size, 0) === (temp[1] / 1);
    });
    x = x[0];
    y = y[0];
    console.log(x['Iteam 1'] + y['Iteam 1']);
    const obj = {
      item: element.text,
      x: temp[0] / 1,
      y: temp[1] / 1,
      item1: Number(parseInt(x['Iteam 1'], 0) + parseInt(y['Iteam 1'], 0)),
      item2: Number(parseInt(x['Iteam 2'], 0) + parseInt(y['Iteam 2'], 0)),
      item3: Number(parseInt(x['Iteam 3'], 0) + parseInt(y['Iteam 3'], 0)),
      item4: Number(parseInt(x['Iteam 4'], 0) + parseInt(y['Iteam 4'], 0)),
      item5: Number(parseInt(x['Iteam 5'], 0) + parseInt(y['Iteam 5'], 0)),
    };
    return obj;
  }

  public getJSON(): Observable<any> {
    return this.http.get(this._jsonURL);
  }

  // Overview Component testing
  public initOverview(): go.Overview {
    const $ = go.GraphObject.make;
    const overview = $(go.Overview);
    return overview;
  }


  public ngAfterViewInit() {

    if (this.observedDiagram) return;
    this.observedDiagram = this.myDiagramComponent.diagram;
    this.cdr.detectChanges(); // IMPORTANT: without this, Angular will throw ExpressionChangedAfterItHasBeenCheckedError (dev mode only)

    const appComp: SchemaComponent = this;
    // listener for inspector
    this.myDiagramComponent.diagram.addDiagramListener('ChangedSelection', (e) => {
      if (e.diagram.selection.count === 0) {
        appComp.selectedNode = null;
      }
      const node = e.diagram.selection.first();
      if (node instanceof go.Node) {
        appComp.selectedNode = node;
      } else {
        appComp.selectedNode = null;
      }
    });
    this.myDiagramComponent.diagram.addDiagramListener('ExternalObjectsDropped', (e) => {
      e.diagram.nodes.each((n) => {
        n.data.key = undefined;
      });
      const node = e.diagram.selection.first();
      if(!node) { return }
      if (node.data.category === 'outerProfile') {
        if(this.depthOption) {
        
        } else {
          alert('please select depth first');
          this.myDiagramComponent.diagram.remove(node);
          return;
        }
      
      }
    });
    this.myDiagramComponent.diagram.addDiagramListener('ObjectDoubleClicked', (e) => {
      const node = e.diagram.selection.first();
      if (node.data.category === 'outerProfile') {
        const dialogRef = this.dialog.open(OuterProfiledialogComponent, {
          data: node.data,
          width: '70em',
          height: '50em'
        });
        dialogRef.afterClosed().subscribe(result => {
          this.depthOption = result;

          this.myDiagramComponent.diagram.model.startTransaction('deleted node');
          this.myDiagramComponent.diagram.model.setDataProperty(node.data, 'selectedOption', result);
          this.myDiagramComponent.diagram.model.commitTransaction('deleted node');
        });
      }
    });
    this.myDiagramComponent.diagram.addDiagramListener('ObjectSingleClicked', (e) => {
      const node = e.diagram.selection.first();

      if (node.data.category === 'outerProfile') {
     //   this.outerProfileSelectionFlag = node.data;
      } else if(node.data.category === 'door') {
      //  this.doorSelectionFlag = node.data;
      } else { 
      //  this.outerProfileSelectionFlag = null;
      }
    });
  } // end ngAfterViewInit

  outerPanelCalc() {

    const model =  this.myDiagramComponent.diagram.model.nodeDataArray;
  //  console.log(model);
    const outerTable = [];
    model.forEach(element => {
      if(element.category === 'outerProfile') {
        const size = element.size.split(' ');
        const selectedOpt = this.depthOption;
        outerTable.push(
        {name : element.text, componentName: 'Outer Profile', placement: '', width: size[0], height: '', component: '', busbar: '', total: '', qty: 4},
        {name : element.text, componentName: 'Outer Profile', placement: '', width: '', height: size[1], component: '', busbar: '', total: '', qty: 4},
        {name : element.text, componentName: 'Outer Profile - Depth', placement: '', width: '', height: '', component: '', busbar: '', total: selectedOpt.option.total, qty: 4},
        {name : element.text, componentName: 'Plinth Width', placement: '', width: size[0], height: '', component: '', busbar: '', total: '', qty: 2},
        {name : element.text, componentName: 'Plinth Depth', placement: '', width: '', height: '', component: '', busbar: '', total: selectedOpt.option.total, qty: 2},
        { name : element.text,componentName: 'Door', placement: '', width: '', height: '', component: '', busbar: '', total: '', qty: 2},
        {name : element.text, componentName: 'Door', placement: '', width: '', height: '', component: '', busbar: '', total: '', qty: 2},
        {name : element.text, componentName: 'Cover', placement: '', width: '', height: '', component: '', busbar: '', total: '', qty: 2},
        {name : element.text, componentName: 'Cover', placement: '', width: '', height: '', component: '', busbar: '', total: '', qty: 2},
        {name : element.text, componentName: 'Axial Corner Module', placement: '', width: '', height: '', component: '', busbar: '', total: '', qty: 8},
        {name : element.text, componentName: 'Allen Bolts and Nuts(M8*20)', placement: '', width: '', height: '', component: '', busbar: '', total: '', qty: 4},
      );
      } else if(element.category === 'door') {
        const group =  this.myDiagramComponent.diagram.findNodeForKey(element.group);
        const size = element.size.split(' ');
        const selectedOpt = this.depthOption;
        let compoDepth;
        if(selectedOpt){
          compoDepth = selectedOpt.option.depth;
        }
        outerTable.push(
          {name : element.text, componentName: 'Inner Profile L', placement: 'Inner Profile', width: size[0], height: '',component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Inner Profile H', placement: 'Inner Profile', width: size[1], height: '' ,component: '', busbar: '', total: '', qty: 4},
          { name : element.text,componentName: 'Inner Profile D', placement: 'Inner Profile', width: compoDepth, height: '',component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Door', placement: 'Door', width: size[0], height: size[1], component: '', busbar: '', total: '', qty: 1},
          {name : element.text, componentName: 'Sepration Plate Sides', placement: 'Sepration Plate', width: size[1], height: compoDepth, component: '', busbar: '', total: '', qty: 2},
          { name : element.text,componentName: 'Sepration Plate Top Bottom', placement: 'Sepration Plate', width: size[0], height: compoDepth, component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Mounting Plate', placement: 'MOunting Plate', width: compoDepth, height: '', component: '', busbar: '', total: '', qty: 1},
          {name : element.text, componentName: 'Allen Bolts and Nuts(M8*20)', placement: 'Accessories', width: size[0], height: size[0], component: '', busbar: '', total: '', qty: ''},
        );
      } else if(element.category === 'cover') {
        const group =  this.myDiagramComponent.diagram.findNodeForKey(element.group);
        const size = element.size.split(' ');
        const selectedOpt = this.depthOption;
        let compoDepth;
        if(selectedOpt){
          compoDepth = selectedOpt.option.depth;
        }
        outerTable.push(
          {name : element.text, componentName: 'Inner Profile L', placement: 'Inner Profile', width: size[0], height: '',component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Inner Profile H', placement: 'Inner Profile', width: size[1], height: '' ,component: '', busbar: '', total: '', qty: 4},
          {name : element.text, componentName: 'Inner Profile D', placement: 'Inner Profile', width: compoDepth, height: '',component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Cover', placement: 'Cover', width: size[0], height: size[1], component: '', busbar: '', total: '', qty: 1},
          {name : element.text, componentName: 'Allen Bolts and Nuts(M8*20)', placement: 'Accessories', width: size[0], height: size[0], component: '', busbar: '', total: '', qty: ''},
        );
      } else if(element.category === 'cableChamber') {
        const group =  this.myDiagramComponent.diagram.findNodeForKey(element.group);
        const size = element.size.split(' ');
      //  const selectedOpt = group.data.selectedOption;
        const selectedOpt =this.depthOption;
        let compoDepth;
        if(selectedOpt){
          compoDepth = selectedOpt.option.depth;
        }
        outerTable.push(
          {name : element.text, componentName: 'Inner Profile L', placement: 'Inner Profile', width: size[0], height: '',component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Inner Profile H', placement: 'Inner Profile', width: size[1], height: '' ,component: '', busbar: '', total: '', qty: 4},
          {name : element.text, componentName: 'Inner Profile D', placement: 'Inner Profile', width: compoDepth, height: '',component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Cable Chamber', placement: '', width: size[0], height: size[1], component: '', busbar: '', total: '', qty: 1},
          {name : element.text, componentName: 'Sepration Plate Sides', placement: 'Sepration Plate', width: size[1], height: compoDepth, component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Sepration Plate Top Bottom', placement: 'Sepration Plate', width: size[0], height: compoDepth, component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Allen Bolts and Nuts(M8*20)', placement: 'Accessories', width: size[0], height: size[0], component: '', busbar: '', total: '', qty: ''},
        );
      } else if(element.category === 'coverwithlouver') {
        const group =  this.myDiagramComponent.diagram.findNodeForKey(element.group);
        const size = element.size.split(' ');
        const selectedOpt = this.depthOption;
        let compoDepth;
        if(selectedOpt){
          compoDepth = selectedOpt.option.depth;
        }
        outerTable.push(
          {name : element.text, componentName: 'Inner Profile L', placement: 'Inner Profile', width: size[0], height: '',component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Inner Profile H', placement: 'Inner Profile', width: size[1], height: '' ,component: '', busbar: '', total: '', qty: 4},
          {name : element.text, componentName: 'Inner Profile D', placement: 'Inner Profile', width: compoDepth, height: '',component: '', busbar: '', total: '', qty: 2},
          {name :element.text, componentName: 'Cover with Louver', placement: '', width: size[0], height: size[1], component: '', busbar: '', total: '', qty: 1},
          {name : element.text, componentName: 'Sepration Plate Sides', placement: 'Sepration Plate', width: size[1], height: compoDepth, component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Sepration Plate Top Bottom', placement: 'Sepration Plate', width: size[0], height: compoDepth, component: '', busbar: '', total: '', qty: 2},
          {name : element.text, componentName: 'Allen Bolts and Nuts(M8*20)', placement: 'Accessories', width: size[0], height: size[0], component: '', busbar: '', total: '', qty: ''},
        );
      }
    });
  
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {type: 'outerPanel', data: outerTable},
        width: '70em',
        height: '40em'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log('Table Closed')
      });
  }

  save() {
    this.bottomData = this.myDiagramComponent.diagram.model.nodeDataArray;

    const dialogRef = this.dialog.open(JSONDialogComponent, {
      data: this.myDiagramComponent.diagram.model.toJson(),
      width: '50em',
      height: '30em'
    });
    dialogRef.afterClosed().subscribe(result => {
      
    });
  }
  // doorCalc() {
  //   if (this.doorSelectionFlag) {
  //     let outerTable = [];
  //     const group =  this.myDiagramComponent.diagram.findNodeForKey(this.doorSelectionFlag.group);
  //     const size = this.doorSelectionFlag.size.split(' ');
  //     const selectedOpt = group.data.selectedOption;
  //     let compoDepth;
  //     if(selectedOpt){
  //       compoDepth = selectedOpt.option.depth;
  //     }
  //     outerTable.push(
  //       { componentName: 'Inner Profile L', placement: 'Inner Profile', width: size[0], height: '', total: '', qty: 2},
  //       { componentName: 'Inner Profile H', placement: 'Inner Profile', width: size[1], height: '' , total: '', qty: 4},
  //       { componentName: 'Inner Profile D', placement: 'Inner Profile', width: compoDepth, height: '', total: '', qty: 2},
  //       { componentName: 'Door', placement: 'Door', width: size[0], height: size[1], total: '', qty: 1},
  //       { componentName: 'Sepration Plate Sides', placement: 'Sepration Plate', width: size[1], height: compoDepth, total: '', qty: 2},
  //       { componentName: 'Sepration Plate Top Bottom', placement: 'Sepration Plate', width: size[0], height: compoDepth, total: '', qty: 2},
  //       { componentName: 'Mounting Plate', placement: 'MOunting Plate', width: compoDepth, height: '', total: '', qty: 1},
  //       { componentName: 'Allen Bolts and Nuts(M8*20)', placement: 'Accessories', width: size[0], height: size[0], total: '', qty: ''},
  //     );
  //     const dialogRef = this.dialog.open(DialogComponent, {
  //       data: {type: 'door', data: outerTable},
  //       width: '70em',
  //       height: '40em'
  //     });
  //     dialogRef.afterClosed().subscribe(result => {
  //       console.log('Table Closed')
  //     });


  //   } else {
  //     alert('please select outer profile first or select depth options');
  //   }
  // }

  public handleInspectorChange(newNodeData) {
    const uuid = newNodeData.uuid;
    // find the entry in nodeDataArray with this key, replace it with newNodeData
    let index = null;
    for (let i = 0; i < this.diagramNodeData.length; i++) {
      const entry = this.diagramNodeData[i];
      if (entry.uuid && entry.uuid === uuid) {
        index = i;
      }
    }

    if (index >= 0) {
      // here, we set skipsDiagramUpdate to false, since GoJS does not yet have this update
      this.skipsDiagramUpdate = true;
      this.diagramNodeData[index] = _.cloneDeep(newNodeData);
    }
  }


}