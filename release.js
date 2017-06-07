#!/usr/bin/env node

var exec = require('child_process').exec
var spawn = require('child_process').spawn
var path = require('path')
var tar = require('tar-fs')
var crypto = require('crypto')

var WINDOWS = process.platform === 'win32'

build(false, function (err) {
  if (err) process.exit(1)
  if (process.platform !== 'linux') return

  build(true, function (err) {
    if (err) process.exit(1)
  })
})

function build (ia32, cb) {
  shouldRelease(function (err, version) {
    if (err) return cb(err)
    if (!version) return cb(null, null)

    console.log('releasing ...')

    spawn(WINDOWS ? 'npm.cmd' : 'npm',  ['run', 'prebuild' + (ia32 ? '-ia32' : '')], {stdio: 'inherit'}).on('exit', function (code) {
      if (code) return cb(new Error('Build failed'))

      var stream = tar.pack(path.join(__dirname, 'prebuilds'))
      var bufs = []

      stream.on('readable', function () {
        var data
        while ((data = stream.read())) {
          bufs.push(data)
        }
      })

      stream.on('end', function () {
        var buf = Buffer.concat(bufs)
        var hash = crypto.createHash('sha256').update(buf).digest('hex')

        console.log('PREBUILD WAS SUCCESFUL: ' + hash + '.sha256.tar')

        cb(null, version)
      })
    })
  })
}


function shouldRelease (cb) {
  return cb(null, true)

  getPackageVersion('HEAD', function (err, head) {
    if (err) return cb(err)
    getPackageVersion('HEAD~1', function (err, oldHead) {
      if (err) return cb(err)
      if (head === oldHead) return cb(null, null)
      // cb(null, head)
    })
  })
}

function getPackageVersion (rev, cb) {
  exec('git show ' + rev + ':package.json', {
    encoding: 'utf8'
  }, function (err, diff) {
    cb(err, diff && JSON.parse(diff).version)
  })
}
