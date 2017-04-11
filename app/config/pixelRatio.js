var React = require('react-native')
var { PixelRatio } = React

var pixelRatio = PixelRatio.get();

module.exports = (size) => {
    switch (pixelRatio){
        case 1:
            return size * 0.9;
            break;
        case 2:
            return size * 1.15;
            break;
        case 3:
            return size * 1.35;
            break;
        default:
            return size * pixelRatio;
    }
}

//    if (pixelRatio == 2) {
//        return size * 1.15;
//    }
//    if (pixelRatio == 3) {
//        return size * 1.35;
//    }
//    return size * pixelRatio;
