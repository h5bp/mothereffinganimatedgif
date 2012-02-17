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

