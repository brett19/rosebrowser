var Font = function(family, weight, size, style) {
  this.family = family;
  this.weight = weight;
  this.size = size;
  this.style = style;
};

Font.FONT = {
  NORMAL:          0,
  LARGE:           1,
  SMALL:           2,
  NORMAL_BOLD:     3,
  LARGE_BOLD:      4,
  SMALL_BOLD:      5,
  TITLE:           6, // Not loaded
  DESCRIPTION:     7, // Not loaded
  NORMAL_OUTLINE:  8,
  OUTLINE_BOLD_18: 9,
  OUTLINE_BOLD_14: 10,
  OUTLINE_BOLD_24: 11,
  OUTLINE_BOLD_16: 12,
  OUTLINE_BOLD_11: 13,
  BOLD_12:         14,
  BOLD_14:         15
};

Font.SIZE = {
  SMALL: 8,
  NORMAL: 9,
  LARGE: 12,
  FIXED_11: 11,
  FIXED_12: 12,
  FIXED_14: 14,
  FIXED_16: 16,
  FIXED_18: 18,
  FIXED_24: 24
};

Font.WEIGHT = {
  NORMAL: 'normal',
  BOLD: 'bold'
};

Font.STYLE = {
  NORMAL: 0,
  OUTLINE: 1
};

Font.getFont = function(id) {
  var family = 'Arial';
  var weight = Font.WEIGHT.NORMAL;
  var size = Font.SIZE.NORMAL;
  var style = Font.STYLE.NORMAL;

  switch(id) {
    case Font.FONT.NORMAL:
      break;
    case Font.FONT.NORMAL_BOLD:
      weight = Font.WEIGHT.BOLD;
      break;
    case Font.FONT.NORMAL_OUTLINE:
      style = Font.STYLE.OUTLINE;
      break;
    case Font.FONT.SMALL:
      size = Font.SIZE.SMALL;
      break;
    case Font.FONT.SMALL_BOLD:
      size   = Font.SIZE.SMALL;
      weight = Font.WEIGHT.BOLD;
      break;
    case Font.FONT.LARGE:
      size   = Font.SIZE.LARGE;
      weight = Font.WEIGHT.BOLD;
      break;
    case Font.FONT.LARGE_BOLD:
      size   = Font.SIZE.LARGE;
      weight = Font.WEIGHT.BOLD;
      break;
    case Font.FONT.OUTLINE_BOLD_11:
      size   = Font.SIZE.FIXED_11;
      weight = Font.WEIGHT.BOLD;
      style  = Font.STYLE.OUTLINE;
      break;
    case Font.FONT.OUTLINE_BOLD_14:
      size   = Font.SIZE.FIXED_14;
      weight = Font.WEIGHT.BOLD;
      style  = Font.STYLE.OUTLINE;
      break;
    case Font.FONT.OUTLINE_BOLD_16:
      size   = Font.SIZE.FIXED_16;
      weight = Font.WEIGHT.BOLD;
      style  = Font.STYLE.OUTLINE;
      break;
    case Font.FONT.OUTLINE_BOLD_18:
      size   = Font.SIZE.FIXED_18;
      weight = Font.WEIGHT.BOLD;
      style  = Font.STYLE.OUTLINE;
      break;
    case Font.FONT.OUTLINE_BOLD_24:
      size   = Font.SIZE.FIXED_24;
      weight = Font.WEIGHT.BOLD;
      style  = Font.STYLE.OUTLINE;
      break;
    case Font.FONT.BOLD_12:
      size   = Font.SIZE.FIXED_12;
      weight = Font.WEIGHT.BOLD;
      break;
    case Font.FONT.BOLD_14:
      size   = Font.SIZE.FIXED_14;
      weight = Font.WEIGHT.BOLD;
      break;
  }

  return new Font(family, weight, size, style);
};

// AHAHAHAHAHAHHAHAHAHAHAH
function createTEXTure(fontID, text)
{
  var font = Font.getFont(fontID);
  var div = document.createElement("div");
  div.innerHTML = text;
  div.style.position = 'absolute';
  div.style.top = '-9999px';
  div.style.left = '-9999px';
  div.style.fontFamily = font.family;
  div.style.fontWeight = font.weight;
  div.style.fontSize = font.size + 'pt';
  document.body.appendChild(div);
  var size = {x: div.offsetWidth, y: div.offsetHeight};
  document.body.removeChild(div);

  if ((font.style & Font.STYLE.OUTLINE) !== 0) {
    size.x = Math.round((size.x + 1) / 2) * 2;
    size.y = Math.round((size.y + 1) / 2) * 2;
  }

  var bitmap = document.createElement('canvas');
  var g = bitmap.getContext('2d');
  bitmap.width = size.x;
  bitmap.height = size.y;
  g.font = font.weight + ' ' + font.size + 'pt ' + font.family;

  if ((font.style & Font.STYLE.OUTLINE) !== 0) {
    g.fillStyle = 'black';
    g.fillText(text, 0, size.y / 2 + 2);
    g.fillText(text, 1, size.y / 2 + 1);
    g.fillText(text, 0, size.y / 2 + 1);
    g.fillText(text, 2, size.y / 2 + 2);
    g.fillText(text, 1, size.y / 2 + 3);
    g.fillText(text, 2, size.y / 2 + 3);
  }

  g.fillStyle = 'white';
  g.fillText(text, 1, size.y/2+2);

  var texture = new THREE.Texture(bitmap);
  texture.needsUpdate = true;
  return texture;
}
Font.createTEXTure = createTEXTure;

module.exports = Font;
