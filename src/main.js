var SCREEN_WIDTH = 360;
var SCREEN_HEIGHT = 640;
var GAME_AREA_WIDTH = SCREEN_WIDTH;
var GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.85;
var FPS = 60;

phina.main(function() {

  phina.display.DisplayScene.defaults.$extend({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "transparent",
  });
  
  phina.display.Label.defaults.fontFamily = "main";
  phina.display.Label.defaults.fill = "white";

  var app = passion.Application();
  if (location.hostname == "localhost") {
    app.enableStats();
  }
  app.run();

  app.replaceScene(phina.game.ManagerScene({
    scenes: [

      {
        className: "phina.game.LoadingScene",
        arguments: {
          assets: passion.Assets.get({ assetType: "common" }),
        },
      },

      {
        className: "passion.StageAssetLoadScene",
        arguments: {
          stage: "testStage",
        },
      },

      {
        className: "passion.GameScene",
      },

    ]
  }));

});
