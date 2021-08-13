 /**
 * Defines a **Page** in the CMS.
 * @typedef Page
 * @memberof AgilityFetch.Types
 * @property {number} pageID - The unique ID of the page in this language.
 * @property {string} name - The friendly url slug for the page - this is used to make up the URL.
 * @property {string} path - The url path for this page.
 * @property {string} title - The page title for the page, used for SEO and appears in the browser bar/tab.
 * @property {string} menuText - And alternate text field, often used in dynamic menu generation.
 * @property {string} pageType - The type of page. Valid values include *static*, *dynamic*, *dynamic_node*, *link*, and *folder*.
 * @property {string} templateName - The name of the Page Template this page uses.
 * @property {boolean} securePage - This value represents whether this page should be secured within the website.
 * @property {AgilityFetch.Types.SystemProperties} properties The system properties of this page item.
 * @property {Object.<string, AgilityFetch.Types.ContentZone>} zones - Contains a dictionary of content zones for this page and the modules in each zone.
 * @property {string} [redirectUrl] - If this page is a *link*, then this property will show the intended destination redirect.
 * @property {number} [dynamicItemContentID] - If this page is a dynamic page, then this property will show the associated contentID of the dynamic content item.
 * @property {AgilityFetch.Types.SitemapVisibility} visible - Object that contains properties pertaining to the intended visibility of this page for seo and menus.
 */

