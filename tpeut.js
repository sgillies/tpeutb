Ext.BLANK_IMAGE_URL = '../ext-2.3.0/resources/images/default/s.gif';

var layers, map, base, mosaic, panel1, slider;
var mapwin, mapPanel, tree;
var stores = {};
var tree_kids = [];

/* Mapping of SVG files to layers */
var overlayDefs = {
  'Grid': [
    ["Framework", "data/gridlines.svg"],
    ["Labels", "data/gridnumbers.svg"],
  ],
  'Coastline': "data/shoreline.svg",
  'Island numbers': "data/islandnumbers.svg",
  'Lakes': [
    ["Areas", "data/lakesoutline.svg"],
    ["Lake and marsh numbers", "data/lakenumbers.svg"],
  ],
  'Mountains': [
    ["Brown outline", "data/mountainsnofill.svg"],
    ["Brown fill", "data/mountainsbrown.svg"],
    ["Pink fill", "data/mountainspink.svg"],
    ["Red outline", "data/mountainsred.svg"],
    ["Numbers", "data/mountainnumbers.svg"],
  ],
  'Open water, lettering': "data/namesislandswater.svg",
  'Names of Mountains, Peoples, Regions, display capitals': [
    ["Red", "data/namespeoplesregionsmountainsred.svg"],
    ["Black", "data/namespeoplesregionsmountainsblack.svg"],
  ],
  'Rivers': [
    ["River courses", "data/riversoutline.svg"],
    ["Restoration of partial erasures", "data/riverspartiallyerased.svg"],
    ["Supplementary linework", "data/riversdecorative.svg"],
    ["Flow direction arrows", "data/riverflow.svg"],
    ["Numbers", "data/rivernumbers.svg"],
  ],
  'Routes': [
    ["Route linework", "data/routesoutline.svg"],
    ["Conjectural restoration of missing linework", "data/routesrestoriation.svg"],
    ["Stretches with no distance figure", "data/routesnodistance.svg"],
    ["Stretches with no start marked", "data/routesnostart.svg"],
    ["One stretch drawn as two or more", "data/routestwoasone.svg"],
    ["Unnamed route stretches", "data/unnamedroutesoutline.svg"],
    ["Unnamed route stretch numbers", "data/unnamedroutenumbers.svg"],
  ],
  'Symbols': "data/isolatedsymbols.svg",
};

var sectionExtents = [
 [ 1.9616100742, 0.994715347767, 66.7499912997, 47.0484075517 ],
 [ 57.7041853839, 6.61347040305, 131.011253828, 55.7362661311 ],
 [ 118.676763285, 10.4427068151, 190.533810381, 56.1407508851 ],
 [ 184.346833511, 6.78419808073, 249.669907835, 51.8420285676 ],
 [ 241.988230567, 11.2952832607, 313.79756943, 54.7999331448 ],
 [ 305.946452682, 9.79651142635, 368.157354551, 52.3125567349 ],
 [ 359.640618417, 3.56212535966, 434.345857084, 52.5462820168 ],
 [ 421.156822097, 5.17041677675, 489.810854531, 51.7219172788 ],
 [ 479.515500719, 3.04569708603, 550.055437495, 50.0000749226 ],
 [ 540.130878116, 1.53984404883, 616.949211753, 47.8757981465 ],
 [ 607.316815286 -0.283461267647, 680.407124167, 45.8517015016 ]
];

var sectionCenters = [
  [36.6, 24.3],
  [94.6, 28.0],
  [157.3, 29.5],
  [221.0, 29.2],
  [276.8, 28.7],
  [336.4, 28.3],
  [398.7, 25.9],
  [432.1, 24.6],
  [514.1, 23.5],
  [578.1, 21.3],
  [643.4, 18.0]
];

var DPC = 72.0/2.54;
var RES = 1.0/60.3;

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
  e = sectionCenters[parseInt(n)-1];
  center = new OpenLayers.LonLat(e[0], e[1]);
  z = 1;
  map.setCenter(center, z, false, false);
  // map.zoomToExtent(new OpenLayers.Bounds(e[0], e[1], e[2], e[3]));
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
    var e = sectionCenters[3];
    center = new OpenLayers.LonLat(e[0], e[1]);
    z = 1;
  }
  
  map.setCenter(center, z, false, false);
}

function launchViewer(w, h) {

  var resolutions = [8.0*RES, 4.0*RES, 2.0*RES, 1.0*RES, 0.5*RES, 0.25*RES];

  var metadataUrl = "http://dl-img.home.nyu.edu/adore-djatoka/resolver?url_ver=Z39.88-2004&rft_id=http://pipsqueak.atlantides.org/tpeutv/mos-all-geo-20100712.tif&svc_id=info:lanl-repo/svc/getMetadata";

  var mosaic = new OpenLayers.Layer.OpenURL('All section, mosaicked',
    "http://dl-img.home.nyu.edu/", 
    { layername: 'basic', 
      format: 'image/jpeg', 
      rft_id: 'http://pipsqueak.atlantides.org/tpeutb/mos-all-geo.tif',
      imgMetadata: {
        identifier: "http://pipsqueak.atlantides.org/tpeutb/mos-all-geo.tif",
        imagefile: "/data/djatoka-cache/jp2/mos-all-geo.jp2",
        width: 43008, 
        height: 3072, 
        dwtLevels: 5, 
        levels: 5, 
        compositingLayerCount: 1 
        },
      // Fudge the extents slightly so we don't incur extra rows and columns of
      // tiles. TODO: actually solve the problem.
      maxExtent: new OpenLayers.Bounds(-16.6222, -1.2174, 696.612-4.0/3072, 49.7279-1.0/3072),
      units: 'cm',
      tileSize: new OpenLayers.Size(192, 192),
      metadataUrl: metadataUrl,
      isBaseLayer: false }
    );
        
  var maxExtent = new OpenLayers.Bounds(0.0, 0.0, 681.13281, 60.163372);
  // var maxExtent = new OpenLayers.Bounds(-16.6222, -1.2174, 696.612, 49.728);
  var options = {
    resolutions: resolutions,
    units: 'cm'
    };

  map = new OpenLayers.Map('map', options);
  map.tileSize = mosaic.tileSize;

  base = new OpenLayers.Layer.Image(
  	                  'None',
  	                  'data/base-transparent.png',
  	                  new OpenLayers.Bounds(0.0, 0.0, 681.13281, 60.163372),
  	                  new OpenLayers.Size(8, 8),
  	                  {isBaseLayer: true,
                       resolutions: resolutions,
                       units: 'cm'}
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
  stores[n] = new GeoExt.data.LayerStore({layers: layers.slice(1, 2)});
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

function loaded() {
    if (document.baseURI.indexOf('/#') > 0) {
        launchViewer(800, 600);
    }
};
