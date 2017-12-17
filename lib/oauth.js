'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _querystring = require('querystring');

var _electron = require('electron');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IIJAuth = function () {
  function IIJAuth(clientId) {
    _classCallCheck(this, IIJAuth);

    this.clientId = clientId;
    this.window = null;
  }

  _createClass(IIJAuth, [{
    key: 'startRequest',
    value: function startRequest() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _electron.app.on('ready', function () {
          _this.window = new _electron.BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: { nodeIntegration: false }
          });
          var params = (0, _querystring.stringify)({
            client_id: _this.clientId,
            response_type: 'token',
            redirect_uri: 'http://localhost',
            state: '1'
          });
          var authURL = 'https://api.iijmio.jp/mobile/d/v1/authorization/?' + params;
          _this.window.loadURL(authURL);
          _this.window.show();
          _this.window.webContents.on('will-navigate', function (event, url) {
            resolve(_this.returnCredential(url));
          });
          _this.window.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
            resolve(_this.returnCredential(newUrl));
          });
          _this.window.on('close', function () {
            return _this.window = null;
          }, false);
        });
      });
    }
  }, {
    key: 'returnCredential',
    value: function returnCredential(url) {
      var result = void 0;
      url = url.replace('localhost#', 'localhost?');
      this.window.destroy();

      try {
        result = (0, _querystring.parse)(url);
      } catch (e) {}

      return result || false;
    }
  }]);

  return IIJAuth;
}();

exports.default = IIJAuth;
module.exports = exports['default'];