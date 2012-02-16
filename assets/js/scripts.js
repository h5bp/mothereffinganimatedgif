(function(window, $){
    
    var App = {};
    App.MAX_BYTES = 102400; // 100 KB
    App.timeline = [];

	$('#drop')
		.on('dragenter', function (e) {
			e.preventDefault();
		})
		.on('dragover', function (e) {
			e.preventDefault();
		})
		.on('drop', function (e) {
			var files = e.originalEvent.dataTransfer.files;

			for (var i = 0; i < files.length; ++i) {
				var file = files[i];

				//console.log('file ' + i + ': type = ' + file.type);

				// is file.type cross-browser compatible, or do we need to eliminate this
				// condition, instead checking the prefix of the data: url once loaded?
				if (typeof file.type === 'string' && file.type.match(/^image\/(jpeg|png|gif)$/)) {
					var file_reader = new FileReader();

					file_reader.onload = function (e) {
						var $file_img = $('<img>')
							.addClass('film-strip-img')
							.on('error', function (e) {
								// show message to user for broken files?
							})
							.on('load', function (e) {
								var is_landscape = $file_img.prop('width') >= $file_img.prop('height');

								$file_img
									.removeClass('portrait landscape')
									.addClass(is_landscape ? 'landscape' : 'portrait');

								var $file_img_box = $('<li>')
									.addClass('film-strip-item')
									.append($file_img)
									.appendTo('.files ul');
							})
							.attr('src', e.target.result);
					};

					file_reader.readAsDataURL(file);
				}

				// show message to user for invalid uploaded files?
				else {

				}
			}

			e.preventDefault();
		});
})(window, jQuery);
