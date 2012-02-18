/*global Modernizr:false, FileReaderJS:false */


// test to see if we can do cool download or fallback style.
Modernizr
    .addTest("blobbuilder", !!(window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder))
    .addTest("bloburls",    !!(window.URL && window.URL.createObjectURL || window.webkitURL && window.webkitURL.createObjectURL))
    .addTest("download",    "download" in document.createElement("a"))
    .addTest("formdata",    !!(window.FormData && "append" in window.FormData.prototype));


if(!Modernizr.download && !$('#saveasbro').length) {
    var iframe = document.createElement("iframe");
    iframe.src = "http://saveasbro.com/gif/";
    iframe.style = "position: absolute; visibility: hidden; left: -999em;";
    iframe.id = "saveasbro";
    document.body.appendChild(iframe);
}

// Bail out if the browser doesn't support required features
// blobbuilder and a[download] are not required, as there is a fallback
var support = FileReaderJS.enabled && Modernizr.draganddrop &&
              document.querySelector && Modernizr.postmessage && window.JSON;
if (!support) {
    $("body").addClass("disabled");
    var caniscript = document.createElement('script');
    caniscript.src = 'http://sandbox.thewikies.com/caniuse/json+filereader+draganddrop+querySelector+postmessage.html?callback=canicallback';
    document.body.appendChild(caniscript);
} else {

    window.app = new MFAApp();
    window.appView = new MFAAppView({model: window.app});
    window.timelineView = new TimelineView({model: window.app.get('timeline')});

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
            skip: function(file) {
                // just skip it
            },
            load: function(e, file) {
                $('div#inimglist').trigger('filedropsuccess', [e.target.result, file]);
            },
            groupstart: function(group) {
                $("body").addClass("hasfiles"); // todo let the view handle this
            },
            groupend: function(group) { // todo let the view handle this
                // TOOOOOO SLOW
                //buildGif();
            }
        }
    };

    // the library handles most of the dnd bits.
    FileReaderJS.setupDrop(document.body, opts);
    FileReaderJS.setupClipboard(document.body, opts);

    setupDrag();
}

function canicallback(data) {
  $('#dropArea').html(data.html);
}
