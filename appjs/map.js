;(function($,window,document){

  function map(el) {
  	this.el = $(el);
    this.canvas = null;
    this.canvasId = null;
    this.svgObj = null;
    this.mousePos = {x:null,y:null};
  }

  map.prototype = {

    loadSVG: function(svgfile,objs=[],collision=[]){

      $.get(svgfile,function(data){

        var xml = $.parseXML( data );
        map.svgDoc = $( xml );
        console.log(map.svgDoc);
        map.svgObj = map.parseSVG();

        objs.forEach(function(obj,i){
          if(obj === 'line' || obj === 'all')  map.drawLine();
          if(obj === 'polyline' || obj === 'all')  map.drawPolyline();
          if(obj === 'polygon' || obj === 'all')  map.drawPolygon();
          if(obj === 'rect' || obj === 'all')  map.drawRect();
          if(obj === 'circle' || obj === 'all')  map.drawCircle();
        })

        if(collision.length > 0){ map.fireCollisionDetect(collision); }

      });

    },  // end of loadSVG function ---------------------------------------------

    parseSVG: function(){

      var svgObj = [];
      for( var index in map.svgDoc[0].childNodes[0].childNodes ){

        if(parseInt(index) || index === '0'){

          var obj = map.svgDoc[0].childNodes[0].childNodes[index];
          var objName = map.svgDoc[0].childNodes[0].childNodes[index].tagName;
          var attributes = map.svgDoc[0].childNodes[0].childNodes[index].attributes;
          svgObj.push({objName:objName,attributes:{}});

          for( var item in attributes ){
            if(parseInt(item) || item === '0'){
              var attr = attributes[item].name;
              var value = attributes[item].value;
              svgObj[svgObj.length-1].attributes[attr] = value;
            }
          }

          if(objName === 'line') svgObj[svgObj.length-1].attributes = map.parseLine( svgObj[svgObj.length-1].attributes );
          if(objName === 'polyline'){ svgObj[svgObj.length-1].lines = map.parsePolyline( svgObj[svgObj.length-1].attributes );}
          if(objName === 'polygon'){ svgObj[svgObj.length-1].lines = map.parsePolygon( svgObj[svgObj.length-1].attributes );}
          if(objName === 'rect') svgObj[svgObj.length-1].attributes = map.parseRect( svgObj[svgObj.length-1].attributes );
          if(objName === 'circle') svgObj[svgObj.length-1].attributes = map.parseCircle( svgObj[svgObj.length-1].attributes );

        }

      }

      for (var index in svgObj){
        if(parseInt(index) || index === '0'){
          var objName = svgObj[index].objName;
          if(typeof map[objName] === 'undefined') map[objName] = [];
          if(typeof map[objName] !== 'undefined'){ map[objName].push(svgObj[index]) }
        }
      }

      console.log(map);
      return svgObj;

    }, // end of parseSVG function ---------------------------------------------

    parseLine: function(attributes){

      var x1 = attributes.x1;
      var x2 = attributes.x2;
      var y1 = attributes.y1;
      var y2 = attributes.y2;
      attributes.length = map.math.lineLength(x1,y1,x2,y2);
      attributes.angle = map.math.lineAngleToAxis(x1,y1,x2,y2);

      return attributes;

    }, // end of parseLine function --------------------------------------------

    parsePolyline: function(attributes){

      var lines = [];
      var points = attributes.points.split(" ");
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
          lines.push( {objName:'line',attributes:{parentId:attributes.id,stroke:attributes.stroke,style:attributes.style,x1:value}} );
        }else if (count === 2) {
          lines[lines.length-1].attributes.y1 = value;
        }else if (count === 3) {
          lines[lines.length-1].attributes.x2 = value;
        }else if (count === 4) {

          lines[lines.length-1].attributes.y2 = value;

          var x1 = lines[lines.length-1].attributes.x1;
          var y1 = lines[lines.length-1].attributes.y1;
          var x2 = lines[lines.length-1].attributes.x2;
          var y2 = lines[lines.length-1].attributes.y2;

          lines[lines.length-1].attributes.length = map.math.lineLength(x1,y1,x2,y2);
          lines[lines.length-1].attributes.angle = map.math.lineAngleToAxis(x1,y1,x2,y2);

          count = 0
        }

      })

      return lines;

    },  // end of parsePolyline function ---------------------------------------

    parsePolygon: function(attributes){

      var lines = map.parsePolyline(attributes);

      var x1 = lines[lines.length-1].attributes.x2;
      var y1 = lines[lines.length-1].attributes.y2;
      var x2 = lines[0].attributes.x1;
      var y2 = lines[0].attributes.y1;
      var length = map.math.lineLength(x1,y1,x2,y2);
      var angle = map.math.lineAngleToAxis(x1,y1,x2,y2);
      lines.push( {objName:'line',attributes:{parentId:attributes.id,stroke:attributes.stroke,style:attributes.style,x1:x1,y1:y1,x2:x2,y2:y2,length:length,angle:angle}} );

      return lines;

    },  // end of parsePolygon function ----------------------------------------

    parseRect: function(attributes){

      attributes.x1 = Number(attributes.x);
      attributes.y1 = Number(attributes.y);
      attributes.x2 = Number(attributes.width);
      attributes.y2 = Number(attributes.height);

      return attributes;

    },  // end of parseRect function -------------------------------------------

    parseCircle: function(attributes){

      return attributes;

    },  // end of parseCircle function -----------------------------------------

    drawLine: function(){
      $(document).ready(function(){
        if(map.canvasId !== null && typeof map.line === 'object'){

          map.canvas = document.getElementById( map.canvasId );
          var ctx = map.canvas.getContext('2d');
          map.line.forEach(function(line,i){
            ctx.beginPath();
            ctx.moveTo(line.attributes.x1, line.attributes.y1);
            ctx.lineTo(line.attributes.x2, line.attributes.y2);

            var styleObj = map.helper.parseStyle(line.attributes.style);
            ctx.strokeStyle=map.helper.colorNameToHex(line.attributes.stroke);
            ctx.lineWidth=parseInt(styleObj["stroke-width"]);

            ctx.stroke();
            ctx.closePath();
          })
        }
      })
    },   // end of drawLine function -------------------------------------------

    drawPolyline: function(){
      $(document).ready(function(){
        if(map.canvasId !== null && typeof map.polyline === 'object'){

          map.canvas = document.getElementById( map.canvasId );
          var ctx = map.canvas.getContext('2d');

          map.polyline.forEach(function(polyline,i){
            ctx.beginPath();

            polyline.lines.forEach(function(line,index){
              if(index === 0) ctx.moveTo(line.attributes.x1, line.attributes.y1);
              ctx.lineTo(line.attributes.x2, line.attributes.y2);
            })

            var styleObj = map.helper.parseStyle(polyline.attributes.style);
            ctx.strokeStyle=map.helper.colorNameToHex(polyline.attributes.stroke);
            ctx.lineWidth=parseInt(styleObj["stroke-width"]);

            ctx.stroke();

          })
        }
      })
    },  // end of drawPolyline function ----------------------------------------

    drawPolygon: function(){
      $(document).ready(function(){
        if(map.canvasId !== null && typeof map.polygon === 'object'){

          map.canvas = document.getElementById( map.canvasId );
          var ctx = map.canvas.getContext('2d');

          map.polygon.forEach(function(polygon,i){
            ctx.beginPath();

            polygon.lines.forEach(function(line,index){
              if(index === 0) ctx.moveTo(line.attributes.x1, line.attributes.y1);
              ctx.lineTo(line.attributes.x2, line.attributes.y2);
            })

            var styleObj = map.helper.parseStyle(polygon.attributes.style);
            ctx.strokeStyle=map.helper.colorNameToHex(polygon.attributes.stroke);
            ctx.lineWidth=parseInt(styleObj["stroke-width"]);
            ctx.fillStyle=map.helper.colorNameToHex(polygon.attributes.fill);

            ctx.fill();
            ctx.stroke();
          })
        }
      })
    },  // end of drawPolygon function -----------------------------------------

    drawRect: function(){
      $(document).ready(function(){
        if(map.canvasId !== null && typeof map.rect === 'object'){

          map.canvas = document.getElementById( map.canvasId );
          var ctx = map.canvas.getContext('2d');

          map.rect.forEach(function(rect,i){
            if(rect.attributes.id !== 'svgEditorBackground'){

              ctx.beginPath();
              var styleObj = map.helper.parseStyle(rect.attributes.style);
              ctx.strokeStyle=map.helper.colorNameToHex(rect.attributes.stroke);
              ctx.lineWidth=parseInt(styleObj["stroke-width"]);
              ctx.fillStyle=map.helper.colorNameToHex(rect.attributes.fill);
              ctx.rect(rect.attributes.x1,rect.attributes.y1,rect.attributes.x2,rect.attributes.y2);
              ctx.fill();
              ctx.stroke();

            }
          })
        }
      })
    },  // end of drawRect function --------------------------------------------

    drawCircle: function(){
      $(document).ready(function(){
        if(map.canvasId !== null && typeof map.circle === 'object'){

          map.canvas = document.getElementById( map.canvasId );
          var ctx = map.canvas.getContext('2d');

          map.circle.forEach(function(circle,i){
              ctx.beginPath();
              var styleObj = map.helper.parseStyle(circle.attributes.style);
              ctx.strokeStyle=map.helper.colorNameToHex(circle.attributes.stroke);
              ctx.lineWidth=parseInt(styleObj["stroke-width"]);
              ctx.fillStyle=map.helper.colorNameToHex(circle.attributes.fill);

              ctx.arc(circle.attributes.cx,circle.attributes.cy,circle.attributes.r,0,2*Math.PI);
              ctx.fill();
              ctx.stroke();
          })
        }
      })
    },  // end of drawCircle function --------------------------------------------

    fireCollisionDetect: function(objs){
      if(map.svgObj !== null && map.canvasId !== null){

        map.event.mousemove();
        objs.forEach(function(obj,i){
          if(obj === 'line' || obj === 'all') window.setInterval(function(){ map.collisionDetectOnLine(map.line); },100);
          if(obj === 'polyline' || obj === 'all') window.setInterval(function(){ map.collisionDetectOnPolyline(); },100);
          if(obj === 'polygon' || obj === 'all') window.setInterval(function(){ map.collisionDetectOnPolygon(); },100);
          if(obj === 'circle' || obj === 'all') window.setInterval(function(){ map.collisionDetectOnCircle(); },100);
        })

      }
    }, // end of collisionDetect function --------------------------------------

    collisionDetectOnLine: function(lines){

      lines.forEach(function(line,i){

        var lineLength = line.attributes.length;
        var mouseDistoPoint1 = map.math.lineLength(map.mousePos.x,map.mousePos.y,Number(line.attributes.x1),Number(line.attributes.y1));
        var mouseDistoPoint2 = map.math.lineLength(map.mousePos.x,map.mousePos.y,Number(line.attributes.x2),Number(line.attributes.y2));

        if(lineLength.toFixed(1) === (mouseDistoPoint1+mouseDistoPoint2).toFixed(1)){
          console.log('collision');
          return false;
        }

      })

    }, // end of collisionDetectOnLine function --------------------------------

    collisionDetectOnPolyline: function(objs){

      map.polyline.forEach(function(polyline,i){

        map.collisionDetectOnLine(polyline.lines);

      })

    }, // end of collisionDetectOnPolyline function ----------------------------

    collisionDetectOnPolygon: function(objs){

      map.polygon.forEach(function(polyline,i){

        map.collisionDetectOnLine(polyline.lines);

      })

    }, // end of collisionDetectOnPolygon function ----------------------------

    collisionDetectOnCircle: function(objs){
      if(map.mousePos.x !== null && map.mousePos.y !== null){
        map.circle.forEach(function(circle,i){

          var mouseDistoCenter = map.math.lineLength(map.mousePos.x,map.mousePos.y,Number(circle.attributes.cx),Number(circle.attributes.cy));
          if(Number(circle.attributes.r) >= mouseDistoCenter){
            console.log('collision');
          }
        })
      }

    }, // end of collisionDetectOnCircle function ------------------------------

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

    event: {

      mousemove: function(){
        if(map.svgObj !== null && map.canvasId !== null){
          $('#'+map.canvasId).on('mousemove',function(e){
            map.mousePos.x = e.pageX - $(this).offset().left;
            map.mousePos.y = e.pageY - $(this).offset().top;
          })
        }
      } // end of mousemove function -------------------------------------------

    } // end of event obj ------------------------------------------------------

  } // end of map prototype ----------------------------------------------------

  $.fn.map = function (params) {

    var map = new map(this);
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        map[key] = params[key];
      }
    }
    map.loadSVG(map.svgfile);

  };  // end of jQuery plugIn --------------------------------------------------

  var map = new map();
  map.canvasId = 'canvas';
  map.loadSVG('xmls/drawsvg3.xmls', ['all'], ['all'] );

})(jQuery,window,document);



















////////////////////////////////////////////////////////////////////////////////
