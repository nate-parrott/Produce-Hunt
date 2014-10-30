
window.encodeImage = function(field, callback) {
	if (field.files.length == 0) {
		callback(null);
		return;
	}
  var file = field.files[0];
  // Ensure it's an image
  if(!file.type.match(/image.*/)) {
		callback(null);
		return;
	}
	// Load the image
	var reader = new FileReader();
	reader.onload = function (readerEvent) {
	    var image = new Image();
	    image.onload = function (imageEvent) {

	        // Resize the image
	        var canvas = document.createElement('canvas'),
	            max_size = 100,
	            width = image.width,
	            height = image.height;
	        if (width > height) {
	            if (width > max_size) {
	                height *= max_size / width;
	                width = max_size;
	            }
	        } else {
	            if (height > max_size) {
	                width *= max_size / width;
	                height = max_size;
	            }
	        }
	        canvas.width = width;
	        canvas.height = height;
	        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
	        var dataUrl = canvas.toDataURL('image/jpeg');
	        callback(dataUrl);
	    }
	    image.src = readerEvent.target.result;
	}
	reader.readAsDataURL(file);
}
