'use strict';

var rutil = {};

function enumToName(list, val) {
  for (var i in list) {
    if (list.hasOwnProperty(i)) {
      if (list[i] === val) {
        return i;
      }
    }
  }
  return 'unknown:' + val;
}
rutil.enumToName = enumToName;

function debugValidateProps(obj, props) {
  for (var i = 0; i < props.length; ++i) {
    var propVal = eval('obj.' + props[i][0]);
    if (propVal === undefined) {
      console.warn('Expected property to be set: ', props[i][0]);
      console.trace();
      continue;
    }
    if (propVal instanceof Int64) {
      // We can cheat since the check value has to be 32bit anyways.
      if (propVal.hi !== 0 ||
        props[i][1] && propVal.lo < props[i][1] ||
        props[i][2] && propVal.lo > props[i][2]) {
        console.warn('Expected property', props[i][0], 'to be between', props[i][1], 'and', props[i][2], '(got:0x' + propVal.toString(16) + ')');
        console.trace();
        continue;
      }
    } else {
      if (props[i][1] && propVal < props[i][1] ||
          props[i][2] && propVal > props[i][2]) {
        console.warn('Expected property', props[i][0], 'to be between', props[i][1], 'and', props[i][2], '(got:' + propVal + ')');
        console.trace();
        continue;
      }
    }
  }
}
rutil.debugValidateProps = debugValidateProps;

rutil.VIRTUAL_FUNC = function() {
  throw new Error('Pure virtual function was invoked');
};

module.exports = rutil;
