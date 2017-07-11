var ShareGIFWith = function() {};

ShareGIFWith.imgur = function(imageData, imageName, imageTitle, imageCaption, success, error) {
  $.ajax({
      url: 'https://api.imgur.com/3/image',
      type: 'POST',
      data: {
          type   : 'base64',
          key    : 'b0b751fa5073aed697e0919602ce506d',
          name   : imageName,
          title  : imageTitle,
          description: imageCaption,
          image  : imageData
      },
      dataType: 'json'
  }).success(function(data) {
      success(data);
  }).error(function() {
      error();
  });
};

