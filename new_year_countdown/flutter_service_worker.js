'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "6e8f566f734e1a2b01a85048d8c291aa",
"index.html": "ba4af117b404a978aa7fca9b8972dce8",
"/": "ba4af117b404a978aa7fca9b8972dce8",
"main.dart.js": "aa141c8754652f085447455ff564b01e",
"icons/favicon-16x16.png": "8377082132ba92624a084a7da4dbc11b",
"icons/favicon.ico": "1856ace050cf694b8ff5388ddae93ce6",
"icons/apple-icon.png": "b47c20adbe98312a09ae84ffe9221131",
"icons/apple-icon-144x144.png": "ecbd707e1fa0d73bda0cff5f480488e7",
"icons/android-icon-192x192.png": "380b28dc0d0f52ee90eb0ea5c936fcd1",
"icons/apple-icon-precomposed.png": "b47c20adbe98312a09ae84ffe9221131",
"icons/apple-icon-114x114.png": "84e80ab0aa801c509ecfd86328b8cd1a",
"icons/ms-icon-310x310.png": "a902eccc034d6faf0e3c86de24ec237c",
"icons/ms-icon-144x144.png": "ecbd707e1fa0d73bda0cff5f480488e7",
"icons/apple-icon-57x57.png": "87d9f2c3a6c74030f39ab5f4d02c8cc5",
"icons/apple-icon-152x152.png": "ebfc2a61cc1256c29832eb8f6e8abd25",
"icons/ms-icon-150x150.png": "3a76358f5def833b6a994debca28ddab",
"icons/android-icon-72x72.png": "19be1ad408e404b3107b76b746acd455",
"icons/android-icon-96x96.png": "d6fe89640e2e2b4bd163eedfd117c15c",
"icons/android-icon-36x36.png": "3cbdd64153160b8d0f02f1ce447deb8a",
"icons/apple-icon-180x180.png": "50a82fda3a76182a884f6e9ce5e952b2",
"icons/favicon-96x96.png": "d6fe89640e2e2b4bd163eedfd117c15c",
"icons/manifest.json": "b58fcfa7628c9205cb11a1b2c3e8f99a",
"icons/android-icon-48x48.png": "e5933506a1b2d5ed8a17a11fa486c48a",
"icons/apple-icon-76x76.png": "e7b5668b0ef57cb74046918519b93be7",
"icons/apple-icon-60x60.png": "b87a85745cefe413d9052aa3271541fc",
"icons/browserconfig.xml": "653d077300a12f09a69caeea7a8947f8",
"icons/android-icon-144x144.png": "ecbd707e1fa0d73bda0cff5f480488e7",
"icons/apple-icon-72x72.png": "19be1ad408e404b3107b76b746acd455",
"icons/apple-icon-120x120.png": "3bdc03b51cac884b9d91ea0b5b3a8587",
"icons/favicon-32x32.png": "aae29ef99b1832b584183811c638662b",
"icons/ms-icon-70x70.png": "1d6c97db32fc77d5a1e6fbde25b8a37d",
"manifest.json": "90a799ad19733ad6c3180139d78c4fd1",
"assets/AssetManifest.json": "f712bf16b786b9f871cdcabb3a3e7052",
"assets/NOTICES": "c87e9b79f34f3a1b53751f7e80180096",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/flags/brazil.svg": "959af1e7a2d161e0fa1210d2c16af577",
"assets/assets/flags/united-states.svg": "aefba3fef673e14305b112b0e82805fe",
"assets/assets/fireworks-particle.png": "db9cd9d0f841a501771c67f1c75bbc72",
"canvaskit/canvaskit.js": "43fa9e17039a625450b6aba93baf521e",
"canvaskit/profiling/canvaskit.js": "f3bfccc993a1e0bfdd3440af60d99df4",
"canvaskit/profiling/canvaskit.wasm": "a9610cf39260f60fbe7524a785c66101",
"canvaskit/canvaskit.wasm": "04ed3c745ff1dee16504be01f9623498"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
