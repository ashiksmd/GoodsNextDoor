// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/itemDetails/itemDetails.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            var row = DBAccess.row;
            element.querySelector(".pagetitle").innerText = row.title;
            element.querySelector("#desc").innerText = row.description;
            element.querySelector("#contact span").innerText = row.contact;
            element.querySelector("#location span").innerText = row.city;

            if (row.imageUri) {
                element.querySelector("#thumbnail-div img").src = row.imageUri;
                element.querySelector("#thumbnail-div img").addEventListener("click", showPhotoPreview, false);
                element.querySelector("#img-preview-div .close-icon").addEventListener("click", closePhotoPreview, false);
                element.querySelector("#thumbnail-div").className = "";
            }
            else {
                element.querySelector("#thumbnail-div").className = "hidden";
            }

            showAppBar();
            //console.log(DBAccess.row);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });

    function showPhotoPreview(e) {
        document.getElementById("img-preview").src = e.target.src;
        document.getElementById("img-preview-div").className = "overlay";
    }

    function closePhotoPreview() {
        document.getElementById("img-preview-div").className = "hidden overlay";
    }
})();

