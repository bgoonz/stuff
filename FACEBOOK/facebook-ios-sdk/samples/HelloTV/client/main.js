// Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
//
// You are hereby granted a non-exclusive, worldwide, royalty-free license to use,
// copy, modify, and distribute this software in source code or binary form for use
// in connection with the web services and APIs provided by Facebook.
//
// As with any software that integrates with the Facebook platform, your use of
// this software is subject to the Facebook Developer Principles and Policies
// [http://developers.facebook.com/policy/]. This copyright notice shall be
// included in all copies or substantial portions of the software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// utility method to return an alert template.
var createAlert = function (title, description) {
  var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
  <alertTemplate>
  <title>${title}</title>
  <description>${description}</description>
  <button id="alertOKButton">
  <text>OK</text>
  </button>
  </alertTemplate>
  </document>`

  var parser = new DOMParser()
  var alertDoc = parser.parseFromString(alertString, 'application/xml')
  var alertOKButton = alertDoc.getElementById('alertOKButton')
  alertOKButton.addEventListener('select', function (e) {
    navigationDocument.dismissModal()
  })
  return alertDoc
}

// utility method to load a tvml document and assign a callback when we complete loading it.
function getDocument(url, onload) {
  var wrapper = function () {
    onload(templateXHR.responseXML)
  }
  var templateXHR = new XMLHttpRequest()
  templateXHR.responseType = 'document'
  templateXHR.addEventListener('load', wrapper)
  templateXHR.open('GET', url, true)
  templateXHR.send()
  return templateXHR
}

// main.tvml helper to update the content depending if the user is logged in.
function updateContent(doc) {
  var img = doc.getElementById('profileImage')

  if (FBSDKJS.isLoggedIn()) {
    var src =
      'https://graph.facebook.com/v2.5/me/picture?type=square&width=200&height=200&access_token=' +
      FBSDKJS.accessTokenString()
    img.setAttribute('src', src)
  } else {
    img.setAttribute('src', 'http://127.0.0.1:9002/Friends.png')
  }
}

// main.tmvl helper to return a document for asking for publish actions
var createLogin = function () {
  var s = `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
  <FBSDKLoginViewController publishPermissions="publish_actions" />
  </document>`
  var d = new DOMParser().parseFromString(s, 'application/xml')
  d.addEventListener('onFacebookLoginViewControllerFinish', function (e) {
    // _shareLink is defined by the app
    _shareLink()
  })
  return d
}

// main.tvml helper to be called back from native code after sharing.
var shareLinkCallback = function () {
  navigationDocument.presentModal(createAlert('Success!', 'Thanks for sharing'))
}

App.onLaunch = function (options) {
  var onShareLinkButtonSelect = function (e) {
    if (!FBSDKJS.hasGranted('publish_actions')) {
      navigationDocument.presentModal(createLogin())
    } else {
      // _shareLink is defined by the app
      _shareLink()
    }
  }
  var onLoginCancel = function (e) {
    console.log('login cancelled')
  }
  var onLoginError = function (e) {
    console.log('login error ' + e)
  }
  var onLoginStatusChange = function (e) {
    updateContent(navigationDocument.documents[0])
  }
  var mainDoc = getDocument('http://localhost:9002/main.tvml', function (doc) {
    var shareLinkButton = doc.getElementById('shareLinkButton')
    shareLinkButton.addEventListener('select', onShareLinkButtonSelect)
    doc.addEventListener('onFacebookLoginCancel', onLoginCancel)
    doc.addEventListener('onFacebookLoginError', onLoginError)
    doc.addEventListener('customOnFacebookLogin', onLoginStatusChange)
    doc.addEventListener('customOnFacebookLogout', onLoginStatusChange)

    // Log event for app analytics.
    FBSDKJS.logEventParameters('tvml-app-launch')

    navigationDocument.pushDocument(doc)
    updateContent(doc)
  })
}
