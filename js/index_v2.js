var engine = new engine();

engine.createGameWorld('canvas');

// setInterval(function(){
//
//   engine.add('circle',{
//     x:0,
//     y:0,
//     r:10,
//     mass:10,
//     velocity:{x:5,y:5},
//   });
//
// },1000)

engine.add('circle',{
  x:-250,
  y:50,
  r:100,
  mass:10,
  velocity:{x:5,y:5},
  // force:{x:0,y:0},
});

engine.add('circle',{
  x:0,
  y:50,
  r:50,
  mass:10,
  velocity:{x:-5,y:-5},
  // force:{x:0,y:0},
});

engine.add('circle',{
  x:180,
  y:50,
  r:50,
  mass:10,
  velocity:{x:5,y:5},
  // force:{x:0,y:0},
});

engine.add('circle',{
  x:250,
  y:100,
  r:50,
  mass:100,
  velocity:{x:10,y:10},
  // force:{x:0,y:0},
});

engine.addRules(['gravity','border','collision']);
// engine.addRules(['border','airfriction']);
// engine.addRules(['gravity','border']);

engine.updateFrame();


console.log(engine);
// engine.updateFrame();
