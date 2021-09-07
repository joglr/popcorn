import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!
const stream = await navigator.mediaDevices.getUserMedia({
   audio:  true
})

const a = new Audio()
a.srcObject = stream

// a.play()
a.controls = true

document.body.appendChild(a)

const at = stream.getAudioTracks()[0]

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`
