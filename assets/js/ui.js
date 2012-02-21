var AnimateButtonView = Backbone.View.extend({
    events: {
        'click': 'generateAnimation'
    },
    generateAnimation: function(e) {
        // todo can rotations be integrated into the image items?
        var self = this;
        $('.rotateimg').each(function(i, rel) {
            self.model.get('timeline').at(i).set('rotation', $(rel).data('rotation'));
        });

        var animatedGIF = this.model.getAnimatedGIF();

        return false;
    },
});

var ResetButtonView = Backbone.View.extend({
    events: {
        'click': 'clearTimeline'
    },
    clearTimeline: function(e) {
        this.model.restart();

        return false;
    },
});

var ShareButtonView = Backbone.View.extend({
    events: {
        'click': 'shareAnimation',
    },
    initialize: function() {
        this.model.on('animationGenerated', this.showShareLink, this);
        this.model.on('restart', this.hideShareLink, this);
    },
    showShareLink: function(animatedGIF) {
        if(animatedGIF) {
            this.$el.show();
        }
    },
    shareAnimation: function(e) {
        var filename = "animated."+((+new Date()) + "").substr(8);

        // Imgur takes the image data, filename, title, caption, success callback and error callback
        ShareGIFWith.imgur(this.model.getAnimatedGIF().rawDataURL(), filename, '', '', 
        function(deletePage, imgurPage, largeThumbnail, original, smallSquare) {
            prompt('Boom! Your image is now available on imgur. Copy the link below:', imgurPage);
        }, 
        function() {
            alert('Could not upload image to imgur. :/  Sorry.');
        });

        return false;
    },
    hideShareLink: function() {
        this.$el.hide();
    }
});

var DownloadButtonView = Backbone.View.extend({
    initialize: function() {
        this.model.on('animationGenerated', this.showDownloadLink, this);
        this.model.on('restart', this.hideDownloadLink, this);
    },
    showDownloadLink: function(animatedGIF) {
        if(animatedGIF) {
            window.URL = window.webkitURL || window.URL;
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

            var filename = "animated."+((+new Date()) + "").substr(8);

            var downloadLink = this.$el;
            downloadLink.hide();

            if(Modernizr.download && Modernizr.bloburls && Modernizr.blobbuilder) {
                downloadLink.attr('download', filename + '.gif');
                downloadLink.attr('href', animatedGIF.binaryURL(filename));
                downloadLink.show();

                downloadLink.on('click', function(e) {
                  // Need a small delay for the revokeObjectURL to work properly.
                  setTimeout(function() {
                    window.URL.revokeObjectURL(downloadLink.href);
                  }, 1500);
                });
            } else {
                window.onmessage = function(e) {
                    e = e || window.event;

                    var origin = e.origin || e.domain || e.uri;
                    if(origin !== "http://saveasbro.com") return;
                    downloadLink('href', e.data);
                    downloadLink.show();
                };

                var iframe = document.querySelector('#saveasbro');
                iframe.contentWindow.postMessage(JSON.stringify({name:filename, data: animatedGIF.rawDataURL(), formdata: Modernizr.formdata}),"http://saveasbro.com/gif/");
            }
        }
    },
    hideDownloadLink: function() {
        this.$el.hide();
    }
});

var AnimatedGIFView = Backbone.View.extend({
    initialize: function() {
        this.model.on('animationGenerated', this.showAnimatedGIF, this);
        this.model.on('restart', this.hideAnimatedGIF, this);
    },
    showAnimatedGIF: function(animatedGIF) {
        if(animatedGIF) {
            this.$el.attr('src', animatedGIF.dataURL()).show();
        }
    },
    hideAnimatedGIF: function(animatedGIF) {
        this.$el.attr("src", "about:blank").hide();
    }
});

var ResultsView = Backbone.View.extend({
    initialize: function() {
        this.animateButtonView = new AnimateButtonView({model: this.model, el: this.$el.find('.play')});
        this.resetButtonView = new ResetButtonView({model: this.model, el: this.$el.find('.clear')});
        this.downloadButtonView = new DownloadButtonView({model: this.model, el: this.$el.find('#downloadlink')});
        this.shareButtonView = new ShareButtonView({model: this.model, el: this.$el.find('#sharelink')});

        this.animatedGIFView = new AnimatedGIFView({model: this.model, el: this.$el.find('#animresult')});
    }
});

var TimelineView = Backbone.View.extend({
    events: {
        'filedropsuccess': 'insertFile',
        'filedroperror': 'fileError',

        'click .rotateimg': 'rotateTimelineImage',
    },
    initialize: function() {
        this.model.on('restart', this.restartTimeline, this);
    },
    restartTimeline: function() {
        this.$el.empty();
    },
    insertFile: function(e, fileData, fileInfo) {
        var timelineImage = new TimelineImage({sequence:this.model.nextSequence()});
        timelineImage.setSrc(fileData);
        this.model.addImage(timelineImage);

        // todo TimelineImageView.render
        this.$el.append("<div class='col'><img class='rotateimg' data-rotation='0' src='" + fileData + "' /><div class='fil3l'></div></div>");
    },
    fileError: function(e, fileInfo) {
        this.$el.append("<div class='col error'>Error<div class='fil3l'></div></div>");
    },
    rotateTimelineImage: function(e) {
        // todo can we stop putting the data in a data attr and instead tie it directly to the model?
        var currentRotation = parseInt($(e.currentTarget).attr('data-rotation')) + 90;
        if(currentRotation >= 360) currentRotation = 0;
        $(e.currentTarget).rotate(currentRotation);
        $(e.currentTarget).attr('data-rotation', currentRotation);
    }
});


