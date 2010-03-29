Ext.BLANK_IMAGE_URL = '../ext-2.3.0/resources/images/default/s.gif';

var params;
var layers, map, base, background, s1, s2, panel1, slider;
var mapwin = null;
var mapPanel = null;
var tree = null;

var overlays = [
  ["Framework", "data/all-gridlines.svg"],
  ["Labels", "data/all-gridnumbers.svg"],

  ["Coastline", "data/all-shoreline.svg"],

  ["Island numbers", "data/all-islandnumbers.svg"],

  ["Areas", "data/all-lakesoutline.svg"],
  ["Lake and marsh numbers", "data/all-lakenumbers.svg"],

  ["Brown outline", "data/all-mountainsnofill.svg"],  // Mountains
  ["Brown fill", "data/all-mountainsbrown.svg"], // Mountains
  ["Pink fill", "data/all-mountainspink.svg"],
  ["Red red", "data/all-mountainsred.svg"],
  ["Numbers", "data/all-mountainnumbers.svg"],

  ["Names", "data/all-namesislandswater.svg"], // Open Water

  ["Red", "data/all-namespeoplesregionsmountainsred.svg"], // Peoples, Regions
  ["Black", "data/all-namespeoplesregionsmountainsblack.svg"],
  
  ["River courses", "data/all-riversoutline.svg"],
  ["Restoration of partial erasures", "data/all-riverspartiallyerased.svg"],
  ["Supplementary linework", "data/all-riversdecorative.svg"],
  ["Flow direction arrows", "data/all-riverflow.svg"],
  ["Numbers", "data/all-rivernumbers.svg"], // Rivers
  
  ["Route linework", "data/all-routesoutline.svg"],
  ["Conjectural restoration of missing linework", "data/all-routesrestoriation.svg"], // Routes
  ["Stretches with no distance figure", "data/all-routesnodistance.svg"],
  ["Stretches with no start marked", "data/all-routesnostart.svg"],
  ["One stretch drawn as two or more", "data/all-routestwoasone.svg"], // Other routes
  ["Unnamed route stretches", "data/all-unnamedroutesoutline.svg"],
  ["Unnamed route stretch numbers", "data/all-unnamedroutenumbers.svg"], // Unnamed routes

  ["Numbers of isolated unnamed symbols", "data/all-isolatedsymbols.svg"], // Isolated symbols
  ];

function makeOverlayLayer(title, url) {
  return new OpenLayers.Layer.SVG(
                title, { 
                visibility: false,
                alwaysInRange: true,
                displayInLayerSwitcher: true,
                strategies: [new OpenLayers.Strategy.SVG()],                
                protocol: new OpenLayers.Protocol.SVG({
                    url: url,
                }),
            });
}

var sectionExtents = [
  [0.0, 4.533, 65.985, 50.336],
  [57.184, 2.693, 71.937, 54.486],
  [118.822, 1.686, 73.293, 56.122],
  [182.756, 2.850, 69.078, 52.894],
  [241.903, 2.099, 72.149, 53.967],
  [303.746, 3.205, 66.655, 51.039],
  [360.651, 0.735, 73.208, 55.329],
  [422.035, 3.285, 68.692, 52.137],
  [480.551, 2.990, 69.169, 52.964],
  [540.065, 0.0, 78.571, 60.163],
  [607.130, 1.358, 73.571, 56.335]
];

function moveToSection(map, n) {
  e = sectionExtents[parseInt(n)-1];
  map.zoomToExtent(new OpenLayers.Bounds(
                          e[0], 
                          map.maxExtent.top - e[3] - e[1],
                          e[0] + e[2],
                          map.maxExtent.top - e[1]
                          ));
}

function parseViewParams() {
  params = OpenLayers.Util.getParameters();
}

function initView(map, params) {
  var xy, center, z;
  if (params.z && params.l && params.xy) {
    // layers
    if (params.l.length == map.layers.length) { 
      // this.map.events.unregister('addlayer', this, this.configureLayers);
      for(var i=0, len=params.l.length; i<len; i++) {
        var layer = map.layers[i];
        var c = params.l.charAt(i);
        if (c == "B") {
          map.setBaseLayer(layer);
        } else if ( (c == "T") || (c == "F") ) {
          layer.setVisibility(c == "T");
        }
      }
    }
    if (typeof params.xy == 'object' && params.xy.constructor == Array) {
      xy = params.xy;
    }
    else {
      xy = params.xy.split(',');
    }
    center = new OpenLayers.LonLat(parseFloat(xy[0]), parseFloat(xy[1]));
    z = parseInt(params.z);
  }
  else {
    var e = sectionExtents[3];
    center = new OpenLayers.LonLat(e[0]+e[2]/2.0, e[1]+e[3]/2.0);
    z = 6;
  }
  
  map.setCenter(center, z, false, false);
}

/*Ext.onReady(function() {*/

