phina.namespace(function() {
  
  phina.define("passion.GLLayer", {
    superClass: "phina.display.Layer",

    static: {
      GL_CANVAS: null,
      GL: null,
    },

    renderChildBySelf: true,
    ready: false,

    domElement: null,
    gl: null,

    camera: null,

    enemyDrawer: null,
    effectDrawer: null,
    bulletDrawer: null,
    playerDrawer: null,

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

      var gl = this.gl = passion.GLLayer.GL;
      var extInstancedArrays = phigl.Extensions.getInstancedArrays(gl);

      gl.viewport(0, 0, this.domElement.width, this.domElement.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.disable(gl.CULL_FACE);

      var cw = this.domElement.width;
      var ch = this.domElement.height;
      var w = this.width;
      var h = this.height;
      var sw = Math.pow(2, ~~Math.log2(cw) + 1);
      var sh = Math.pow(2, ~~Math.log2(ch) + 1);

      this.camera = passion.Camera()
        .setPosition(w * 0.5, h * 0.5, 2000)
        .lookAt(w * 0.5, h * 0.5, 0)
        .ortho(-w * 0.5, w * 0.5, h * 0.5, -h * 0.5, 0.1, 3000)
        .calcVpMatrix();

      this.enemyDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);
      this.effectDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);
      this.bulletDrawer = passion.BulletDrawer(gl, extInstancedArrays, w, h);
      this.playerDrawer = passion.SpritDrawer(gl, extInstancedArrays, w, h);

      this.ready = true;
    },

    update: function(app) {
      if (!this.ready) return;

      this.enemyDrawer.update(app);
      this.effectDrawer.update(app);
      this.bulletDrawer.update(app);
      this.playerDrawer.update(app);
    },

    draw: function(canvas) {
      if (!this.ready) return;

      var gl = this.gl;
      var image = this.domElement;
      var cw = image.width;
      var ch = image.height;

      var ou = this.camera.uniformValues();

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.enemyDrawer.render(ou);
      this.effectDrawer.render(ou);
      this.bulletDrawer.render(ou);
      this.playerDrawer.render(ou);

      gl.flush();

      canvas.context.drawImage(image, 0, 0, cw, ch, 0, 0, this.width, this.height);
    },

    _static: {
      // quality: 0.5,
      quality: 1.0,
    },
  });

});
