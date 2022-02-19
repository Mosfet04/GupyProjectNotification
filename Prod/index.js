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

const privateKey = fs.readFileSync('/etc/letsencrypt/live/dominio/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/dominio/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/dominio/chain.pem', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

app.post('/api/send-subs-data', (request, response) => {
    const subscriptions = JSON.parse(fs.readFileSync('subscription_data.json', 'utf8'));
    subscriptions.push(request.body)
    fs.writeFile('subscription_data.json', JSON.stringify(subscriptions), function(err) {
        if (err) return console.log(err);
        console.log('Sucesso');
        response.send('OK');
    });
    response.send('ERR');
});

app.post('/api/remove-subs-data', (request, response) => {
    const subscriptions_archive = JSON.parse(fs.readFileSync('subscription_data.json', 'utf8'));
    subscriptions_archive.splice(subscriptions_archive.findIndex(obj => obj.endpoint === request.body.endpoint), 1)
    fs.writeFile('subscription_data.json', JSON.stringify(subscriptions_archive), function(err) {
        if (err) return console.log(err);
        console.log('Sucesso');
        response.send('OK');
    });
    response.send('ERR');
});


var server = https.createServer(credentials, app);
server.listen(443, () => console.log('usando a porta 443'));

http.createServer(function(req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);