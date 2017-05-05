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
    lines[i].vector = new Victor(line.x2-line.x1,line.y2-line.y1);
    lines[i].slope = ( (line.y2-line.y1)/(line.x2-line.x1) ).toFixed(1);
    // if( Math.abs(lines[i].slope) === Infinity ){
    //
    // }
    lines[i].constant = ( line.y1-( (line.y2-line.y1)/(line.x2-line.x1) )*line.x1 ).toFixed(1);
    // if( Math.abs(lines[i].constant) === Infinity ){
    //   lines[i].constant = line.x1;
    // }
  });
  console.log(lines);
  drawGameWorld();
  drawBall();

  setInterval(function(){

    clearCanvas();
    for(var i=1;i<=ball.speed;i++){
      moveBall();
    }
    collisionDetect(lines);
    drawGameWorld();
    drawBall();

  },10)

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

  function moveBall(){
    ball.cx += ball.vector.x;
    ball.cy += ball.vector.y;
  }

  function collisionDetect(lines){

    lines.forEach(function(line,i){

      var distoPoint1 = new Victor(line.x1-ball.cx,line.y1-ball.cy).length();
      var distoPoint2 = new Victor(line.x2-ball.cx,line.y2-ball.cy).length();

      var parallelLine_constant = ball.cy-line.slope*ball.cx;

      // if( Math.abs(parallelLine_constant) === Infinity ){
      //   parallelLine_constant = ball.cx;
      //   // console.log('here');
      // }

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


      // console.log(ballCenterInsideLine);
      // console.log(distanceFromCenterToLine);

      if(ballCenterInsideLine){
        // console.log(distanceFromCenterToLine);
      }

      if(ballCenterInsideLine && distanceFromCenterToLine <= ball.r){


          console.log('bouncing on radius');

          console.log( (distanceFromCenterToLine - ball.r).toFixed(1) );

          if( distanceFromCenterToLine - ball.r === 0){

            bouncing(line,false);

          }else {

            bouncing(line,true);
          }


          return false;


      }



      if(line.vector.length().toFixed(1) === (distoPoint1+distoPoint2).toFixed(1)){



        // console.log(parallelLine_constant);
        // console.log( Math.abs(line.constant-parallelLine_constant) )

        // console.log('bouncing');
        // bouncing(line);
        return false;

      }
    })

  }

  function predictIntersect(lines){
    lines.forEach(function(line,i){

      var slope2 = (line.y2-line.y1)/(line.x2-line.x1);
      var constant2 = line.y1-slope2*line.x1;

      L2: y=slope

    })
  }

  function bouncing(line,crossLine){

    var enterAngle = ball.vector.horizontalAngleDeg()-line.vector.horizontalAngleDeg();
    if(Math.abs(enterAngle) < 5 && Math.abs(enterAngle) >= 0) enterAngle = 5;
    if(Math.abs(enterAngle) > -5 && Math.abs(enterAngle) < 0) enterAngle = -5;

    // console.log('enter vector:(x:'+ball.vector.x+',y:'+ball.vector.y+')');
    ball.vector = ball.vector.rotateDeg(-2*enterAngle);
    // console.log('bounce vector:(x:'+ball.vector.x+',y:'+ball.vector.y+')');
    console.log(crossLine);
    if(crossLine){
      console.log('cross line');
      var keepMoving = true;
      while (keepMoving) {

        moveBall();

        var parallelLine_constant = ball.cy-line.slope*ball.cx;
      if( Math.abs(line.slope) === Infinity ){

        var distanceFromCenterToLine = Math.abs(ball.cx-line.x1);

      }else {

        var distanceFromCenterToLine = Math.abs(line.constant-parallelLine_constant)/Math.sqrt(1+line.slope*line.slope);
      }



        if(distanceFromCenterToLine > ball.r){
          console.log(distanceFromCenterToLine);
          keepMoving = false
        }

      }
    }

  }

  function clearCanvas(){
    ctx.clearRect(-300, -300, 600, 600);
  }

})
