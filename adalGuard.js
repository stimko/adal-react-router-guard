import AuthenticationContext from 'adal/adal.js'

var _adal = null
var _oauthData = { isAuthenticated: false, userName: '', loginError: '', profile: '' }
const  updateDataFromCache = (resource) => {
  var token = _adal.getCachedToken(resource)
  _oauthData.isAuthenticated = token !== null && token.length > 0
  var user = _adal.getCachedUser() || { userName: '' }
  _oauthData.userName = user.userName
  _oauthData.profile = user.profile
  _oauthData.loginError = _adal.getLoginError()
}
const saveToken = (hash) => {
  var requestInfo = _adal.getRequestInfo(hash)
  _adal.saveTokenFromHash(requestInfo)
  _adal.handleWindowCallback(hash)
}
const loginHandler = () => {
  _adal._saveItem(_adal.CONSTANTS.STORAGE.START_PAGE, window.location.pathname)
  _adal._logstatus('Start login at:' + window.location.href)
  _adal.login()
}

export function isAuthenticated(){
  return _oauthData.isAuthenticated
}

export function setOAuthData(oauth){
  _oauthData = oauth
}

export function getResourceForEndpoint(endpoint){
  return _adal.getResourceForEndpoint(endpoint)
}

export function getAuthorizationToken(resource){
  var deferred = new Promise(
    function(resolve, reject){
      _adal.acquireToken(resource, function (error, tokenOut) {
          if (error) {
            _adal._logstatus('err :' + error)
            reject(error)
            var hash = window.location.hash                 
            if (!_adal.isCallback(hash)){
              window.localStorage.href = window.location.href
              loginHandler()
            }
          } else {
            resolve(tokenOut)
          }
      })
    }
  )
  return deferred
}

export function getCachedToken(resource){
  return _adal.getCachedToken(resource)
}

export function getCachedUser(){
  return _adal.getCachedUser()
}

export function setCachedUser(user){
   _adal._user = user
}

export function requireAuth() {
  if(window.frameElement && !!~window.frameElement.id.indexOf("adalRenewFrame")){
    saveToken(window.location.hash)
  }
  if(!window.frameElement || window.frameElement.id === 'adalIdTokenFrame'){
    setTimeout(() =>{
      updateDataFromCache(_adal.config.loginResource)
      if (!_oauthData.isAuthenticated) {
        var hash = window.location.hash                 
        if (_adal.isCallback(hash)) {
          if(window.localStorage.href && window.self === window.top){
            window.location.href = window.localStorage.href
          }
          updateDataFromCache(_adal.config.loginResource)
          saveToken(hash)
        } else {
          window.localStorage.href = window.location.href
          loginHandler()
        }
      }
    }, 0)
  }
}

export function init(configOptions) {
  if (configOptions) {
    var existingHash = window.location.hash
    var pathDefault = window.location.href
    if (existingHash) {
      pathDefault = pathDefault.replace(existingHash, '')
    }
    configOptions.redirectUri = configOptions.redirectUri || pathDefault
    configOptions.postLogoutRedirectUri = configOptions.postLogoutRedirectUri || pathDefault

    _adal = window.self === window.top ? new AuthenticationContext(configOptions) : window.parent.AuthenticationContext ? window.parent.AuthenticationContext() : new AuthenticationContext(configOptions)
  } else {
    throw new Error('You must set configOptions, when calling init')
  }
  updateDataFromCache(_adal.config.loginResource)
}
