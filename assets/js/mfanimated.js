// handles interfacing with GIFEncoder
var MFAnimatedGIF = function(opts) {
    var encoder;

    var _rotate = function(image, rotation) {
        var canvas = document.createElement("canvas");

        canvas.width = image.width;
        canvas.height = image.height;

        var ctx = canvas.getContext('2d');
        ctx.translate(image.width/2, image.height/2);
        ctx.rotate(rotation * Math.PI / 180.0);
        ctx.drawImage(image, -image.width/2, -image.height/2, image.width, image.height);
        ctx.rotate(rotation * Math.PI / 180.0);
        ctx.translate(-image.width/2, -image.height/2);

        return canvas;
    };

    var _initialize = function(opts) {

        var canvas = document.createElement("canvas");
        var context = canvas.getContext('2d');

        encoder = new GIFEncoder();
        encoder.setRepeat(opts.repeat);
        encoder.setDelay(opts.delay);
        canvas.width  = opts.width;
        canvas.height = opts.height;
        encoder.setSize(opts.width, opts.height);
        encoder.setQuality(21 - (20 * (opts.quality / 10)));

        encoder.start();

        for(var i=0; i<opts.images.length; i++) {
            var animframe = (opts.rotations[i] === 0) ? opts.images[i] : _rotate(opts.images[i], opts.rotations[i]);

            var ctx = canvas.getContext('2d');
            ctx.drawImage(animframe, 0, 0, animframe.width, animframe.height, 0, 0, canvas.width, canvas.height);
            
            encoder.addFrame(ctx);    
        }

        encoder.finish();
    };

    var _rawDataURL = function() {
        return $.base64.encode(encoder.stream().getData());
    };

    var _dataURL = function() {
        return 'data:image/gif;base64,' + _rawDataURL();
    };

    var _binaryURL = function() {
        // Convert encoder data to binary format
        var data = encoder.stream().getData();
        var byteArray = new Uint8Array(data.length);
        for (var i = 0; i < data.length; i++) {
            byteArray[i] = data.charCodeAt(i) & 0xff;
        }

        var bb = new BlobBuilder();
        bb.append(byteArray.buffer);
        return window.URL.createObjectURL(bb.getBlob("image/gif"));
    };

    _initialize(opts);

    return {
        dataURL   : _dataURL,
        rawDataURL: _rawDataURL,
        binaryURL : _binaryURL
    };
};
