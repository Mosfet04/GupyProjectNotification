const API_gcm = '-'
const publicElement = '-';
const privateElement = '-';

const webpush = require('web-push');
const subscription_data = require('../subscription_data.json')
const lista_empresas_notificacao = require('../scraper/dados.json')

webpush.setGCMAPIKey(API_gcm);
webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    publicElement,
    privateElement
);

subscription_data.forEach(element => {
    Object.keys(lista_empresas_notificacao).map(result => {
        if (lista_empresas_notificacao[result]) {
            webpush.sendNotification(element, result);
        }
    })
});