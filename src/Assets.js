phina.namespace(function() {

  phina.define("passion.Assets", {
    _static: {
      get: function(options) {
        switch (options.assetType) {
          case "common":
            return {
              image: {
                "bullets.png": "./asset/image/bullets.png",
                "test.png": "./asset/image/test.png",
              },
              vertexShader: {
                "bullets.vs": "./asset/shader/bullets.vs",
                "sprites.vs": "./asset/shader/sprites.vs",
              },
              fragmentShader: {
                "bullets.fs": "./asset/shader/bullets.fs",
                "sprites.fs": "./asset/shader/sprites.fs",
              },
            };
          default:
            throw "invalid assetType: " + options.assetType;
        }
      },
    },
  });

});
