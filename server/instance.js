/**
 * Server Instance
 */

import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'
import express from 'express'
import Path from 'path'
import bodyParser from 'body-parser'
import multer from 'multer'
import chalk from 'chalk'
import App from './app'
import webpackConfig from '../webpack.config.babel'


const upload = multer() // for parsing multipart/form-data
const config = require('./config.json')
const packageConf = require('../package.json')

class Server {
  constructor () {
    this.p = config
    this.p.version = packageConf.version
    this.app = new App(this.p)

    this.server = express()
    this.server.use(bodyParser.json())
    this.server.use(bodyParser.urlencoded({ extended: true }))
    this.initRoutes()
    this.server.listen(this.p.env.port, () => {
      console.info(chalk.cyan('Graphiy'),
        chalk.grey(this.p.version),
        'running as ',
        chalk.white(this.p.env.name),
        ` on http://${this.p.env.host}:${this.p.env.port}`
      )
    })
  }

  initRoutes (req, res) {
    if (process.env.NODE_ENV === 'DEV') {
     /* const webpackOptions = {
        entry: './client/app.js',
        output: {
          path: '/',
        },
      }*/
      const wmOptions = {
        index: 'client/index.html',
        publicPath: '/',
      }
      this.server.use(webpackMiddleware(webpack(webpackConfig()), wmOptions))
    } else {
      this.server.get(/build*/, this._onResourceRequest.bind(this))
    }
    this.server.get('/', this._onRootRequest.bind(this))
    this.server.post(/item/, upload.array(), this._onAPIRequest.bind(this))
    this.server.post(/find/, upload.array(), this._onAppRequest.bind(this))
    this.server.get(/tags/, this._onAppSelectInit.bind(this))
    this.server.get(/^(.+)$/, this._onOtherRequest.bind(this))
  }

  _onRootRequest (req, res) {
    res.sendFile(Path.join(this.p.app.path, '/client/index.html'))
  }

  _onResourceRequest (req, res) {
    res.sendFile(Path.join(this.p.app.path, req.path))
  }

  _on3dpartyRequest (req, res) {
    res.sendFile(Path.join(this.p.app.path, '..', req.path))
  }

  _onAppRequest (req, res) {
    this.app[req.body.method](req.body.args)
      .then((data) => {
        res.send(data)
      })
  }

  _onAppSelectInit (req, res) {
    const query = req.query.q
    this.app.searchTags(query)
      .then((data) => {
        res.send(JSON.stringify(data))
      })
  }

  _onAPIRequest (req, res) {
    this.app.apiServer.request(req.body)
      .then((data) => {
        res.send(data)
      })
  }

  _onOtherRequest (req, res) {
    console.info(`other static request: ${req.params[0]}`)
    res.sendFile(Path.join(this.p.static + req.params[0]))
  }
}
export default new Server
