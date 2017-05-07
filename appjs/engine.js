function engine(){

}

engine.prototype = {

  svg : {

    svgDoc:null,
    canvasId:null,
    canvas:null,
    svgObj:null,
    showLine:true,
    showPolyline:true,
    showPolygon:true,
    showRect:true,
    showCircle:true,

    loadSVG: function(svgfile){

      var fileContent = null;

      var request = new XMLHttpRequest();
      request.open("GET", svgfile, false);
      request.onreadystatechange = function ()
      {
          if(request.readyState === 4)
          {
              if(request.status === 200 || request.status == 0)
              {
                  var fileContent = request.responseText;
                  var parser = new DOMParser();
                  engine.svg.svgDoc = parser.parseFromString(fileContent, "application/xml");

                  if( engine.svg.svgDoc.getElementsByTagName('parsererror').length > 0 ){
                    alert( engine.svg.svgDoc.getElementsByTagName('parsererror')[0].textContent )
                    engine.svg.svgDoc = null;
                  }else {
                    engine.svg.svgObj = engine.svg.parseSVG();
                    engine.svg.canvas = document.getElementById( engine.svg.canvasId );
                    console.log(engine.svg);
                  }

              }else if (request.status === 404 || request.status === 403) {

                  var parser = new DOMParser();
                  engine.svg.svgDoc = parser.parseFromString(svgfile, "application/xml");

                  if( engine.svg.svgDoc.getElementsByTagName('parsererror').length > 0 ){
                    alert( engine.svg.svgDoc.getElementsByTagName('parsererror')[0].textContent )
                    engine.svg.svgDoc = null;
                  }else {
                    engine.svg.svgObj = engine.svg.parseSVG();
                    engine.svg.canvas = document.getElementById( engine.svg.canvasId );
                    console.log(engine.svg);
                  }
              }
          }
      }
      request.send(null);

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
        }
      }

      // console.log(svgObj);
      return svgObj;

    }, // end of parseSVG function ---------------------------------------------

    parseLine: function(line){

      line.x1 = Number(line.x1);
      line.y1 = Number(line.y1);
      line.x2 = Number(line.x2);
      line.y2 = Number(line.y2);

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
        eachLinePoints.push(points[i]);
        eachLinePoints.push(points[i+1]);
        eachLinePoints.push(points[i+2]);
        eachLinePoints.push(points[i+3]);
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

      rect.x = Number(rect.x);
      rect.y = Number(rect.y);
      rect.x1 = Number(rect.x);
      rect.y1 = Number(rect.y);
      rect.x2 = Number(rect.width);
      rect.y2 = Number(rect.height);

      return rect;

    },  // end of parseRect function -------------------------------------------

    parseCircle: function(circle){

      return circle;

    },  // end of parseCircle function -----------------------------------------

    drawLine: function(){

        if(typeof engine.svg.line === 'object'){

          var ctx = engine.svg.canvas.getContext('2d');

          engine.svg.line.forEach(function(line,i){
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);

            var styleObj = engine.helper.parseStyle(line.style);
            ctx.strokeStyle=engine.helper.colorNameToHex(line.stroke);
            ctx.lineWidth=parseInt(styleObj["stroke-width"]);

            ctx.stroke();
            ctx.closePath();
          })
        }

    },   // end of drawLine function -------------------------------------------

    drawPolyline: function(){

        if(typeof engine.svg.polyline === 'object'){

          var ctx = engine.svg.canvas.getContext('2d');

          engine.svg.polyline.forEach(function(polyline,i){
            ctx.beginPath();

            polyline.lines.forEach(function(line,index){
              if(index === 0) ctx.moveTo(line.x1, line.y1);
              ctx.lineTo(line.x2, line.y2);
            })

            var styleObj = engine.helper.parseStyle(polyline.style);
            ctx.strokeStyle=engine.helper.colorNameToHex(polyline.stroke);
            ctx.lineWidth=parseInt(styleObj["stroke-width"]);

            ctx.stroke();

          })
        }

    },  // end of drawPolyline function ----------------------------------------

    drawPolygon: function(){

        if(typeof engine.svg.polygon === 'object'){

          var ctx = engine.svg.canvas.getContext('2d');

          engine.svg.polygon.forEach(function(polygon,i){
            ctx.beginPath();

            polygon.lines.forEach(function(line,index){
              if(index === 0) ctx.moveTo(line.x1, line.y1);
              ctx.lineTo(line.x2, line.y2);
            })

            var styleObj = engine.helper.parseStyle(polygon.style);
            ctx.strokeStyle=engine.helper.colorNameToHex(polygon.stroke);
            ctx.lineWidth=parseInt(styleObj["stroke-width"]);
            ctx.fillStyle=engine.helper.colorNameToHex(polygon.fill);

            ctx.fill();
            ctx.stroke();
          })
        }

    },  // end of drawPolygon function -----------------------------------------

    drawRect: function(){

        if(typeof engine.svg.rect === 'object'){

          var ctx = engine.svg.canvas.getContext('2d');

          engine.svg.rect.forEach(function(rect,i){
            if(rect.id !== 'svgEditorBackground'){

              ctx.beginPath();
              var styleObj = engine.helper.parseStyle(rect.style);
              ctx.strokeStyle=engine.helper.colorNameToHex(rect.stroke);
              ctx.lineWidth=parseInt(styleObj["stroke-width"]);
              ctx.fillStyle=engine.helper.colorNameToHex(rect.fill);
              ctx.rect(rect.x1,rect.y1,rect.x2,rect.y2);
              ctx.fill();
              ctx.stroke();

            }
          })
        }

    },  // end of drawRect function --------------------------------------------

    drawCircle: function(){

        if(typeof engine.svg.circle === 'object'){

          var ctx = engine.svg.canvas.getContext('2d');

          engine.svg.circle.forEach(function(circle,i){
              ctx.beginPath();
              var styleObj = engine.helper.parseStyle(circle.style);
              ctx.strokeStyle=engine.helper.colorNameToHex(circle.stroke);
              ctx.lineWidth=parseInt(styleObj["stroke-width"]);
              ctx.fillStyle=engine.helper.colorNameToHex(circle.fill);

              ctx.arc(circle.cx,circle.cy,circle.r,0,2*Math.PI);
              ctx.fill();
              ctx.stroke();
          })
        }

    },  // end of drawCircle function --------------------------------------------


  }, // end of svg object ------------------------------------------------------

  createGameWorld: function(canvasId=null,svgfile=null){
    if(this.svg.canvasId === null || this.svg.svgObj === null){
      if(canvasId === null || svgfile===null){
        alert('You must give canvasId and svg source to the engine.');
      }else if (canvasId !== null && svgfile !== null) {
        this.svg.canvasId = canvasId;
        this.svg.loadSVG(svgfile);
      }
    }

    if (this.svg.canvasId !== null && this.svg.svgObj !== null) {
      if(this.svg.showLine) this.svg.drawLine();
      if(this.svg.showPolyline) this.svg.drawPolyline();
      if(this.svg.showPolygon) this.svg.drawPolygon();
      if(this.svg.showRect) this.svg.drawRect();
      if(this.svg.showCircle) this.svg.drawCircle();
    }

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
    lineLength: function(x1,y1,x2,y2){
      return Math.hypot( (x2-x1), (y2-y1) );
    },
    lineAngleToAxis: function(x1,y1,x2,y2){
      var dy = y2 - y1;
      var dx = x2 - x1;
      var theta = -Math.atan2(dy, dx); // range (-PI, PI]
      theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
      //if (theta < 0) theta = 360 + theta; // range [0, 360)
      return theta;
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
