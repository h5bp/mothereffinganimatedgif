var TimelineImage = Backbone.Model.extend({
    initialize: function() {
        this.set('originalImage', new Image());
    },
    setSrc: function(src) {
        this.get('originalImage').src = src;

        // todo this isn't the right place to do this
        if (!window.app.get('timeline') || window.app.get('timeline').length === 1) {
            var originalimg = this.get('originalImage');
            originalimg.onload = function() {
                MFAApp.initialWidth = originalimg.width;
                MFAApp.initialHeight = originalimg.height;
                $(window).trigger('firstimage');
            };
        }
    }
});

var Timeline = Backbone.Collection.extend({
    noPersistence: new bnp.NoPersistence(),
    model: TimelineImage,
    comparator: function(timelineImage) {
        return timelineImage.get("sequence");
    },
    addImage: function(image) {
        image.set('sequence', this.length);
        this.add(image);
        this.sort();
    },
    swapImages: function(firstImage, secondImage) {
        var firstRef = this.find(function(img) { return img.get('originalImage').src === firstImage.src; });
        var secondRef = this.find(function(img) { return img.get('originalImage').src === secondImage.src; });

        var seq = firstRef.get('sequence');
        firstRef.set('sequence', secondRef.get('sequence'));
        secondRef.set('sequence', seq);

        this.sort();
    },
});

var MFAApp = Backbone.Model.extend({
    defaults: {
           rate: 300,
        quality: 10,
      animHeight: 200,
       animWidth: 200
    },
    initialize: function() {
       this.set('timeline', new Timeline());
    },
    getRawImages: function() {
       return this.get('timeline').map(function(timelineImage) { return timelineImage.get('originalImage'); });
    },
    tempClear: function() {
        $("#animresult").attr("src", "about:blank").hide();
        $("body").removeClass("hasfiles");
        $("#inimglist").empty();
        this.clear(); // todo need to set defaults again?
    },
    swapImages: function(firstImage, secondImage) {
      this.get('timeline').swapImages(firstImage, secondImage);
    },
    buildGif: function() {

        if (!this.get('timeline').length) {
            return;
        }
        
        var rotations = [];
        $('.rotateimg').each(function(j, el) {
            rotations.push($(el).data('rotation'));
        });

        this.set('mfAnimatedGIF', new MFAnimatedGIF({
            images: this.getRawImages(),
            rotations: rotations,
            delay : this.get('rate'),
            quality : this.get('quality'),
            repeat: 0,

            // use dimensions from first image as default
            height: this.get('animHeight'), // todo || App.timeline[0].height,
            width : this.get('animWidth') // todo  || App.timeline[0].width
        }));

        $('#sharelink').css({'display':'inline-block'});

        $('#animresult').attr('src', this.get('mfAnimatedGIF').dataURL());

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
            a.href = this.get('mfAnimatedGIF').binaryURL(filename);
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
            iframe.contentWindow.postMessage(JSON.stringify({name:filename, data: app.window.get('mfAnimatedGIF').rawDataURL(), formdata: Modernizr.formdata}),"http://saveasbro.com/gif/");
        }
    }
});

// constants
MFAApp.initialWidth = 20;
MFAApp.initialHeight = 20;
MFAApp.initialRate = 300; // 300ms delay in frames
MFAApp.initialQuality = 10; // 10 is supposed to give a good balance
MFAApp.maxQuality = 20;
MFAApp.MAX_BYTES = 2*1024*1024; // 2MB
