(function(window, $){
    
    var MFAnimatedGIF = function(images, delay, repeat, width, height) {
        var encoder;

        var _initialize = function(images, delay, repeat, width, height) {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext('2d');

            encoder = new GIFEncoder();
            encoder.setRepeat(repeat);
            encoder.setDelay(delay);
            canvas.width = width;
            canvas.height = height;
            encoder.setSize(width, height);

            encoder.start();

            for(var i=0; i<images.length; i++) {
                var animframe = images[i];
                var ctx = canvas.getContext('2d');

                ctx.drawImage(animframe, 0, 0, animframe.width, animframe.height, 0, 0, canvas.width, canvas.height);
                
                encoder.addFrame(ctx);    
            }

            encoder.finish();
        };

        var _dataURL = function() {
            return 'data:image/gif;base64,' + $.base64.encode(encoder.stream().getData());
        };

        _initialize(images, delay, repeat, width, height);

        return {
            dataURL: _dataURL
        };
    }

    var App = {};
    App.MAX_BYTES = 2097152; // 2MB
    App.timeline = [];

    $(function() {
        
        var body = $("body");
        
        // Bail out if the browser doesn't support required features
        if (!FileReaderJS.enabled) {
            body.addClass("disabled");
            return;
        }
        
        var fileList = $("#inimglist");
        var opts = {
            accept: 'image/*',
            on: {
                beforestart: function(file) {
                    if (file.size > App.MAX_BYTES) {
                        return false;
                    }
                },
                error: function(file) {
                    fileList.append("<li class='error'>Error</li>");
                },
                skip: function(file) {
                    fileList.append("<li class='skip'>Skip</li>");
                },
                load: function(e, file) {
                    fileList.append("<li><img src='"+e.target.result+"' /></li>");
                    
                    var originalimg = new Image();
                    originalimg.src = e.target.result;
                    App.timeline.push(originalimg);
                },
                groupstart: function(group) {
                    $("body").addClass("hasfiles");
                },
                groupend: function(group) {
                }
            }
        };

        FileReaderJS.setupDrop(document.body, opts);
        FileReaderJS.setupClipboard(document.body, opts);

    });

    $('.play').on('click', function(e) {
        var mfAnimatedGIF = new MFAnimatedGIF(App.timeline, 300, false, 75, 75);

        $('#animresult').attr('src', mfAnimatedGIF.dataURL());

        return false;
    });

})(window, jQuery);
