(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            showAppBar();
            element.querySelector("#submit").addEventListener("click", this.gotoMapView, false);
        },

        gotoMapView: function () {
            getLoc(function (location) {
                var catList = document.getElementById("categories");
                var category = catList.options[catList.selectedIndex].innerText;
                var title = document.getElementById("keywords").value;
                //var city = location.zip.slice(0, 4) || 9801;

                DBAccess.itemsTable.where({ category: category })
                                    .where(function (keyword, lat, long, off) {
                                        return this.title.indexOf(keyword) != -1 
                                                && this.latitude < lat + off && this.latitude > lat - off 
                                                && this.longitude < long + off && this.longitude > long - off;

                                    }, title, location.latitude, location.longitude, 0.05).read().done(function (results) {
                                        DBAccess.results = results;
                                        /*for (var i = 0; i < results.length; i++) {
                                            var row = results[i];
                                            console.log(row);
                                        }*/

                                        WinJS.Navigation.navigate("/pages/mapcontrol/mapcontrol.html");
                                    });
                
                
            });
            //location.href = "/pages/mapcontrol/mapcontrol.html";
        }
    });
})();
