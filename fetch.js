var travis = require('travis-logs')
var request = require('request')
var split = require('split2')
var tar = require('tar-fs')
var zlib = require('zlib')

var builds = []

travis('.')
  .on('job', (stream) => {
    var url = null
    stream.pipe(split()).on('data', (data) => {
      if (/PREBUILD WAS SUCCESFUL:/.test(data.trim())) {
        url = data.trim().split(' ').pop().trim()
      }
    }).on('end', () => {
      if (url) builds.push(url)
    })
  })
  .on('pass', () => {
    console.log('Fetching travis builds ...')

    var missing = builds.length

    builds.forEach((build) => {
      console.log('Downloading', build, '...')
      console.log('TODO: check that the hash matches lol')
      request(build).pipe(zlib.createGunzip()).pipe(tar.extract('prebuilds')).on('finish', function () {
        if (--missing) return
        console.log('Done!')
      })
    })
  })
  .on('fail', () => {
    console.error('Travis failed')
    process.exit(1)
  })
