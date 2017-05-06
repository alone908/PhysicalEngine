$(document).ready(function(){

  var canvas = document.getElementById( 'canvas' );
  var ctx = canvas.getContext('2d');
  ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
  ctx.transform(1, 0, 0, -1, 0, 0);

  if(Math.random() < 0.5){var sign1=-1}else { var sign1=1 }
  if(Math.random() < 0.5){var sign2=-1}else { var sign2=1 }

  var initialX = sign1*Math.random();
  var initialY = sign2*Math.sqrt( 1-initialX*initialX );
  var initialVector = new Victor(initialX,initialY);

  var ball = {cx:0,
              cy:0,
              r:15,
              speed:3,
              vector:initialVector};

  var lines = [
    {x1:-300,y1:150,x2:-150,y2:300},
    {x1:150,y1:300,x2:300,y2:150},
    {x1:150,y1:-300,x2:300,y2:-150},
    {x1:-300,y1:-150,x2:-150,y2:-300},
    {x1:-300,y1:150,x2:-300,y2:-150},
    {x1:-150,y1:300,x2:150,y2:300},
    {x1:300,y1:150,x2:300,y2:-150},
    {x1:-150,y1:-300,x2:150,y2:-300},
    {x1:-250,y1:50,x2:-150,y2:200},
    {x1:123,y1:-66,x2:-59,y2:73},
    {x1:-13,y1:-266,x2:36,y2:73},
    {x1:-214,y1:189,x2:-142,y2:-34},
    {x1:84,y1:69,x2:142,y2:199},
    {x1:84,y1:209,x2:142,y2:9},
  ]

  lines.forEach(function(line,i){
    lines[i].vector = new Victor(line.x2-line.x1,line.y2-line.y1);
    lines[i].slope = Number( ( (line.y2-line.y1)/(line.x2-line.x1) ).toFixed(1) );
    lines[i].constant = Number( ( line.y1-( (line.y2-line.y1)/(line.x2-line.x1) )*line.x1 ).toFixed(1) );
  });
  console.log(lines);
  drawGameWorld();
  drawBall();

  var frameTimer = setInterval(function(){

    clearCanvas();
    // for(var i=1;i<=ball.speed;i++){
      moveBall();
      collisionDetect(lines);
    // }
    drawGameWorld();
    drawBall();

  },1)

  function drawGameWorld(){
    lines.forEach(function(line,i){
      ctx.beginPath();
      ctx.moveTo( lines[i].x1,lines[i].y1 );
      ctx.lineTo( lines[i].x2,lines[i].y2 );
      ctx.stroke();
    });
  }

  function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.cx,ball.cy,ball.r,0,2*Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.stroke();
  }

  function moveBall(backwards=false,speed=null){
    if(speed === null){
      if(backwards){
        ball.cx -= ball.vector.x*ball.speed;
        ball.cy -= ball.vector.y*ball.speed;
      }else if (!backwards) {
        ball.cx += ball.vector.x*ball.speed;
        ball.cy += ball.vector.y*ball.speed;
      }
    }else if (speed !== null) {
      if(backwards){
        ball.cx -= ball.vector.x*speed;
        ball.cy -= ball.vector.y*speed;
      }else if (!backwards) {
        ball.cx += ball.vector.x*speed;
        ball.cy += ball.vector.y*speed;
      }
    }
  }

  function collisionDetect(lines){

    lines.forEach(function(line,i){

      var distoPoint1 = new Victor(line.x1-ball.cx,line.y1-ball.cy).length();
      var distoPoint2 = new Victor(line.x2-ball.cx,line.y2-ball.cy).length();
      var parallelLine_constant = ball.cy-line.slope*ball.cx;

      if( Number(distoPoint1.toFixed(1)) <= ball.r || Number(distoPoint2.toFixed(1)) <= ball.r ){

        if( Number(distoPoint1.toFixed(1)) === ball.r  || Number(distoPoint2.toFixed(1)) === ball.r ){
          bouncing(line,false,true);
        }else {
          bouncing(line,true,true);
        }

        return false;

      }else {

        var ballCenterInsideLine = true;

        if( line.x1 > line.x2 ){
          if(ball.cx > line.x1) ballCenterInsideLine = false;
          if(ball.cx < line.x2) ballCenterInsideLine = false;
        }else if (line.x2 > line.x1) {
          if(ball.cx > line.x2) ballCenterInsideLine = false;
          if(ball.cx < line.x1) ballCenterInsideLine = false;
        }else if (line.x1 == line.x2) {

        }

        if( line.y1 > line.y2 ){
          if(ball.cy > line.y1) ballCenterInsideLine = false;
          if(ball.cy < line.y2) ballCenterInsideLine = false;
        }else if (line.y2 > line.y1) {
          if(ball.cy > line.y2) ballCenterInsideLine = false;
          if(ball.cy < line.y1) ballCenterInsideLine = false;
        }

        if( Math.abs(line.slope) === Infinity ){
          var distanceFromCenterToLine = Math.abs(ball.cx-line.x1);
        }else {
          var distanceFromCenterToLine = Math.abs(line.constant-parallelLine_constant)/Math.sqrt(1+line.slope*line.slope);
        }

        if(ballCenterInsideLine && distanceFromCenterToLine <= ball.r){
            if( Number( (distanceFromCenterToLine - ball.r).toFixed(1) ) === 0){
              bouncing(line,false,false);
            }else {
              bouncing(line,true,false);
            }
            return false;
        }

      }

    })

  }

  function predictIntersect(lines){
    lines.forEach(function(line,i){

    })
  }

  function bouncing(line,crossLine,endPoint){

    var enterAngle = ball.vector.horizontalAngleDeg()-line.vector.horizontalAngleDeg();

    var distoPoint1 = new Victor(line.x1-ball.cx,line.y1-ball.cy);
    var distoPoint2 = new Victor(line.x2-ball.cx,line.y2-ball.cy);

    if(endPoint){

      var keepMoving = true;

      while(keepMoving){
        moveBall(true,1);
        distoPoint1.x = line.x1-ball.cx;
        distoPoint1.y = line.y1-ball.cy;
        distoPoint2.x = line.x2-ball.cx;
        distoPoint2.y = line.y2-ball.cy;
        if( Number(distoPoint1.length().toFixed(1)) > ball.r || Number(distoPoint2.length().toFixed(1)) > ball.r ){
          keepMoving = false
        }
      }

      if( enterAngle > 135 || (enterAngle < 45 && enterAngle > -45) || enterAngle < -135){
        ball.vector = ball.vector.rotateDeg(-180+2*enterAngle);
      }else {
        ball.vector = ball.vector.rotateDeg(-2*enterAngle);
      }

    }else if (!endPoint) {

      if(crossLine){

        var keepMoving = true;
        while(keepMoving){
          moveBall(true);
          var parallelLine_constant = ball.cy-line.slope*ball.cx;
          if( Math.abs(line.slope) === Infinity ){
            var distanceFromCenterToLine = Math.abs(ball.cx-line.x1);
          }else {
            var distanceFromCenterToLine = Math.abs(line.constant-parallelLine_constant)/Math.sqrt(1+line.slope*line.slope);
          }
          if(distanceFromCenterToLine > ball.r){
            keepMoving = false
          }
        }

      }

      ball.vector = ball.vector.rotateDeg(-2*enterAngle);

    }

  }

  function radiuToDegree(r){
    return r*180/Math.PI;
  }

  function degreeToRadiu(d) {
    return d*Math.PI/180;
  }

  function clearCanvas(){
    ctx.clearRect(-300, -300, 600, 600);
  }

})
