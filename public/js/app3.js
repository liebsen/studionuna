const streamURL = 'https://sonic.dattalive.com/8634/;'
let audio = null
let currentSong = null
let playBtn = document.getElementById('playBtn')
let app = document.getElementById('app')
let inetStatus = document.querySelector('.inetstatus')
let programObject = {}
let currentBackground = null
let programTitle = null
let comingSoon = null
let comingSoonPreviewInterval = 15
let programBackground = null
let applyBackground = null
let applyStyle = null
let programStyle = null
let defaultStyle = null
let defaultBackground = null
let currentStyle = null
let programActive = false
let programProgress = 0
let announcing = false
let sliderTabs = {}
let currentSlider = null
const minPostsSlider = 3
const catIcons = {
  programas: 'microphone-variant',
  libros: 'book',
  notas: 'rss',
  // especiales: 'flash',
  editorial: 'feather'
}

document.addEventListener('DOMContentLoaded', () => {
  axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=14&_embed&per_page=100&orderby=parent&order=asc').then(res => {
    Object.keys(res.data).forEach(i => {
      const item = res.data[i]
      const slug = item._embedded['wp:term'][0][0].slug

      if (!sliderTabs[slug]) {
        /* sliders object */
        sliderTabs[slug] = {
          name: item._embedded['wp:term'][0][0].name,
          icon: catIcons[slug],
          items: []
        }
      }

      sliderTabs[slug].items.push(item)
    })

    setTimeout(() => {
      Object.keys(sliderTabs).filter( j => sliderTabs[j].items.length > minPostsSlider ).forEach((i, j) => {
        /* appends */
        let tabItem = document.createElement('a')
        tabItem.setAttribute('href', `#${i}`)
        tabItem.setAttribute('title', sliderTabs[i].name)
        tabItem.innerHTML = `<span class="icon">
  <span class="mdi mdi-${sliderTabs[i].icon}"></span>
</span>`
        let index = 0
        Object.keys(catIcons).filter((e, a) => {
          if (i === e) {
            index = a
          }
        })
        document.querySelector('.splide_tabs').insertBefore(tabItem, document.querySelector('.splide_tabs').children[index])
      })

      app.classList.add('fadeIn')
      document.getElementById('loading').classList.add('fadeOut')
      document.querySelector('.splide_sliders').classList.add('fadeInUp')
      
      updateProgramObject().then(data => {
        programObject = data
        rotateBackgrounds()
      })

      setTimeout(() => {
        document.querySelector('.splide_tabs').classList.add('fadeInDown')
        document.querySelector('.social').classList.add('fadeIn')
        document.getElementById('loading').remove()
        hashChanged(window.location.hash)  
      }, 500)

      setInterval(() => {
        updateProgramObject().then(data => {
          programObject = data
        })
      }, 60000 * 60)

      setInterval(nowPlaying, 10000)
      setInterval(rotateBackgrounds, 60000)
      nowPlaying()
      autoPlay()
    }, 500)
  })
})

togglePlay = () => {
  if (!app.classList.contains('is-playing')) {
    createStreamConnection()
    audio.play()
    app.classList.add('is-playing')
  } else {
    audio.setAttribute('src', '')
    audio.removeAttribute('src')
    audio.load()
    app.classList.remove('is-playing')
  }
}

createStreamConnection = () => {
  if (!audio || audio.getAttribute('src') !== streamURL) {
    audio = document.createElement('audio')
    audio.setAttribute('src', streamURL)
    audio.setAttribute('preload', 'none')
    audio.setAttribute('type', 'audio/mp3')
    audio.load()
  }
}

playBtn.onclick = () => {
  togglePlay()
}

autoPlay = () => {
  createStreamConnection()
  var promise = audio.play()
  if( typeof promise !== 'undefined' ) {
    promise.then(() => {
      app.classList.add('is-playing')
    }).catch(e => {
      // console.log('[AUTOPLAY-ERROR]', e)
    });
  }
}

nowPlaying = () => {
  setTimeout(() => {
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
  }, 30000)
}

