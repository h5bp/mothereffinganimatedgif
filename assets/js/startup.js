/*global Modernizr, FileReaderJS, MFAApp MFAAppView, TimelineView */


// test to see if we can do cool download or fallback style.
Modernizr
    .addTest("bloburls",    !!(window.URL && window.URL.createObjectURL || window.webkitURL && window.webkitURL.createObjectURL))
    .addTest("download",    "download" in document.createElement("a"))
    .addTest("formdata",    !!(window.FormData && "append" in window.FormData.prototype));

// Bail out if the browser doesn't support required features
// a[download] are is required, as there is a fallback (not really)
var support = FileReaderJS.enabled && Modernizr.draganddrop &&
              document.querySelector && Modernizr.postmessage && window.JSON;
if (!support) {
    $("body").addClass("disabled");
    var caniscript = document.createElement('script');
    caniscript.src = 'http://api.html5please.com/json+filereader+draganddrop+querySelector+postmessage.json?callback=canicallback&texticon&html&readable';
    document.body.appendChild(caniscript);
} else {

    window.appView = new MFAAppView({model: new MFAApp()});

    // drag and drop file setup.
    var opts = {
        accept: 'image/*',
        on: {
            beforestart: function(file) {
                if (file.size > MFAApp.MAX_BYTES) {
                    return false;
                }
            },
            error: function(file) {
                $('div#inimglist').trigger('filedroperror', file);
            },
            load: function(e, file) {
                $('div#inimglist').trigger('filedropsuccess', [e.target.result, file]);
            }
        }
    };

    // the library handles most of the dnd bits.
    FileReaderJS.setupDrop(document.body, opts);
    FileReaderJS.setupClipboard(document.body, opts);
}

function canicallback(data) {
  $('#dropArea').html(data.html);
}
