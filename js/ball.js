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
              speed:1,
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
    lines[i].vector = new Victor(lines[i].x2-lines[i].x1,lines[i].y2-lines[i].y1);
  });

  drawGameWorld();
  drawBall();

  setInterval(function(){

    clearCanvas();
    moveBall();
    collisionDetect(lines);
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
    ctx.stroke();
  }

  function moveBall(){
    ball.cx += ball.vector.x*ball.speed;
    ball.cy += ball.vector.y*ball.speed;
  }

  function collisionDetect(lines){

    lines.forEach(function(line,i){

      var distoPoint1 = new Victor(line.x1-ball.cx,line.y1-ball.cy).length();
      var distoPoint2 = new Victor(line.x2-ball.cx,line.y2-ball.cy).length();

      if(line.vector.length().toFixed(1) === (distoPoint1+distoPoint2).toFixed(1)){
        console.log('bouncing');
        bouncing(line);
        return false;
      }
    })

  }

  function bouncing(line){

    var enterAngle = ball.vector.horizontalAngleDeg()-line.vector.horizontalAngleDeg();

    console.log('enter vector:(x:'+ball.vector.x+',y:'+ball.vector.y+')');
    ball.vector = ball.vector.rotateDeg(-2*enterAngle);
    console.log('bounce vector:(x:'+ball.vector.x+',y:'+ball.vector.y+')');

  }

  function clearCanvas(){
    ctx.clearRect(-300, -300, 600, 600);
  }

})
