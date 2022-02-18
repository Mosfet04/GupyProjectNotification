var Nightmare = require('nightmare'),
    nightmare = Nightmare({
        //openDevTools: {
        //  mode: 'detach'
        //},
        show: true
    })
var vo = require('vo')
require('dotenv').config()

let _ = require('lodash');
const { exit } = require('process');
let urls = []

let dados = {}

fs = require('fs');


function* acess(urls) {
    for (let i = 1; i <= urls.length; i++) {
        if (i < urls.length) {
            yield nightmare
                .goto('https://' + urls[i] + '.gupy.io/candidates/applications')
                .wait('div[class="candidate-container__header"]')
                .evaluate(() => document.querySelector('div[class="app-header__message"]').innerHTML)
                .then(function(result) {
                    if (result.indexOf('class="app-header__message--notification') != -1) {
                        dados[urls[i]] = true
                    } else {
                        dados[urls[i]] = false
                    }
                    console.log(urls[i])
                })
        } else {
            console.log('Entrei')
            nightmare.end();
        }
    }
}

function list() {
    console.log("Entrou")
    nightmare
        .goto('https://login.gupy.io/candidates/signin')
        .wait('button[id="social-form-acess-button"]')
        .click('button[id="social-form-acess-button"]')
        .wait('input[id="email"]')
        .type('input[id="email"]', process.env.login)
        .type('input[id="password-input"]', process.env.senha)
        .click('form[class="gupy-form"]>button')
        .wait('div[class="app-header__drawer"]')
        .click('div[class="app-header__drawer"]>button')
        .evaluate(() => document.querySelector('div[class="sc-iybRtq cMpTbG"]').innerHTML)
        .then(function(result) {
            console.log(urls)
            let temp = result.split(' ')
            for (e in temp) {
                _.includes(temp[e], 'aria-controls="menu-list-') ? urls.push(temp[e].split('aria-controls="menu-list-')[1].split('"')[0]) : null
            } 
        })
        .then(function() {
            vo(acess(urls))(function(err, result) {
                if (err) throw err
                console.log(dados)
                fs.writeFile('dados.json', JSON.stringify(dados), function(err) {
                    if (err) return console.log(err);
                    console.log('Sucesso');
                    exit();
                });
            });
        })
        .catch(function(error) {
            console.error(error);
        });
}

list()