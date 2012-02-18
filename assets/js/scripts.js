    var fileList = $("#inimglist");
    var body = $("body");

    var App = {};
    App.MAX_BYTES = 2*1024*1024; // 2MB
    App.initialRate = 300; // 300ms delay in frames
    App.initialQuality = 10; // 10 is supposed to give a good balance
    App.maxQuality = 20;
    App.timeline = [];
    App.mfAnimatedGIF = null;
    
    App.clear = function() {
        finalImage.attr("src", "about:blank").hide();
        fileList.empty();
        App.timeline = [];
        App.mfAnimatedGIF = null;
        body.removeClass("hasfiles");
    };
    App.rebuildTimeline = function() {
        App.timeline = fileList.find(".col").map(function() {
            var originalimg = new Image();
            var src = $(this).find("img").attr("src");
            if (src) {
                originalimg.src = src;
                return originalimg;
            }
        }).toArray();
    };
    
    setupDrag();
    

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
                fileList.append("<div class='col error'>Error<div class='fil3l'></div></div>");
            },
            skip: function(file) {
                fileList.append("<div class='col skip'>Skip<div class='fil3l'></div></div>");
            },
            load: function(e, file) {
                fileList.append("<div class='col'><img class='rotateimg' data-rotation='0' src='"+e.target.result+"' /><div class='fil3l'></div></div>");

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


    // Bail out if the browser doesn't support required features
    // blobbuilder and a[download] are not required, as there is a fallback
    var support = FileReaderJS.enabled && Modernizr.draganddrop &&
                    document.querySelector && Modernizr.postmessage && window.JSON;
    if (!support) {
        body.addClass("disabled");
        var caniscript = document.createElement('script');
        caniscript.src = 'http://sandbox.thewikies.com/caniuse/json+filereader+draganddrop+querySelector+postmessage.html?callback=canicallback';
        document.body.appendChild(caniscript);

    } else {

        // the library handles most of the dnd bits.
        FileReaderJS.setupDrop(document.body, opts);
        FileReaderJS.setupClipboard(document.body, opts);

    }

    $(document).on('click', '.rotateimg', function(e) {
        var currentRotation = parseInt($(e.currentTarget).attr('data-rotation')) + 90;
        if(currentRotation >= 360) currentRotation = 0;
        $(e.currentTarget).rotate(currentRotation);
        $(e.currentTarget).attr('data-rotation', currentRotation);
    });

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

            iframe.src = "http://saveasbro.com/gif/";
            iframe.setAttribute("style","position: absolute; visibility: hidden; left: -999em;");
            iframe.id = "saveasbro";
            document.body.appendChild(iframe);
        }


    
    var finalImage = $("#animresult");
    $(".clear").on('click', function() {
        App.clear();
        $('#sharelink').css({'display':'none'});
        return false;
    });
    
    // kick off GIF generation and download prep
    $('.play').on('click', function(e) {
        buildGif();
        return false;
    });

    $('#sharelink').on('click', function(e) {
        var filename = "animated."+((+new Date()) + "").substr(8);

        // Imgur takes the image data, filename, title, caption, success callback and error callback
        ShareGIFWith.imgur(App.mfAnimatedGIF.rawDataURL(), filename, '', '', 
        function(deletePage, imgurPage, largeThumbnail, original, smallSquare) {
            prompt('Boom! Your image is now available on imgur. Copy the link below:', imgurPage);
        }, 
        function() {
            alert('Could not upload image to imgur. :/  Sorry.');
        });

        return false;
    });

    function buildGif() {

        if (!App.timeline.length) {
            return;
        }
        
        var rotations = [];
        $('.rotateimg').each(function(j, el) {
            rotations.push($(el).data('rotation'));
        });

        App.mfAnimatedGIF = new MFAnimatedGIF({
            images: App.timeline,
            rotations: rotations,
            delay : App.rate, 
            quality : App.quality, 
            repeat: 0,

            // use dimensions from first image as default
            height: App.animHeight || App.timeline[0].height,
            width : App.animWidth  || App.timeline[0].width
        });

        // todo the following will display the share link when ready 
        $('#sharelink').css({'display':'inline-block'});

        $('#animresult').attr('src', App.mfAnimatedGIF.dataURL());

        //
        // Create the download link
        //
        window.URL = window.webkitURL || window.URL;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

        var filename = "animated."+((+new Date()) + "").substr(8);

        var a = document.querySelector('#downloadlink');
        a.style.display = "none";

        if(Modernizr.download && Modernizr.bloburls && Modernizr.blobbuilder) {
            a.download = filename + '.gif';
            a.href = App.mfAnimatedGIF.binaryURL(filename);
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
                a.href = e.data;
                a.style.display = "inline-block";
            };

            var iframe = document.querySelector('#saveasbro');
            iframe.contentWindow.postMessage(JSON.stringify({name:filename, data: App.mfAnimatedGIF.rawDataURL(), formdata: Modernizr.formdata}),"http://saveasbro.com/gif/");
        }

    }
    
function canicallback(data){
    $('#dropArea').html(data.html);
}
