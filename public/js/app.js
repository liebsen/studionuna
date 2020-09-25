let currentSong = null
var audio = document.getElementById('stream')
var playBtn = document.getElementById('playBtn')
var backgrounds = []
var currentBackground = null

document.addEventListener('DOMContentLoaded', () => {
  axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=14&_embed').then(res => {
    const news = document.querySelector('.splide__list')
    Object.keys(res.data).forEach(i => {
      const item = res.data[i]
      news.innerHTML+= `<a href="${item.link}" class="splide__slide news-container" target="_blank"><div class="news-item" target="_blank" style="background-image: url('${item._embedded['wp:featuredmedia'][0].source_url}')"><div class="news-title"><h3>${item.title.rendered}</h3>${item.excerpt.rendered}</div></div></a>`
    })
    setTimeout(() => {
      new Splide( '#news', {
        type    : 'loop',
        perPage : 7,
        autoplay: true,
        padding: {
          right: '5rem',
          left : '5rem',
        },
        breakpoints: {
          '1440': {
            perPage: 5
          },
          '1366': {
            perPage: 4
          },
          '1280': {
            perPage: 4
          },
          '1024': {
            perPage: 3
          },
          '640': {
            perPage: 2
          },
          '480': {
            perPage: 1
          }
        }
      } ).mount();
      if (document.getElementById('loading')) {
        document.getElementById('app').classList.add('animated', 'fadeIn', 'delay')
        document.getElementById('loading').classList.add('animated', 'fadeOut')
        document.getElementById('news').classList.add('animated', 'fadeInUp', 'delay2')

        nowPlaying()
        autoPlay()
        getBackgrounds()

        setTimeout(() => {
          document.getElementById('loading').remove()
        }, 500)

        setInterval(secondLoop, 10000)
      }
    }, 500)
  })
})

togglePlay = () => {
  if (playBtn.classList.contains('mdi-play-circle')) {
    playBtn.classList.remove('mdi-play-circle')
    playBtn.classList.add('mdi-pause-circle')
    audio.play()
  } else {
    audio.pause()
    audio.currentTime = 0
    playBtn.classList.remove('mdi-pause-circle')
    playBtn.classList.add('mdi-play-circle')
  }
}

playBtn.onclick = () => {
  togglePlay()
}

autoPlay = () => {
  var promise = audio.play();
  if( typeof promise !== 'undefined' ) {
    promise.then(function() {
      playBtn.classList.remove('mdi-play-circle')
      playBtn.classList.add('mdi-pause-circle')
    }).catch(function(e) {
      // console.log('[AUTOPLAY-ERROR]', e)
    });
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

getBackgrounds = () => {
  axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=18&_embed').then(res => {
    Object.keys(res.data).forEach(i => {
      backgrounds.push({
        range: res.data[i].title.rendered,
        background: res.data[i]._embedded['wp:featuredmedia'][0].source_url
      })
    })
  })
  rotateBackgrounds()
}

rotateBackgrounds = () => {
  axios.get('/localtime.php').then(res => {
    const time = res.data.split(':').join('')
    backgrounds.map(item => {
      const range = item.range.split('-')
      const from = range[0].replace(':', '')
      const to = range[1].replace(':', '')
      if (time >= from && time <= to) {
        if (currentBackground !== item.background) {
          var body = document.getElementsByTagName('body')[0]
          body.style.backgroundImage = `url(${item.background})`
        }
      }
    })
  })
}

secondLoop = () => {
  rotateBackgrounds() 
  nowPlaying()
}
