chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
     
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");

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
      else  if (request.greeting.startsWith("Link")) {
          ProcessLink(request.greeting);
      }
      else if (request.greeting.startsWith("Text")) {
          ProcessText(request.greeting);
      }
      else if (request.greeting.startsWith("Page")) {
          ProcessPage(request.greeting);
      }
  });

var ProcessImage = function (greeting) {

    var url = greeting.split(';');

    // Replace the src with the r500 file
    var imgUrl = chrome.extension.getURL("images/r500.png");

    var imgs = document.getElementsByTagName("img");
    for (var idx = 0; idx < imgs.length; idx++) {
        if (imgs[idx].src === url[1].trim()) {

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


var ProcessLink = function(greeting) {
    var url = greeting.split(';');
    var links = document.getElementsByTagName("a");
    for (var idx = 0; idx < links.length; idx++) {
        if (links[idx].href === url[1].trim()) {            
            
            //var nLink = GenerateNewLinkText(links[idx].text);
            //links[idx].text = nLink;
            links[idx].text = "[Removed By 7ASecond]";
            links[idx].href = "http://7ASecond.Net";            
        }
    }
};

function pad(padding, str, padLeft) {
    if (typeof str === 'undefined')
        return padding;
    if (padLeft) {
        return (padding + str).slice(-pad.length);
    } else {
        return (str + padding).substring(0, padding.length);
    }
}

var GenerateNewLinkText = function (txt) {
    var replacementText = "[Removed]";
    var padding = Array(txt.length - replacementText.length).join(" "); // make a string of 255 spaces        
    return pad(padding, replacementText, false);
}

var ProcessText = function(greeting) {
    
}

var ProcessPage = function (greeting) {

}