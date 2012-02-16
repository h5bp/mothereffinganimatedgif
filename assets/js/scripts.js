(function(window, $){
    
    var App = {};
    App.MAX_BYTES = 102400; // 100 KB
    App.timeline = [];

    $(function() {
        var fileList = $(".files ul").empty();
        var opts = {
            on: {
                loadend: function(e, file) {
                    fileList.append("<li><img src='"+e.target.result+"' /></li>");
                },
                groupstart: function(group) {
                },
                groupend: function(group) {
                }
            }
        };

        FileReaderJS.setupDrop(document.body, opts);
        FileReaderJS.setupClipboard(document.body, opts);
    });

})(window, jQuery);