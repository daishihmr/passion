phina.namespace(function() {

  phina.define("passion.ParticleEmitter", {
    superClass: "phina.display.Element",

    x: 0,
    y: 0,

    drawer: null,
    objName: null,
    spawnOptions: null,

    genPerFrame: 0,

    init: function(drawer, objName, spawnOptions) {
      this.superInit();
      this.drawer = drawer;
      this.objName = objName;
      this.spawnOptions = spawnOptions;
    },

    update: function(app) {
      for (var i = 0; i < this.genPerFrame; i++) {
        var p = this.drawer.get(this.objName);
        if (p) {
          p.spawn({}.$extend(this.spawnOptions, {
            x: this.x,
            y: this.y,
          }));
          this.flare("spawnParticle", { particle: p });
        } else {
          break;
        }
      }
    },
  });

  phina.define("passion.Particle", {
    superClass: "passion.Sprite",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("removed", function() {
        this.clear("enterframe");
        this.tweener.clear();
      });
    },

  });

});
