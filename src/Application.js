phina.namespace(function() {

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
      this.keyboardEx.on('keydown', function(e) {
        this.currentScene && this.currentScene.flare('keydown', {
          keyCode: e.keyCode,
        });
      }.bind(this));
      this.keyboardEx.on('keyup', function(e) {
        this.currentScene && this.currentScene.flare('keyup', {
          keyCode: e.keyCode,
        });
      }.bind(this));
      this.keyboardEx.on('keypress', function(e) {
        this.currentScene && this.currentScene.flare('keypress', {
          keyCode: e.keyCode,
        });
      }.bind(this));

      this.gamepadManager = passion.GamepadManager();
    },

    update: function() {
      this.keyboardEx.update();
      this.gamepadManager.update();
    },

  });
});
