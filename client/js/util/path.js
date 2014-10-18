var path = {};

function normalizePath(path) {
  path = path.replace(/\\/g, '/');
  path = path.replace(/\/\//g, '/');
  return path;
};
path.normalize = normalizePath;

module.exports = path;
