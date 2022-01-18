import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;
const button = document.getElementById("record") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
let ac : AudioContext

button.onclick = recordAudio;

async function recordAudio() {
  if (!ac) ac = new AudioContext()
  if (ac.state !== "running") await ac.resume()

  button.disabled = true;
  app.innerHTML = `Please enable recording :)`;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const descriptions = devices
    .filter((device) => device.kind === "audioinput")
    .map((device, i) => `${i}: ${device.label}`)
    .join("\n");

  app.innerHTML = `Select device`;
  const inputValue = prompt(`TYPE NUMBER TO SELECT DEVICE:
${descriptions}
`);
  if (inputValue === null) {
    button.disabled = false;
    return;
  }
  const index = Number(inputValue);

  const selectedDevice = devices[index];
  console.log(index, selectedDevice);

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: selectedDevice.deviceId,
    },
  });

  const mediaRecorder = new MediaRecorder(stream, {});

  const chunks: Blob[] = [];
  mediaRecorder.start();
  let mimeType: string | null;

  // function draw(size: number, i: number) {
  //   ctx.fillRect(i, 0, 1, size);
  // }





  mediaRecorder.ondataavailable = (e) => {
    let size = e.data.size / 10;
    max = Math.max(max, size);
    // canvas.height = max
    // chunks.forEach((c, i) => draw(c.size / 10, i));
    if (mimeType !== null) mimeType = e.type;
    chunks.push(e.data);
    console.log(e.data);
  };

  app.innerHTML = `Recording (0%)`;
  let recordDuration = 10_000;
  let captureInterval = 25;
  let progress = 0;
  let max = canvas.height;

  let interval = setInterval(() => {
    progress += captureInterval;
    app.innerHTML = `Recording (${(
      (progress / recordDuration) *
      100
    ).toFixed()}%)`;
    mediaRecorder.requestData();
  }, captureInterval);

  await delay(recordDuration);
  clearInterval(interval);
  mediaRecorder.stop();

  for (let s of stream.getTracks()) s.stop();

  await new Promise((r) => (mediaRecorder.onstop = r));

  console.log(chunks.length);

  const blob = new Blob(chunks, {
    type: "audio/ogg; codecs=opus",
  });

  const size = blob.size;

  const url = window.URL.createObjectURL(blob);
  const a = new Audio();
  a.src = url;
  a.controls = true;
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(`Size: ${size}`));
  div.appendChild(a);
  document.body.appendChild(div);
  button.disabled = false;

  const arrayBuffer = await blob.arrayBuffer()
  // const thing = await ac.decodeAudioData(arrayBuffer)
  console.log(arrayBuffer.byteLength)
  const uint = new Uint8Array(arrayBuffer)



  function drawThing() {
    draw(uint, arrayBuffer.byteLength)
    requestAnimationFrame(drawThing)
  }

  let drawVisual = requestAnimationFrame(drawThing);

}

function draw(dataArray: Uint8Array, bufferLength: number) {
  const WIDTH = 300
  const HEIGHT = 100
  let analyser = ac.createAnalyser()
  analyser.getByteTimeDomainData(dataArray);

  ctx.fillStyle = 'rgb(200, 200, 200)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(0, 0, 0)';

  ctx.beginPath();

  var sliceWidth = WIDTH * 1.0 / bufferLength;
  var x = 0;

  for(var i = 0; i < bufferLength; i++) {

    var v = dataArray[i] / 128.0;
    var y = v * HEIGHT/2;

    if(i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height/2);
  ctx.stroke();
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createAsyncIterableFromListener(subscribe: Function) {
  return {
    [Symbol.asyncIterator]() {
      return {
        i: 0,
        next() {
          return new Promise((r) => {
            subscribe((e: Event) => r({ value: e,  }));
          });
        },
      };
    },
  };
}

async function* yieldEvent(subscribe: any)  {
  while(true) {
    yield new Promise(resolve => subscribe((event: Event) => {
      resolve(event)
    }))
  }
}

  // const dataIter = createAsyncIterableFromListener((h: Function) => {
  //   mediaRecorder.ondataavailable = (e) => h(e);
  // });
  // const dataIter2 = yieldEvent((h: Function) => {
  //   mediaRecorder.ondataavailable = (e) => h(e);
  // })
