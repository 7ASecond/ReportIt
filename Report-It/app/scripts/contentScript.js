


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {


   dhtmlx.message.position = "bottom";

    if (request.greeting === "Reported")       // Show the Reported Message to the EU
        dhtmlx.message({
            text: "Successfully Reported!",
            type: "info"
        });
    else if (request.greeting === "Error")     // Show the error message to the EU
        dhtmlx.message({
            text: "Failed to Report this",
            type: "error"
        });
        // ReSharper disable once PossiblyUnassignedProperty
    else if (request.greeting.startsWith("Image")) {
        ProcessImage(request.greeting);
    }
    else if (request.greeting.startsWith("Link")) {
        ProcessLink(request.greeting);
    }
    else if (request.greeting.startsWith("Text")) {
        ProcessText(request.greeting);
    }
    else if (request.greeting.startsWith("Page")) {
        ProcessPage(request.greeting);
    }
    else if (request.greeting.startsWith("RemoveImages")) {
        RemoveImages(request.greeting);       
    }
    else if (request.greeting === "OnLoad") {
        injectScriptOnLoad();
    }
});

var RemoveImages = function (greeting) {
    var imgUrl = chrome.extension.getURL("images/r500.png");
    var imgs = document.getElementsByTagName("img");

    var blockedImages = GetBlockedImages(imgs);

    for (var imgIndex = 0; imgIndex < imgs.length; imgIndex++) {
        if (ImageIsBlocked(imgs[imgIndex].src)) {
            var width = imgs[imgIndex].width;
            var height = imgs[imgIndex].height;
            imgs[imgIndex].src = imgUrl; // Change the Image and set it's properties   
            imgs[imgIndex].width = width; // Set our image to the same size as the previous image
            imgs[imgIndex].height = height;

            imgs[imgIndex].alt = "Removed by 7ASecond.Net";

            var r = imgs[imgIndex].parentElement;
            if (imgs[imgIndex].parentElement.localName === 'a') {
                imgs[imgIndex].parentElement.href = "http://7ASecond.Net";
                imgs[imgIndex].baseURI = "http://7ASecond.Net";
                imgs[imgIndex].host = "http://7ASecond.Net";
                imgs[imgIndex].hostname = "http://7ASecond.Net";
                imgs[imgIndex].parentElement.removeAttribute('rel');
            }
            imgs[imgIndex].title = "Removed by 7ASecond.Net";
        }
    }
};


var GetBlockedImages = function (imgs) {
    var xhr = new CreateCorsRequest("POST", "http://reportitapi2.azurewebsites.net/API/Check/");
    xhr.onload = function () {
        var responseText = xhr.responseText;
        console.log("Response Text: " + responseText);
        // process the response.
    };

    xhr.onerror = function () {
        console.log(tabs[0].id);
    };

    var imgsSrc = new Array(imgs.length);
    for (var idx = 0; idx < imgs.length; idx++) {
        imgsSrc[imgsSrc.length] = imgs[idx].src;
    }


    var jString = JSON.stringify(imgsSrc);
    // Send the Report
    return xhr.send(jString);
}

var ProcessImage = function (greeting) {

    var url = greeting.split(';');

    // Replace the src with the r500 file
    var imgUrl = chrome.extension.getURL("images/r500.png");

    var imgs = document.getElementsByTagName("img");

    for (var idx = 0; idx < imgs.length; idx++) {
        if (imgs[idx].src === url[1].trim()) {
            SaveImageToLocalStorage(imgs[idx].src);
          
            var width = imgs[idx].width;
            var height = imgs[idx].height;
            imgs[idx].src = imgUrl;  // Change the Image and set it's properties   
            imgs[idx].width = width; // Set our image to the same size as the previous image
            imgs[idx].height = height;

            imgs[idx].alt = "Removed by 7ASecond.Net";

            var r = imgs[idx].parentElement;
            if (imgs[idx].parentElement.localName === 'a') {
                imgs[idx].parentElement.href = "http://7ASecond.Net";
                imgs[idx].baseURI = "http://7ASecond.Net";
                imgs[idx].host = "http://7ASecond.Net";
                imgs[idx].hostname = "http://7ASecond.Net";
                imgs[idx].parentElement.removeAttribute('rel');
            }
            imgs[idx].title = "Removed by 7ASecond.Net";
        }
    }
};




