/* Copyright (c) UNC Chapel Hill University Library, created by Hugh A. Cayless
 * and revised by J. Clifford Dyer.  Published under the Clear BSD licence.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full 
 * text of the license. 
 */


/**
 * @requires OpenLayers/Layer/Grid.js
 * @requires OpenLayers/Tile/Image.js
 */

/**
 * Class: OpenLayers.Layer.OpenURL
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
OpenLayers.Layer.OpenURL = OpenLayers.Class(OpenLayers.Layer.Grid, {

    /**
     * APIProperty: isBaseLayer
     * {Boolean}
     */
    isBaseLayer: true,

    /**
     * APIProperty: tileOrigin
     * {<OpenLayers.Pixel>}
     */
    tileOrigin: null,
    
    url_ver: 'Z39.88-2004',
    rft_id: null,
    svc_id: "info:lanl-repo/svc/getRegion",
    svc_val_fmt: "info:ofi/fmt:kev:mtx:jpeg2000",
    format: null,
    tileHeight: null,

    /**
     * Constructor: OpenLayers.Layer.OpenURL
     * 
     * Parameters:
     * name - {String}
     * url - {String}
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, options) {
        var newArguments = [];
        newArguments.push(name, url, {}, options);
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
        this.rft_id = options.rft_id;
        this.format = options.format;
        // Get image metadata if it hasn't been set
        if (!options.imgMetadata) {
          var request = OpenLayers.Request.issue({url: options.metadataUrl, async: false});
          this.imgMetadata = eval('(' + request.responseText + ')');
        } else {
          this.imgMetadata = options.imgMetadata;
        }

        var bbox = this.maxExtent;
        this.mw = bbox.right - bbox.left;
        this.mh = bbox.top - bbox.bottom;

        this.requestBase = OpenLayers.Layer.OpenURL.djatokaURL 
          + "?url_ver=" + this.url_ver 
          + "&rft_id=" + this.rft_id 
          + "&svc_id=" + this.svc_id 
          + "&svc_val_fmt=" + this.svc_val_fmt 
          + "&svc.format=" + this.format
          + "&svc.rotate=0";
    },    

    /**
     * APIMethod: clone
     * 
     * Parameters:
     * obj - {Object}
     * 
     * Returns:
     * {<OpenLayers.Layer.OpenURL>} An exact clone of this <OpenLayers.Layer.OpenURL>
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.OpenURL(this.name,
                                           this.url,
                                           this.options);
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },    
    
    /**
     * Method: getURL
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * 
     * Returns:
     * {String} A string with the layer's url and parameters and also the 
     *          passed-in bounds and appropriate tile size specified as 
     *          parameters
     * 
     * Djatoka has no geo-referencing, so the conversion from map to image
     * coordinates must be done here.
     */
    getURL: function (bounds) {  
        var bbox = this.maxExtent;
        var xoff = (bounds.left - bbox.left)/this.mw;
        var yoff = (bbox.top - bounds.top)/this.mh;
        var r = this.resolutions[this.map.zoom];
        var h = Math.round(192.0*r*60.3);
        yoff = Math.round(yoff*3072.0)/3072.0;
        xoff = Math.round(xoff*3072.0)/3072.0;
        return this.url + this.requestBase
          + "&svc.region=" + yoff.toFixed(12) + "," + xoff.toFixed(12) 
          + "," +  h + "," + h
          + "&svc.scale=192,192";
    },

    /**
     * Method: addTile
     * addTile creates a tile, initializes it, and adds it to the layer div. 
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * position - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {<OpenLayers.Tile.Image>} The added OpenLayers.Tile.Image
     */
    addTile:function(bounds, position) {
        var url = this.getURL(bounds);
        return new OpenLayers.Tile.Image(this, position, bounds, 
                                             url, this.tileSize);
    },

    CLASS_NAME: "OpenLayers.Layer.OpenURL"
});

OpenLayers.Layer.OpenURL.djatokaURL = 'adore-djatoka/resolver';