function launchViewer(w, h) {
  map = new OpenLayers.Map('map', {
              units: 'cm',
              maxExtent: new OpenLayers.Bounds(0.0, 0.0, 681.133, 60.163)
              });
  
  base = new OpenLayers.Layer.Image(
  	                  'None',
  	                  'data/base-transparent.png',
  	                  new OpenLayers.Bounds(0.0, 0.0, 681.133, 60.163),
  	                  new OpenLayers.Size(8, 8),
  	                  {isBaseLayer: true}
                    );
  
  background = new OpenLayers.Layer.Image(
                    'All, 50% opacity',
                    'data/all-half-opacity.jpg',
                    new OpenLayers.Bounds(0.0, 0.0, 681.133, 60.163),
                    new OpenLayers.Size(5434, 480),
  	                  {isBaseLayer: false, alwaysInRange: true, visibility: true}
                    );

  s1 = new OpenLayers.Layer.Image(
                    'Section 1',
                    'data/section-01.jpg',
                    new OpenLayers.Bounds(1.593, 8.052, 64.50, 51.401),
                    new OpenLayers.Size(2099, 1445),
  	                  {isBaseLayer: false, alwaysInRange: true, visibility: false}
                    );

  s2 = new OpenLayers.Layer.Image(
                    'Section 2',
                    'data/section-02.jpg',
                    new OpenLayers.Bounds(57.981, 11.242, 129.006, 56.557),
                    new OpenLayers.Size(2368, 1510),
  	                  {isBaseLayer: false, alwaysInRange: true, visibility: false}
                    );

  layers = [base, background, s2, s1];
  for (i=0; i<overlays.length; i++) {
    layers.push(makeOverlayLayer(overlays[i][0], overlays[i][1]));
  }
  
  map.addLayers(layers);
  map.addControl(new OpenLayers.Control.ArgParser());
  map.addControl(new OpenLayers.Control.TPeutPermalink('permalink'));
  map.addControl(new OpenLayers.Control.MousePosition());
  map.addControl(new OpenLayers.Control.Scale());

  // Empty rendered-to elements
  $('#tree-div').empty();
  $('#imagery-slider').empty();
  $('#overlay-slider').empty();

  // create Ext window including a map panel
  mapwin = new Ext.Window({
        layout: "border",
        resizable: true,
        maximizable: true,
        constrain: true,
        closeAction: 'hide',
        title: "Map Viewer",
        width: w,
        height: h,
        x: (document.width-w)/2,
        y: (document.height-h)/2,
        items: [
            { collapsible: true,
              // collapsed: true,
              title: 'Options',
              region:'west',
              contentEl: 'map-contents',
              width: 320,
              }, 
            {
              xtype: "gx_mappanel",
              region: "center",
              map: map
            }
        ]
    });
    mapwin.show();

  mapPanel = mapwin.items.get(1);

  var k = 4; // first overlay index
  
  var mapstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(1, k)
    });

  var gridstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k, k+2)
    });
  
  var coaststore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+2, k+3)
    });

  var islandsstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+3, k+4)
    });

  var lakesstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+4, k+6)
    });

  var mountainstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+6, k+11)
    });

  var openwaterstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+11, k+12)
    });

  var peoplesregionsstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+12, k+14)
    });
  
  var riverstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+14, k+19)
    });
  
  var routestore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+19, k+26)
    });
  
  var isolatedsymbolsstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+26, k+27)
    });
  
  backgroundSlider = new GeoExt.TPeutOverlayOpacitySlider({
      layers: map.layers.slice(1, k),
      aggressive: true, 
      width: 280,
      minValue: 0,
      maxValue: 100,
      increment: 10,
      value: 100,
      fieldLabel: "imagery-opacity",
      renderTo: "imagery-slider"
  });

  // create a separate slider bound to the map but displayed elsewhere
  overlaySlider = new GeoExt.TPeutOverlayOpacitySlider({
      layers: map.layers.slice(k),
      aggressive: true, 
      width: 280,
      minValue: 0,
      maxValue: 100,
      increment: 10,
      value: 100,
      fieldLabel: "overlay-opacity",
      renderTo: "overlay-slider"
  });

  tree = new Ext.tree.TreePanel({
    width: 320,
    height: 375,
    renderTo: "tree-div",
    autoScroll:true,
    animate:true,
    enableDD:true,
    containerScroll: true,
    rootVisible: true,
    frame: false,
    loader: new Ext.tree.TreeLoader({
      // applyLoader has to be set to false to not interfer with loaders
      // of nodes further down the tree hierarchy
      applyLoader: false,
      }),
    root: new GeoExt.tree.LayerNode({
            expanded: true,
            children: [
              { // isolated symbols
                text: "Symbols",
                nodeType: "gx_layer",
                layer: map.layers[30],
                }, 
              { // routes
                text: "Routes",
                nodeType: "gx_layercontainer",
                layerStore: routestore,
                }, 
              { // rivers
                text: "Rivers",
                nodeType: "gx_layercontainer",
                layerStore: riverstore,
                }, 
              { // peoples, regions
                text: "Names of Mountains, Peoples, Regions, display capitals",
                nodeType: "gx_layercontainer",
                layerStore: peoplesregionsstore,
                },
              { // water
                text: "Open water, lettering",
                nodeType: "gx_layer",
                layer: map.layers[15],
                },
              { // mountains
                text: "Mountains",
                nodeType: "gx_layercontainer",
                layerStore: mountainstore,
                },
              { // lakes
                text: "Lakes",
                nodeType: "gx_layercontainer",
                layerStore: lakesstore,
                },
              { // islands
                text: "Island numbers",
                nodeType: "gx_layer",
                layer: map.layers[7],
                }, 
              { // coast
                text: "Coastline",
                nodeType: "gx_layer",
                layer: map.layers[6],
                }, 
              { // grid
                text: "Grid",
                nodeType: "gx_layercontainer",
                layerStore: gridstore,
                }, 
              { // map
                text: "Map",
                nodeType: "gx_layercontainer",
                layerStore: mapstore,
                } 
              ]
            }),
    listeners: {
      "radiochange": function(node){
        alert(node.layer.name + " is now the the active layer.");
        }
      },
    rootVisible: false,
    lines: false
    });

  // initialize map view
  initView(map, params);

};
