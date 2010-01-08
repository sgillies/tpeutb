var map;
var background;
var overlays = [
  ["Mountains (red)", "data/all-mountainsred.svg"],
  ["Mountains (pink)", "data/all-mountainspink.svg"],
  ["Mountains (brown)", "data/all-mountainsbrown.svg"],
  ["Mountains (no fill)", "data/all-mountainsnofill.svg"],
  ["Shoreline", "data/all-shoreline.svg"],
  ["Lakes (outline)", "data/all-lakesoutline.svg"],
  ["Rivers (decorative)", "data/all-riversdecorative.svg"],
  ["Rivers (partially erased)", "data/all-riverspartiallyerased.svg"],
  ["Rivers (outline)", "data/all-riversoutline.svg"],
  ["Names (red)", "data/all-namespeoplesregionsmountainsred.svg"],
  ["Names (black)", "data/all-namespeoplesregionsmountainsblack.svg"],
  ["Names (islands, water)", "data/all-namesislandswater.svg"],
  ["Unnamed Routes (outline)", "data/all-unnamedroutesoutline.svg"],
  ["Routes (restoration)", "data/all-routesrestoriation.svg"],
  ["Routes (no distance)", "data/all-routesnodistance.svg"],
  ["Routes (two as one)", "data/all-routestwoasone.svg"],
  ["Routes (no start)", "data/all-routesnostart.svg"],
  ["Routes (outline)", "data/all-routesoutline.svg"],
  ["River (numbers)", "data/all-rivernumbers.svg"],
  ["River (flow)", "data/all-riverflow.svg"],
  ["Isolated symbols", "data/all-isolatedsymbols.svg"],
  ["Island numbers", "data/all-islandnumbers.svg"],
  ["Mountain numbers", "data/all-mountainnumbers.svg"],
  ["Lake numbers", "data/all-lakenumbers.svg"],
  ["Unnamed route numbers", "data/all-unnamedroutenumbers.svg"],
  ["Grid lines", "data/all-gridlines.svg"]
  ];
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
var layers = [];

function makeOverlayLayer(title, url) {
  return new OpenLayers.Layer.SVG(
                title, { 
                visibility: false,
                alwaysInRange: true,
                strategies: [new OpenLayers.Strategy.SVG()],                
                protocol: new OpenLayers.Protocol.SVG({
                    url: url,
                }),
            });
}

function initTPeut() {
  map = new OpenLayers.Map('map', {
              units: 'cm',
              maxExtent: new OpenLayers.Bounds(0.0, 0.0, 680.7, 60.2)
              });
   
  background = new OpenLayers.Layer.Image(
                    'Demo Background',
                    'demo-background.jpg',
                    new OpenLayers.Bounds(0.0, 0.0, 680.7, 60.2),
                    new OpenLayers.Size(5431, 480),
                    { isBaseLayer: true, visibility: true }
                    );
  layers.push(background);

  for (i=0; i<overlays.length; i++) {
    layers.push(makeOverlayLayer(overlays[i][0], overlays[i][1]));
  }
   
  map.addLayers(layers);
  map.addControl(new OpenLayers.Control.LayerSwitcher());
  map.addControl(new OpenLayers.Control.Permalink('permalink'));
  map.addControl(new OpenLayers.Control.MousePosition());
  map.addControl(new OpenLayers.Control.Scale());
  if (!map.getCenter()) {
    moveToSection('4');
    $("#field-section option:nth-child(4)").attr('selected', true);
  }
}

function moveToSection(n) {
  e = sectionExtents[parseInt(n)-1];
  map.zoomToExtent(new OpenLayers.Bounds(
                          e[0], 
                          map.maxExtent.top - e[3] - e[1],
                          e[0] + e[2],
                          map.maxExtent.top - e[1]
                          ));
}

