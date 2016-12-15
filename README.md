# adal-react-router-guard
React router guard for adal.js

1. Add requireAuth as the guard to onEnter hook in a react router path, I do it at the root path "/"
2. Call the init method like you normally would with your AD credentials somewhere in your app, I do it in indexs.js
3. Use "let token = await getAuthorizationToken(resource)" (see example) in your service/s to let adal handle either using cached token or refreshing stale token
