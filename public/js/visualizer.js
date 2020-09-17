var modes = ['bar-graph', 'waveform', 'rgb-bar-graph']
var mode = modes[0]

function visualize(from, source) {
  var select = {
    value: 'bar-graph'
  }

  var context = new AudioContext();

  if (0 == from) {
    var src = context.createMediaElementSource(source);
  } else if (1 == from) {
    var src = context.createMediaStreamSource(source);
  } else if (2 == from) {
    var src = context.createMediaStreamSource(source);
  }

  var analyser = context.createAnalyser();
  var listen = context.createGain();
  var canvas = document.getElementById("canvas");
  var WIDTH = (canvas.width = window.innerWidth);
  var HEIGHT = (canvas.height = window.innerHeight);

  var ctx = canvas.getContext("2d");

  /* var mouseX = 0;
  var mouseY = 0;
  canvas.addEventListener("mousemove", function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });*/

  src.connect(listen);
  listen.connect(analyser);
  if (from == 0) {
    analyser.connect(context.destination);
  }
  analyser.fftSize = 2**13;
  var frequencyBins = analyser.fftSize / 2;

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  var dataHistory = [];

  renderFrame();

  function renderFrame() {
    requestAnimationFrame(renderFrame);
    
    analyser.smoothingTimeConstant = 0.5;

    if (from == 2) {
      if (cbx.checked) {
        listen.gain.setValueAtTime(1, context.currentTime);
      } else {
        listen.gain.setValueAtTime(0, context.currentTime);
      }
    } else {
      listen.gain.setValueAtTime(1, context.currentTime);
    }

    var WIDTH = (canvas.width = window.innerWidth);
    var HEIGHT = (canvas.height = window.innerHeight);
    var sliceWidth = WIDTH * 1.0 / bufferLength;

    var x = 0;
    var scale = Math.log(frequencyBins - 1) / WIDTH;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    /*
     ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, HEIGHT);
    ctx.stroke();
    ctx.closePath();

    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.font = "16px Courier";
    ctx.fillStyle = "white";
    ctx.fillText(
      Math.floor(Math.E ** (mouseX / WIDTH * Math.log(frequencyBins / 2))) +
        " Hz",
      mouseX,
      mouseY
    );*/ 

    if (mode == "bar-graph") {
      analyser.getByteFrequencyData(dataArray);
      for (var i = 0; i < bufferLength; i++) {
        let x = Math.floor(Math.log(i) / scale);
        barHeight = dataArray[i];
        /* var r = barHeight + (25 * (i/bufferLength));
                 var g = 250 * (i/bufferLength);
                 var b = 50; */
        var h = 300 - barHeight * 300 / 255;
        var s = 100 + "%";
        var l = barHeight < 64 ? barHeight * 50 / 64 + "%" : "50%";
        ctx.fillStyle = "hsl(" + h + "," + s + "," + l + ")";
        // ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(
          x,
          HEIGHT - barHeight * HEIGHT / 255,
          Math.floor(Math.log(i + 1) / scale) - Math.floor(Math.log(i) / scale),
          HEIGHT
        );
      }
    } else if (mode == "waveform") {
      analyser.getByteFrequencyData(dataArray);
      let start = 0//dataArray.find(a=> Math.max.apply('',dataArray));
      analyser.getByteTimeDomainData(dataArray);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      x = 0;
      for (var i = start; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * HEIGHT / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x = i*sliceWidth//frequencyBins/analyser.sampleRate;
      }
      ctx.lineTo(WIDTH, dataArray[0] / 128.0 * HEIGHT / 2);
      ctx.stroke();
    } else if (mode == "rgb-bar-graph") {
      //ctx.globalCompositeOperation = "hue";
      analyser.getByteFrequencyData(dataArray);
      var imgData = ctx.createImageData(WIDTH, HEIGHT);
      // for (var i = 0; i < bufferLength; i += 2) {
      //   let x = i / 3 *  WIDTH / bufferLength;
      //   var r = dataArray[i];
      //   var g = dataArray[i + 1];
      //   var b = dataArray[i + 2];
      for (j = 0; j < imgData.data.length; j += 4) {
        let y = j / 4 / WIDTH;
        let x = Math.floor(((j / 4) % WIDTH) * bufferLength / WIDTH);
        imgData.data[j + 0] =
          255 - dataArray[x] <= y * (255 / HEIGHT) ? dataArray[x] : 0;
        imgData.data[j + 1] =
          255 - dataArray[x + 1] <= y * (255 / HEIGHT) ? dataArray[x + 1] : 0;
        imgData.data[j + 2] =
          255 - dataArray[x + 2] <= y * (255 / HEIGHT) ? dataArray[x + 2] : 0;
        imgData.data[j + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      // ctx.fillStyle = "rgb(" + r + "," + 0 + "," + 0 + ")";
      // ctx.fillRect(x, HEIGHT - (r * HEIGHT / 255), 1, HEIGHT);
      // ctx.fillStyle = "rgb(" + 0 + "," + g + "," + 0 + ")";
      // ctx.fillRect(x, HEIGHT - (g * HEIGHT / 255), 1, HEIGHT);
      // ctx.fillStyle = "rgb(" + 0 + "," + 0 + "," + b + ")";
      // ctx.fillRect(x, HEIGHT - (b * HEIGHT / 255), 1, HEIGHT);
      // }
    } else {
      if (typeof(a)) {
        a = setInterval(function () {
        analyser.getByteFrequencyData(dataArray);
        dataHistory.unshift(dataArray);
        });
      }
      for (let j = 0; j < dataHistory.length; j++) {
        for (var i = 0; i < bufferLength; i++) {
          let x = Math.floor(Math.log(i) / scale);
          barHeight = dataHistory[j][i];
          /* var r = barHeight + (25 * (i/bufferLength));
                 var g = 250 * (i/bufferLength);
                 var b = 50; */
          var h = 300 - barHeight * 300 / 255;
          var s = 100 + "%";
          var l = barHeight < 64 ? barHeight * 50 / 64 + "%" : "50%";
          ctx.fillStyle = "hsl(" + h + "," + s + "," + l + ")";
          // ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          ctx.fillRect(
            x,
            HEIGHT * j / dataHistory.length,
            Math.floor(Math.log(i + 1) / scale) -
              Math.floor(Math.log(i) / scale),
            HEIGHT * j +
              1 / dataHistory.length -
              HEIGHT * j / dataHistory.length
          );
        }
      }
      if (dataHistory.length > 5) {
        dataHistory.pop();
      }
    }
  }
}
