function _measureText(font, text) {
  var div = document.createElement("div");
  div.innerHTML = '';
  div.appendChild(document.createTextNode(text));
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
    size.x = Math.round((size.x + 3) / 2) * 2;
    size.y = Math.round((size.y + 3) / 2) * 2;
  }

  return size;
}

function _drawFont(g, x, y, font, text, color) {
  g.font = font.weight + ' ' + font.size + 'pt ' + font.family;

  if ((font.style & Font.STYLE.OUTLINE) !== 0) {
    g.fillStyle = 'black';
    g.fillText(text, x+0, y+1);
    g.fillText(text, x+1, y+0);
    g.fillText(text, x+0, y+0);
    g.fillText(text, x+2, y+1);
    g.fillText(text, x+1, y+2);
    g.fillText(text, x+2, y+2);
  }

  g.fillStyle = color;
  g.fillText(text, x+1, y+1);
}

function _drawCharNamePlate(g, gameObject) {
  var font = Font.getFont(Font.FONT.NORMAL_OUTLINE);
  var name = gameObject.name;

  if (gameObject.selected) {
    name = '|> ' + name + ' <|';
  }

  var size = _measureText(font, name);
  _drawFont(g, 128/2 - size.x/2, 64+10-size.y, font, name, 'white');
}

function _drawNpcNamePlate(g, gameObject) {
  var topText, bottomText;
  var name = gameObject.name;
  var idx = name.indexOf(']');
  if (idx !== -1) {
    topText = name.substr(0, idx + 1).trim();
    bottomText = name.substr(idx + 1).trim();
  } else {
    topText = '';
    bottomText = name;
  }

  if (gameObject.selected) {
    bottomText = '|> ' + bottomText + ' <|';
  }

  var curY = 64 + 10;

  if (bottomText) {
    var font = Font.getFont(Font.FONT.NORMAL_OUTLINE);
    var size = _measureText(font, bottomText);
    curY -= size.y - 3;
    _drawFont(g, 128/2 - size.x/2, curY, font, bottomText, 'white');
  }

  if (topText) {
    var font = Font.getFont(Font.FONT.NORMAL_OUTLINE);
    var size = _measureText(font, topText);
    curY -= size.y - 3;
    _drawFont(g, 128/2 - size.x/2, curY, font, topText, '#ffceae');
  }
}

function _drawNamePlate(g, gameObject) {
  if (gameObject instanceof CharObject) {
    _drawCharNamePlate(g, gameObject);
  } else if (gameObject instanceof MobObject) {
    _drawNpcNamePlate(g, gameObject);
  }
}

ui.createNamePlate = function(gameObject) {
  var bitmap = document.createElement('canvas');
  var g = bitmap.getContext('2d');
  bitmap.width = 128;
  bitmap.height = 64;
  var texture = new THREE.Texture(bitmap);

  function __update() {
    g.clearRect(0, 0, 128, 64);
    _drawNamePlate(g, gameObject);
    texture.needsUpdate = true;
  }
  __update();
  gameObject.on('name_changed', __update);
  gameObject.on('selected', __update);
  gameObject.on('deselected', __update);

  return texture;
};
