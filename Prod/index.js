const { response } = require('express');
const express = require('express');
var serveIndex = require('serve-index');
const fs = require('fs')
const https = require('https');
const http = require('http');
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static('view'));
app.use('/.well-known', express.static('.well-known'), serveIndex('.well-known'));

const privateKey = fs.readFileSync('/etc/letsencrypt/live/domain/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/domain/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/domain/chain.pem', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

app.post('/api/send-subs-data', (request, response) => {
    fs.writeFile('subscription_data.json', JSON.stringify(request.body), function(err) {
        if (err) return console.log(err);
        console.log('Sucesso');
    });
});

var server = https.createServer(credentials, app);
server.listen(443, () => console.log('usando a porta 443'));

http.createServer(function(req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);