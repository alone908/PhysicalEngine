
var engine = new engine();

engine.createGameWorld('canvas','xmls/map.xmls');
engine.updateFrame(1);

document.getElementById('run').onclick = function(e){
  engine.updateFrame(1);
}
document.getElementById('stop').onclick = function(e){
  engine.stop();
}
document.getElementById('reload').onclick = function(e){
  engine.reload();
  document.getElementById('size').setAttribute('value','10');
  document.getElementById('speed').setAttribute('value','1');
  document.getElementById('hideLine').checked = true;
  document.getElementById('hidePolyline').checked = true;
  document.getElementById('hidePolygon').checked = true;
  document.getElementById('hideRect').checked = true;
  document.getElementById('detectLine').checked = true;
  document.getElementById('detectPolyline').checked = true;
  document.getElementById('detectPolygon').checked = true;
  document.getElementById('detectRect').checked = true;
  document.getElementById('destroy').checked = false;
}
document.getElementById('addSize').onclick = function(e){
  var size = Number(document.getElementById('size').getAttribute('value'));
  if(size >= 0 && size < 30 ){
    document.getElementById('size').setAttribute('value',size+1);
    engine.ball.r = size+1;
  }
}
document.getElementById('minusSize').onclick = function(e){
  var size = Number(document.getElementById('size').getAttribute('value'));
  if(size > 0 && size <= 30 ){
    document.getElementById('size').setAttribute('value',size-1);
    engine.ball.r = size-1;
  }
}
document.getElementById('addSpeed').onclick = function(e){
  var speed = Number(document.getElementById('speed').getAttribute('value'));
  if(speed >= 0 && speed < 10 ){
    document.getElementById('speed').setAttribute('value',Number( (speed+1).toFixed(1) ));
    engine.ball.speed = Number( (speed+1).toFixed(1) );
  }
}
document.getElementById('minusSpeed').onclick = function(e){
  var speed = Number(document.getElementById('speed').getAttribute('value'));
  if(speed > 0 && speed <= 10 ){
    document.getElementById('speed').setAttribute('value',Number( (speed-1).toFixed(1) ));
    engine.ball.speed = Number( (speed-1).toFixed(1) );
  }
}
document.getElementById('hideLine').onclick = function(e){
  if(this.checked){
    engine.svg.showLine = true;
  }else if (!this.checked) {
    engine.svg.showLine = false;
  }
}
document.getElementById('hidePolyline').onclick = function(e){
  if(this.checked){
    engine.svg.showPolyline = true;
  }else if (!this.checked) {
    engine.svg.showPolyline = false;
  }
}
document.getElementById('hidePolygon').onclick = function(e){
  if(this.checked){
    engine.svg.showPolygon = true;
  }else if (!this.checked) {
    engine.svg.showPolygon = false;
  }
}
document.getElementById('hideRect').onclick = function(e){
  if(this.checked){
    engine.svg.showRect = true;
  }else if (!this.checked) {
    engine.svg.showRect = false;
  }
}
document.getElementById('detectLine').onclick = function(e){
  if(this.checked){
    engine.detectOnLine = true;
  }else if (!this.checked) {
    engine.detectOnLine = false;
  }
}
document.getElementById('detectPolyline').onclick = function(e){
  if(this.checked){
    engine.detectOnPolyline = true;
  }else if (!this.checked) {
    engine.detectOnPolyline = false;
  }
}
document.getElementById('detectPolygon').onclick = function(e){
  if(this.checked){
    engine.detectOnPolygon = true;
  }else if (!this.checked) {
    engine.detectOnPolygon = false;
  }
}
document.getElementById('detectRect').onclick = function(e){
  if(this.checked){
    engine.detectOnRect = true;
  }else if (!this.checked) {
    engine.detectOnRect = false;
  }
}
document.getElementById('destroy').onclick = function(e){
  if(this.checked){
    engine.destroyTarget = true;
  }else if (!this.checked) {
    engine.destroyTarget = false;
  }
}
