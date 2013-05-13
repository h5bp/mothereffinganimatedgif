var AnimateButtonView = Backbone.View.extend({
    events: {
        'click': 'generateAnimation'
    },
    initialize: function() {
        this.initialLabel = $(this.el).text();
        this.model.on('gifEncodeProgress', this.progress, this);
        this.model.on('animationGenerated', this.done, this);
    },
    generateAnimation: function(e) {
        $(this.el).text("Setting up GIF encode...");
        this.model.generateAnimatedGIF({
            progress: this.progress
        });
        return false;
    },
    progress: function (percent) {
        $(this.el).text( Math.round(percent*100)+"% encoded..." );
    },
    done: function (info) {
        $(this.el).text( this.initialLabel );
    }
});

var ResetButtonView = Backbone.View.extend({
    events: {
        'click': 'clearTimeline'
    },
    clearTimeline: function(e) {
        this.model.restart();

        return false;
    }
});

var ShareButtonView = Backbone.View.extend({
    events: {
        'click': 'shareAnimation',
    },
    initialize: function() {
        this.model.on('animationGenerated', this.showShareLink, this);
        this.model.on('restart', this.hideShareLink, this);
    },
    showShareLink: function(omgAnimatedGIF) {
        if(omgAnimatedGIF) {
            this.omgAnimatedGIF = omgAnimatedGIF;
            this.$el.show();
        }
    },
    shareAnimation: function(e) {
        var filename = "animated."+((+new Date()) + "").substr(8);

        // Imgur takes the image data, filename, title, caption, success callback and error callback
        ShareGIFWith.imgur(
            this.omgAnimatedGIF.rawDataURL, filename, '', '', 
            function(deletePage, imgurPage, largeThumbnail, original, smallSquare) {
                prompt('Boom! Your image is now available on imgur. Copy the link below:', imgurPage);
            }, 
            function() {
                alert('Could not upload image to imgur. :/  Sorry.');
            }
        );

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
    showDownloadLink: function(omgAnimatedGIF) {
        if(omgAnimatedGIF) {
            window.URL = window.webkitURL || window.URL;
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

            var filename = "animated."+((+new Date()) + "").substr(8);

            var downloadLink = this.$el;
            downloadLink.hide();

            if(Modernizr.download && Modernizr.bloburls && Modernizr.blobbuilder) {
                downloadLink.attr('download', filename + '.gif');
                downloadLink.attr('href', omgAnimatedGIF.binaryURL);
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
                    downloadLink.attr('href', e.data);
                    downloadLink.show();
                };

                var iframe = document.querySelector('#saveasbro');
                iframe.contentWindow.postMessage(JSON.stringify({name:filename, data: omgAnimatedGIF.rawDataURL, formdata: Modernizr.formdata}),"http://saveasbro.com/gif/");
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
    showAnimatedGIF: function(omgAnimatedGIF) {
        if(omgAnimatedGIF) {
            this.$el.attr('src', omgAnimatedGIF.dataURL).show();
        }
    },
    hideAnimatedGIF: function(omgAnimatedGIF) {
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

var TimelineImageView = Backbone.View.extend({
    tagName: 'div',
    tagClass: 'col',
    events: {
        'click': 'rotateTimelineImage'
    },
    initialize: function() {
        this.model.bind('destroy', this.remove, this);
    },
    rotateTimelineImage: function(e) {
        var currentRotation = this.model.get('rotation') + 90;
        if(currentRotation >= 360) currentRotation = 0;
        this.model.set('rotation', currentRotation);

        this.$el.find('img').rotate(currentRotation);
    },
    render: function() {
        this.$el.html("<div class='col'><img class='rotateimg' src='" + this.model.getSrc() + "' /><div class='fil3l'></div></div>");
        return this;
    }
});

var TimelineView = Backbone.View.extend({
    events: {
        'filedropsuccess': 'insertFile',
        'filedroperror': 'fileError',

        'dragstart .col': 'dragStart',
        'dragenter .col': 'dragEnter',
        'dragover .col': 'dragOver',
        'dragleave .col': 'dragLeave',
        'drop .col': 'drop',
        'dragend .col': 'dragEnd'
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

        var timelineImageView = new TimelineImageView({model: timelineImage});
        this.$el.append(timelineImageView.render().el);
    },
    fileError: function(e, fileInfo) {
        this.$el.append("<div class='col error'>Error<div class='fil3l'></div></div>");
    },
    dragStart: function(e) {
        this.dragSrcEl_ = $(e.currentTarget);

        e.originalEvent.dataTransfer.effectAllowed = 'move';
        e.originalEvent.dataTransfer.setData('text/html', this.dragSrcEl_.html());

        this.dragSrcEl_.addClass('moving');
    },
    dragOver: function(e) {
        if (e.originalEvent.preventDefault) {
            e.originalEvent.preventDefault(); // Allows us to drop.
        }
        e.originalEvent.dataTransfer.dropEffect = 'move';
    },
    dragEnter: function(e) {
        $(e.currentTarget).addClass('over');
    },
    dragLeave: function(e) {
        $(e.currentTarget).removeClass('over'); // this/e.target is previous target element.
    },
    drop: function(e) {
        if (e.originalEvent.stopPropagation) {
            e.originalEvent.stopPropagation(); // stops the browser from redirecting.
        }
        if (e.originalEvent.preventDefault) {
            e.originalEvent.preventDefault(); // Allows us to drop.
        }
    
        var dropTarget = $(e.currentTarget);
        var swapTarget = this.dragSrcEl_;

        if (dropTarget.hasClass('col') && this.dragSrcEl_.html() != dropTarget.html()) {
           swapTarget.html(dropTarget.html());
           dropTarget.html(e.originalEvent.dataTransfer.getData('text/html'));

           this.model.swapImages(swapTarget.children().first().get(0), dropTarget.children().first().get(0));

           this.dragEnd(null);
        }
    },
    dragEnd: function(e) {
        this.$el.find('.col').removeClass('over moving');
        $('body').removeClass('drag'); // todo not sure what is adding this class to the body but it causes problems if it isn't removed
    }
});


var QualitySliderView = Backbone.View.extend({
    events: {
        'change input': 'setQuality',
    },
    initialize: function() {
        this.model.on('change:quality', this.render, this);
        this.model.on('reset:quality', function() { this.$el.find('input').val(this.model.get('quality')); }, this);

		    this.model.setQuality(this.$el.find('input').val());
    },
    setQuality: function(e) {
		    this.model.setQuality($(e.target).val());
    },
    render: function() {
        this.$el.find('output').html(this.model.get('quality') + '<span>goodnesses</span>');
        return this;
    }
});

var RateSliderView = Backbone.View.extend({
    events: {
        'change input': 'setRate'
    },
    initialize: function() {
        this.model.on('change:rate', this.render, this);
        this.model.on('reset:rate', function() { this.$el.find('input').val(this.model.get('rate')); }, this);

		    this.model.setRate(this.$el.find('input').val());
    },
    setRate: function(e) {
		    this.model.setRate($(e.target).val());
    },
    render: function() {
        this.$el.find('output').html(this.model.get('rate') + '<span>ms</span>');
        return this;
    }
});

// todo Seems like there should be a way to remove the need for access to the timeline in this
//      view and restrict it to only needing access to the settings.
var SizeSliderView = Backbone.View.extend({
    events: {
        'change input': 'setSize'
    },
    _setInitialSize: function(initialWidth, initialHeight) {
        this.model.get('settings').set('aspectRatio', initialHeight / initialWidth);

        this.$el.find('input').attr('max', initialWidth);
        this.$el.find('input').attr('value', initialWidth);

        this.model.get('settings').setSize(Math.floor(initialWidth * this.model.get('settings').get('aspectRatio')), initialWidth);
    },
    initialize: function() {
        this.model.get('settings').on('change:animWidth change:animHeight', this.render, this);
        this.model.get('settings').on('reset:animWidth reset:animHeight', function() { this.$el.find('input').val(this.model.get('animWidth')); }, this);

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
        this.model.get('settings').setSize(Math.floor(width * this.model.get('settings').get('aspectRatio')), width);
    },
    render: function() {
        this.$el.find('output').html(this.model.get('settings').get('animWidth') + '<span>px</span>');
        return this;
    }
});

var SettingsView = Backbone.View.extend({
    initialize: function() {
      // this.qualitySliderView = new QualitySliderView({model: this.model.get('settings'), el: this.$el.find('.quality')});
      this.rateSliderView = new RateSliderView({model: this.model.get('settings'), el: this.$el.find('.rate')});
      this.sizeSliderView = new SizeSliderView({model: this.model, el: this.$el.find('.size')});
    }
});

var MFAAppView = Backbone.View.extend({
    el: 'div#container',
    initialize: function() {
        this.model.on('restart', this.restartView, this);
        this.model.get('timeline').on('add', this.imageAdded, this);

        this.timelineView = new TimelineView({model: this.model.get('timeline'), el: this.$el.find('div#inimglist')});
        this.settingsView = new SettingsView({model: this.model, el: this.$el.find('div.controls')});
        this.resultsView = new ResultsView({model: this.model, el: this.$el.find('#results')});
    },
    restartView: function() {
        $("body").removeClass("hasfiles");
    },
    imageAdded: function() {
        $("body").addClass("hasfiles");
    }
});
