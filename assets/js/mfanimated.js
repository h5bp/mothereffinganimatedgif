// handles interfacing with omggif-worker.js
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

        canvas.width  = opts.width;
        canvas.height = opts.height;

        var frames = [];
        for(var i=0; i<opts.images.length; i++) {
            var animframe = (opts.rotations[i] === 0) ? opts.images[i] : _rotate(opts.images[i], opts.rotations[i]);
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(animframe, 0, 0, animframe.width, animframe.height, 0, 0, canvas.width, canvas.height);

            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            frames.push(imageData);
        }

        var gifWorker = new Worker("assets/js/libraries/omggif-worker.js");

        gifWorker.addEventListener('message', function (e) {
            if (e.data.type === "progress") {
                // Percent done, 0.0-0.1
                opts.progress(e.data.data);
            } else if (e.data.type === "gif") {
                var info = e.data;
                info.binaryURL = _binaryURL( e.data.buffer );
                info.rawDataURL = _rawDataURL( e.data.string );
                info.dataURL = _dataURL( info.rawDataURL );
                opts.done(info);
            }
        }, false);
        gifWorker.addEventListener('error', function (e) {
            opts.error(e);
            gifWorker.terminate();
        }, false);

        gifWorker.postMessage({
            frames: frames,
            delay: opts.delay,
            matte: [255, 255, 255],
            transparent: [0, 255, 0]
        });

    };

    var _rawDataURL = function(data) {
        return $.base64.encode(data);
    };

    var _dataURL = function(rawData) {
        return 'data:image/gif;base64,' + rawData;
    };

    var _binaryURL = function(data) {
        window.URL = window.URL || window.webkitURL;
        var blob = new Blob([data], {type: 'image/gif'});
        return window.URL.createObjectURL(blob);
    };

    _initialize(opts);

};
