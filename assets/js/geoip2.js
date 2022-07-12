"use strict";var geoip2=function(){var e={};function t(e,t,n,r){this.successCallback=e,this.errorCallback=t,this.type=r}t.prototype.returnSuccess=function(e){this.successCallback&&"function"==typeof this.successCallback&&this.successCallback(this.fillInObject(JSON.parse(e)))},t.prototype.returnError=function(e){this.errorCallback&&"function"==typeof this.errorCallback&&(e||(e={error:"Unknown error"}),this.errorCallback(e))};var n={country:[["continent","Object","names","Object"],["country","Object","names","Object"],["registered_country","Object","names","Object"],["represented_country","Object","names","Object"],["traits","Object"]],city:[["city","Object","names","Object"],["continent","Object","names","Object"],["country","Object","names","Object"],["location","Object"],["postal","Object"],["registered_country","Object","names","Object"],["represented_country","Object","names","Object"],["subdivisions","Array",0,"Object","names","Object"],["traits","Object"]]};return t.prototype.fillInObject=function(e){for(var t="country"===this.type?n.country:n.city,r=0;r<t.length;r++)for(var o=t[r],s=e,i=0;i<o.length;i+=2){var c=o[i];s[c]||(s[c]="Object"===o[i+1]?{}:[]),s=s[c]}try{Object.defineProperty(e.continent,"continent_code",{enumerable:!1,get:function(){return this.code},set:function(e){this.code=e}})}catch(t){e.continent.code&&(e.continent.continent_code=e.continent.code)}if("country"!==this.type)try{Object.defineProperty(e,"most_specific_subdivision",{enumerable:!1,get:function(){return this.subdivisions[this.subdivisions.length-1]},set:function(e){this.subdivisions[this.subdivisions.length-1]=e}})}catch(t){e.most_specific_subdivision=e.subdivisions[e.subdivisions.length-1]}return e},t.prototype.getGeoIPResult=function(){var e,t=window.location.hostname,n=t.split(".").reverse();"maxmind"!==n[1]||"com"!==n[0]&&"dev"!==n[0]||"www.maxmind.com"===t||(e=t);var r,o=this,s=new window.XMLHttpRequest,i="https://"+(e||"geoip-js.com")+"/geoip/v2.1/"+this.type+"/me?",c={referrer:location.protocol+"//"+location.hostname};if(!this.alreadyRan){for(r in this.alreadyRan=1,c)c.hasOwnProperty(r)&&c[r]&&(i+=r+"="+encodeURIComponent(c[r])+"&");i=i.substring(0,i.length-1),s.open("GET",i,!0),s.onload=function(){if(void 0===s.status||200===s.status)o.returnSuccess(s.responseText);else{var e,t=s.hasOwnProperty("contentType")?s.contentType:s.getResponseHeader("Content-Type");if(/json/.test(t)&&s.responseText.length)try{e=JSON.parse(s.responseText)}catch(t){e={code:"HTTP_ERROR",error:"The server returned a "+s.status+" status with an invalid JSON body."}}else e=s.responseText.length?{code:"HTTP_ERROR",error:"The server returned a "+s.status+" status with the following body: "+s.responseText}:{code:"HTTP_ERROR",error:"The server returned a "+s.status+" status but either the server did not return a body or this browser is a version of Internet Explorer that hides error bodies."};o.returnError(e)}},s.ontimeout=function(){o.returnError({code:"HTTP_TIMEOUT",error:"The request to the GeoIP2 web service timed out."})},s.onerror=function(){o.returnError({code:"HTTP_ERROR",error:"There was a network error receiving the response from the GeoIP2 web service."})},s.send(null)}},e.country=function(e,n,r){new t(e,n,r,"country").getGeoIPResult()},e.city=function(e,n,r){new t(e,n,r,"city").getGeoIPResult()},e.insights=function(e,n,r){new t(e,n,r,"insights").getGeoIPResult()},e}();
//# sourceMappingURL=geoip2.js.map
