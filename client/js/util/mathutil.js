var MathUtil = {};

function slerp1d(a, b) {
  var twoPi = Math.PI * 2;
  var targetDir = ((a % twoPi) + twoPi) % twoPi;
  var thisDir = ((b % twoPi) + twoPi) % twoPi;
  var deltaDir = targetDir - thisDir;
  var absDeltaDir = Math.abs(deltaDir);
  var signDeltaDir = absDeltaDir === deltaDir ? +1 : -1;
  if (absDeltaDir > Math.PI) {
    deltaDir = signDeltaDir * (2 * Math.PI - absDeltaDir) * -1;
  }
  return deltaDir;
}
MathUtil.slerp1d = slerp1d;

module.exports = MathUtil;
