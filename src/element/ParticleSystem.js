phina.namespace(function() {

  phina.define("passion.ParticleEmitter", {
    superClass: "phina.display.Element",

    x: 0,
    y: 0,

    glLayer: null,
    drawer: null,
    objName: null,
    spawnOptions: null,

    genPerFrame: 0,

    init: function(glLayer, drawer, objName, spawnOptions) {
      this.superInit();
      this.glLayer = glLayer;
      this.drawer = drawer;
      this.objName = objName;
      this.spawnOptions = spawnOptions;
    },

    update: function(app) {
      for (var i = 0; i < this.genPerFrame; i++) {
        var p = this.drawer.get(this.objName);
        if (p) {
          p.spawn({}.$extend(this.spawnOptions(), {
            x: this.x,
            y: this.y,
          }));
          p.addChildTo(this.glLayer);
        } else {
          break;
        }
      }
    },

  });
});
