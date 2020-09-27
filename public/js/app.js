let currentSong = null
var audio = document.getElementById('stream')
var playBtn = document.getElementById('playBtn')
var currentBackground = null
var candidateBackground = null
var applyBackground = null
var defaultBackground = null
var currentStyle = null

document.addEventListener('DOMContentLoaded', () => {
  axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=14&_embed').then(res => {
    const news = document.querySelector('.splide__list')
    Object.keys(res.data).forEach(i => {
      const item = res.data[i]
      const excerpt = stripTags(item.excerpt.rendered)
      news.innerHTML+= `<a href="${item.link}" class="splide__slide news-container" target="_blank"><div class="news-item" target="_blank" style="background-image: url('${item._embedded['wp:featuredmedia'][0].source_url}')"><div class="news-title"><h3>${item.title.rendered}</h3><p>${excerpt}</p></div></div></a>`
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
          '1600': {
            perPage: 6
          },
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
        rotateBackgrounds()

        setTimeout(() => {
          document.getElementById('loading').remove()
        }, 500)

        setInterval(nowPlaying, 10000)
        setInterval(rotateBackgrounds, 60000)
      }
    }, 500)
  })
})

togglePlay = () => {
  if (!playBtn.classList.contains('is-playing')) {
    playBtn.classList.add('is-playing')
    audio.play()
  } else {
    audio.pause()
    audio.currentTime = 0
    playBtn.classList.remove('is-playing')
  }
}

playBtn.onclick = () => {
  togglePlay()
}

autoPlay = () => {
  var promise = audio.play();
  if( typeof promise !== 'undefined' ) {
    promise.then(function() {
      playBtn.classList.add('is-playing')
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

rotateBackgrounds = () => {
  const div = document.querySelector('.background')

  axios.get('/localtime.php').then(res => {
    axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=18&_embed').then(res2 => {
      Object.keys(res2.data).forEach(i => {
        let item = res2.data[i]
        const serverTime = res.data
        const weekDay = serverTime.split(' ')[0]
        const dayTime = serverTime.split(' ')[1]
        const time = parseInt(dayTime.split(':').join(''))
        const background = item._embedded['wp:featuredmedia'][0].source_url

        if (item.title.rendered === 'default') {
          defaultBackground = background
          currentStyle = stripTags(item.content.rendered)
        } else {
          const itemData = item.title.rendered.split('/')
          const itemHourRange = itemData[1].split('-')
          const itemWeekDays = itemData[0].split(',')

          if (itemWeekDays.includes(weekDay)) {
            let from = parseInt(itemHourRange[0].replace(':', ''))
            let to = parseInt(itemHourRange[1].replace(':', ''))

            if (to < from) {
              if (time >= to) {
                to+= from + 100
              } else {
                from= 0
              }
            }

            if (time >= from && time <= to) {
              candidateBackground = background
              currentStyle = stripTags(item.content.rendered)
            }
          }
        }
      })

      /* check results and proceed to apply */
      if (candidateBackground) {
        applyBackground = candidateBackground
      } else {
        applyBackground = defaultBackground
      }

      if (applyBackground && currentBackground !== applyBackground) {
        div.classList.remove('animated', 'fadeOut', 'fadeIn', 'delay')
        div.classList.add('animated', 'fadeOut')
        setTimeout(() => {
          if (currentStyle) {
            div.style = currentStyle
          }
          div.style.backgroundImage = `url(${applyBackground})`
        }, 1000)
        setTimeout(() => {
          div.classList.remove('animated', 'fadeOut', 'fadeIn', 'delay')
          div.classList.add('animated', 'fadeIn', 'delay')
        }, 5000)
        currentBackground = applyBackground
      }
      candidateBackground = null
    })
  })
}

stripTags = str => {
  return str.replace(/(<([^>]+)>)/ig, '')
}
