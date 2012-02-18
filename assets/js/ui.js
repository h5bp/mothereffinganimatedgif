// todo use jquery show/hide instead of none/inline

var qualitySlider = function(){

	var elem, slider, output;

	var init = function(){
		elem = $('.quality').show();
		slider = elem.find('input');
		output = elem.find('output');
		slider.change(change);
		window.app.set('quality', MFAApp.initialQuality);
		change();
	};

	var change = function(){
		window.app.set('quality', slider.val());
    output.html(window.app.get('quality') + '<span>goodnesses</span>');
	}

	init();
};

var sizeSlider = function(){

	var elem, slider, output;

	var init = function(){
		elem = $('.size').show();
		slider = elem.find('input');
		output = elem.find('output');
		slider.change(change);
		change();
	};

	var change = function(){
		var resolvedWidth = Math.floor(slider.val()/100 * MFAApp.initialWidth);

    output.html(resolvedWidth + '<span>px</span>');

		window.app.set('animWidth', resolvedWidth);
		window.app.set('animHeight', Math.floor(resolvedWidth * MFAApp.initialHeight / MFAApp.initialWidth));
	}

	init();
};

var rateSlider = function(){
	
	var elem, slider, output, max;

	var init = function(){
		elem = $('.rate').show();
		slider = elem.find('input').change(change);
		output = elem.find('output');

		window.app.set('rate', MFAApp.initialRate);
		max = MFAApp.initialRate / (slider.val() / 100);
		change();
	};

	var change = function(){
		var rate = Math.floor(slider.val()/100 * max);
                output.html(rate + '<span>ms</span>');
		window.app.set('rate', rate);
	};

	init();
};

// todo remove
$(window).bind('firstimage', function(){
	new sizeSlider();
	new rateSlider();
	//new qualitySlider();
});

var TimelineView = Backbone.View.extend({
    el: $('div#inimglist'),
    events: {
        'filedropsuccess': 'insertFile',
        'filedroperror': 'fileError',

        'click .rotateimg': 'rotateTimelineImage'
    },
    insertFile: function(e, fileData, fileInfo) {
        var timelineImage = new TimelineImage();
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

var MFAAppView = Backbone.View.extend({
    el: $('div#container'),
    events: {
        'click .clear': 'clearTimeline',
        'click .play': 'generateAnimation',
        'click #sharelink': 'shareAnimation',

        'change .quality input': 'setQuality'
    },
    initialize: function() {
        // todo

		    this.model.set('quality', MFAApp.initialQuality);
        this.$el.find('.quality input').trigger('change');
        // todo need to update view to show inital quality setting
    },
    clearTimeline: function(e) {
        this.model.tempClear();
        $('#sharelink').css({'display':'none'});
        return false;
    },
    generateAnimation: function(e) {
        this.model.buildGif();
        return false;
    },
    shareAnimation: function(e) {
        var filename = "animated."+((+new Date()) + "").substr(8);

        // Imgur takes the image data, filename, title, caption, success callback and error callback
        ShareGIFWith.imgur(this.model.get('mfAnimatedGIF').rawDataURL(), filename, '', '', 
        function(deletePage, imgurPage, largeThumbnail, original, smallSquare) {
            prompt('Boom! Your image is now available on imgur. Copy the link below:', imgurPage);
        }, 
        function() {
            alert('Could not upload image to imgur. :/  Sorry.');
        });

        return false;
    },
    setQuality: function(e) {
    console.log(e);
		    this.model.set('quality', $(e.target).val());
        $(e.target.parentElement).find('output').html(this.model.get('quality') + '<span>goodnesses</span>');
    }
});

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
