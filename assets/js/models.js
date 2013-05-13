var TimelineImage = Backbone.Model.extend({
    defaults: {
        imageLoaded: false,
        rotation: 0
    },
    initialize: function() {
        this.set('originalImage', new Image());
    },
    setSrc: function(src) {
        var self = this;
        $(this.get('originalImage')).on('load', function(e) {
            self.set('imageLoaded', true);
            self.trigger('imageLoaded', self);
        });

        this.get('originalImage').src = src;
    },
    getSrc: function() {
        return this.get('originalImage').src;
    }
});

var Timeline = Backbone.Collection.extend({
    noPersistence: new bnp.NoPersistence(),
    model: TimelineImage,
    comparator: function(timelineImage) {
        return timelineImage.get("sequence");
    },
    nextSequence: function() {
        return this.length;
    },
    addImage: function(image) {
        this.add(image);
        this.sort();
    },
    swapImages: function(firstImage, secondImage) {
        var firstRef = this.find(function(img) { return img.get('originalImage').src === firstImage.src; });
        var secondRef = this.find(function(img) { return img.get('originalImage').src === secondImage.src; });

        var seq = firstRef.get('sequence');
        firstRef.set('sequence', secondRef.get('sequence'));
        secondRef.set('sequence', seq);

        this.sort();
    },
});

var AnimationSettings = Backbone.Model.extend({
    defaults: {
           rate: 300,
        quality: 3,
      animHeight: 200,
       animWidth: 200
    },
    reset: function() {
        this.set(this.defaults);
        this.trigger('reset:rate reset:quality reset:animHeight reset:animWidth');
    },
    setRate: function(rate) {
        this.set('rate', rate);
    },
    setQuality: function(quality) {
        this.set('quality', quality);
    },
    setSize: function(height, width) {
        this.set('animHeight', height);
        this.set('animWidth', width);
    }
});

var MFAApp = Backbone.Model.extend({
    defaults: {
       animatedGIF: null
    },
    initialize: function() {
        this.set('settings', new AnimationSettings());
        this.get('settings').on('change:rate change:quality change:animHeight change:animWidth', function() { 
            this.set('animatedGIF', null); 
        }, this);

        this.set('timeline', new Timeline());
    },
    restart: function() {
        this.get('timeline').reset();
        this.get('timeline').trigger('restart');

        this.set(this.defaults);
        this.get('settings').reset();

        this.trigger('restart');
    },
    getRawImages: function() {
        return this.get('timeline').map(function(timelineImage) { return timelineImage.get('originalImage'); });
    },
    getRotations: function() {
        return this.get('timeline').map(function(timelineImage) { return timelineImage.get('rotation'); });
    },
    swapImages: function(firstImage, secondImage) {
        this.set('animatedGIF', null);
        this.get('timeline').swapImages(firstImage, secondImage);
    },
    generateAnimatedGIF: function() {
        if(this.get('animatedGIF') === null) {
            var self = this;
            var progress = function (percent) {
                self.gifEncodeProgress(percent);
            };
            var done = function (info) {
                self.gifEncodeDone(info);          
            };
            this.set('animatedGIF', new MFAnimatedGIF({
                images: this.getRawImages(),
                rotations: this.getRotations(),
                delay : this.get('settings').get('rate'),
                quality : this.get('settings').get('quality'),
                repeat: 0,
                height: this.get('settings').get('animHeight'),
                width : this.get('settings').get('animWidth'),
                progress: progress,
                done: done
            }));
        }
    },
    gifEncodeProgress: function(percent) {
        this.trigger('gifEncodeProgress', percent);
    },
    gifEncodeDone: function(info) {
        this.set('omgAnimatedGIF', info);
        this.trigger('animationGenerated', info);
    },
    gifEncodeError: function(error) {
        this.trigger('gifEncodeError', error);
    }
});

// constants
MFAApp.MAX_BYTES = 2*1024*1024; // 2MB
