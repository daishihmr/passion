phina.namespace(function() {

  phina.define("passion.SpritDrawer", {
    superClass: "phigl.InstancedDrawable",

    objTypes: null,
    objParameters: null,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);

      this.objTypes = [];
      this.objParameters = {};

      var shader = phigl.Program(gl)
        .attach("sprites.vs")
        .attach("sprites.fs")
        .link();

      this
        .setProgram(shader)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            //
            -5, +5,
            //
            +5, +5,
            //
            -5, -5,
            //
            +5, -5,
          ]
        }, {
          unitSize: 2,
          data: [
            //
            0, 1,
            //
            1, 1,
            //
            0, 0,
            //
            1, 0,
          ]
        }, ])
        .setInstanceAttributes(
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceFrame",
          "instanceColor"
        )
        .setUniforms(
          "vpMatrix",
          "texture",
          "globalScale"
        );

      var instanceStride = this.instanceStride / 4;

      this.uniforms.globalScale.setValue(1.0);
    },

    addObjType: function(objName, options) {
      options = {}.$extend({
        className: "passion.Sprite",
        count: 1,
        texture: null,
        additiveBlending: false,
      }, options);

      if (!this.objTypes.contains(objName)) {
        var self = this;
        var instanceStride = this.instanceStride / 4;

        this.objTypes.push(objName);
        var objParameter = this.objParameters[objName] = {
          count: options.count,
          instanceVbo: phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW),
          texture: phigl.Texture(this.gl, options.texture),
          pool: null,
          additiveBlending: options.additiveBlending,
          instanceData: Array.range(options.count).map(function(i) {
            return [
              // visible
              0,
              // m0
              1, 0, 0,
              // m1
              0, 1, 0,
              // m2
              0, 0, 1,
              // m3
              0, 0, 0,
            ];
          }).flatten(),
        };

        var ObjClass = phina.using(options.className);
        objParameter.pool = Array.range(options.count).map(function(id) {
          return ObjClass(id, objParameter.instanceData, instanceStride)
            .on("removed", function() {
              objParameter.pool.push(this);
            });
        });
      }
    },

    get: function(objName) {
      return this.objParameters[objName].pool.shift();
    },

    update: function() {},

    render: function(uniforms) {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);

      this.uniforms.globalScale.value = 1.0;

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.uniforms[key]) this.uniforms[key].value = value;
        }.bind(this));
      }
      var self = this;
      this.objTypes.forEach(function(objName) {
        var objParameter = self.objParameters[objName];

        if (objParameter.additiveBlending) {
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        } else {
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }

        self.setInstanceAttributeVbo(
          objParameter.instanceVbo.set(objParameter.instanceData)
        );
        self.uniforms.texture.setValue(0).setTexture(objParameter.texture);
        self.draw(objParameter.count);
      });
    },
  });

});
