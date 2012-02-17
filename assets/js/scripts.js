
    // handles interfacing with GIFEncoder
    var MFAnimatedGIF = function(opts) {
        var encoder;

        var _initialize = function(opts) {

            var canvas = document.createElement("canvas");
            var context = canvas.getContext('2d');

            encoder = new GIFEncoder();
            encoder.setRepeat(opts.repeat);
            encoder.setDelay(opts.delay);
            canvas.width =  opts.width;
            canvas.height = opts.height;
            encoder.setSize(opts.width, opts.height);
            console.log(opts.quality);
            encoder.setQuality(opts.quality);

            encoder.start();

            for(var i=0; i<opts.images.length; i++) {
                var animframe = opts.images[i];
                var ctx = canvas.getContext('2d');

                ctx.drawImage(animframe, 0, 0, animframe.width, animframe.height, 0, 0, canvas.width, canvas.height);
                
                encoder.addFrame(ctx);    
            }

            encoder.finish();
        };

        var _dataURL = function() {
            return 'data:image/gif;base64,' + $.base64.encode(encoder.stream().getData());
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
            dataURL: _dataURL,
            binaryURL: _binaryURL
        };
    };

    var App = {};
    App.MAX_BYTES = 2*1024*1024; // 2MB
    App.initialRate = 300; // 300ms delay in frames
    App.initialQuality = 10; // 10 is supposed to give a good balance
    App.timeline = [];
    
    App.clear = function() {
        finalImage.attr("src", "about:blank").hide();
        fileList.empty();
        App.timeline = [];
        body.removeClass("hasfiles");
    };

    var fileList = $("#inimglist");
    var body = $("body");
        
    // Bail out if the browser doesn't support required features
    // blobbuilder and a[download] are not required, as there is a fallback
    if (!FileReaderJS.enabled || !Modernizr.draganddrop) {
        body.addClass("disabled");
    }
    
    // drag and drop setup.
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

                if (App.timeline.length === 0){
                    // TODO: do we need this?
                    // App.timeline[0].width seems to work fine when called in groupend
                    originalimg.onload = function(){
                        App.initialWidth    = originalimg.width;
                        App.initialHeight   = originalimg.height;
                        $(window).trigger('firstimage');
                    };
                }

                originalimg.src = e.target.result;
                App.timeline.push(originalimg);
            },
            groupstart: function(group) {
                body.addClass("hasfiles");
            },
            groupend: function(group) {
                // TOOOOOO SLOW
                //buildGif();
            }
        }
    };
    // the library handles most of the dnd bits.
    FileReaderJS.setupDrop(document.body, opts);
    FileReaderJS.setupClipboard(document.body, opts);


    // test to see if we can do cool download or fallback style.
        Modernizr.addTest({
            // BlobBuilder
            "blobbuilder": function() {
                return  !!(window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder);
            },
            // Blob URL support
            "bloburls": function() {
                return !!(window.URL && window.URL.createObjectURL || window.webkitURL && window.webkitURL.createObjectURL);
            },
            // download attribute
            "download": function() {
                return "download" in document.createElement("a");
            },
            // FormData
            "formdata": function() {
                return  !!(window.FormData && "append" in window.FormData.prototype);
            }
        });

        if(!Modernizr.download && $('#saveabro')) {
            var iframe = document.createElement("iframe");

            iframe.src = "http://saveasbro.com/";
            iframe.setAttribute("style","position: absolute; visibility: hidden; left: -999em;");
            iframe.id = "saveasbro";
            document.body.appendChild(iframe);
        }


    
    var finalImage = $("#animresult");
    $(".clear").on('click', function() {
        App.clear();
        return false;
    });
    

    // kick off GIF generation and download prep
    $('.play').on('click', function(e) {
        buildGif();
        return false;
    }); // eo $('.play').on('click', function(e) {


    
    function buildGif() {

        if (!App.timeline.length) {
            return;
        }
        
        var mfAnimatedGIF = new MFAnimatedGIF({
            images: App.timeline,
            delay : App.rate, 
            quality : App.quality, 
            repeat: 0,

            // use dimensions from first image as default
            height: App.animHeight || App.timeline[0].height,
            width : App.animWidth  || App.timeline[0].width
        });

        $('#animresult').attr('src', mfAnimatedGIF.dataURL());

        //
        // Create the download link
        //
        window.URL = window.webkitURL || window.URL;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

        var filename = "animated.gif";

        var a = document.querySelector('#downloadlink');
        a.style.display = "none";

        if(Modernizr.download && Modernizr.bloburls && Modernizr.blobbuilder) {
            a.download = filename;
            a.href = mfAnimatedGIF.binaryURL(filename);
            a.style.display = "inline-block";

            a.onclick = function(e) {
              // Need a small delay for the revokeObjectURL to work properly.
              setTimeout(function() {
                window.URL.revokeObjectURL(a.href);
              }, 1500);
            };
        } else {
            window.onmessage = function(e) {
                e = e || window.event;

                var origin = e.origin || e.domain || e.uri;
                if(origin !== "http://saveasbro.com") return;
                a.href = "http://saveasbro.com/gif/" + e.data;
                a.style.display = "inline-block";
            };

            var iframe = document.querySelector('#saveasbro');
            iframe.contentWindow.postMessage(JSON.stringify({name:filename, data: mfAnimatedGIF.dataURL(), formdata: Modernizr.formdata}),"http://saveasbro.com");
        }

    }
    
