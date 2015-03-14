var global = {
    locator: null,
    location: null
};

function getLoc(callback) {
    if (global.location && global.location.zip) {
        callback(global.location);
        return;
    }

    global.location = {};
    var location = global.location;

    if (global.locator == null)
        global.locator = new Windows.Devices.Geolocation.Geolocator();


    if (global.locator != null) {
        global.locator.getGeopositionAsync().then(function (pos) {
            location.latitude = pos.coordinate.latitude;
            location.longitude = pos.coordinate.longitude;
            var geopoint = new Windows.Devices.Geolocation.Geopoint(pos.coordinate);
            Windows.Services.Maps.MapLocationFinder.findLocationsAtAsync(geopoint).done(function (address) {
                //console.log("Got address!");
                if (address.locations.length != 0) {
                    location.city = address.locations[0].address.town;
                    location.zip = address.locations[0].address.postCode;
                }

                if (callback) {
                    callback(location);
                    return;
                }
            });
        }, function () { });
    }
}

function showAppBar() {
    document.getElementById('appbar').winControl.disabled = false;
}

function hideAppBar() {
    document.getElementById('appbar').winControl.disabled = true;
    //document.getElementById('commandsAppBar').winControl.hideCommands([cmdFavorite, cmdCamera]);
    //document.getElementById('scenarioHideButtons').disabled = true;
    //document.getElementById('scenarioShowButtons').disabled = false;
}