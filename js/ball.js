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
              speed:10,
              vector:initialVector};

  var lines = [
    {x1:-300,y1:150,x2:-150,y2:300,id:2},
    {x1:150,y1:300,x2:300,y2:150,id:4},
    {x1:150,y1:-300,x2:300,y2:-150,id:6},
    {x1:-300,y1:-150,x2:-150,y2:-300,id:8},
    {x1:-300,y1:300,x2:-300,y2:-300,id:1},
    {x1:-300,y1:300,x2:300,y2:300,id:3},
    {x1:300,y1:300,x2:300,y2:-300,id:5},
    {x1:-300,y1:-300,x2:300,y2:-300,id:7},
    {x1:-250,y1:50,x2:-150,y2:200,id:10},
    {x1:123,y1:-66,x2:-59,y2:73,id:11},
    {x1:-13,y1:-266,x2:36,y2:73,id:12},
    {x1:-214,y1:189,x2:-142,y2:-34,id:9},
    {x1:84,y1:69,x2:142,y2:199,id:14},
    {x1:84,y1:209,x2:142,y2:9,id:13},
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
      if(predictLines === null){
        collisionDetect(lines);
      }else {
        collisionDetect(predictLines);
      }
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

  function collisionDetectPredict(lines,ball){

      lines.forEach(function(line,i){

        var distoPoint1 = new Victor(line.x1-ball.cx,line.y1-ball.cy).length();
        var distoPoint2 = new Victor(line.x2-ball.cx,line.y2-ball.cy).length();
        var parallelLine_constant = ball.cy-line.slope*ball.cx;

        if( Number(distoPoint1.toFixed(1)) <= ball.r || Number(distoPoint2.toFixed(1)) <= ball.r ){

          if( Number(distoPoint1.toFixed(1)) === ball.r  || Number(distoPoint2.toFixed(1)) === ball.r ){
            return line;
          }else {
            return line;
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
              return line;
            }else {
              return line;
            }
            return false;
          }

        }

      })

      return false;
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

    predictIntersect(line);

  }

  var predictLines = null;

  function predictIntersect(currentLine){

    // var predictBall = ball;
    // var keepMoving = true;
    //
    // while (keepMoving) {
    //
    //   predictBall.cx += ball.vector.x*ball.speed*10;
    //   predictBall.cy += ball.vector.y*ball.speed*10;
    //   var result = collisionDetectPredict(lines,predictBall);
    //
    //   if(result !== false){
    //     predictLines.push(result);
    //     keepMoving = false;
    //   }
    //
    // }

    // console.log(predictLines);

    if(ball.vector.x > 0 && ball.vector.y > 0){
      result1 = checkLineIntersection(-300,300,300,300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      result2 = checkLineIntersection(300,300,300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      if(result1.onLine1){
        var lastPoint = {x:result1.x,y:result1.y};
      }else if (result2.onLine1) {
        var lastPoint = {x:result2.x,y:result2.y};
      }

    }else if (ball.vector.x < 0 && ball.vector.y < 0) {
      result1 = checkLineIntersection(-300,300,-300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      result2 = checkLineIntersection(-300,-300,300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      if(result1.onLine1){
        var lastPoint = {x:result1.x,y:result1.y};
      }else if (result2.onLine1) {
        var lastPoint = {x:result2.x,y:result2.y};
      }

    }else if (ball.vector.x > 0 && ball.vector.y < 0) {
      result1 = checkLineIntersection(300,300,300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      result2 = checkLineIntersection(-300,-300,300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      if(result1.onLine1){
        var lastPoint = {x:result1.x,y:result1.y};
      }else if (result2.onLine1) {
        var lastPoint = {x:result2.x,y:result2.y};
      }

    }else if (ball.vector.x < 0 && ball.vector.y > 0) {
      result1 = checkLineIntersection(-300,300,300,300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      result2 = checkLineIntersection(-300,300,-300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      if(result1.onLine1){
        var lastPoint = {x:result1.x,y:result1.y};
      }else if (result2.onLine1) {
        var lastPoint = {x:result2.x,y:result2.y};
      }

    }else if (ball.vector.x > 0 && ball.vector.y === 0) {
      result1 = checkLineIntersection(300,300,300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      var lastPoint = {x:result1.x,y:result1.y};
    }else if (ball.vector.x < 0 && ball.vector.y === 0) {
      result1 = checkLineIntersection(-300,300,-300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      var lastPoint = {x:result1.x,y:result1.y};
    }else if (ball.vector.x === 0 && ball.vector.y > 0) {
      result1 = checkLineIntersection(-300,300,300,300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      var lastPoint = {x:result1.x,y:result1.y};
    }else if (ball.vector.x === 0 && ball.vector.y < 0) {
      result1 = checkLineIntersection(-300,-300,300,-300,ball.cx,ball.cy,ball.cx+ball.vector.x,ball.cy+ball.vector.y);
      var lastPoint = {x:result1.x,y:result1.y};
    }

    // var candidateLine = [];

    var compareX = null;
    var compareY = null;
    var lastCompareX = null;
    var lastCompareY = null;

    var predict = null;

    predictLines = [];

    var ballVectorAngle = ball.vector.horizontalAngleDeg()

    lines.forEach(function(line,i){

      // if(line.x1 > 0 && line.y1 > 0){
      //   var newLinePoint1 = {x:line.x1+(ball.r+10)*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y1+(ball.r+10)*Math.sin(degreeToRadiu(ballVectorAngle))}
      // }else if (line.x1 > 0 && line.y1 < 0) {
      //   var newLinePoint1 = {x:line.x1+(ball.r+10)*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y1-(ball.r+10)*Math.sin(degreeToRadiu(ballVectorAngle))}
      // }else if (line.x1 < 0 && line.y1 > 0) {
      //   var newLinePoint1 = {x:line.x1-(ball.r+10)*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y1+(ball.r+10)*Math.sin(degreeToRadiu(ballVectorAngle))}
      // }else if (line.x1 < 0 && line.y1 < 0) {
      //   var newLinePoint1 = {x:line.x1-(ball.r+10)*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y1-(ball.r+10)*Math.sin(degreeToRadiu(ballVectorAngle))}
      // }
      //
      // if(line.x2 > 0 && line.y2 > 0){
      //   var newLinePoint2 = {x:line.x2+(ball.r+10)*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y2+(ball.r+10)*Math.sin(degreeToRadiu(ballVectorAngle))}
      // }else if (line.x2 > 0 && line.y2 < 0) {
      //   var newLinePoint2 = {x:line.x2+(ball.r+10)*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y2-(ball.r+10)*Math.sin(degreeToRadiu(ballVectorAngle))}
      // }else if (line.x2 < 0 && line.y2 > 0) {
      //   var newLinePoint2 = {x:line.x2-(ball.r+10)*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y2+(ball.r+10)*Math.sin(degreeToRadiu(ballVectorAngle))}
      // }else if (line.x2 < 0 && line.y2 < 0) {
      //   var newLinePoint2 = {x:line.x2-(ball.r+10)*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y2-(ball.r+10)*Math.sin(degreeToRadiu(ballVectorAngle))}
      // }

      if(line.x1 > 0 && line.y1 > 0){
        var newLinePoint1 = {x:line.x1+ball.r*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y1+ball.r*Math.sin(degreeToRadiu(ballVectorAngle))}
      }else if (line.x1 > 0 && line.y1 < 0) {
        var newLinePoint1 = {x:line.x1+ball.r*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y1-ball.r*Math.sin(degreeToRadiu(ballVectorAngle))}
      }else if (line.x1 < 0 && line.y1 > 0) {
        var newLinePoint1 = {x:line.x1-ball.r*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y1+ball.r*Math.sin(degreeToRadiu(ballVectorAngle))}
      }else if (line.x1 < 0 && line.y1 < 0) {
        var newLinePoint1 = {x:line.x1-ball.r*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y1-ball.r*Math.sin(degreeToRadiu(ballVectorAngle))}
      }

      if(line.x2 > 0 && line.y2 > 0){
        var newLinePoint2 = {x:line.x2+ball.r*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y2+ball.r*Math.sin(degreeToRadiu(ballVectorAngle))}
      }else if (line.x2 > 0 && line.y2 < 0) {
        var newLinePoint2 = {x:line.x2+ball.r*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y2-ball.r*Math.sin(degreeToRadiu(ballVectorAngle))}
      }else if (line.x2 < 0 && line.y2 > 0) {
        var newLinePoint2 = {x:line.x2-ball.r*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y2+ball.r*Math.sin(degreeToRadiu(ballVectorAngle))}
      }else if (line.x2 < 0 && line.y2 < 0) {
        var newLinePoint2 = {x:line.x2-ball.r*Math.cos(degreeToRadiu(ballVectorAngle)),y:line.y2-ball.r*Math.sin(degreeToRadiu(ballVectorAngle))}
      }



      result = checkLineIntersection(newLinePoint1.x,newLinePoint1.y,newLinePoint2.x,newLinePoint2.y,ball.cx,ball.cy,lastPoint.x,lastPoint.y);

      // result = checkLineIntersection(line.x1,line.y1,line.x2,line.y2,ball.cx,ball.cy,lastPoint.x,lastPoint.y);

      // console.log(result);
      if(result.onLine1 && result.onLine2){
        // console.log(line);
        // if(line !== currentLine && result.x >= -300 && result.x <= 300 && result.y >= -300 && result.y <= 300){
        if(line !== currentLine){
          predictLines.push(line);
        }

        // compareX = Math.abs(ball.cx-result.x);
        // compareY = Math.abs(ball.cy-result.y);
        //
        // if(lastCompareX === null && line !== currentLine){
        //   predict = line;
        // }
        //
        // if(lastCompareX > compareX  && line !== currentLine){
        //   predict = line;
        // }
        //
        // lastCompareX = compareX;
        // lastCompareY = compareY;


      }



    })
    // console.log('predict');
    // console.log(lastPoint);
    // console.log(predictLines);

    // console.log(predict);

    // predictLine = predict;

    // candidateLine.forEach(function(line,i)){
    //
    //   compareX = ball.cx-line
    //
    //   if(  )
    //
    //   var lastCompareX =
    // }

    // clearInterval(frameTimer)
  }

  function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
      // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
      var denominator, a, b, numerator1, numerator2, result = {
          x: null,
          y: null,
          onLine1: false,
          onLine2: false
      };
      denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
      if (denominator == 0) {
          return result;
      }
      a = line1StartY - line2StartY;
      b = line1StartX - line2StartX;
      numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
      numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
      a = numerator1 / denominator;
      b = numerator2 / denominator;

      // if we cast these lines infinitely in both directions, they intersect here:
      result.x = line1StartX + (a * (line1EndX - line1StartX));
      result.y = line1StartY + (a * (line1EndY - line1StartY));

      // if line1 is a segment and line2 is infinite, they intersect if:
      if (a > 0 && a < 1) {
          result.onLine1 = true;
      }
      // if line2 is a segment and line1 is infinite, they intersect if:
      if (b > 0 && b < 1) {
          result.onLine2 = true;
      }
      // if line1 and line2 are segments, they intersect if both of the above are true
      return result;
  };




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
