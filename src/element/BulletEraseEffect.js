phina.namespace(function() {

  phina.define("passion.BulletEraseEffect", {
    superClass: "passion.Sprite",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("enterframe", function(e) {
        if (e.app.ticker.frame % 2 === 0) {
          this.frameX += 1 / 8;
          if (this.frameX >= 1.0) {
            this.remove();
          }
        }
      });
    },

    spawn: function(options) {
      passion.Sprite.prototype.spawn.call(this, {}.$extend(options, {
        frameX: 0,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        scaleX: 64,
        scaleY: 64,
        alpha: 1.0,
      }));
      return this;
    },

  });
});
