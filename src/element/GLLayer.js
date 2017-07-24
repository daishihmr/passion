phina.namespace(() => {

  phina.define("passion.GLLayer", {
    superClass: "phina.display.Layer",

    renderChildBySelf: true,
    ready: false,

    domElement: null,
    gl: null,

    camera: null,

    bgDrawer: null,
    enemyDrawer: null,
    shotDrawer: null,
    effectDrawer: null,
    playerDrawer: null,
    bulletDrawer: null,
    topEffectDrawer: null,

    init: function() {
      this.superInit({
        width: GAME_AREA_WIDTH,
        height: GAME_AREA_HEIGHT,
      });
      this.originX = 0;
      this.originY = 0;

      if (passion.GLLayer.GL_CANVAS == null) {
        passion.GLLayer.GL_CANVAS = document.createElement("canvas");
        passion.GLLayer.GL = passion.GLLayer.GL_CANVAS.getContext("webgl");
      }

      this.domElement = passion.GLLayer.GL_CANVAS;
      this.domElement.width = this.width * passion.GLLayer.quality;
      this.domElement.height = this.height * passion.GLLayer.quality;

      const gl = this.gl = passion.GLLayer.GL;
      const extInstancedArrays = phigl.Extensions.getInstancedArrays(gl);

      gl.viewport(0, 0, this.domElement.width, this.domElement.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      const cw = this.domElement.width;
      const ch = this.domElement.height;
      const w = this.width;
      const h = this.height;
      const sw = Math.pow(2, ~~Math.log2(cw) + 1);
      const sh = Math.pow(2, ~~Math.log2(ch) + 1);

      this.camera = passion.Camera()
        .setPosition(w * 0.5, h * 0.5, 2000)
        .lookAt(w * 0.5, h * 0.5, 0)
        .ortho(-w * 0.5, w * 0.5, h * 0.5, -h * 0.5, 0.1, 3000)
        .calcVpMatrix();

      this.bgDrawer = passion.SpriteDrawer(gl, extInstancedArrays, w, h);
      this.enemyDrawer = passion.SpriteDrawer(gl, extInstancedArrays, w, h);
      this.shotDrawer = passion.SpriteDrawer(gl, extInstancedArrays, w, h);
      this.effectDrawer = passion.SpriteDrawer(gl, extInstancedArrays, w, h);
      this.playerDrawer = passion.SpriteDrawer(gl, extInstancedArrays, w, h);
      this.bulletDrawer = passion.BulletDrawer(gl, extInstancedArrays, w, h);
      this.topEffectDrawer = passion.SpriteDrawer(gl, extInstancedArrays, w, h);

      this.ready = true;
    },

    update: function(app) {
      if (!this.ready) return;

      this.bgDrawer.update(app);
      this.enemyDrawer.update(app);
      this.shotDrawer.update(app);
      this.effectDrawer.update(app);
      this.playerDrawer.update(app);
      this.bulletDrawer.update(app);
      this.topEffectDrawer.update(app);
    },

    draw: function(canvas) {
      if (!this.ready) return;

      const gl = this.gl;
      const image = this.domElement;
      const cw = image.width;
      const ch = image.height;

      const ou = this.camera.uniformValues();

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.bgDrawer.render(ou);
      this.effectDrawer.render(ou);
      this.enemyDrawer.render(ou);
      this.shotDrawer.render(ou);
      this.playerDrawer.render(ou);
      this.bulletDrawer.render(ou);
      this.topEffectDrawer.render(ou);

      gl.flush();

      const p = passion.GLLayer.padding;
      canvas.context.drawImage(image,
        0, 0, cw, ch,
        this.width * p, this.height * p, this.width * (1 - p * 2), this.height * (1 - p * 2)
      );
    },

    _static: {
      GL_CANVAS: null,
      GL: null,
      // padding: 0.1,
      // padding: 0.05,
      padding: 0.02,
      // quality: 0.5,
      // quality: 0.75,
      quality: 1.0,
    },
  });

});
