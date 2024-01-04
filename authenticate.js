const { google } = require('googleapis');
const http = require('http');
const destroyer = require('server-destroy');
const fs = require('fs');

const credentials = require('./googleConfig.json');
const oauth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);
async function authenticate() {
  try {
    const open = (await import('open')).default;
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/gmail.modify',
    });
    const server = http.createServer(async (req, res) => {
      if (req.url.indexOf('/oauth2callback') > -1) {
        const qs = new URL(req.url, 'http://localhost:3000').searchParams;
        res.end('Authentication successful! You can close this tab.');
        server.destroy();
        const { tokens } = await oauth2Client.getToken(qs.get('code'));
        oauth2Client.setCredentials(tokens);
        fs.writeFile('token.json', JSON.stringify(tokens), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to token.json');
        });
      }
    }).listen(3000, () => {
      open(authorizeUrl, {wait: false}).then(cp => cp.unref());
    });
    destroyer(server);
  } catch (e) {
    console.error('Authentication failed:', e);
  }
}
authenticate();
