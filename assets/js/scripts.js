(function(window, $){

    var App = {};
    App.MAX_BYTES = 102400; // 100 KB
    App.timeline = [];

    var delayInterval = 300;
    var frameHighlightTimer = null;
    var fileList = $('#inimglist').empty();
    var opts = {
        on: {
            loadend: function(e, file) {
                fileList.append("<li><img src='" + e.target.result + "' /></li>");

                var originalimg = new Image();
                originalimg.src = e.target.result;
                App.timeline.push(originalimg);
            },
            groupstart: function(group) {
            },
            groupend: function(group) {
            }
        }
    };

    FileReaderJS.setupDrop(document.body, opts);
    FileReaderJS.setupClipboard(document.body, opts);

    // Update the frame on the viewer
    var currentFrame = 0;
    var updateCurrentFrame = function() {
      var totalItems = App.timeline.length - 1;
      if (currentFrame < totalItems) {
        currentFrame++
      } else {
        currentFrame = 0
      }

      $('li', fileList).removeClass('current').eq(currentFrame).addClass('current')
    }

    $('.play').on('click', function(e) {
        // Hide the image if it's not playing
        if ($(this).hasClass('isPlaying')) {
          $(this).removeClass('isPlaying').text('Play')
          $('#animresult').hide()
          $('li.current', fileList).removeClass('current')

          clearInterval(frameHighlightTimer)

          return false
        } else {
          $(this).addClass('isPlaying').text('Pause')
        }

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        var encoder = new GIFEncoder();
        encoder.setRepeat(0);
        encoder.setDelay(delayInterval);
        canvas.width = 75;
        canvas.height = 75;
        encoder.setSize(75,75);

        encoder.start();

        var totalItems = App.timeline.length;
        for(var i=0; i < totalItems; i++) {
            var animframe = App.timeline[i];
            var ctx = canvas.getContext('2d');

            ctx.drawImage(animframe, 0, 0, animframe.width, animframe.height, 0, 0, canvas.width, canvas.height);

            encoder.addFrame(ctx);
        }

        encoder.finish();

        // Play the animation
        currentFrame = 0
        $('li', fileList).eq(0).addClass('current')
        $('#animresult').attr('src', 'data:image/gif;base64,' + $.base64.encode(encoder.stream().getData())).show();
        frameHighlightTimer = setInterval(updateCurrentFrame, delayInterval)

        return false;
    });

})(window, jQuery);
