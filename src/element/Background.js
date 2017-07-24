phina.namespace(() => {

  phina.define("passion.Background", {
    superClass: "passion.Sprite",

    _static: {
      setup: function(glLayer, texture) {
        const texSrc = phina.asset.AssetManager.get("image", texture);
        const height = texSrc.domElement.height * GAME_AREA_WIDTH / texSrc.domElement.width;
        const tex = phina.graphics.Canvas().setSize(512, 512);
        tex.context.drawImage(texSrc.domElement, 0, 0, 512, 512);
        phina.asset.AssetManager.set("image", texture + "_bg", tex);

        glLayer.bgDrawer.addObjType("bg", {
          className: "passion.Background",
          texture: texture + "_bg",
          count: 2,
        });

        const bg1 = glLayer.bgDrawer.get("bg");
        bg1.spawn(height);
        bg1.x = GAME_AREA_WIDTH / 2;
        bg1.y = GAME_AREA_HEIGHT / 2;
        bg1.addChildTo(glLayer);

        const bg2 = glLayer.bgDrawer.get("bg");
        bg2.spawn(height);
        bg2.x = GAME_AREA_WIDTH / 2;
        bg2.y = GAME_AREA_HEIGHT / 2 - height;
        bg2.addChildTo(glLayer);
      },
    },

    height: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", e => {
        this.y += 3;
        if (this.y > GAME_AREA_HEIGHT / 2 + this.height) {
          this.y -= this.height * 2;
        }
      });
    },

    spawn: function(height) {
      this.height = height;
      this.superMethod("spawn", {
        scaleX: GAME_AREA_WIDTH,
        scaleY: this.height,
        frameX: 0,
        frameY: 0,
        frameW: 1,
        frameH: 1,
        red: 0.5,
        green: 0.5,
        blue: 0.5,
      });
      return this;
    },

  });
});
