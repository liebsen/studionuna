nowPlaying = () => {
  axios.get('/nowplaying.php').then(res => {
    document.querySelector('.nowplaying').innerHTML = decodeURIComponent(escape(res.data))
  })  
}
setInterval(() => {
  nowPlaying()
}, 100000)
nowPlaying()
