(function(window, $){
    
    var App = {};
    App.MAX_BYTES = 102400; // 100 KB
    App.timeline = [];

    $('#dropArea').on('dragenter', function(e){
        e.preventDefault();
    }).on('dragexit', function(e){
        e.preventDefault();
    }).on('dragover', function(e){
        e.preventDefault();
    }).on('drop', function(e){
        e.preventDefault();
        var data = e.dataTransfer,
            files = data.files,
            reader = {};
        for(var file in files){
            // file.fileName
            reader = new FileReader();
            reader.onloadend = function(e){
                var data = event.currentTarget.result.substr(0, App.MAX_BYTES);
            };
            reader.readAsBinaryString(file);
            //reader.readAsDataURL(file);
        }
    });

})(window, jQuery);