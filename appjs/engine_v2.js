function engine(){

  this.fps = 100;
  this.fpms = 0.1;
  this.dt = 1/this.fpms;
  this.updateFinish = true;
  this.frameTimer = null;
  this.frameCounter = 0;

  this.canvasId = null;
  this.canvas = null;
  this.ctx = null;

  this.detectOnLine = true;
  this.detectOnPolyline = true;
  this.detectOnPolygon = true;
  this.detectOnRect = true;
  this.destroyTarget = false;

  this.ball = null;
  this.gameBorder = null;


  this.world = {bodies:[],
                rules:[]};

}

engine.prototype = {

  svg : {

    svgDoc:null,
    svgfile:null,
    svgObj:null,
    showLine:true,
    showPolyline:true,
    showPolygon:true,
    showRect:true,
    showCircle:true,

    loadSVG: function(svgfile){
      var request = new XMLHttpRequest();
      request.open("GET", svgfile, false);
      request.onreadystatechange = function ()
      {
          if(request.readyState === 4)
          {
              callback(request.status);
          }
      }
      request.send(null);

      function callback(status){
          if(status === 200 || status == 0)
          {
            var parser = new DOMParser();
            engine.svg.svgDoc = parser.parseFromString(request.responseText, "application/xml");
          }else if (status === 404 || status === 403) {
            var parser = new DOMParser();
            engine.svg.svgDoc = parser.parseFromString(svgfile, "application/xml");
          }
          if( engine.svg.svgDoc.getElementsByTagName('parsererror').length > 0 ){
              alert( engine.svg.svgDoc.getElementsByTagName('parsererror')[0].textContent )
              engine.svg.svgDoc = null;
          }else {
              engine.svg.svgObj = engine.svg.parseSVG();
          }
      }

    },  // end of loadSVG function ---------------------------------------------

    parseSVG: function(){

      var svgObj = [];
      for( var index in engine.svg.svgDoc.childNodes[0].childNodes ){

        if(parseInt(index) || index === '0'){

          var obj = engine.svg.svgDoc.childNodes[0].childNodes[index];
          var objName = engine.svg.svgDoc.childNodes[0].childNodes[index].tagName;
          var attributes = engine.svg.svgDoc.childNodes[0].childNodes[index].attributes;
          svgObj.push({objName:objName});

          for( var item in attributes ){
            if(parseInt(item) || item === '0'){
              var attr = attributes[item].name;
              var value = attributes[item].value;
              svgObj[svgObj.length-1][attr] = value;
            }
          }

          if(objName === 'line') svgObj[svgObj.length-1] = engine.svg.parseLine( svgObj[svgObj.length-1] );
          if(objName === 'polyline'){ svgObj[svgObj.length-1].lines = engine.svg.parsePolyline( svgObj[svgObj.length-1] );}
          if(objName === 'polygon'){ svgObj[svgObj.length-1].lines = engine.svg.parsePolygon( svgObj[svgObj.length-1] );}
          if(objName === 'rect') svgObj[svgObj.length-1] = engine.svg.parseRect( svgObj[svgObj.length-1] );
          if(objName === 'circle') svgObj[svgObj.length-1] = engine.svg.parseCircle( svgObj[svgObj.length-1] );

        }

      }

      for (var index in svgObj){
        if(parseInt(index) || index === '0'){
          var objName = svgObj[index].objName;
          if(typeof engine.svg[objName] === 'undefined') engine.svg[objName] = [];
          if(typeof engine.svg[objName] !== 'undefined'){ engine.svg[objName].push(svgObj[index]) }
          engine.world.bodies.push(svgObj[index]);
        }
      }

      return svgObj;

    }, // end of parseSVG function ---------------------------------------------

    parseLine: function(line){

      line.x1 = Number(line.x1)-engine.canvas.width*0.5;
      line.y1 = -Number(line.y1)+engine.canvas.height*0.5;
      line.x2 = Number(line.x2)-engine.canvas.width*0.5;
      line.y2 = -Number(line.y2)+engine.canvas.height*0.5;

      line.slope = Number( ( (line.y2-line.y1)/(line.x2-line.x1) ).toFixed(1) );
      line.constant = Number( ( line.y1-line.slope*line.x1 ).toFixed(1) );

      line.vector = new engine.vector(line.x2-line.x1,line.y2-line.y1);
      line.length = line.vector.length();
      line.angle = line.vector.horizontalAngleDeg();

      return line;

    }, // end of parseLine function --------------------------------------------

    parsePolyline: function(polyline){

      var lines = [];
      var points = polyline.points.split(" ");
      var eachLinePoints = [];

      for(var i=0;i<=points.length-2;i+=2){
        eachLinePoints.push(Number(points[i])-engine.canvas.width*0.5);
        eachLinePoints.push(-Number(points[i+1])+engine.canvas.height*0.5);
        eachLinePoints.push(Number(points[i+2])-engine.canvas.width*0.5);
        eachLinePoints.push(-Number(points[i+3])+engine.canvas.height*0.5);
        if(i+3 === points.length-1){  break;  }
      }

      var count = 0;
      eachLinePoints.forEach(function(value,i){

        count ++;

        if(count === 1){
          lines.push( {objName:'line',parentId:polyline.id,stroke:polyline.stroke,style:polyline.style,x1:Number(value)} );
        }else if (count === 2) {
          lines[lines.length-1].y1 = Number(value);
        }else if (count === 3) {
          lines[lines.length-1].x2 = Number(value);
        }else if (count === 4) {

          lines[lines.length-1].y2 = Number(value);

          lines[lines.length-1].slope = Number( ( (lines[lines.length-1].y2-lines[lines.length-1].y1)/(lines[lines.length-1].x2-lines[lines.length-1].x1) ).toFixed(1) );
          lines[lines.length-1].constant = Number( ( lines[lines.length-1].y1-lines[lines.length-1].slope*lines[lines.length-1].x1 ).toFixed(1) );

          lines[lines.length-1].vector = new engine.vector(lines[lines.length-1].x2-lines[lines.length-1].x1,lines[lines.length-1].y2-lines[lines.length-1].y1);
          lines[lines.length-1].length = lines[lines.length-1].vector.length();
          lines[lines.length-1].angle = lines[lines.length-1].vector.horizontalAngleDeg();

          count = 0
        }

      })

      return lines;

    },  // end of parsePolyline function ---------------------------------------

    parsePolygon: function(polygon){

      var lines = engine.svg.parsePolyline(polygon);

      var x1 = lines[lines.length-1].x2;
      var y1 = lines[lines.length-1].y2;
      var x2 = lines[0].x1;
      var y2 = lines[0].y1;

      var slope = Number( ( (y2-y1)/(x2-x1) ).toFixed(1) );
      var constant = Number( ( y1-slope*x1 ).toFixed(1) );

      var vector = new engine.vector(x2-x1,y2-y1);
      var length = vector.length();
      var angle = vector.horizontalAngleDeg();

      lines.push( {objName:'line',parentId:polygon.id,stroke:polygon.stroke,style:polygon.style,x1:x1,y1:y1,x2:x2,y2:y2,vector:vector,length:length,angle:angle,slope:slope,constant:constant} );

      return lines;

    },  // end of parsePolygon function ----------------------------------------

    parseRect: function(rect){

      rect.x = Number(rect.x)-engine.canvas.width*0.5;
      rect.y = -Number(rect.y)+engine.canvas.height*0.5;
      rect.width = Number(rect.width);
      rect.height = Number(rect.height);
      rect.x1 = rect.x;
      rect.y1 = rect.y;
      rect.x2 = rect.width;
      rect.y2 = -rect.height;

      rect.lines = [{objName:'line',parentId:rect.id,stroke:rect.stroke,style:rect.style,x1:rect.x1,y1:rect.y1,x2:rect.x1+rect.width,y2:rect.y1},
                    {objName:'line',parentId:rect.id,stroke:rect.stroke,style:rect.style,x1:rect.x1+rect.width,y1:rect.y1,x2:rect.x1+rect.width,y2:rect.y1-rect.height},
                    {objName:'line',parentId:rect.id,stroke:rect.stroke,style:rect.style,x1:rect.x1+rect.width,y1:rect.y1-rect.height,x2:rect.x1,y2:rect.y1-rect.height},
                    {objName:'line',parentId:rect.id,stroke:rect.stroke,style:rect.style,x1:rect.x1,y1:rect.y1-rect.height,x2:rect.x1,y2:rect.y1}];
      rect.lines.forEach(function(line,i){
        rect.lines[i].slope = Number( ( (line.y2-line.y1)/(line.x2-line.x1) ).toFixed(1) );
        rect.lines[i].constant = Number( (line.y1-(line.y2-line.y1)/(line.x2-line.x1)*line.x1).toFixed(1) );
        rect.lines[i].vector = new engine.vector(line.x2-line.x1,line.y2-line.y1);
        rect.lines[i].length = line.vector.length();
        rect.lines[i].angle = line.vector.horizontalAngleDeg();
      })

      return rect;

    },  // end of parseRect function -------------------------------------------

    parseCircle: function(circle){

      circle.cx = Number(circle.cx)-engine.canvas.width*0.5;
      circle.cy = -Number(circle.cy)+engine.canvas.height*0.5;
      return circle;

    },  // end of parseCircle function -----------------------------------------

    drawSvgObjs: function(){

    },  // end of drawSvgObjs function -----------------------------------------

    drawLine: function(lines){

          lines.forEach(function(line,i){
            engine.ctx.beginPath();
            engine.ctx.moveTo(line.x1, line.y1);
            engine.ctx.lineTo(line.x2, line.y2);

            var styleObj = engine.helper.parseStyle(line.style);
            engine.ctx.strokeStyle=engine.helper.colorNameToHex(line.stroke);
            engine.ctx.lineWidth=parseInt(styleObj["stroke-width"]);

            engine.ctx.stroke();
            engine.ctx.closePath();
          })

    },   // end of drawLine function -------------------------------------------

    drawPolyline: function(polylines){

          polylines.forEach(function(polyline,i){
            engine.ctx.beginPath();

            polyline.lines.forEach(function(line,index){
              if(index === 0) engine.ctx.moveTo(line.x1, line.y1);
              engine.ctx.lineTo(line.x2, line.y2);
            })

            var styleObj = engine.helper.parseStyle(polyline.style);
            engine.ctx.strokeStyle=engine.helper.colorNameToHex(polyline.stroke);
            engine.ctx.lineWidth=parseInt(styleObj["stroke-width"]);

            engine.ctx.stroke();

          })

    },  // end of drawPolyline function ----------------------------------------

    drawPolygon: function(polygons){

          polygons.forEach(function(polygon,i){
            engine.ctx.beginPath();

            polygon.lines.forEach(function(line,index){
              if(index === 0) engine.ctx.moveTo(line.x1, line.y1);
              engine.ctx.lineTo(line.x2, line.y2);
            })

            var styleObj = engine.helper.parseStyle(polygon.style);
            engine.ctx.strokeStyle=engine.helper.colorNameToHex(polygon.stroke);
            engine.ctx.lineWidth=parseInt(styleObj["stroke-width"]);
            engine.ctx.fillStyle=engine.helper.colorNameToHex(polygon.fill);

            engine.ctx.fill();
            engine.ctx.stroke();
          })

    },  // end of drawPolygon function -----------------------------------------

    drawRect: function(rects){

          rects.forEach(function(rect,i){
            if(rect.id !== 'svgEditorBackground'){

              engine.ctx.beginPath();
              var styleObj = engine.helper.parseStyle(rect.style);
              engine.ctx.strokeStyle=engine.helper.colorNameToHex(rect.stroke);
              engine.ctx.lineWidth=parseInt(styleObj["stroke-width"]);
              engine.ctx.fillStyle=engine.helper.colorNameToHex(rect.fill);
              engine.ctx.rect(rect.x1,rect.y1,rect.x2,rect.y2);
              engine.ctx.fill();
              engine.ctx.stroke();

            }
          })

    },  // end of drawRect function --------------------------------------------

    drawCircle: function(circles){

          circles.forEach(function(circle,i){
              engine.ctx.beginPath();
              var styleObj = engine.helper.parseStyle(circle.style);
              engine.ctx.strokeStyle=engine.helper.colorNameToHex(circle.stroke);
              engine.ctx.lineWidth=parseInt(styleObj["stroke-width"]);
              engine.ctx.fillStyle=engine.helper.colorNameToHex(circle.fill);

              engine.ctx.arc(circle.cx,circle.cy,circle.r,0,2*Math.PI);
              engine.ctx.fill();
              engine.ctx.stroke();
          })

    },  // end of drawCircle function ------------------------------------------


  }, // end of svg object ------------------------------------------------------

  setCanvas: function(){
    this.canvas = document.getElementById( this.canvasId );
    this.ctx = this.canvas.getContext('2d');
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
    this.ctx.transform(1, 0, 0, -1, 0, 0);
  },

  createGameWorld: function(canvasId=null,svgfile=null){
    // console.log('createGameWorld');
    if(this.canvas === null && canvasId !== null){
      this.canvasId = canvasId;
      this.setCanvas();
    }

    this.world.bodies.forEach(function(obj,i){
      if(obj.shape === 'circle') engine.svg.drawCircle([obj]);
    })

  },

  add: function(type,property){

    switch (type) {
      case 'circle':
        this.addCircle(property);
        break;
      default:

    }

  },

  addCircle: function(property){

    var cx = (property.x === undefined) ? 0 : property.x ;
    var cy = (property.y === undefined) ? 0 : property.y ;
    var r = (property.r === undefined) ? 0 : property.r ;

    var mass = (property.mass === undefined) ? 0 : property.mass ;

    if(property.velocity === undefined){
      var velocity = new engine.vector(0,0);
    }else {
      var velocity = (property.velocity.x === undefined || property.velocity.y === undefined)
      ? new engine.vector(0,0)
      : new engine.vector(property.velocity.x,property.velocity.y);
    }

    var circle = {shape:'circle',
                  cx:cx,
                  cy:cy,
                  r:r,
                  area:Number((r*r*Math.PI).toFixed(2)),
                  mass:mass,
                  velocity:velocity,
                  force:new engine.vector(0,0),
                  acceleration:new engine.vector(0,0),
                  stroke:'black',
                  style:'stroke-width: 1px;',
                  fill:'yellow'}

    this.world.bodies.push(circle);
    this.svg.drawCircle([circle]);

  },

  addRules: function(rules=[]){

    if(typeof rules === 'object'){
      rules.forEach(function(rule,i){
        engine.world.rules.push(rule);
      })
    }else if (typeof rules === 'string') {
      engine.world.rules.push(rule);
    }
  },

  applyRules: function(){
    // console.log('applyrules');
    this.world.bodies.forEach(function(obj,objKey){

      engine.world.bodies[objKey].force.x = 0;
      engine.world.bodies[objKey].force.y = 0;
      engine.world.bodies[objKey].acceleration.x = 0;
      engine.world.bodies[objKey].acceleration.y = 0;

      engine.world.rules.forEach(function(rule,i){
        if(rule === 'gravity') engine.applyGravity(objKey);
        if(rule === 'border') engine.applyBorder(objKey);
        if(rule === 'airfriction') engine.applyAirfriction(objKey);
        // console.log(engine.world.bodies[objKey]);
      })

      //  console.log(engine.world.bodies[objKey].force.y);

      engine.world.bodies[objKey].acceleration.x = engine.world.bodies[objKey].force.x/engine.world.bodies[objKey].mass;
      engine.world.bodies[objKey].acceleration.y = engine.world.bodies[objKey].force.y/engine.world.bodies[objKey].mass;

      // console.log(engine.world.bodies[objKey].acceleration.y);


    })
  },

  applyGravity: function(objKey){
    // console.log('applyGravity');
    // if(this.frameCounter === 1){
      this.world.bodies[objKey].force.y += -0.0098*this.world.bodies[objKey].mass;
      // this.world.bodies[objKey].acceleration.y += -0.0098;
      // console.log(this.world.bodies[objKey].acceleration.y);
    // }
  },

  applyBorder: function(objKey){
    switch (this.world.bodies[objKey].shape) {
      case 'circle':

        var cx = this.world.bodies[objKey].cx;
        var cy = this.world.bodies[objKey].cy;
        var r = this.world.bodies[objKey].r;

        if(cx <= -this.canvas.width*0.5+r || cx >= this.canvas.width*0.5-r || cy <= -this.canvas.height*0.5+r || cy >= this.canvas.height*0.5-r){

          if(cx <= -this.canvas.width*0.5+r) this.world.bodies[objKey].cx = -this.canvas.width*0.5+r;
          if(cx >= this.canvas.width*0.5-r) this.world.bodies[objKey].cx = this.canvas.width*0.5-r;
          if(cy <= -this.canvas.height*0.5+r) this.world.bodies[objKey].cy = -this.canvas.height*0.5+r;
          if(cy >= this.canvas.height*0.5-r)  this.world.bodies[objKey].cy = this.canvas.height*0.5-r;

          if(cx <= -this.canvas.width*0.5+r) this.world.bodies[objKey].velocity.x = -this.world.bodies[objKey].velocity.x;
          if(cx >= this.canvas.width*0.5-r) this.world.bodies[objKey].velocity.x = -this.world.bodies[objKey].velocity.x;
          if(cy <= -this.canvas.height*0.5+r) this.world.bodies[objKey].velocity.y = -this.world.bodies[objKey].velocity.y;
          if(cy >= this.canvas.height*0.5-r)  this.world.bodies[objKey].velocity.y = -this.world.bodies[objKey].velocity.y;


          // this.world.bodies[objKey].velocity.x = -this.world.bodies[objKey].velocity.x;
          // this.world.bodies[objKey].velocity.y = -this.world.bodies[objKey].velocity.y;
        }

        break;
      default:

    }
  },

  applyAirfriction: function(objKey){
    switch (this.world.bodies[objKey].shape) {
      case 'circle':

        var fx = -0.0000025*this.world.bodies[objKey].velocity.x*this.world.bodies[objKey].area ;
        var fy = -0.0000025*this.world.bodies[objKey].velocity.y*this.world.bodies[objKey].area ;

        // if( Math.abs(fx+this.world.bodies[objKey].force.x) <= 0.000005 ) fx = 0 ;
        // if( Math.abs(fy+this.world.bodies[objKey].force.y) <= 0.000005 ) fy = 0 ;

        if(objKey === 3){

          // console.log(Math.abs(fy+this.world.bodies[objKey].force.y));
        }

        this.world.bodies[objKey].force.x += fx;
        this.world.bodies[objKey].force.y += fy;

        break;
      default:

    }
  },

  moveObj: function(backwards=false){
    // console.log('moveObj');

    this.world.bodies.forEach(function(obj,i){
      var Vx = Number( (obj.velocity.x+obj.acceleration.x*engine.dt).toFixed(2) );
      var Vy = Number( (obj.velocity.y+obj.acceleration.y*engine.dt).toFixed(2) );

      engine.world.bodies[i].velocity.x = Vx;
      engine.world.bodies[i].velocity.y = Vy;
      engine.world.bodies[i].cx += Vx;
      engine.world.bodies[i].cy += Vy;

    })


    // if(backwards){
    //   this.ball.cx -= this.ball.vector.x;
    //   this.ball.cy -= this.ball.vector.y;
    // }else if (!backwards) {
    //   this.ball.cx += this.ball.vector.x;
    //   this.ball.cy += this.ball.vector.y;
    // }

  },

  fireCollisionDetect: function(){
    this.collisionDetectOnLine(this.gameBorder);
    if(this.detectOnLine) this.collisionDetectOnLine(this.svg.line);
    if(this.detectOnPolyline){
      this.svg.polyline.forEach(function(polyline,i){
        engine.collisionDetectOnLine(polyline.lines,i,polyline.objName);
      })
    }
    if(this.detectOnPolygon){
      this.svg.polygon.forEach(function(polygon,i){
        engine.collisionDetectOnLine(polygon.lines,i,polygon.objName);
      })
    }
    if(this.detectOnRect){
      this.svg.rect.forEach(function(rect,i){
        if(rect.id !== 'svgEditorBackground') engine.collisionDetectOnLine(rect.lines,i,rect.objName);
      })
    }
  },

  collisionDetectOnLine: function(lines,parentKey = null,parentName = null){

      var toPoint1Vector = new engine.vector();
      var toPoint2Vector = new engine.vector();
      var toPoint1Leng = 0;
      var toPoint2Leng = 0;

      lines.forEach(function(line,i){

        toPoint1Vector.x = line.x1-engine.ball.cx;
        toPoint1Vector.y = line.y1-engine.ball.cy;
        toPoint2Vector.x = line.x2-engine.ball.cx;
        toPoint2Vector.y = line.y2-engine.ball.cy;

        toPoint1Leng = toPoint1Vector.length();
        toPoint2Leng = toPoint2Vector.length();

        var parallelLine_constant = engine.ball.cy-line.slope*engine.ball.cx;

        if( Number(toPoint1Leng.toFixed(1)) <= engine.ball.r || Number(toPoint2Leng.toFixed(1)) <= engine.ball.r ){

          if( Number(toPoint1Leng.toFixed(1)) === engine.ball.r  || Number(toPoint2Leng.toFixed(1)) === engine.ball.r ){
            engine.bouncing(line,false,true);
            engine.destroyObj(line,i,parentKey,parentName);
          }else {
            engine.bouncing(line,true,true);
            engine.destroyObj(line,i,parentKey,parentName);
          }

          return false;

        }else {

          var ballCenterInsideLine = true;

          if( line.x1 > line.x2 ){
            if(engine.ball.cx > line.x1) ballCenterInsideLine = false;
            if(engine.ball.cx < line.x2) ballCenterInsideLine = false;
          }else if (line.x2 > line.x1) {
            if(engine.ball.cx > line.x2) ballCenterInsideLine = false;
            if(engine.ball.cx < line.x1) ballCenterInsideLine = false;
          }else if (line.x1 == line.x2) {

          }

          if( line.y1 > line.y2 ){
            if(engine.ball.cy > line.y1) ballCenterInsideLine = false;
            if(engine.ball.cy < line.y2) ballCenterInsideLine = false;
          }else if (line.y2 > line.y1) {
            if(engine.ball.cy > line.y2) ballCenterInsideLine = false;
            if(engine.ball.cy < line.y1) ballCenterInsideLine = false;
          }

          if( Math.abs(line.slope) === Infinity ){
            var distanceFromCenterToLine = Math.abs(engine.ball.cx-line.x1);
          }else {
            var distanceFromCenterToLine = Math.abs(line.constant-parallelLine_constant)/Math.sqrt(1+line.slope*line.slope);
          }

          if(ballCenterInsideLine && distanceFromCenterToLine <= engine.ball.r){
            if( Number( (distanceFromCenterToLine - engine.ball.r).toFixed(1) ) === 0){
              engine.bouncing(line,false,false);
              engine.destroyObj(line,i,parentKey,parentName);
            }else {
              engine.bouncing(line,true,false);
              engine.destroyObj(line,i,parentKey,parentName);
            }
            return false;
          }

        }

      })

  },

  bouncing: function(line,crossLine,endPoint){

    var enterAngle = this.ball.vector.horizontalAngleDeg()-line.vector.horizontalAngleDeg();

    var toPoint1Leng = new engine.vector(line.x1-this.ball.cx,line.y1-this.ball.cy);
    var toPoint2Leng = new engine.vector(line.x2-this.ball.cx,line.y2-this.ball.cy);

    if(endPoint){

      var keepMoving = true;

      while(keepMoving){
        this.moveBall(true,1);
        toPoint1Leng.x = line.x1-this.ball.cx;
        toPoint1Leng.y = line.y1-this.ball.cy;
        toPoint2Leng.x = line.x2-this.ball.cx;
        toPoint2Leng.y = line.y2-this.ball.cy;
        if( Number(toPoint1Leng.length().toFixed(1)) > this.ball.r || Number(toPoint2Leng.length().toFixed(1)) > this.ball.r ){
          keepMoving = false
        }
      }

      if( enterAngle > 125 || (enterAngle < 55 && enterAngle > -55) || enterAngle < -125){
        this.ball.vector = this.ball.vector.rotateDeg(-180+2*enterAngle);
      }else {
        this.ball.vector = this.ball.vector.rotateDeg(-2*enterAngle);
      }

    }else if (!endPoint) {

      if(crossLine){

        var keepMoving = true;
        while(keepMoving){
          this.moveBall(true);
          var parallelLine_constant = this.ball.cy-line.slope*this.ball.cx;
          if( Math.abs(line.slope) === Infinity ){
            var distanceFromCenterToLine = Math.abs(this.ball.cx-line.x1);
          }else {
            var distanceFromCenterToLine = Math.abs(line.constant-parallelLine_constant)/Math.sqrt(1+line.slope*line.slope);
          }
          if(distanceFromCenterToLine > this.ball.r){
            keepMoving = false
          }
        }

      }

      this.ball.vector = engine.ball.vector.rotateDeg(-2*enterAngle);

    }

  },

  destroyObj: function(line,childKey,parentKey,parentName){
    if(this.destroyTarget){

      var objName = (parentKey !== null) ? parentName : line.objName;

      if(parentKey !== null){
          if(this.svg[objName] !== undefined) delete this.svg[objName][parentKey];
      }else {
          if(this.svg[objName] !== undefined) delete this.svg[objName][childKey];
      }
    }
  },

  clearFrame: function(){
    // console.log('clear');
    this.ctx.clearRect(-this.canvas.width*0.5, -this.canvas.height*0.5, this.canvas.width, this.canvas.height);
  },

  updateFrame: function(){

    if(this.frameTimer === null){
      this.frameTimer = setInterval(function(){
        if(engine.updateFinish){
          // console.log('next run');
          engine.updateFinish = false;
          engine.frameCounter ++;

          engine.clearFrame();
          engine.applyRules();
          engine.moveObj();
          // engine.fireCollisionDetect();
          engine.createGameWorld();

          engine.updateFinish = true;
        }

      },this.dt)
    }
  },

  stop: function(){
    if(this.frameTimer !== null){
      clearInterval(this.frameTimer);
      this.frameTimer = null;
    }
  },

  reload: function(){

    if(this.frameTimer !== null){
      this.stop();
    }
    this.clearFrame();

    for (var index in this.svg.svgObj){
      if(parseInt(index) || index === '0'){
        var objName = this.svg.svgObj[index].objName;
        if(typeof this.svg[objName] !== 'undefined'){ this.svg[objName] = undefined }
      }
    }

    this.svg.svgObj = null;

    this.svg.showLine = true;
    this.svg.showPolyline = true;
    this.svg.showPolygon = true;
    this.svg.showRect = true;
    this.svg.showCircle = true;

    this.detectOnLine = true;
    this.detectOnPolyline = true;
    this.detectOnPolygon = true;
    this.detectOnRect = true;
    this.destroyTarget = false;

    this.createGameWorld(this.canvasId,this.svg.svgfile);
    this.updateFrame();
  },

  vector: function(x=null,y=null){

    this.x = (x===null) ? 0 : x ;
    this.y = (y===null) ? 0 : y ;

    this.length = function(){
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    this.horizontalAngle = function(){
      return Math.atan2(this.y, this.x);
    }
    this.horizontalAngleDeg = function(){
      return radian2degrees(this.horizontalAngle());
    }
    this.rotate = function (angle) {
    	var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
    	var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

    	this.x = nx;
    	this.y = ny;

    	return this;
    }
    this.rotateDeg = function (angle) {
    	angle = degrees2radian(angle);
    	return this.rotate(angle);
    }
    radian2degrees = function(rad) {
      var degrees = 180 / Math.PI;
	    return rad * degrees;
    }
    degrees2radian = function (deg) {
      var degrees = 180 / Math.PI;
	    return deg / degrees;
    }


  },  // end of vector function ------------------------------------------------

  math: {
    radian2degrees: function(rad) {
      var degrees = 180 / Math.PI;
      return rad * degrees;
    },
    degrees2radian: function (deg) {
      var degrees = 180 / Math.PI;
      return deg / degrees;
    },
    areaOfTriangle: function(a,b,c){

      var s = (a+b+c)/2;
      var a = Math.sqrt( s*(s-a)*(s-b)*(s-c) );

      return a ;
    }
  },  // end of math object --------------------------------------------------

  helper: {
    colorNameToHex(color){
      var colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
      "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
      "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
      "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
      "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
      "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
      "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
      "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
      "honeydew":"#f0fff0","hotpink":"#ff69b4", "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
      "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
      "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
      "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
      "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
      "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
      "navajowhite":"#ffdead","navy":"#000080","oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
      "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
      "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
      "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
      "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
      "violet":"#ee82ee", "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5", "yellow":"#ffff00","yellowgreen":"#9acd32"};

      if (typeof colors[color.toLowerCase()] != 'undefined')
      return colors[color.toLowerCase()];

      return '#000';

    },  // end of colorNameToHex function ------------------------------------

    parseStyle: function(style){

      var styleObj={};
      var styles = style.replace(/\s|\"|\'/g,'').split(';');

      styles.forEach(function(value,i){
        if(value !== ""){
          styleObj[value.split(':')[0]] = value.split(':')[1];
        }
      })

      return styleObj;

    }  // end of parseStyle function -----------------------------------------

  }, // end of helper object -------------------------------------------------


}
