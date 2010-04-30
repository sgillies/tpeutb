Ext.BLANK_IMAGE_URL = '../ext-2.3.0/resources/images/default/s.gif';

var layers, map, base, mosaic, s1, s2, panel1, slider;
var mapwin, mapPanel, tree;
var stores = {};
var tree_kids = [];

/* Mapping of SVG files to layers */
var overlayDefs = {
  'Grid': [
    ["Framework", "data/all-gridlines.svg"],
    ["Labels", "data/all-gridnumbers.svg"],
  ],
  'Coastline': "data/all-shoreline.svg",
  'Island numbers': "data/all-islandnumbers.svg",
  'Lakes': [
    ["Areas", "data/all-lakesoutline.svg"],
    ["Lake and marsh numbers", "data/all-lakenumbers.svg"],
  ],
  'Mountains': [
    ["Brown outline", "data/all-mountainsnofill.svg"],
    ["Brown fill", "data/all-mountainsbrown.svg"],
    ["Pink fill", "data/all-mountainspink.svg"],
    ["Red outline", "data/all-mountainsred.svg"],
    ["Numbers", "data/all-mountainnumbers.svg"],
  ],
  'Open water, lettering': "data/all-namesislandswater.svg",
  'Names of Mountains, Peoples, Regions, display capitals': [
    ["Red", "data/all-namespeoplesregionsmountainsred.svg"],
    ["Black", "data/all-namespeoplesregionsmountainsblack.svg"],
  ],
  'Rivers': [
    ["River courses", "data/all-riversoutline.svg"],
    ["Restoration of partial erasures", "data/all-riverspartiallyerased.svg"],
    ["Supplementary linework", "data/all-riversdecorative.svg"],
    ["Flow direction arrows", "data/all-riverflow.svg"],
    ["Numbers", "data/all-rivernumbers.svg"],
  ],
  'Routes': [
    ["Route linework", "data/all-routesoutline.svg"],
    ["Conjectural restoration of missing linework", "data/all-routesrestoriation.svg"],
    ["Stretches with no distance figure", "data/all-routesnodistance.svg"],
    ["Stretches with no start marked", "data/all-routesnostart.svg"],
    ["One stretch drawn as two or more", "data/all-routestwoasone.svg"],
    ["Unnamed route stretches", "data/all-unnamedroutesoutline.svg"],
    ["Unnamed route stretch numbers", "data/all-unnamedroutenumbers.svg"],
  ],
  'Symbols': "data/all-isolatedsymbols.svg",
};

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
  var params = {};
  try {
    var items = document.baseURI.split('?')[1].split('&');
    for (var j=0, len = items.length; j<len; j++) {
      var item = items[j].split('=');
      params[item[0]] = item[1];
    }
  }
  catch(e) {
    // pass
  }
  if (params.l) {
    // layers
    if (params.l.length == map.layers.length) { 
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
  }
  if (params.z && params.xy) {
    if (typeof params.xy == 'object' && params.xy.constructor == Array) {
      xy = params.xy;
    }
    else {
      xy = params.xy.split('%2C');
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
  
  mosaic = new OpenLayers.Layer.Image(
                    'All section, mosaicked',
                    'data/sections-mosaic-low.jpg',
                    new OpenLayers.Bounds(1.0, 6.0, 681.0, 57.0),
                    new OpenLayers.Size(10880, 816),
  	                  {isBaseLayer: false, alwaysInRange: true, visibility: true}
                    );

  layers = [base, mosaic];

  /* Build various GeoExt objects from the layer definitions at the top of
     this file
  */
  tree_kids = [];
  stores = {};

  for (var name in overlayDefs) {
    if (overlayDefs.hasOwnProperty(name)) {
      entry = overlayDefs[name];
      if (typeof(entry) == "string") {
        var layer = makeOverlayLayer(name, entry);
        layers.push(layer);
        stores[name] = new GeoExt.data.LayerStore({layers: [layer]});
        tree_kids.push({text: name, nodeType: 'gx_layer', layer: layer});
      }
      else {
        var group = [];
        for (i=0; i<entry.length; i++) {
          var layer = makeOverlayLayer(entry[i][0], entry[i][1]);
          layers.push(layer);
          group.push(layer);
        }
        stores[name] = new GeoExt.data.LayerStore({layers: group});
        tree_kids.push({text: name, nodeType: 'gx_layercontainer', layerStore: stores[name]});
      }
    }
  }

  /* Now GeoExt objects for the non-overlay layers */
  var n = 'Maps'
  stores[n] = new GeoExt.data.LayerStore({layers: layers.slice(1, 4)});
  tree_kids.push({text: n, nodeType: 'gx_layercontainer', layerStore: stores[n]});

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
        y: $('#bd').offset().top,
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

  backgroundSlider = new GeoExt.TPeutOverlayOpacitySlider({
      layers: map.layers.slice(1, 4),
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
      layers: map.layers.slice(4),
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
      applyLoader: false,
      }),
    root: new GeoExt.tree.LayerNode({
            expanded: true,
            children: tree_kids, 
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

};
