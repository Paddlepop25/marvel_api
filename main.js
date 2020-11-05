require('dotenv').config()

const express = require('express')
const handlebars = require('express-handlebars')
const md5 = require('js-md5')
const fetch = require('node-fetch')
const withQuery = require('with-query').default
const MARVEL_BASEURL = 'http://gateway.marvel.com/v1/public/characters'
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const app = express()

/*
Example from documentation (https://developer.marvel.com/documentation/authorization) 
ts - a timestamp (or other long string which can change on a request-by-request basis)
hash - a md5 digest of the ts parameter, your private key and your public key (e.g. md5(ts+privateKey+publicKey)
For example, a user with a public key of "1234" and a private key of "abcd" could construct a valid call as follows: http://gateway.marvel.com/v1/public/comics?ts=1&apikey=1234&hash=ffd275c5130566a2916217b101f26150 (the hash value is the md5 digest of 1abcd1234)
*/

let PUBLIC_KEY = process.env.PUBLIC_KEY
let PRIVATE_KEY = process.env.PRIVATE_KEY
let ts = (new Date()).getTime()
let hash = md5(`${ts}${PRIVATE_KEY}${PUBLIC_KEY}`)

let url = withQuery(MARVEL_BASEURL, {
  apikey: PUBLIC_KEY,
  ts, hash
})
// console.info('url -------> ', url)

app.engine('hbs', handlebars({ defaultLayout: 'default.hbs' }))
app.set('view engine', 'hbs')

// configure app
app.get('/',
  (req, res) => {
    fetch(url)
      .then(result => result.json())
      .then(result => {
        let bigData = result['data']['results']
          .map((info) => {
            return {
              name: info.name,
              thumbnail: `${info.thumbnail.path}.${info.thumbnail.extension}`,
              url: info.urls[0].url
            }
          })
          console.info('bigData --->', bigData)
          res.status(200)
          res.type('text/html')
          res.render('index', { bigData })
      })
      .catch(err => {
            console.err('ERROR --->', err)
      })
    })

app.listen(PORT,
  console.info(`Application started on port ${PORT} on ${new Date()}`)
)