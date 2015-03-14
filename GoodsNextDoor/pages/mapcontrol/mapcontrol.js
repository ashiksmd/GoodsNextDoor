// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

(function () {
    "use strict";

    var mapControl = null;
    //var infoBox;
    var pinLayer = new Microsoft.Maps.EntityCollection();
    var mapReady = false;

    function displayInfoBox(e) {
        var row = e.target.row;
        document.getElementById("info-title").innerText = row.title;
        document.getElementById("info-desc").innerText = row.description;
        document.getElementById("info-contact").innerText = row.contact;

        document.getElementById("info-box").className = "overlay";
        DBAccess.row = row;
        //infoBox.setOptions({ title: e.target.Title, description: e.target.Description, visible: true, offset: new Microsoft.Maps.Point(0, 25) });
        //infoBox.setLocation(e.target.getLocation());        
    }

    var pinLocations = {};
    function pinOccupied(lat, long) {
        var index = lat + "," + long;
        return pinLocations[index];
    }
    
    function addNewPin(lat, long) {
        var index = lat + "," + long;
        pinLocations[index] = true;
        return new Microsoft.Maps.Location(lat, long);
    }

    function getPinLocation(lat, long, round) {
        round = round || 1;
        
        var off = 0.0001 * round;

        if (pinOccupied(lat, long)) {
            if (!pinOccupied(lat, long - off)) return addNewPin(lat, long - off);
            if (!pinOccupied(lat, long + off)) return addNewPin(lat, long + off);

            if (!pinOccupied(lat - off, long)) return addNewPin(lat - off, long);
            if (!pinOccupied(lat - off, long - off)) return addNewPin(lat - off, long - off);
            if (!pinOccupied(lat - off, long + off)) return addNewPin(lat - off, long + off);

            if (!pinOccupied(lat + off, long)) return addNewPin(lat + off, long);
            if (!pinOccupied(lat + off, long - off)) return addNewPin(lat + off, long - off);
            if (!pinOccupied(lat + off, long + off)) return addNewPin(lat + off, long + off);
            
            return getPinLocation(lat, long, round + 1);
        }

        return addNewPin(lat, long);
    }

    function deleteMap() {
        if (mapControl) {
            try {
                mapControl.dispose();
            } catch (e) { };
        }

        mapControl = null;
    }

    WinJS.UI.Pages.define("/pages/mapcontrol/mapcontrol.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            //console.log("ready");
            hideLoader();
            hideAppBar();
            if (!mapReady) {
                //console.log("Loading map module");
                Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: this.initMap, culture: "en-us", homeRegion: "US" });
            }
            else {
                //console.log("Reuse map module");
                this.initMap();
            }

            element.querySelector("#snapToCurrent").addEventListener("click", function () {
                getLoc(function (location) {
                    mapControl.setView({ center: new Microsoft.Maps.Location(location.latitude, location.longitude) });
                });
                
            });

            element.querySelector("#info-box .close-icon").addEventListener("click", function () {
                document.getElementById("info-box").className = "hidden overlay";
            });
        },

        initMap: function () {
            mapReady = true;
            getLoc(function (location) {

                pinLocations = {};
                pinLayer.clear();

                var loc = getPinLocation(location.latitude, location.longitude);
                var mapOptions =
                {
                    center: DBAccess.mapCenter || loc,
                    zoom: DBAccess.zoom ||  15,
                    credentials: "An5SrtrV6M3L0KQZiR0v5-SEJZNa8lbdbOok6GxgkuQ07ZktSbK8XIk72Xs6A369"
                };

                deleteMap();  //If mapcontrol exists, unload it before creating new

                mapControl = new Microsoft.Maps.Map(document.getElementById("mapdiv"), mapOptions);

                //infoBox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), { visible: false });

                var currentLocation = new Microsoft.Maps.Pushpin(loc, { icon: '/images/pin_transparent.gif' });
                currentLocation.Title = "";
                currentLocation.Description = "You are Here!";
                pinLayer.push(currentLocation);

                //Microsoft.Maps.Events.addHandler(currentLocation, 'click', displayInfoBox);

                
                for (var i = 0; i < DBAccess.results.length; i++) {
                    var row = DBAccess.results[i];
                    var loc = getPinLocation(row.latitude, row.longitude);
                    
                    //var distance = Math.sqrt(Math.pow((location.latitude - row.latitude), 2) + Math.pow((location.longitude - row.longitude), 2))
                    var pin = new Microsoft.Maps.Pushpin(loc);
                    //pin.Title = row.title;
                    //pin.Description = row.description + "<br/><br/>" + "Contact: " + row.contact + "<br/><br/><div class='detail-link'>See Details</div>";
                    pin.row = row;

                    pinLayer.push(pin);
                    Microsoft.Maps.Events.addHandler(pin, 'click', displayInfoBox);
                }

                mapControl.entities.push(pinLayer);
                //mapControl.entities.push(infoBox);

                document.getElementById("info-details").addEventListener('click', function (e) {
                    e.preventDefault();
                    if (mapControl) {
                        DBAccess.mapCenter = mapControl.getCenter();
                        DBAccess.zoom = mapControl.getZoom();
                    }

                    deleteMap();
                    WinJS.Navigation.navigate('/pages/itemDetails/itemDetails.html');
                });
            });
            
        },

        unload: function () {
            deleteMap();
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
