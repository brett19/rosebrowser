'use strict';

function NAnimation() {
}

NAnimation._cache = new IndexedCache(function(hashKey, callback) {
  var path = 'cache/animation/' + hashKey.toString(16);
  AnimationData.load(path, callback);
});

NAnimation.load = function(hashKey, callback) {
  NAnimation._cache.get(hashKey, function(data) {
    callback(null, data);
  });
};
