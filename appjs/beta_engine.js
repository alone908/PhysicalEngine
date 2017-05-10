
;(function (root, factory) {

  root.Engine = factory.call(root);

}(typeof window !== 'undefined' ? window : this, function () {

'use strict';

var window = this;
var document = window.document;
var world = {};

var Engine = function Engine(){

};


(function(){

    Engine.renderer = function(){

    }

}());









return Engine;

}));


// var Engine = (function(Engine){
//
//   return Engine;
//
// }(Engine || {}))
//
// Engine.svg = (function(svg){
//
//   var set = {
//         svgDoc:null,
//         svgfile:null,
//         canvasId:null,
//         canvas:null,
//         ctx:null,
//         svgObj:null,
//         showLine:true,
//         showPolyline:true,
//         showPolygon:true,
//         showRect:true,
//         showCircle:true}
//
//   for(var i in set){
//     if(svg[i] === undefined) svg[i] = set[i];
//   }
//
//
//   console.log(svg);
//   return svg;
//
//
//
// }(Engine.svg || {}));
//
// console.log(Engine);
