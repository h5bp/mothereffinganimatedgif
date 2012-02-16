$(function() {
    
    var App = {};
    App.MAX_BYTES = 2097152; // 2MB
    App.timeline = [];

    var fileList = $("#inimglist");
    var timeline = $('#timeline');
    var dropArea = $('#dropArea');
    var currentFrame = 0;
    var delayInterval = 300;
    var frameHighlightTimer = null;
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
                fileList.append("<li><img src='" + e.target.result + "' /></li>");
                
                var originalimg = new Image();
                originalimg.src = e.target.result;
                App.timeline.push(originalimg);
            },
            groupstart: function(group) {
            },
            groupend: function(group) {
                if (App.timeline.length > 0) {
                    timeline.addClass('visible')
                    dropArea.addClass('withTimeline').html('<h2>Click play to start playing your GIF</h2>')
                } else {
                    timeline.removeClass('visible')
                    dropArea.removeClass('withTimeline').html('<h2>Drag and Drop files here</h2>')
                }
            }
        }
    };

    FileReaderJS.setupDrop(document.body, opts);
    FileReaderJS.setupClipboard(document.body, opts);
    
    // Update the frame on the viewer
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
        // Hide the image if it's not playing, reset the stage
        if ($(this).hasClass('isPlaying')) {
          $(this).removeClass('isPlaying').text('Play')
          $('li.current', fileList).removeClass('current')
          dropArea.html('<h2>Click play to start playing your GIF</h2>')

          clearInterval(frameHighlightTimer)

          return false
        } else {
          $(this).addClass('isPlaying').text('Pause')
        }
        
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
        
        // Play the animation
        currentFrame = 0
        $('li', fileList).eq(0).addClass('current')
        dropArea.html($('<img />').attr('src', 'data:image/gif;base64,' + $.base64.encode(encoder.stream().getData())))
        frameHighlightTimer = setInterval(updateCurrentFrame, delayInterval)

        return false;
    });

});