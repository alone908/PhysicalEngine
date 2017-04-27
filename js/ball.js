$(document).ready(function(){


  var canvas = document.getElementById( 'canvas' );
  var ctx = canvas.getContext('2d');
  ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
  ctx.transform(1, 0, 0, -1, 0, 0);

  var ball = {cx:-250,cy:0,r:15,vector:{x:0,y:1}};

  var lines = [
    {x1:-300,y1:150,x2:-150,y2:300},
    {x1:150,y1:300,x2:300,y2:150},
    {x1:150,y1:-300,x2:300,y2:-150},
    {x1:-300,y1:-150,x2:-150,y2:-300},

    {x1:-290,y1:150,x2:-290,y2:-150},
    {x1:-150,y1:290,x2:150,y2:290},
    {x1:290,y1:150,x2:290,y2:-150},
    {x1:-150,y1:-290,x2:150,y2:-290}
  ]

  lines.forEach(function(line,i){
    lines[i].length = lineLength(lines[i].x1,lines[i].y1,lines[i].x2,lines[i].y2);
    lines[i].angle = lineAngleToAxis(lines[i].x1,lines[i].y1,lines[i].x2,lines[i].y2);
  });

  console.log(lines);

  drawGameWorld();
  drawBall();

  function moveBall(){
    ball.cx += ball.vector.x;
    ball.cy += ball.vector.y;
  }

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

  function clearCanvas(){
    ctx.clearRect(-300, -300, 600, 600);
  }

  function collisionDetect(lines){

    lines.forEach(function(line,i){

      var distoPoint1 = lineLength(ball.cx,ball.cy,line.x1,line.y1);
      var distoPoint2 = lineLength(ball.cx,ball.cy,line.x2,line.y2);

      if(line.length.toFixed(1) === (distoPoint1+distoPoint2).toFixed(1)){
        console.log('collision');
        bouncing(line);
        return false;
      }

    })

  }

  function bouncing(line){

    var vectorLength = lineLength(0,0,ball.vector.x,ball.vector.y);
    var vectorAngle = lineAngleToAxis(0,0,ball.vector.x,ball.vector.y);


    var newX = -ball.vector.x;
    var newY = -ball.vector.y;

    //
    // var enterAngle = vectorAngle-line.angle;
    // var leaveAngle = enterAngle;
    //
    // console.log('vector angle:'+vectorAngle);
    // console.log('enter angle:'+enterAngle);
    //
    // var newX = (ball.vector.x*Math.cos(2*leaveAngle*Math.PI/180)-ball.vector.y*Math.sin(2*leaveAngle*Math.PI/180));
    // var newY = (ball.vector.x*Math.sin(2*leaveAngle*Math.PI/180)+ball.vector.y*Math.cos(2*leaveAngle*Math.PI/180));

    var reflectVector = {x:newX,y:newY}
    console.log(reflectVector);
    ball.vector = reflectVector;

  }


  function lineLength(x1,y1,x2,y2){
    return Math.hypot( (x2-x1), (y2-y1) );
  }

  function lineAngleToAxis(x1,y1,x2,y2){
    var dy = y2 - y1;
    var dx = x2 - x1;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta;
  }

  setInterval(function(){

    clearCanvas();
    moveBall();
    collisionDetect(lines);
    drawGameWorld();
    drawBall();

  },1)

})
