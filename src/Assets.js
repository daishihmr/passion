phina.namespace(function() {

  phina.define("passion.Assets", {
    _static: {
      get: function(options) {
        switch (options.assetType) {
          case "common":
            return {
              font: {
                main: "./asset/font/Baumans/Baumans-Regular.ttf",
                message: "./asset/font/YasashisaGothic.ttf",
              },
              image: {
                "test.png": "./asset/image/test.png",
                "test2.png": "./asset/image/test2.png",
                "bg.png": "./asset/image/bg.png",
                "bullets.png": "./asset/image/bullets.png",
                "texture0.png": "./asset/image/texture0.png",
                "enemy1.png": "./asset/image/enemy1.png",
              },
              vertexShader: {
                "bullets.vs": "./asset/shader/bullets.vs",
                "sprites.vs": "./asset/shader/sprites.vs",
              },
              fragmentShader: {
                "bullets.fs": "./asset/shader/bullets.fs",
                "sprites.fs": "./asset/shader/sprites.fs",
              },
              xml: {
                "simple": "./asset/bulletml/simple.bulletml",
                "test": "./asset/bulletml/test.bulletml",
              },
            };
          default:
            throw "invalid assetType: " + options.assetType;
        }
      },
    },
  });

});
