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

      // Pointer Lock APIが実装されたら使う
      // if (!phina.isMobile()) {
      //   this.pointerLock = passion.PointerLock(this.domElement);
      //   window.document.addEventListener("click", e => {
      //     if (this.currentScene instanceof passion.GameScene) {
      //       this.pointerLock.lock();
      //     } else {
      //       this.pointerLock.exit();
      //     }

      //     this.on("changedscene", e => {
      //       if (this.currentScene instanceof passion.GameScene) {
      //         this.pointerLock.lock();
      //       } else {
      //         this.pointerLock.exit();
      //       }
      //     });
      //   }, false);
      // }
    },

    replaceScene: function(scene) {
      this.superMethod("replaceScene", scene);
      this.flare('changedscene');
    },

    pushScene: function(scene) {
      this.superMethod("pushScene", scene);
      this.flare('changedscene');
    },

    popScene: function(scene) {
      this.superMethod("popScene", scene);
      this.flare('changedscene');
    },

    update: function() {
      this.keyboardEx.update();
      this.gamepadManager.update();
    },

  });
});
