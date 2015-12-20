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

var ProcessText = function(greeting) {
    // document.write(String.fromCharCode(178)); // ABC 
    var textParts = greeting.split(';');
    var text = textParts[1];
    var replacementChar = String.fromCharCode(178);
    var str = new Array(text.length + 1).join(replacementChar);
    document.body.innerText = document.body.innerText.replace(text, str);

}

var ProcessPage = function (greeting) {

}