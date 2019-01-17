// check with log that service worker is working - attached event listeners are working
// (works with self. this. or without anything)
// install event
// addEventListener('install', () => {
//     console.log('Service worker: install');
// });

// followed example from https://www.youtube.com/watch?v=ksXwaWHCW6k
const cacheName = 'restaurants_reviews_v1';
// activate event
addEventListener('activate', e => {
    console.log('Service worker: active');
    // after service worker is activated remove old caches
    e.waitUntil(
        // filter all existing caches that are of this website (name like 'restaurants_reviews_')
        // and their name is different then cacheName
        caches.keys()
            .then( cachesNames => {
                // ensure that all wrapped promises resolve
                return Promise.all(
                    cachesNames
                        .filter( name => {
                            return name.startsWith('restaurants_reviews_') && name !== cacheName;
                        })
                        // delete all those old caches
                        .map( cache => {
                            console.log('Service worker: removing old caches');
                            return caches.delete(cache);
                        })
                );
            } )
    )
});

// if there is a cache use it, if not send original request
self.addEventListener('fetch', e => {
    // intercept fetch event
    e.respondWith(
        // try to fetch from network first
        fetch(e.request)
            .then( response => {
                // do the clone of a response from network to current request
                const responseClone = response.clone();
                // create a cache
                caches
                    .open(cacheName)
                    // add response to cache
                    .then(cache => {
                        cache.put(e.request, responseClone);
                    });
                // return the original response for site to work normally
                return response;
            })
            // if no network = getting error
            .catch( error => {
                // check caches for current request
                caches
                    .match(e.request)
                    // if there is one recorded response is returned
                    .then( response => {return response})
                    // if not we just get an error
            })
    )
});