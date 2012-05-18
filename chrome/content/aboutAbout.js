/*
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var AboutAbout = {

  XULNS: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",

  makeXML: function aboutAbout_makeXML(aXMLObject) {
    var res = null;
    var oldPrettyPrinting = XML.prettyPrinting;
    XML.prettyPrinting = false;
    try {
      if (typeof aXMLObject == "string") {
        aXMLObject = new XML(aXMLObject);
      }
      res = (new DOMParser).parseFromString(aXMLObject.toXMLString(),
                                            "application/xml")
                           .documentElement;
    } catch (e) {
    }
    XML.prettyPrinting = oldPrettyPrinting;
    return res;
  },

  middleClickHandler: function aboutAbout_middleClickHandler(aEvent) {
    if ((Application.id == "{3550f703-e582-4d05-9a08-453d09bdfdc6}") ||
        aEvent.button != 1) return;
    aEvent.preventDefault();
    if ("gBrowser" in window) {
      gBrowser.selectedTab = gBrowser.addTab(aEvent.target.label);
    } else { // SeaMonkey Mail, Composer & Address Book
      openAsExternal(aEvent.target.label);
    }
    closeMenus(aEvent.target);
  },

  addMenuItem: function aboutAbout_addMenuItem(aNode, aLabel) {
    aNode.appendChild(this.makeXML(<menuitem xmlns={this.XULNS}
                                             label={aLabel}/>));
  },

  populate: function aboutAbout_populate(aNode) {
    const Cc = Components.classes, Ci = Components.interfaces;
    const nsIAboutModule = Ci.nsIAboutModule;
    
    while (aNode.lastChild) aNode.removeChild(aNode.lastChild);

    // http://mxr.mozilla.org/mozilla-central/source/toolkit/content/aboutAbout.xhtml
    var protocols = [];
    var ios = Cc["@mozilla.org/network/io-service;1"].
              getService(Ci.nsIIOService);
    for (var cid in Cc) {
      let res = cid.match(/@mozilla.org\/network\/protocol\/about;1\?what\=(.*)$/);
      if (res) {
        let aboutType = res[1];
        let contract = "@mozilla.org/network/protocol/about;1?what=" + aboutType;
        try {
          let am = Cc[contract].getService(nsIAboutModule);
          let uri = ios.newURI("about:" + aboutType, null, null);
          let flags = am.getURIFlags(uri);
          if (!(flags & nsIAboutModule.HIDE_FROM_ABOUTABOUT)) {
            protocols.push(aboutType);
          }
        } catch (e) {
          // getService might have thrown if the component doesn't actually
          // implement nsIAboutModule
        }
      }
    }

    if (protocols.length > 20) {
      var hbox  = aNode.appendChild(this.makeXML(<hbox xmlns={this.XULNS}/>));
      var vbox1 = hbox.appendChild(this.makeXML(<vbox xmlns={this.XULNS}/>));
      var vbox2 = hbox.appendChild(this.makeXML(<vbox xmlns={this.XULNS}/>));
      protocols.sort().forEach(function(aProtocol) {
        let vbox = (aProtocol <= protocols[parseInt(protocols.length / 2)])
                    ? vbox1 : vbox2;
        AboutAbout.addMenuItem(vbox, "about:" + aProtocol);
      })
    } else {
      protocols.sort().forEach(function(aProtocol) {
        AboutAbout.addMenuItem(aNode, "about:" + aProtocol);
      })
    }
  }
}
