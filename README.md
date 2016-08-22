www-arnaudjuracek
=====

`🌎🖥🌍 unubiquitous & cross-client-synced portfolio`
![preview](preview.png?raw=true "preview")

Built with brocessing's [bro-start](https://github.com/brocessing/bro-start/)

### Installation

Install [ImageMagick](https://github.com/ImageMagick/ImageMagick), then :

```bash
$ ssh remote_username@remote_host
$ mkdir /www/www-arnaudjuracek && cd /ww/www-arnaudjuracek
$ git clone https://github.com/arnaudjuracek/www-arnaudjuracek.git
$ sudo npm install
$ ln -s /www/www-arnaudjuracek/build /www/www-arnaudjuracek/server/public
$ npm run build
$ pm2 start server/app.js
```

### Deployment
```bash
$ ssh remote_username@remote_host 
$ cd /www/www-arnaudjuracek
$ git pull
$ npm run build
$ pm2 restart app
```

### Data structures

`src/views/project-name.txt` :

```YAML
---
template: project

title: " "
date: YYYY-MM-DD
context: " "
license: " "
credits:
  "category":
    - "<b>html</b> valid entry"
    - "<b>html</b> valid entry"
  "category":
    - "<b>html</b> valid entry"
  "":
    - "<b>html</b> valid entry with untitled category"

content: |
  <p>multiple lines</p>
  <p>html content</p>

images:
  - 00.png
  - 01.png
  - 02.png
  - 07.png
images-columns: 2

vimeo: vimeoID
videos:
  - {url: "file.mp4", poster: "poster.png"}
```

If `template` is omitted, `{{content}}` will be output. You can quickly build views like this (see [views/index.txt](src/views/index.txt)), but note that none of the other YAML fields will be evaluated.

Note that the assets path is implicit, and should be `assets/projects/project-name/`. 
When calling `npm run build`, all images assets will be resized and structured as following : 
```
assets/
  projects/
    project-name/
      low/image.jpg
      small/image.jpg
      normal/image.jpg
      large/image.jpg
```

### Dependencies
- [bro-start](https://github.com/brocessing/bro-start/) (MIT)
  - [Webpack](https://github.com/webpack/webpack) + [Webpack-dev-server](https://github.com/webpack/webpack-dev-server)
  - [ES6](https://github.com/lukehoban/es6features#readme) transpilation with [Babel](https://github.com/babel/babel)
  - [Stylus](https://github.com/stylus/stylus/) + [nib](https://github.com/tj/nib) + [autoprefixer](https://github.com/jescalan/autoprefixer-stylus)
  - [mustache](https://mustache.github.io/) with [mu](https://github.com/raycmorgan/Mu)
  - [BrowserSync](https://github.com/BrowserSync/browser-sync) + [localtunnel](https://github.com/localtunnel/localtunnel)
- [blazy](https://github.com/dinbror/blazy) (MIT)
- [js-yaml](https://github.com/nodeca/js-yaml) (MIT)
- [matter-js](https://github.com/liabru/matter-js) (MIT)
- [pixi.js](https://github.com/pixijs/pixi.js) (MIT)
- [Mac OS X lion cursors](http://tobiasahlin.com/blog/common-mac-os-x-lion-cursors/)

### License
MIT.
