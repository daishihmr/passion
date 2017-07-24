const SCREEN_WIDTH = 360;
const SCREEN_HEIGHT = 640;
const GAME_AREA_WIDTH = SCREEN_WIDTH;
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.85;
const FPS = 60;
const PROD_DOMAIN = "private.dev7.jp";

phina.main(() => {

  phina.display.DisplayScene.defaults.$extend({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "transparent",
  });

  phina.display.Label.defaults.fontFamily = "main";
  phina.display.Label.defaults.fill = "white";

  phina.asset.SoundManager.volume = 0.05;
  phina.asset.SoundManager.musicVolume = 0.05;

  const app = passion.Application();
  if (location.hostname == "localhost" || location.hostname == PROD_DOMAIN) {
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
        arguments: { stage: "testStage" },
      },

      {
        className: "passion.GameScene",
      },

    ]
  }));
});