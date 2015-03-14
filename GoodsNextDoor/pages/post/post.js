(function () {
    "use strict";

    var pickedPhoto = null;

    WinJS.UI.Pages.define("/pages/post/post.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            element.querySelector("#pickPhoto").addEventListener("click", pickPhoto, false);
            element.querySelector("#thumbnail").addEventListener("click", showPhotoPreview, false);
            element.querySelector("#img-preview-div .close-icon").addEventListener("click", closePhotoPreview, false);

            //Save session
            element.querySelector("#categories").addEventListener("change", function (e) {
                WinJS.Application.sessionState.postCategory = e.target.selectedIndex;
            }, false);
            element.querySelector("#title").addEventListener("change", function (e) {
                WinJS.Application.sessionState.postTitle = e.target.value;
            }, false);
            element.querySelector("#desc").addEventListener("change", function (e) {
                WinJS.Application.sessionState.postDesc = e.target.innerText;
            }, false);
            element.querySelector("#contact").addEventListener("change", function (e) {
                WinJS.Application.sessionState.postContact = e.target.value;
            }, false);
            
            showAppBar();
            element.querySelector("#submit").addEventListener("click", this.postToDB, false);

            getLoc(function (location) {
                var displayLoc = document.getElementById("location");
                if (displayLoc && location.city)
                    displayLoc.innerText = "Location: " + location.city;
            });

            if (options && options.activationKind === Windows.ApplicationModel.Activation.ActivationKind.pickFileContinuation) {
                loadThumbnail(options.activatedEventArgs);
            }
            restoreSession();
        },

        postToDB: function () {
            showLoader();
            getLoc(function (location) {
                var item = {};
                var catList = document.getElementById("categories");
                item.category = catList.options[catList.selectedIndex].innerText;
                item.title = document.getElementById("title").value;
                item.description = document.getElementById("desc").innerText;
                item.contact = document.getElementById("contact").value;
                
                item.latitude = location.latitude;
                item.longitude = location.longitude;
                item.city = location.city;

                if (pickedPhoto) {
                    item.containerName = "goodsnextdoor";
                    item.resourceName = pickedPhoto.name;
                }

                DBAccess.postItem(item, function (e) {
                    uploadImage(e, function () {
                        hideLoader();
                        var messageDialog = new Windows.UI.Popups.MessageDialog("Your ad is now online!");
                        messageDialog.showAsync();
                    });
                });
            });
        }
    });

    function uploadImage(e, callback) {
        var url = '';
        var date = new Date().toGMTString().replace('UTC', 'GMT');
        var data = MSApp.createFileFromStorageFile(pickedPhoto);
        var xhrOptions = {
            type: 'PUT',
            url: e.imageUri + "?" + e.sasQueryString,
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Length': data.size,
                'x-ms-date': date,
                'x-ms-version': '2009-09-19',
                'x-ms-blob-type': 'BlockBlob',
            },
            data: data,
        };
        WinJS.xhr(xhrOptions).then(callback, function onerror(error) {
            // handle error
            console.log(error);
        });
    }

    function restoreSession() {
        var categ =  WinJS.Application.sessionState.postCategory;
        var title = WinJS.Application.sessionState.postTitle;
        var desc = WinJS.Application.sessionState.postDesc;
        var contact = WinJS.Application.sessionState.postContact;
        var image = WinJS.Application.sessionState.postImage;

        if(categ)
            document.getElementById("categories").selectedIndex = categ;

        if(title)
            document.getElementById("title").value =  title;

        if(desc)
            document.getElementById("desc").innerText = desc;

        if(contact)
            document.getElementById("contact").value = contact;
    }

    function saveSession() {
        WinJS.Application.sessionState.postCategory = document.getElementById("categories").selectedIndex;
        WinJS.Application.sessionState.postTitle = document.getElementById("title").value;
        WinJS.Application.sessionState.postDesc = document.getElementById("desc").innerText;
        WinJS.Application.sessionState.postContact = document.getElementById("contact").value;
    }
    
    function loadThumbnail(e) {
        var files = e[0].files;
        var filePicked = files.size > 0 ? files[0] : null;
        if (filePicked !== null) {
            // Application now has read/write access to the picked file 
            var tempFolder = Windows.Storage.ApplicationData.current.temporaryFolder;
            var asyncCopy = filePicked.copyAsync(tempFolder, filePicked.name, Windows.Storage.NameCollisionOption.replaceExisting);
            asyncCopy.then(function (e) {
                pickedPhoto = e;
                //console.log(JSON.stringify(e));
                document.getElementById("thumbnail").src = "ms-appdata:///temp/" + e.name;
                document.getElementById("thumbnail-div").className = "";
            });


            //document.getElementById("thumbnail").src = filePicked.copyAndReplaceAsync();
            //document.getElementById("thumbnail-div").className = "";
        } else {
            // The picker was dismissed with no selected file
        }
    }

    
    function pickPhoto() {
        var picker = new Windows.Storage.Pickers.FileOpenPicker();
        var enumerator = Windows.Graphics.Imaging.BitmapDecoder.getDecoderInformationEnumerator();
        enumerator.forEach(function (decoderInfo) {
            decoderInfo.fileExtensions.forEach(function (fileExtension) {
                picker.fileTypeFilter.append(fileExtension);
            });
        });

        //saveSession();

        picker.pickSingleFileAndContinue();
    }

    function showPhotoPreview(e) {
        document.getElementById("img-preview").src = e.target.src;
        document.getElementById("img-preview-div").className = "overlay";
    }

    function closePhotoPreview() {
        document.getElementById("img-preview-div").className = "hidden overlay";
    }
})();
