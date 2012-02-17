var qualitySlider = function(){

	var elem, slider, output;

	var init = function(){
		elem = $('.quality').show();
		slider = elem.find('input');
		output = elem.find('output');
		slider.change(change);
		App.quality = App.initialQuality;
		change();
	};

	var change = function(){
		App.quality = slider.val();
                output.html(App.quality + '<span>goodnesses</span>');
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
		var resolvedWidth = Math.floor(slider.val()/100 * App.initialWidth);

                output.html(resolvedWidth + '<span>px</span>');

		App.animWidth  = resolvedWidth;
		App.animHeight = Math.floor(resolvedWidth * App.initialHeight / App.initialWidth);
	}

	init();
};

var rateSlider = function(){
	
	var elem, slider, output, max;

	var init = function(){
		elem = $('.rate').show();
		slider = elem.find('input').change(change);
		output = elem.find('output');

		App.rate = App.initialRate;
		max = App.initialRate / (slider.val() / 100);
		change();
	};

	var change = function(){
		var rate = Math.floor(slider.val()/100 * max);
                output.html(rate + '<span>ms</span>');
		App.rate = rate;
	};

	init();
};

$(window).bind('firstimage', function(){
	new sizeSlider();
	new rateSlider();
	new qualitySlider();
});



Element.prototype.hasClassName = function(name) {
  return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};

Element.prototype.addClassName = function(name) {
  if (!this.hasClassName(name)) {
    this.className = this.className ? [this.className, name].join(' ') : name;
  }
};

Element.prototype.removeClassName = function(name) {
  if (this.hasClassName(name)) {
    var c = this.className;
    this.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
  }
};


var samples = samples || {};

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
       App.rebuildTimeline();
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

