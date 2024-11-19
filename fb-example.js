// The 'request' variable is the HTTP request sent by the user
// The 'response' variable is the HTTP response to reply to the user
/* ... imports ... */
const querystring = require('querystring')
const fetch = require('isomorphic-unfetch')
/* ... end imports ... */

/* ... inside the route handler ... */
const { query } = request

const params = querystring.stringify(query)

const endpoint = `https://${process.env.https://dxp-us-stage-search.funnelback.squiz.cloud/s/search.html?collection=seattleu~sp-search&profile=_default&form=partial}/s/search.html?${params}`

const funnelbackResponse = await fetch(endpoint)
const searchResults = await funnelbackResponse.text()

response.render('layout', { searchResults })
/* ... end of the route handler ... */