rotateBackgrounds = () => {
  const div = document.querySelector('.background')
  const logo = document.querySelector('.logo')
  logo.classList.remove('bounceIn')
  logo.classList.add('bounceIn')
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
      let itemWeekDays = itemData[0].split(',')
      let startHour = itemHourRange[0].split(':')[0]
      let startMin = itemHourRange[0].split(':')[1]
      let endHour = itemHourRange[1].split(':')[0]
      let endMin = itemHourRange[1].split(':')[1]
      let ends = itemHourRange[1]
      let programLimit = new Date(serverTime.y, serverTime.m, serverTime.d)

      programLimit.setHours(startHour)
      programLimit.setMinutes(startMin - comingSoonPreviewInterval)

      const comingSoonLimit = parseInt(`${programLimit.getHours()}${programLimit.getMinutes()}`)
      let programStarts = new Date(serverTime.y, serverTime.m, serverTime.d)
      programStarts.setHours(startHour)
      programStarts.setMinutes(startMin)
      let day = serverTime.d

      if (parseInt(endHour) < parseInt(startHour)) {
        let then = new Date(serverTime.y, serverTime.m, serverTime.d)
        then.setDate(then.getDate() + 1)
        day = then.getDate()
      }

      let programEnds = new Date(serverTime.y, serverTime.m, day)

      programEnds.setHours(endHour)
      programEnds.setMinutes(endMin)

      const duration = programEnds.getTime() - programStarts.getTime()
      const elapsed = date.getTime() - programStarts.getTime()
      const minDur = Math.round(duration / 60000)
      const minEla = Math.round(elapsed / 60000)
      const progress = Math.round(minEla / minDur * 100)

      if (itemProgram) {
        /* programs */
        if (itemWeekDays.includes(weekDay)) {
          if (time >= comingSoonLimit && time < from) {
            const diff = programStarts.getTime() - date.getTime()
            const min = Math.round(diff / 60000)
            comingSoon = stripTags(item.excerpt.rendered)
            if (min < 2) {
              comingSoon+= `(ya llega)`
            } else {
              comingSoon+= `(en ${min}m)`
            }
          }

          if (date >= programStarts && date <= programEnds) { /* active program */
            programBackground = background
            programStyle = stripTags(item.content.rendered)
            programTitle = stripTags(item.excerpt.rendered)
            programProgress = progress
          }
        }
      } else { /* defaults */          

        if (to < from) {
          if (time >= to) {
            to+= from + 100
          } else {
            from= 0
          }
        }

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
      div.classList.remove('fadeOut', 'fadeIn')
      div.classList.add('fadeOut')
      setTimeout(() => {
        div.style = ''
        if (applyStyle) {
          div.style = applyStyle
        }
        div.style.backgroundImage = `url(${applyBackground})`
      }, 1000)
      setTimeout(() => {
        div.classList.remove('fadeOut', 'fadeIn')
        div.classList.add('fadeIn')
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
    nowprogram.innerHTML = `<span class="mdi mdi-microphone-variant"></span> ${current} <div class="progress-container"><div class="progress"><div class="bar" style="width:${programProgress}%"></div></div></div>`
    nowplaying.style.display = 'none'
    nowprogram.style.display = 'block'
    nowprogram.classList.add('fadeInUp')
  } 

  if (coming) {
    setTimeout(() => {
      announcing = true
      comingsoon.classList.remove('fadeOut', 'pulse')
      comingsoon.innerHTML = `<span class="mdi mdi-clock-check-outline"></span> ${coming}`
      comingsoon.style.display = 'block'
      comingsoon.classList.add('pulse')
      nowplaying.style.display = 'none'
      nowprogram.style.display = 'none'

      setTimeout(() => {
        comingsoon.classList.remove('pulse')
        comingsoon.classList.add('fadeOut')
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
    }, 5000)
  } 
}

updateProgramObject = () => {
  return new Promise(next => {
    return axios.get('https://studionuna.com.ar/noticias/wp-json/wp/v2/posts?categories=18&_embed&per_page=100').then(res => {
      next(res.data)
    })
  })
}

showTab = id => {

  let active = document.querySelector('.splide_tabs > a.active')
  let delay = 'delay3'

  if (currentSlider)  {
    delay = ''
    currentSlider.destroy()
  }

  if (active) {
    active.classList.remove('active')
  }

  if (sliderTabs[id] && sliderTabs[id].items.length > minPostsSlider) {
    document.querySelector(`a[href="#${id}"]`).classList.add('active')
    document.querySelector('.splide_sliders').innerHTML = `<div class="splide animated fadeInUp ${delay}" id="${id}">
  <div class="splide__track">
    <div class="splide__list"></div>
  </div>
</div>`

    sliderTabs[id].items.forEach(item => {
      let h3class = ''
      if (item.title.rendered && item.title.rendered.length > 30) {
        h3class = 'reduce'
      }
      document.getElementById(id).querySelector('.splide__list').innerHTML+= `<a href="${item.link}" class="splide__slide splide_sliders-container" target="_blank"><div class="splide_sliders-item" target="_blank" style="background-image: url('${item._embedded['wp:featuredmedia'][0].source_url}')"><div class="splide_sliders-title"><h3 class="${h3class}">${item.title.rendered}</h3><p>${stripTags(item.excerpt.rendered)}</p></div></div></a>`
    })

    currentSlider = new Splide( `#${id}`, {
      type    : 'loop',
      perPage : 5,
      autoplay: true,
      padding: {
        right: '5rem',
        left : '5rem',
      },
      breakpoints: {
        '1366': {
          perPage: 4,
          padding: {
            right: '4rem',
            left : '4rem',
          }
        },
        '1024': {
          perPage: 3,
          padding: {
            right: '0',
            left : '0',
          }
        },
        '640': {
          perPage: 2,
          padding: {
            right: '0',
            left : '0',
          }
        },
        '480': {
          perPage: 1,
          padding: {
            right: '0',
            left : '0',
          }
        }
      }
    }).mount()
  }
}

stripTags = str => {
  return str.replace(/(<([^>]+)>)/ig, '')
}

hashChanged = () => {
  let hash = window.location.hash.replace('#', '')
  if (Object.keys(sliderTabs).includes(hash)) {
    showTab(hash)
  } else {
    showTab(Object.keys(sliderTabs)[0])
  }
}

window.addEventListener('hashchange', hashChanged)
window.ononline = () => {
  inetStatus.querySelector('.mdi-router-wireless-off').style.display = 'none'
  inetStatus.querySelector('.mdi-router-wireless').style.display = 'block'
  inetStatus.classList.remove('fadeIn', 'fadeOut')
  inetStatus.classList.add('fadeOut')
  if (!app.classList.contains('is-playing')) {
    togglePlay()
  }
}

window.onoffline = () => {
  inetStatus.querySelector('.mdi-router-wireless').style.display = 'none'
  inetStatus.querySelector('.mdi-router-wireless-off').style.display = 'block'
  inetStatus.classList.remove('fadeIn', 'fadeOut')
  inetStatus.classList.add('fadeIn')
  if (app.classList.contains('is-playing')) {
    togglePlay()
  }
}
