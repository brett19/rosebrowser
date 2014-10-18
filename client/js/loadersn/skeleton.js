'use strict';

function NSkeleton() {
}

NSkeleton._cache = new IndexedCache(function(hashKey, callback) {
  var path = 'cache/skeleton/' + hashKey.toString(16);
  SkeletonData.load(path, callback);
});

NSkeleton.load = function(hashKey, callback) {
  NSkeleton._cache.get(hashKey, function(data) {
    callback(null, data);
  });
};
