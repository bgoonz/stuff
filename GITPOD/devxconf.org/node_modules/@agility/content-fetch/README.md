[![Build Status](https://agility.visualstudio.com/Agility%20CMS/_apis/build/status/Fetch%20API/Agility%20Content%20Fetch%20JS%20SDK?branchName=master)](https://agility.visualstudio.com/Agility%20CMS/_build/latest?definitionId=59&branchName=master)
[![Netlify Status](https://api.netlify.com/api/v1/badges/c45f5d6e-923b-4019-820e-826e6185017d/deploy-status)](https://app.netlify.com/sites/agilitydocs/deploys)

# Agility Content Fetch JS SDK
This is the official JavaScript library for accessing live and preview content from your [Agility CMS](https://agilitycms.com) instance. 

You can use this in both node and browser based JS apps.

Don't have an Agility CMS instance? Sign up for [Free (forever)](https://account.agilitycms.com/sign-up?product=agility-free) today!

## Features
- Queries the high-availability, CDN backed Agility Fetch REST API
- Get a sitemap for a given channel
- Get a page, including its content zones, modules, and their content
- Get a content item
- Query a content list using a filter syntax
- Get the details of a media gallery
- Keep track of syncing content to your app
- Optional in-memory caching

## Getting Started
In order to use this sdk, you'll need to install the script and you'll also need to authenticate your requests.

### Prerequisites
You must have access to an Agility instance to retrieve the *guid* and generate your *apiKey*. Or, you must have these values provided to you.

### Installation
Install it using **npm** (recommended):
```
npm install @agility/content-fetch
```

If necessary, you can also reference a standalone package that can be used in a browser using a traditional **script** tag. In this case, the sdk can be accessed using a global variable by name of `agility`:
```html
<!-- Use a specific version (i.e. 0.4.2) -->
<script type="text/javascript" src="https://unpkg.com/@agility/content-fetch@0.4.2/dist/agility-content-fetch.browser.js"></script>

<!-- Or, Use the latest version -->
<script type="text/javascript" src="https://unpkg.com/@agility/content-fetch@latest/dist/agility-content-fetch.browser.js"></script>
```
### Making a Request
```javascript
import agility from '@agility/content-fetch'

//initialize the api client
const api = agility.getApi({
  guid: 'ade6cf3c',
  apiKey: 'defaultlive.201ffdd0841cacad5bb647e76547e918b0c9ecdb8b5ddb3cf92e9a79b03623cb'
});

//make the request: get a content item with the ID '22'
api.getContentItem({
    contentID: 22,
    languageCode: 'en-us'
})
.then(function(contentItem) {
    //on success
    console.log(contentItem);
})
.catch(function(error) {
    //on error
    console.log(error);
});
```

## Documentation
Full documentation for this SDK can be found in our [Agility Fetch JS SDK Reference Doc](https://agilitydocs.netlify.com/agility-content-fetch-js-sdk/).

For docs & help around Agility CMS, please see [Agility CMS Documentation](https://help.agilitycms.com/hc/en-us)

## Tutorials
[About the Content Fetch API](https://help.agilitycms.com/hc/en-us/articles/360031985112-About-the-Content-Fetch-API)

[Authenticating your Content Fetch API Calls](https://help.agilitycms.com/hc/en-us/articles/360032225191-Authenticating-your-Content-Fetch-API-Calls)

[Retrieving your API Key(s), Guid, and API URL](https://help.agilitycms.com/hc/en-us/articles/360031919212-Retrieving-your-API-Key-s-Guid-and-API-URL-)

[Making your First Call with the Content Fetch API](https://help.agilitycms.com/hc/en-us/articles/360031918152-Making-your-First-API-Call-with-the-Content-Fetch-API)

[Calilng the Content Fetch API using the Javascript SDK](https://help.agilitycms.com/hc/en-us/articles/360031945912-Calling-the-Content-Fetch-API-using-the-JavaScript-SDK)

[Page Management in a Headless CMS](https://help.agilitycms.com/hc/en-us/articles/360032554331-Page-Management-in-a-Headless-CMS)

[Using Agility CMS with Create React App](https://help.agilitycms.com/hc/en-us/articles/360031121692-Using-Agility-CMS-with-Create-React-App-CRA-)

[Creating a Module for the Agility CMS Create React App](https://help.agilitycms.com/hc/en-us/articles/360031590791-Creating-a-Module-for-the-Agility-CMS-Create-React-App)

[Creating a Page Template for the Agility CMS Create React App](https://help.agilitycms.com/hc/en-us/articles/360032611011-Creating-a-Page-Template-for-the-Agility-CMS-Create-React-App)

[Deploying your Agility CMS Create React App](https://help.agilitycms.com/hc/en-us/articles/360032203552-Deploying-your-Agility-CMS-Create-React-App)

[Content Webhooks](https://help.agilitycms.com/hc/en-us/articles/360035934911)

## Contributing
If you would like to contribute to this SDK, you can fork the repository and submit a pull request. We'd love to include your updates.

### Running the Tests
An essential part of contributing to this SDK is adding and running unit tests to ensure the stability of the project.
```
> npm run test
```







