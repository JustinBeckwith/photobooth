var width = 320, height = 0, video, canvas, photo, startbutton,  
  streaming, message, ctx, handle;

function onload() {
  message = document.getElementById('message');
  video = document.getElementById('video');
  photo = document.getElementById('photo');
  startbutton = document.getElementById('startbutton');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  navigator.getMedia({
      video: true,
      audio: false
    },
    (stream) => {
      var vendorURL = window.URL || window.webkitURL;
      video.src = vendorURL.createObjectURL(stream);
      videoStart();
    },
    (err) => {
      console.error("An error occured! " + err);
    }
  );

  video.addEventListener('canplay', (ev) => {
    if (!streaming) {
      height = video.videoHeight;
      width = video.videoWidth;
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  startbutton.addEventListener('click', (ev) => {
    takepicture();
    ev.preventDefault();
  }, false);
}

function takepicture() {
  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
  photo.style.height = video.offsetHeight;

  videoPause();

  message.style.display = 'inline-block';
  
  var form = new FormData()
  form.append('pic', data);

  fetch("/sendpic", {
    method: "POST",
    body: form
  }).then((response) => {
    return response.json();
  }).then((faces) => {
    console.log(faces);
    ctx.beginPath();
    ctx.strokeStyle = "#80ff80";
    ctx.fillStyle = "#80ff80";
    for (var face of faces) {
      console.log('drawing face');
      var startPoint = face.bounds.face[face.bounds.face.length-1];
      ctx.moveTo(startPoint.x, startPoint.y);
      for (var point of face.bounds.face) {
        ctx.fillRect(point.x-3, point.y-3, 7, 7);
        ctx.lineTo(point.x, point.y);
      };
      ctx.stroke();
    }
    ctx.closePath();
  }).catch((err) => {
    console.error('There was a problem :(');
    console.error(err);
  });
}

function videoStart() {
  video.play();
  handle = setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
  }, 20);
}

function videoPause() {
  if (handle) {
    clearInterval(handle);
  }
  video.pause();
}