var QualitySliderView = Backbone.View.extend({
    events: {
        'change input': 'setQuality',
    },
    initialize: function() {
		    this.model.setQuality(this.$el.find('input').val());
        this.$el.find('output').html(this.model.get('quality') + '<span>goodnesses</span>');
    },
    setQuality: function(e) {
		    this.model.setQuality($(e.target).val());
        this.$el.find('output').html(this.model.get('quality') + '<span>goodnesses</span>');
    }
});

var RateSliderView = Backbone.View.extend({
    events: {
        'change input': 'setRate'
    },
    initialize: function() {
		    this.model.setRate(this.$el.find('input').val());
        this.$el.find('output').html(this.model.get('rate') + '<span>ms</span>');
    },
    setRate: function(e) {
		    this.model.setRate($(e.target).val());
        this.$el.find('output').html(this.model.get('rate') + '<span>ms</span>');
    }
});

var SizeSliderView = Backbone.View.extend({
    events: {
        'change input': 'setSize'
    },
    _setInitialSize: function(initialWidth, initialHeight) {
        this.model.set('aspectRatio', initialHeight / initialWidth);

        this.$el.find('input').attr('max', initialWidth);
        this.$el.find('input').attr('value', initialWidth);

        this.$el.find('output').html(initialWidth + '<span>px</span>'); // todo move stuff like this to render

        this.model.setSize(Math.floor(initialWidth * this.model.get('aspectRatio')), initialWidth);
    },
    initialize: function() {
        // After an image has been added to the timeline we need to know the size
        var self = this;
        this.model.get('timeline').on('add', function(item) {
            item.on('imageLoaded', function(image) {
                if(image.get('sequence') === 0) {
                    self._setInitialSize(image.get('originalImage').width, image.get('originalImage').height);
                }
            });
            if(item.get('loaded') && item.get('sequence') === 0) {
                self._setInitialSize(item.get('originalImage').width, item.get('originalImage').height);
            }
        });
    },
    setSize: function(e) {
        var width = $(e.target).val();

        this.$el.find('output').html(width + '<span>px</span>'); // todo move stuff like this to render

        this.model.setSize(Math.floor(width * this.model.get('aspectRatio')), width);
    }
});

var SettingsView = Backbone.View.extend({
    initialize: function() {
      this.qualitySliderView = new QualitySliderView({model: this.model, el: this.$el.find('.quality')});
      this.rateSliderView = new RateSliderView({model: this.model, el: this.$el.find('.rate')});
      this.sizeSliderView = new SizeSliderView({model: this.model, el: this.$el.find('.size')});
    }
});

var MFAAppView = Backbone.View.extend({
    el: 'div#container',
    initialize: function() {
        this.model.on('restart', this.restartView, this);

        this.timelineView = new TimelineView({model: this.model.get('timeline'), el: this.$el.find('div#inimglist')});
        // todo create a settings model and restrict access to this view to that model
        this.settingsView = new SettingsView({model: this.model, el: this.$el.find('div.controls')});
        this.resultsView = new ResultsView({model: this.model, el: this.$el.find('#results')});
    },
    restartView: function() {
        $("body").removeClass("hasfiles");
    }
});

// todo this should be integrated into the timeline view
// http://www.html5rocks.com/en/tutorials/dnd/basics/#toc-examples
function setupDrag() {

  var container = $("#inimglist");
  var dragSrcEl_ = null;

  var handleDragStart = function(e) {
    e.originalEvent.dataTransfer.effectAllowed = 'move';
    e.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
    dragSrcEl_ = this;
    $(this).addClass('moving');
  };

  var handleDragOver = function(e) {
    if (e.originalEvent.preventDefault) {
      e.originalEvent.preventDefault(); // Allows us to drop.
    }
  
    e.originalEvent.dataTransfer.dropEffect = 'move';
  };

  var handleDragEnter = function(e) {
    $(this).addClass('over');
  };

  var handleDragLeave = function(e) {
    // this/e.target is previous target element.
    $(this).removeClass('over');
  };

  var handleDrop = function(e) {
  
    if (e.originalEvent.stopPropagation) {
      e.originalEvent.stopPropagation(); // stops the browser from redirecting.
    }
    
    if (dragSrcEl_ != this) {
       dragSrcEl_.innerHTML = this.innerHTML;
       this.innerHTML = e.originalEvent.dataTransfer.getData('text/html');
       // todo as soon as this is gone we don't need window.app to be global
       window.app.swapImages($(dragSrcEl_).children().get(0), $(this).children().get(0));
       handleDragEnd();
    }
    
  };

  var handleDragEnd = function() {
    container.find(".col").removeClass("over moving");
  };
  
  container.on("dragstart", ".col", handleDragStart);
  container.on("dragenter", ".col", handleDragEnter);
  container.on("dragover", ".col", handleDragOver);
  container.on("dragleave", ".col", handleDragLeave);
  container.on("drop", ".col", handleDrop);
  container.on("dragend", ".col", handleDragEnd);
}
