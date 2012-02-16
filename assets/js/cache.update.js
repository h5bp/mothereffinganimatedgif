//Javascript Document

//==========CACHE MANIFEST DEBUGGER
//http://jonathanstark.com/blog/2009/09/27/debugging-html-5-offline-application-cache
//http://jonathanstark.com/blog/2011/01/31/possible-fix-for-offline-app-cache-invalid_state_err
//==========CACHE MANIFEST DEBUGGER

var cache = window.applicationCache;
var cacheStatusValues = [];

//uncached - nothing is cached as of yet. Poo Poo on you
cacheStatusValues[0] = 'uncached';

// idle - The application cache status is at a stand
// still. Nothing amazing is happening right now
cacheStatusValues[1] = 'idle';

//checking - The browser is checking for an update, 
//or is attempting to download the cache manifest for 
//the first time. Always first event in the sequence.
cacheStatusValues[2] = 'checking'; 

//downloading - The browser has started to download 
//the cache manifest, either for the first time or 
//because changes have been detected
cacheStatusValues[3] = 'downloading';

//updateready - The resources listed in the manifest 
//have been newly redownloaded, and the script can 
//use swapCache() to switch to the new cache.
cacheStatusValues[4] = 'updateready';

//obsolete - The cache manifest file could not be 
//found, indicating that the cache is no longer 
//needed. The application cache is being deleted.
cacheStatusValues[5] = 'obsolete';


//log event to test the app cache functionality
function logEvent(e){
	var online, 
		status, 
		type,
		message;
	online = (navigator.onLine) ? 'yes' : 'no';
	status = cacheStatusValues[cache.status];
	type = e.type;
	message = 'online:' + online;
	message+= ',event:' + type;
	message+=',status:' + status;
	if(type == 'error' && navigator.onLine){
		message+= '(prolly a syntax error in the manifest)';
		};
	console.log(message);
};

// EVENT LISTENERS

// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
  cache.addEventListener('updateready', function(e) {
    if (cache.status === cache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      // Swap it in and reload the page to get the new hotness.
      cache.swapCache();
	  alert('The App Cache gotsah new version!');
      if (confirm('A new version of this site is available. Load it?')) {
        window.location.reload();
		console.log('the window location is reloading');
      }
    } else {
      // Manifest didn't changed. Nothing new to server.
	  console.log('Nuttin\' changed in the Manifest.');
    }
	console.log('the cache has been swapped');
  }, false);
}, false);


//cached - The resources listed in the manifest have 
//been fully downloaded, and the application is now 
//cached locally.
cache.addEventListener('cached',logEvent,false);

cache.addEventListener('checking',logEvent,false);

cache.addEventListener('downloading',logEvent,false);

//error - An error occurred at some point - this 
//could be caused by a number of things. This will 
//always be the last event in the sequence.
cache.addEventListener('error',logEvent,false);

cache.addEventListener('noupdate',logEvent,false);

cache.addEventListener('obsolete',logEvent,false);

//progress - The browser had downloaded and cached 
//an asset. This is fired once for every file that 
//is downloaded (including the current page which 
//is cached implicitly).
cache.addEventListener('progress',logEvent,false);

cache.addEventListener('updateready',logEvent,false);
