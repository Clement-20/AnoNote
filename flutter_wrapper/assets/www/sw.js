/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b1bafff1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "7e3eb6877826ab790dd5e8ff03435eaf"
  }, {
    "url": "pwa-512x512.png",
    "revision": "7e3eb6877826ab790dd5e8ff03435eaf"
  }, {
    "url": "pwa-192x192.png",
    "revision": "de2b95b40dcb8e9e72058ab925c34ba5"
  }, {
    "url": "manifest.webmanifest",
    "revision": "b663b6588fa0894d02a8c0e5d1cac76e"
  }, {
    "url": "index.html",
    "revision": "4cd08fa5927458e44ca8ae526b60f05c"
  }, {
    "url": "icon.svg",
    "revision": "80b0c3a9781c20172c63fb527fe40e57"
  }, {
    "url": "favicon.png",
    "revision": "b77807fc0b52dee28c67af9f9098bac6"
  }, {
    "url": "favicon.ico",
    "revision": "9bab3eb7bb1954cbde9d7a04d3a3ceda"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b3277c8f2ad4aab9c9df756ca1f785b7"
  }, {
    "url": "assets/index-nGH9nhcb.css",
    "revision": null
  }, {
    "url": "assets/index-B_7QCjh0.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b3277c8f2ad4aab9c9df756ca1f785b7"
  }, {
    "url": "favicon.ico",
    "revision": "9bab3eb7bb1954cbde9d7a04d3a3ceda"
  }, {
    "url": "favicon.png",
    "revision": "b77807fc0b52dee28c67af9f9098bac6"
  }, {
    "url": "icon.svg",
    "revision": "80b0c3a9781c20172c63fb527fe40e57"
  }, {
    "url": "llms-full.txt",
    "revision": "432f243c2709964640bf80d04f3dfee0"
  }, {
    "url": "llms.txt",
    "revision": "0f411f598fe1064080f824372239aa8a"
  }, {
    "url": "pwa-192x192.png",
    "revision": "de2b95b40dcb8e9e72058ab925c34ba5"
  }, {
    "url": "pwa-512x512.png",
    "revision": "7e3eb6877826ab790dd5e8ff03435eaf"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "7e3eb6877826ab790dd5e8ff03435eaf"
  }, {
    "url": "robots.txt",
    "revision": "fa94f2f01e462172b86348952b816dc7"
  }, {
    "url": "sitemap.xml",
    "revision": "698fe0ee1d0e3cb91b9e61750afd055e"
  }, {
    "url": "manifest.webmanifest",
    "revision": "b663b6588fa0894d02a8c0e5d1cac76e"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/images\.unsplash\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "unsplash-images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');

}));
