let volume = 0,
  contextMenu,
  tray
const Config = require('electron-config')
const config = new Config()
const electron = require('electron')
const { app, BrowserWindow, Tray, Menu, dialog } = electron
const axios = require('axios')
const OAuthIIJ = require('electron-oauth-iijmio/lib')
const OAuth = new OAuthIIJ(process.env.APIKEY)
axios.defaults.baseURL = 'https://api.iijmio.jp/mobile/d'
axios.defaults.headers.common['X-IIJmio-Developer'] = process.env.APIKEY

main()

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') return
  app.quit()
})

function main () {
  getToken()
    .then(credential => {
      config.set('token', credential.access_token)
      axios.defaults.headers.common['X-IIJmio-Authorization'] =
        credential.access_token
      return getCoupon()
    })
    .then(volume => {
      scheduler()
      setInterval(() => {
        scheduler()
      }, 180000)
    })
    .catch(err => {
      console.log(err)
    })
}

function scheduler () {
  tray = new Tray(__dirname + '/icons/icon.png')
  contextMenu = Menu.buildFromTemplate([
    { label: `miotron v${app.getVersion()}` },
    { label: `今月のクーポン残量: ${volume}MB` },
    {
      label: '閉じる',
      click: () => {
        app.quit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
}

function getToken () {
  if (config.get('token')) {
    return Promise.resolve({
      access_token: config.get('token')
    })
  }
  return OAuth.startRequest()
}

function getCoupon () {
  return new Promise((resolve, reject) => {
    axios
      .get('/v2/coupon/')
      .then(({ data }) => {
        const volume = data.couponInfo[0].coupon.reduce(
          (a, b) => a + b.volume,
          0
        )
        resolve(volume)
      })
      .catch(err => {
        config.delete('token')
        reject(err)
      })
  })
}
