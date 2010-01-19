/**
 * @requires OpenLayers/Control/Permalink.js
 */

/**
 * Class: OpenLayers.Control.TPeutPermalink
 * The Permalink control is hyperlink that will return the user to the 
 * current map view. By default it is drawn in the lower right corner of the
 * map. The href is updated as the map is zoomed, panned and whilst layers
 * are switched.
 * `
 * Inherits from:
 *  - <OpenLayers.Control.Permalink>
 */
OpenLayers.Control.TPeutPermalink = OpenLayers.Class(OpenLayers.Control.Permalink, {
    
    /**
     * APIMethod: createParams
     * Creates the parameters that need to be encoded into the permalink url.
     * 
     * Parameters:
     * center - {<OpenLayers.LonLat>} center to encode in the permalink.
     *     Defaults to the current map center.
     * zoom - {Integer} zoom level to encode in the permalink. Defaults to the
     *     current map zoom level.
     * layers - {Array(<OpenLayers.Layer>)} layers to encode in the permalink.
     *     Defaults to the current map layers.
     * 
     * Returns:
     * {Object} Hash of parameters that will be url-encoded into the
     * permalink.
     */
    createParams: function(center, zoom, layers) {
        center = center || this.map.getCenter();
          
        var params = OpenLayers.Util.getParameters(this.base);
        
        // If there's still no center, map is not initialized yet. 
        // Break out of this function, and simply return the params from the
        // base link.
        if (center) { 

            //zoom
            params.z = zoom || this.map.getZoom(); 

            //lon,lat
            var lat = center.lat;
            var lon = center.lon;
                
            params.xy = Math.round(lon*100000)/100000 + ',' + Math.round(lat*100000)/100000;
            //layers        
            layers = layers || this.map.layers;  
            params.l = '';
            for (var i=0, len=layers.length; i<len; i++) {
                var layer = layers[i];
    
                if (layer.isBaseLayer) {
                    params.l += (layer == this.map.baseLayer) ? "B" : "0";
                } else {
                    params.l += (layer.getVisibility()) ? "T" : "F";           
                }
            }
        }

        return params;
    }, 

    CLASS_NAME: "OpenLayers.Control.TPeutPermalink"
});

