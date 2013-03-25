// https://developer.mozilla.org/En/Custom_about:_URLs#For_Firefox_4

const name = "menu";
const desc = "About: Menu";
const uuid = "{9158e1ea-961a-49c5-b66b-3021432f34ca}";
const chrm = "chrome://aboutmenu/content/";

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function AboutProtocol() {}

AboutProtocol.prototype = {
  classDescription: desc,
  contractID: "@mozilla.org/network/protocol/about;1?what=" + name,
  classID: Components.ID(uuid),
  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIAboutModule]),
  
  getURIFlags: function(aURI) {
    return Components.interfaces.nsIAboutModule.ALLOW_SCRIPT;
  },
  
  newChannel: function(aURI) {
    let ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    let channel = ios.newChannel(chrm, null, null);
    channel.originalURI = aURI;
    return channel;
  }
}

const NSGetFactory = XPCOMUtils.generateNSGetFactory([AboutProtocol]);