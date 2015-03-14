// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

(function () {
    "use strict";

    var mapControl = null;
    var infoBox;
    var pinLayer = new Microsoft.Maps.EntityCollection();

    function displayInfoBox(e) {
        infoBox.setOptions({ title: e.target.Title, description: e.target.Description, visible: true, offset: new Microsoft.Maps.Point(0, 25) });
        infoBox.setLocation(e.target.getLocation());
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

    WinJS.UI.Pages.define("/pages/mapcontrol/mapcontrol.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            hideAppBar();
            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: this.initMap, culture: "en-us", homeRegion: "US" });

            element.querySelector("#snapToCurrent").addEventListener("click", function () {
                getLoc(function (location) {
                    mapControl.setView({ center: new Microsoft.Maps.Location(location.latitude, location.longitude) });
                });
                
            });
        },

        initMap: function () {
            getLoc(function (location) {

                pinLocations = {};
                pinLayer.clear();

                var loc = getPinLocation(location.latitude, location.longitude);
                var mapOptions =
                {
                    center: loc,
                    zoom: 15,
                    credentials: "An5SrtrV6M3L0KQZiR0v5-SEJZNa8lbdbOok6GxgkuQ07ZktSbK8XIk72Xs6A369"
                };

                if (mapControl) {
                    try{
                        mapControl.dispose();
                    } catch (e) {};
                }

                mapControl = new Microsoft.Maps.Map(document.getElementById("mapdiv"), mapOptions);

                infoBox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), { visible: false });

                var currentLocation = new Microsoft.Maps.Pushpin(loc, { icon: '/images/pin_transparent.gif' });
                currentLocation.Title = "";
                currentLocation.Description = "You are Here!";
                pinLayer.push(currentLocation);

                Microsoft.Maps.Events.addHandler(currentLocation, 'click', displayInfoBox);

                
                for (var i = 0; i < DBAccess.results.length; i++) {
                    var row = DBAccess.results[i];
                    var loc = getPinLocation(row.latitude, row.longitude);
                    
                    //var distance = Math.sqrt(Math.pow((location.latitude - row.latitude), 2) + Math.pow((location.longitude - row.longitude), 2))
                    var pin = new Microsoft.Maps.Pushpin(loc);
                    pin.Title = row.title;
                    pin.Description = row.description + "<br/><br/>" + "Contact: " + row.contact;

                    pinLayer.push(pin);
                    Microsoft.Maps.Events.addHandler(pin, 'click', displayInfoBox);
                }

                mapControl.entities.push(pinLayer);
                mapControl.entities.push(infoBox);
            });
            
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            mapControl.dispose();
            mapControl = null;
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