var ProcessLink = function (greeting) {
    var url = greeting.split(';');
    var links = document.getElementsByTagName("a");
    for (var idx = 0; idx < links.length; idx++) {
        if (links[idx].href === url[1].trim()) {

            //var nLink = GenerateNewLinkText(links[idx]);
            //links[idx].text = nLink.text;
            links[idx].text = "[Removed By 7ASecond]";
            links[idx].href = "http://7ASecond.Net";
        }
    }
};

var GenerateNewLinkText = function (link) {
    var replacements = {
        "Download": "404",
        "Click to Download": "Removed",
        "Preview": "404",
        "https?://.+": ""
    };
    var allPatterns = new RegExp(Object.keys(replacements).join("|"));

    var width = link.offsetWidth;
    link.text = link.text.replace(allPatterns, function (s) {
        return "[" + (replacements[s] || "Removed By 7ASecond") + "]";
    });
    link.style.paddingRight = (width - link.offsetWidth) + "px";
    return link;
}

var ProcessText = function (greeting) {
    // document.write(String.fromCharCode(178)); // ABC 
    var textParts = greeting.split(';');
    var text = textParts[1];
    var replacementChar = String.fromCharCode(178);
    var str = new Array(text.length + 1).join(replacementChar);
    document.body.innerText = document.body.innerText.replace(text, str);
}

var ProcessPage = function (greeting) {

}


var SaveImageToLocalStorage = function (imgSrc) {
    var theValue = imgSrc;
    var eUrl = encodeURI(imgSrc);
    localStorage["7ASecond;Image;" + eUrl] = imgSrc;
}

var ImageIsBlocked = function (imgSrc) {
    var res = false;
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("7ASecond;Image")) {
            var r = localStorage.key(i);
            var rParts = r.split(';');
            if (rParts[2] === imgSrc) res = true;
        }
    }

    if (res !== true) // Not found in local storage - try the cloud?
    {

    }


    return res;
};

function CreateCorsRequest(method, url) {
    var xhr = new XMLHttpRequest();


    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/json");
    } else {
        // CORS not supported.
        xhr = null;
    }

    return xhr;
};

function injectScriptOnLoad() {


    //if (document.body !== null) {       // Sometimes runs before the body has been created.
    //    //console.log("Looking for onbeforeunload");
    //    if (document.body.hasAttribute("onbeforeunload")) {
    //        document.body.removeAttribute("onbeforeunload");
    //        document.removeEventListener("beforeunload",false);
    //        console.log("onbeforeunload found and removed");
    //    }

    //    //console.log("Looking for onmouseover");
    //    if (document.body.hasAttribute("onmouseover")) {
    //        document.body.removeAttribute("onmouseover");
    //        document.removeEventListener("mouseover", false);
    //        console.log("onmouseover found and removed");
    //    }

    //    //console.log("Looking for oncontextmenu");
    //    if (document.body.hasAttribute("oncontextmenu")) {
    //        document.body.removeAttribute("oncontextmenu");
    //        document.removeEventListener("contextmenu", false);
    //        console.log("oncontextmenu found and removed");
    //    }

    //    //console.log("Looking for onunload");
    //    if (document.body.hasAttribute("onunload")) {
    //        document.body.removeAttribute("onunload");
    //        document.removeEventListener("unload", false);
    //        console.log("onunload found and removed");
    //    }

    //    //console.log("Looking for onload");
    //    //if (window.hasAttribute("onload")) {
    //    //    window.removeAttribute("onload");
    //    //    window.removeEventListener("load", false);
    //    //    console.log("onload found and removed (Window)");
    //    //}

    //    if (document.head.hasAttribute("onload")) {
    //        document.head.removeAttribute("onload");
    //        document.head.removeEventListener("load", false);
    //        console.log("onload found and removed (Document:Head)");
    //    }

    //    if (document.body.hasAttribute("onload")) {
    //        document.body.removeAttribute("onload");
    //        document.body.removeEventListener("load", false);
    //        console.log("onload found and removed (Document:Body)");
    //    }
    //}
}