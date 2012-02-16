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


$(window).bind('firstimage', function(){
	new sizeSlider();
});

