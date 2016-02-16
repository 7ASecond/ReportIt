

chrome.contextMenus.create({
    "title": "ReportIt!",
    "contexts": ["all"],
    "onclick": onClickHandler
});




var ExtId = "";
// Create the XHR object.
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

// Decide what has been clicked on.
// Get information to send to the Report-It POST Only API
// Add content to the database so that it is not displayed again to the EU.
// Tell the page (tab) showing the content to remove the content
// Send the report to the Report-It POST only API

// Information that must always be sent.
//      1) Extension ID
//      2) Username or ""
//      3) Page URL
//      4) Type of Report (Image, Text, Video, Page, etc)
//      5) followed by Report Type Spectific Information
//          5.1) Images and Videos:
//              Src Url
//          5.2) Text:
//              Text Content
//          5.3) Webpage
//              No Additional information
// Format:
//      "extId,UserName,PageUrl,ReportType,SrcUrl,LinkUrl,TextContent"
// Examples:
//  Report Image (no Username):
//          "extId,,PageUrl,Image,SrcUrl,,"
//  Report Page:
//          "extId,Username,PageUrl,Page,,,"           
function onClickHandler(info) {

    var extId = GetExtensionId();           // This add on's Unique Id for this computer
    var username = GetUsername();           // The Username of the EU if registered & Logged on
    var pUrl = encodeURI(info.pageUrl);     // The Page containing the reported content

    var sUrl = "";                          // The source Url of the content if applicable
    var lUrl = "";                          // The link url of the content if applicable
    var sText = "";                         // The Selected text content if applicable

    // Are we reporting an Image?
    if (info.mediaType === "image") {

        sUrl = encodeURI(info.srcUrl);
        SendReport(extId, username, pUrl, sUrl, lUrl, sText);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { greeting: "Image; " + sUrl }, function (response) {
                console.log(response.farewell);
            });
        });

    }
    else if (info.linkUrl) {
        lUrl = encodeURI(info.linkUrl);
        SendReport(extId, username, pUrl, sUrl, lUrl, sText);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { greeting: "Link; " + lUrl }, function (response) {
                console.log(response.farewell);
            });
        });
    }
    else if (info.selectionText) {
        sText = info.selectionText;
        console.log("Selected text = " + sText);
        SendReport(extId, username, pUrl, sUrl, lUrl, sText);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { greeting: "Text; " + lUrl }, function (response) {
                console.log(response.farewell);
            });
        });
    } else {
        SendReport(extId, username, pUrl, sUrl, lUrl, sText);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { greeting: "Page; " + lUrl }, function (response) {
                console.log(response.farewell);
            });
        });
    }
};

function SendReport(extId, pUrl, sUrl, lUrl, sText) {
    // Format:
    //      "extId,UserName,PageUrl,ReportType,SrcUrl,LinkUrl,TextContent"
    var report = extId + "," + pUrl + "," + sUrl + "," + lUrl + "," + sText;  // The Report that will be sent to the POST only API

    // Setup our POST Headers
    var xhr = new CreateCorsRequest("POST", "http://reportitapi.azurewebsites.net/api/reportit/");
    // For local debugging
    // var xhr = new CreateCorsRequest("POST", "http://localhost:3070/API/ReportIt/");

    xhr.onload = function () {
        var responseText = xhr.responseText;
        console.log("Response Text: " + responseText);
        // process the response.
    };

    xhr.onerror = function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { greeting: "Error" }, function (response) {
                console.log(response.farewell);
                console.log(tabs[0].id);
            });
        });
    };

    // Send the Report
    xhr.send(JSON.stringify(report));

    // Let the EU know that they have reported the content successfully
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "Reported" }, function (response) {
            console.log(response.farewell);
            console.log(tabs[0].id);
        });
    });
};

// Get's the Unique Id of the extension for this machine.
function GetExtensionId() {
    return localStorage.getItem("ReportItExtId");
};

// If the User is registered AND logged in return their username so that they can maintain statistics.
function GetUsername() {
    return "SYSTEM";
};

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        console.log("This is a first install!");
        ExtId = getRandomToken();
        console.log("Extension Id = " + ExtId);
        localStorage.setItem("ReportItExtId", ExtId);
    } else if (details.reason === "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        ExtId = GetExtensionId();
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});



function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = "";
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
};

//var webRequestFilter = {
//    urls: ["<all_urls>"]
//};

//chrome.webRequest.onCompleted.addListener(completedCallBack, webRequestFilter);
//function completedCallBack(details) {
//    if (details.tabId > -1) {
//        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//            chrome.tabs.sendMessage(details.tabId, { greeting: "OnLoad" }, function (response) {                
//            });
//        });
//    }
//   // chrome.webRequest.onCompleted.removeListener(completedCallBack, webRequestFilter);

//}