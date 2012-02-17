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
		output.text(App.quality);
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

		output.text(resolvedWidth);

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
		output.text(rate);
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
  var id_ = 'inimglist';
  var cols_ = document.querySelectorAll('#' + id_ + ' li');
  var dragSrcEl_ = null;

  var handleDragStart = function(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);

    dragSrcEl_ = this;

    // this/e.target is the source node.
    this.addClassName('moving');
  };

  var handleDragOver = function(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Allows us to drop.
    }
  
    e.dataTransfer.dropEffect = 'move';

    return false;
  };

  var handleDragEnter = function(e) {
    this.addClassName('over');
  };

  var handleDragLeave = function(e) {
    // this/e.target is previous target element.
    this.removeClassName('over');
  };

  var handleDrop = function(e) {
    // this/e.target is current target element.

    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }

    // Don't do anything if we're dropping on the same column we're dragging.
    if (dragSrcEl_ != this) {
      dragSrcEl_.innerHTML = this.innerHTML;
      this.innerHTML = e.dataTransfer.getData('text/html');

      // Set number of times the column has been moved.
      //var count = this.querySelector('.count');
      //var newCount = parseInt(count.getAttribute('data-col-moves')) + 1;
      //count.setAttribute('data-col-moves', newCount);
      //count.textContent = 'moves: ' + newCount;
    }

    return false;
  };

  var handleDragEnd = function(e) {
    // this/e.target is the source node.
    [].forEach.call(cols_, function (col) {
      col.removeClassName('over');
      col.removeClassName('moving');
    });
  };

  
  [].forEach.call(cols_, function (col) {
    col.setAttribute('draggable', 'true');  // Enable columns to be draggable.
    col.addEventListener('dragstart', handleDragStart, false);
    col.addEventListener('dragenter', handleDragEnter, false);
    col.addEventListener('dragover', handleDragOver, false);
    col.addEventListener('dragleave', handleDragLeave, false);
    col.addEventListener('drop', handleDrop, false);
    col.addEventListener('dragend', handleDragEnd, false);
  });
}

