document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (document.getElementById('loading')) {
      document.getElementById('loading').classList.add('animated', 'fadeOut')
      setTimeout(() => {
        document.getElementById('loading').remove()  
      }, 500)
    }
  }, 1000)
})

togglePlay = btn => {
  var audio = document.getElementById('stream')
  if (btn.classList.contains('mdi-play-circle')) {
    btn.classList.remove('mdi-play-circle')
    btn.classList.add('mdi-pause-circle')
    document.getElementById("canvas").style.display = 'block'
    audio.play()
    visualize(0, audio)  
  } else {
    audio.pause()
    btn.classList.remove('mdi-pause-circle')
    btn.classList.add('mdi-play-circle')
    document.getElementById("canvas").style.display = 'none'
  }
}

nowPlaying = () => {
  axios.get('nowplaying.php').then(res => {
    document.querySelector('.nowplaying').innerHTML = decodeURIComponent(escape(res.data))
  })  
}

setInterval(() => {
  nowPlaying()
}, 100000)
nowPlaying()

