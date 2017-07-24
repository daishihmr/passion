phina.namespace(() => {

  phina.define("passion.Application", {
    superClass: "phina.display.CanvasApp",

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "#114",
      });

      this.fps = FPS;

      this.keyboardEx = passion.Keyboard(document);
      this.keyboardEx.on('keydown', e => {
        this.currentScene && this.currentScene.flare('keydown', {
          keyCode: e.keyCode,
        });
      });
      this.keyboardEx.on('keyup', e => {
        this.currentScene && this.currentScene.flare('keyup', {
          keyCode: e.keyCode,
        });
      });
      this.keyboardEx.on('keypress', e => {
        this.currentScene && this.currentScene.flare('keypress', {
          keyCode: e.keyCode,
        });
      });

      this.gamepadManager = passion.GamepadManager();
    },

    update: function() {
      this.keyboardEx.update();
      this.gamepadManager.update();
    },

  });
});
