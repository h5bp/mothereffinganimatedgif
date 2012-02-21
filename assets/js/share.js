var ShareGIFWith = function() {};

ShareGIFWith.imgur = function(imageData, imageName, imageTitle, imageCaption, success, error) {
  $.ajax({
      url: 'http://api.imgur.com/2/upload.json',
      type: 'POST',
      data: {
          type   : 'base64',
          key    : 'b0b751fa5073aed697e0919602ce506d',
          name   : imageName,
          title  : imageTitle,
          caption: imageCaption,
          image  : imageData
      },
      dataType: 'json'
  }).success(function(data) {
      success(data['upload']['links']['delete_page'],
              data['upload']['links']['imgur_page'],
              data['upload']['links']['large_thumbnail'],
              data['upload']['links']['original'],
              data['upload']['links']['small_square']);
  }).error(function() {
      error();
  });
};

