#!/usr/bin/env node

var exec = require('child_process').exec
var spawn = require('child_process').spawn

shouldRelease(function (err, version) {
  if (err) throw err
  if (!version) return

  console.log('releasing ...')

  spawn('npm',  ['run', 'prebuild'], {stdio: 'inherit'}).on('exit', function (code) {
    if (code) return process.exit(1)
    process.exit(0)
  })
})

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
