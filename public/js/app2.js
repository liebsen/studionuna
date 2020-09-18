let currentSong = null

document.addEventListener('DOMContentLoaded', () => {
  axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=14&_embed').then(res => {
    const news = document.querySelector('.splide__list')
    Object.keys(res.data).forEach(i => {
      const item = res.data[i]
      news.innerHTML+= `<div class="splide__slide news-item" target="_blank" style="background-image: url('${item._embedded['wp:featuredmedia'][0].source_url}')"><a href="${item.link}" target="_blank"><div class="news-title"><h3>${item.title.rendered}</h3>${item.excerpt.rendered}</div></a></div>`
    })
    setTimeout(() => {
      new Splide( '#news', {
        type    : 'loop',
        perPage : 3,
        autoplay: true,
        padding: {
          right: '5rem',
          left : '5rem',
        },
        breakpoints: {
          '640': {
            perPage: 2,
            gap    : '1rem',
          },
          '480': {
            perPage: 1,
            gap    : '1rem',
          }
        }
      } ).mount();
      if (document.getElementById('loading')) {
        document.getElementById('loading').classList.add('animated', 'fadeOut')
        setTimeout(() => {
          document.getElementById('loading').remove()  
        }, 500)
      }
    }, 500)
  })
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
    if (currentSong !== res.data) {
      document.querySelector('.nowplaying').innerHTML = decodeURIComponent(res.data)
      currentSong = res.data
    }
  })  
}

setInterval(() => {
  nowPlaying()
}, 10000)

nowPlaying()

window.onerror = function (msg, url, lineNo, columnNo, error) {
  const err = `error: ${msg}${url}:${lineNo} -- ${error}`
  console(err)
}
