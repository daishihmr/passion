phina.namespace(() => {

  let c = 0;

  phina.define("passion.LaserMazzleFlash", {
    superClass: "passion.Sprite",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

    spawn: function(options) {
      this.superMethod("spawn", options.$safe({
        frameX: 5 / 8,
        frameY: 1 / 8,
        frameW: 1 / 8,
        frameH: 1 / 8,
        scaleX: 130 + Math.sin(c) * 30,
        scaleY: 130 + Math.sin(c) * 30,
        alpha: 0.1,
        rotation: (-90).toRadian(),
      }));
      this.tweener
        .clear()
        .to({
          alpha: 0
        }, 300)
        .call(() => this.remove());

      c += 0.4;

      return this;
    },

  });
});
