let currentSong = null
var audio = document.getElementById('stream')
var playBtn = document.getElementById('playBtn')
var programObject = {}
var currentBackground = null
var programTitle = null
var comingSoon = null
var comingSoonPreviewInterval = 15
var programBackground = null
var applyBackground = null
var applyStyle = null
var programStyle = null
var defaultStyle = null
var defaultBackground = null
var currentStyle = null
var programActive = false
var announcing = false

document.addEventListener('DOMContentLoaded', () => {
  axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=14&_embed&per_page=100').then(res => {
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
        document.getElementById('app').classList.add('fadeIn', 'delay')
        document.getElementById('loading').classList.add('fadeOut')
        document.getElementById('news').classList.add('fadeInUp', 'delay2')
        document.querySelector('.social').classList.add('fadeIn', 'delay3')

        nowPlaying()
        autoPlay()
        rotateBackgrounds()
        updateProgramObject()

        setTimeout(() => {
          document.getElementById('loading').remove()
        }, 500)

        setInterval(() => {
          updateProgramObject()
        }, 60000 * 60)

        setInterval(nowPlaying, 10000)
        setInterval(rotateBackgrounds, 60000)
      }
    }, 500)
  })
})

togglePlay = () => {
  const app = document.getElementById('app')
  if (!app.classList.contains('is-playing')) {
    app.classList.add('is-playing')
    audio.play()
  } else {
    audio.pause()
    audio.currentTime = 0
    app.classList.remove('is-playing')
  }
}

playBtn.onclick = () => {
  togglePlay()
}

autoPlay = () => {
  var promise = audio.play()
  const app = document.getElementById('app')
  if( typeof promise !== 'undefined' ) {
    promise.then(function() {
      app.classList.add('is-playing')
    }).catch(function(e) {
      // console.log('[AUTOPLAY-ERROR]', e)
    });
  }
}

nowPlaying = () => {
  if (!announcing) {
    axios.get('nowplaying.php').then(res => {
      if (currentSong !== res.data) {
        const nowplaying = document.querySelector('.nowplaying')
        const headphones = '<span class="mdi mdi-headphones"></span> '
        nowplaying.classList.remove('fadeInUp', 'fadeOutUp')
        nowplaying.classList.add('fadeOutUp')
        currentSong = res.data
        setTimeout(() => {
          nowplaying.classList.remove('fadeInUp', 'fadeOutUp')
          nowplaying.innerHTML = headphones + decodeURIComponent(res.data)
          nowplaying.classList.add('fadeInUp')
        }, 1000)
      }
    })
  }
}

rotateBackgrounds = () => {
  const div = document.querySelector('.background')
  axios.get('/localtime.php').then(res => {
    const serverTime = res.data
    const weekDay = serverTime.n
    // const dayTime = serverTime.split(' ')[1]
    const time = parseInt(`${serverTime.h}${serverTime.i}`)
    const date = new Date(serverTime.y, serverTime.m, serverTime.d, serverTime.h, serverTime.i)

    Object.keys(programObject).forEach(i => {
      let item = programObject[i]
      const background = item._embedded['wp:featuredmedia'][0].source_url
      const itemData = item.title.rendered.split('/')
      const itemProgram = parseInt(itemData[0])
      const itemHourRange = itemData[1].split('-')  
      let from = parseInt(itemHourRange[0].replace(':', ''))
      let to = parseInt(itemHourRange[1].replace(':', ''))

      if (to < from) {
        if (time >= to) {
          to+= from + 100
        } else {
          from= 0
        }
      }

      if (itemProgram) {
        /* programs */
        let itemWeekDays = itemData[0].split(',')

        if (itemWeekDays.includes(weekDay)) {

          let programLimit = new Date(serverTime.y, serverTime.m, serverTime.d)
          programLimit.setHours(itemHourRange[0].split(':')[0])
          programLimit.setMinutes(itemHourRange[0].split(':')[1] - comingSoonPreviewInterval)
          const comingSoonLimit = parseInt(`${programLimit.getHours()}${programLimit.getMinutes()}`)

          let programStarts = new Date(serverTime.y, serverTime.m, serverTime.d)
          programStarts.setHours(itemHourRange[0].split(':')[0])
          programStarts.setMinutes(itemHourRange[0].split(':')[1])

          if (time >= comingSoonLimit && time < from) {
            const diff = programStarts.getTime() - date.getTime()
            const min = Math.round(diff / 60000)
            comingSoon = stripTags(item.excerpt.rendered)
            comingSoon+= `(en ${min}m)`
          }
          if (time >= from && time <= to) { /* active program */
            programBackground = background
            programStyle = stripTags(item.content.rendered)
            programTitle = stripTags(item.excerpt.rendered)
          }
        }
      } else { /* defaults */          
        if (time >= from && time <= to || from === to) {
          defaultBackground = background
          defaultStyle = stripTags(item.content.rendered)
        }
      }
    })

    /* check results and proceed to apply */
    if (programBackground) {
      applyBackground = programBackground
      applyStyle = programStyle
      programActive = true
      announcing = true
    } else {
      applyBackground = defaultBackground
      applyStyle = defaultStyle
      programActive = false
      announcing = false
    }

    if (applyBackground && currentBackground !== applyBackground) {
      div.classList.remove('fadeOut', 'fadeIn', 'delay')
      div.classList.add('fadeOut')
      div.style = ''
      setTimeout(() => {
        if (applyStyle) {
          div.style = applyStyle
        }
        div.style.backgroundImage = `url(${applyBackground})`
      }, 1000)
      setTimeout(() => {
        div.classList.remove('fadeOut', 'fadeIn', 'delay')
        div.classList.add('fadeIn', 'delay')
      }, 5000)
      currentBackground = applyBackground
    }

    announceProgram(programTitle, comingSoon)

    programBackground = null
    defaultBackground = null
    programTitle = null
    comingSoon = null
  })
}

announceProgram = (current, coming) => {
  const nowplaying = document.querySelector('.nowplaying')
  const comingsoon = document.querySelector('.comingsoon')
  const nowprogram = document.querySelector('.nowprogram')

  nowplaying.style.display = 'block'
  comingsoon.innerHTML = ''
  comingsoon.style.display = 'none'
  nowprogram.innerHTML = ''
  nowprogram.style.display = 'none'

  if (current) {
    nowprogram.classList.remove('fadeOutUp', 'fadeInUp')
    nowprogram.innerHTML = `<span class="mdi mdi-microphone-variant"></span> ${current}`
    nowplaying.style.display = 'none'
    nowprogram.style.display = 'block'
    nowprogram.classList.add('fadeInUp')
  } 

  if (coming) {
    announcing = true
    comingsoon.classList.remove('fadeOutUp', 'fadeInUp')
    comingsoon.innerHTML = `<span class="mdi mdi-clock-check-outline"></span> ${coming}`
    comingsoon.style.display = 'block'
    comingsoon.classList.add('fadeInUp')
    nowplaying.style.display = 'none'
    nowprogram.style.display = 'none'

    setTimeout(() => {
      comingsoon.classList.remove('fadeInUp')
      comingsoon.classList.add('fadeOutUp')
      setTimeout(() => {
        if (programActive) {
          nowprogram.style.display = 'block'
        } else {
          nowplaying.style.display = 'block'  
        }        
        comingsoon.style.display = 'none'
        announcing = false
      }, 1000)
    }, 5000)    
  } 
}

updateProgramObject = () => {
  axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=18&_embed&per_page=100').then(res => {
    if (res.data) {
      programObject = res.data
    }
  })
}

stripTags = str => {
  return str.replace(/(<([^>]+)>)/ig, '')
}
