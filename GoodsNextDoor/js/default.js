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

    //Not using this for now. client.login seems to throw NotImplementedException on phone. Works on desktop project.
    function authenticate() {
        DBAccess.client.login('microsoftaccount').done(function (result) {
            // handle successful login
            console.log("logged in");
        }, function (error) {
            // handle failed login
            console.log("log in failed");
        });
    }

    app.onactivated = function (eventObject) {
        var activationKind = eventObject.detail.kind;
        var activatedEventArgs = eventObject.detail.detail;

        var url;

        DBAccess.client = new WindowsAzure.MobileServiceClient(
            "https://goodsnextdoorws.azure-mobile.net/",
            "ShFBmkeshFPxcjHKLsxGasopYncMNn49"
        );

        switch (activationKind) {
            case activation.ActivationKind.launch:
                //authenticate();       //client.login() not implemented on phone?
                                        //Works on desktop project. Need alternative for auth.

                url = "/pages/home/home.html";
                break;
            //case activation.ActivationKind.webAuthenticationBrokerContinuation:
             
            case activation.ActivationKind.pickFileContinuation:
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
