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
            console.log(files[i]);
            var reader = new FileReader();
            reader.onloadend = function(e){
                var img = document.createElement("img");
                img.src = e.target.result;

                var li = document.createElement("li");
                $(img).prependTo(li);

                $(li).prependTo('#inimglist');
            };
            reader.readAsDataURL(files[i]);
        }
    });

})(window, jQuery);
