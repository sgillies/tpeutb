Ext.BLANK_IMAGE_URL = '../ext-2.3.0/resources/images/default/s.gif';

var layers, map, base, background, s1, s2, panel1, slider;
var overlays = [
  ["Lines", "data/all-gridlines.svg"],
  ["Labels", "data/all-gridnumbers.svg"],
  ["Lines", "data/all-shoreline.svg"],
  ["Numbers", "data/all-islandnumbers.svg"],
  ["Areas", "data/all-lakesoutline.svg"],
  ["Numbers", "data/all-lakenumbers.svg"],
  ["Lines", "data/all-mountainsnofill.svg"],  // Mountains
  ["Numbers", "data/all-mountainnumbers.svg"],
  ["Brown", "data/all-mountainsbrown.svg"], // Mountains
  ["Pink", "data/all-mountainspink.svg"],
  ["Red", "data/all-mountainsred.svg"],
  ["Names", "data/all-namesislandswater.svg"], // Open Water
  ["Red", "data/all-namespeoplesregionsmountainsred.svg"], // Peoples, Regions
  ["Black", "data/all-namespeoplesregionsmountainsblack.svg"],
  ["Lines", "data/all-riversoutline.svg"],
  ["Decorative", "data/all-riversdecorative.svg"],
  ["Partially erased", "data/all-riverspartiallyerased.svg"],
  ["Flow", "data/all-riverflow.svg"],
  ["Numbers", "data/all-rivernumbers.svg"], // Rivers
  ["Lines", "data/all-routesoutline.svg"],
  ["Restored lines", "data/all-routesrestoriation.svg"], // Routes
  ["No distance", "data/all-routesnodistance.svg"],
  ["No start marked", "data/all-routesnostart.svg"],
  ["Double stretches", "data/all-routestwoasone.svg"], // Other routes
  ["Lines", "data/all-unnamedroutesoutline.svg"],
  ["Numbers", "data/all-unnamedroutenumbers.svg"], // Unnamed routes
  ["Numbers", "data/all-isolatedsymbols.svg"], // Isolated symbols
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

function initView(map) {
  var xy, center, z;
  var params = OpenLayers.Util.getParameters();
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

Ext.onReady(function() {

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

  var mountainsastore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+6, k+8)
    });

  var mountainsbstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+8, k+11)
    });

  var openwaterstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+11, k+12)
    });

  var peoplesregionsstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+12, k+14)
    });
  
  var riversastore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+14, k+16)
    });
  
  var riversbstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+16, k+17)
    });
  
  var riverscstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+17, k+19)
    });
  
  var routesastore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+19, k+21)
    });
  
  var routesbstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+21, k+24)
    });
  
  var unnamedroutesstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+24, k+26)
    });
  
  var isolatedsymbolsstore = new GeoExt.data.LayerStore({
    layers: map.layers.slice(k+26, k+27)
    });
  
  // create a map panel with an embedded slider
  panel1 = new GeoExt.MapPanel({
    header: false,
    renderTo: "map",
    height: 545,
    width: 770,
    map: map,
  });
  
  backgroundSlider = new GeoExt.TPeutOverlayOpacitySlider({
      layers: map.layers.slice(1, k),
      aggressive: true, 
      width: 175,
      isFormField: true,
      fieldLabel: "imagery-opacity",
      renderTo: "imagery-slider"
  });

  // create a separate slider bound to the map but displayed elsewhere
  overlaySlider = new GeoExt.TPeutOverlayOpacitySlider({
      layers: map.layers.slice(k),
      aggressive: true, 
      width: 175,
      isFormField: true,
      fieldLabel: "overlay-opacity",
      renderTo: "overlay-slider"
  });

  var tree = new Ext.tree.TreePanel({
    width: 180,
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
                text: "Isolated symbols",
                nodeType: "gx_layercontainer",
                layerStore: isolatedsymbolsstore,
                }, 
              { // unnamed routes
                text: "Unnamed routes",
                nodeType: "gx_layercontainer",
                layerStore: unnamedroutesstore,
                }, 
              { // routes b
                text: "Routes (b)",
                nodeType: "gx_layercontainer",
                layerStore: routesbstore,
                }, 
              { // routes a
                text: "Routes (a)",
                nodeType: "gx_layercontainer",
                layerStore: routesastore,
                }, 
              { // rivers c
                text: "Rivers (c)",
                nodeType: "gx_layercontainer",
                layerStore: riverscstore,
                }, 
              { // rivers b
                text: "Rivers (b)",
                nodeType: "gx_layercontainer",
                layerStore: riversbstore,
                }, 
              { // rivers a
                text: "Rivers (a)",
                nodeType: "gx_layercontainer",
                layerStore: riversastore,
                }, 
              { // peoples, regions
                text: "Peoples, regions",
                nodeType: "gx_layercontainer",
                layerStore: peoplesregionsstore,
                },
              { // water
                text: "Open water",
                nodeType: "gx_layercontainer",
                layerStore: openwaterstore,
                },
              { // mountains b
                text: "Mountains (b)",
                nodeType: "gx_layercontainer",
                layerStore: mountainsbstore,
                },
              { // mountains a
                text: "Mountains (a)",
                nodeType: "gx_layercontainer",
                layerStore: mountainsastore,
                },

              { // lakes
                text: "Lakes",
                nodeType: "gx_layercontainer",
                layerStore: lakesstore,
                },
              { // islands
                text: "Islands",
                nodeType: "gx_layercontainer",
                layerStore: islandsstore,
                }, 
              { // coast
                text: "Coast",
                nodeType: "gx_layercontainer",
                layerStore: coaststore,
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
  initView(map);

});

