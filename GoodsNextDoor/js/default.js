var DBAccess = {};

function showLoader() {
    document.getElementById("loader").className = "";
}

function hideLoader() {
    document.getElementById("loader").className = "hidden";
}

(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    function initApp() {
        document.getElementById("searchCmd").addEventListener("click", function () {
            WinJS.Navigation.navigate("/pages/home/home.html");
        }, false);
        document.getElementById("postCmd").addEventListener("click", function () {
            WinJS.Navigation.navigate("/pages/post/post.html");
        }, false);

        DBAccess.client = new WindowsAzure.MobileServiceClient(
            "https://goodsnextdoorws.azure-mobile.net/",
            "ShFBmkeshFPxcjHKLsxGasopYncMNn49"
        );

        DBAccess.itemsTable = DBAccess.client.getTable('items');

        //var items = new WinJS.Binding.List();

        DBAccess.postItem = function (item, callback) {
            // This code inserts a new TodoItem into the database. When the operation completes
            // and Mobile Services has assigned an id, the item is added to the Binding List
            DBAccess.itemsTable.insert(item).done(callback);
        };

        //getLoc in common.js
        getLoc(function (location) {
            var displayLoc = document.getElementById("location");
            if (displayLoc && location.city)
                displayLoc.innerText = "Location: " + location.city;
        });
    }

    app.onactivated = function (eventObject) {
        var activationKind = eventObject.detail.kind;
        var activatedEventArgs = eventObject.detail.detail;

        var url;

        switch (activationKind) {
            case activation.ActivationKind.launch:
                url = "/pages/home/home.html";
                break;
            case activation.ActivationKind.pickFileContinuation:
                //case activation.ActivationKind.pickSaveFileContinuation:
                //case activation.ActivationKind.pickFolderContinuation:
                //case activation.ActivationKind.webAuthenticationBrokerContinuation:
                url = "/pages/post/post.html";
                break;
            default:
                url = "/pages/home/home.html";
        }
        var start = WinJS.UI.processAll().
            then(function () {

                initApp();
        
                var initialState = {};
                
                if (nav.history && nav.history.location) {
                    url = nav.history.current.location;
                    initialState = nav.history.current.state || initialState;
                }
                initialState.activationKind = activationKind;
                initialState.activatedEventArgs = activatedEventArgs;
                nav.history.current.initialPlaceholder = true;
                return nav.navigate(url, initialState);

                //return nav.navigate("/pages/home/home.html");
            });

        eventObject.setPromise(start);
    };

    app.oncheckpoint = function (args) {
        // Add app suspension code here.
    };

    nav.onnavigated = function (evt) {
        var contentHost =
            document.body.querySelector("#contenthost"),
            url = evt.detail.location;

        // Remove existing content from the host element.
        WinJS.Utilities.empty(contentHost);

        // Display the new page in the content host.
        WinJS.UI.Pages.render(url, contentHost);
    }

    app.start();
})();
