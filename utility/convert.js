const im = require("imagemagick");
const { thumbSize } = require("../config/config");

module.exports = {
  convert: async function (source, destination, ext, callBack) {
    let cmd;
    switch (ext) {
      case "jpeg":
      case "jpg":
      case "png":
        cmd = [`${source}`, "-thumbnail", thumbSize, "-flatten", destination];
        break;
      case "pdf":
        cmd = [
          `${source}\[0\]`,
          "-thumbnail",
          thumbSize,
          "-flatten",
          destination,
        ];
        break;
      default:
        break;
    }
    
    im.convert(cmd, function (err, convertRes) {
      if (err) {
        console.log(err);
        callBack({ status: false });  
      }
      callBack({ status: true });
      
    });
  },
};
