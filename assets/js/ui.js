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

var samples = samples || {};


// nativesortable
// Author: Brian Grinstead MIT License
// Originally based on code found here:
// http://www.html5rocks.com/en/tutorials/dnd/basics/#toc-examples

// Usage:
// var list = document.getElementByID("list");
// nativesortable(list, "li" [, { change: onchange }]);

nativesortable = (function() {
    
    function hasClassName(el, name) {
        return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
    }

    function addClassName (el, name) {
        if (!hasClassName(el, name)) {
          el.className = el.className ? [el.className, name].join(' ') : name;
        }
    }
    
    function removeClassName(el, name) {
        if (hasClassName(el, name)) {
          var c = el.className;
          el.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
        }
    }
    
    function matchesSelector(el, selector) {
        if (el.matchesSelector)
            return el.matchesSelector(selector);
        if (el.webkitMatchesSelector)
            return el.webkitMatchesSelector(selector);
        if (el.mozMatchesSelector)
            return el.mozMatchesSelector(selector);
        if (el.msMatchesSelector)
            return el.msMatchesSelector(selector);
        return false;
    }
    
    function isBelow(el1, el2) {
    
        var parent = el1.parentNode;
        if (el2.parentNode != parent) {
            return false;
        }
        
        var cur = el1.previousSibling;
        while (cur && cur.nodeType !== 9) {
            if (cur === el2) {
                return true;
            }
            cur = cur.previousSibling;
        }
        return false;
    }
    
    function closest(child, selector) {
        var cur = child;
        while (cur) {
            if (matchesSelector(cur, selector)) {
                return cur;
            }
            cur = cur.parentNode;
            if ( !cur || !cur.ownerDocument || cur.nodeType === 11 ) {
                break;
            }
        }
        return null;
    }
    
    return function(element, childSelector, opts) {
        if (!opts) {
            opts = { }; 
        }
        
        var currentlyDraggingElement = null;
        
        function handleDragStart(e) {
        
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('Text', "*"); // Need to set to something or else drag doesn't start
            
            currentlyDraggingElement = this;
            addClassName(currentlyDraggingElement, 'moving');
        }
        function handleDragOver(e) {
            if (!currentlyDraggingElement) {
                return true;
            }
            
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        }
        
        function handleDragEnter(e) {
            if (!currentlyDraggingElement) {
                return true;
            }
            
            if (e.preventDefault) {
                e.preventDefault();
            }
            
            // over class can stick if mousing over an image quickly.
            [].forEach.call(element.querySelectorAll(childSelector), function(el) {
                removeClassName(el, 'over');
            });
            addClassName(this, 'over');
            return false;
        }
        
        function handleDragLeave(e) {
            removeClassName(this, 'over');
        }
        
        function handleDrop(e) {
        
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            
            if (isBelow(currentlyDraggingElement, this)) {
                // Insert before.
                this.parentNode.insertBefore(currentlyDraggingElement, this);
            
            }
            else {
                // Insert after.
                this.parentNode.insertBefore(currentlyDraggingElement, this.nextSibling);
            }
            
            if (opts.change) {
                opts.change(this, currentlyDraggingElement);
            }
        }
        
        function handleDragEnd(e) {
            currentlyDraggingElement = null;
            [].forEach.call(element.querySelectorAll(childSelector), function(el) {
                removeClassName(el, 'over');
                removeClassName(el, 'moving');
            });
        }
        function delegate(fn) {
            return function(e) {
            
                if (matchesSelector(e.target, childSelector)) {
                    fn.apply(e.target, [e]);
                }
                // Images and links are draggable by default.  Make them trigger events for the parent.
                else if (e.target.tagName === "IMG" || e.target.tagName === "A") {
                    context = closest(e.target, childSelector);
                    
                    if (context) {
                        fn.apply(context, [e]);
                        
                        if (e.type == "dragover" || e.type == "dragleave") {
                            addClassName(context, 'over');
                        }
                    }
                }
            }
        }
        
        element.addEventListener('dragstart', delegate(handleDragStart), false);
        element.addEventListener('dragenter', delegate(handleDragEnter), false)
        element.addEventListener('dragover', delegate(handleDragOver), false);
        element.addEventListener('dragleave', delegate(handleDragLeave), false);
        element.addEventListener('drop', delegate(handleDrop), false);
        element.addEventListener('dragend', delegate(handleDragEnd), false);

        [].forEach.call(element.querySelectorAll(childSelector), function(el) {
            el.setAttribute("draggable", "true");
        });
    }
})();

