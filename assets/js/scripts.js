(function(window, $){
    
    var App = {};
    App.MAX_BYTES = 102400; // 100 KB
    App.timeline = [];

    $('#dropArea').on('dragover', function(e){
        e.stopPropagation();
        e.preventDefault();
    }).on('drop', function(e){
        e.stopPropagation();
        e.preventDefault();

        var files = e.originalEvent.dataTransfer.files;
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onloadend = function(e){
                var img = document.createElement("img");
                img.src = e.target.result;

                var originalimg = new Image();
                originalimg.src = img.src;
                App.timeline.push(originalimg);

                var li = document.createElement("li");
                $(img).attr('class', 'animframe');
                $(img).prependTo(li);

                $(li).prependTo('#inimglist');
            };
            reader.readAsDataURL(files[i]);
        }
    });

    $('.play').on('click', function(e) {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext('2d');

        var encoder = new GIFEncoder();
        encoder.setRepeat(0);
        encoder.setDelay(300);
        canvas.width = 75;
        canvas.height = 75;
        encoder.setSize(75,75);

        encoder.start();

        for(var i=0; i<App.timeline.length; i++) {
            var animframe = App.timeline[i];
            var ctx = canvas.getContext('2d');

            ctx.drawImage(animframe, 0, 0, animframe.width, animframe.height, 0, 0, canvas.width, canvas.height);
            
            encoder.addFrame(ctx);    
        }

        encoder.finish();
        $('#animresult').attr('src', 'data:image/gif;base64,'+$.base64.encode(encoder.stream().getData()));

        return false;
    });

})(window, jQuery);
