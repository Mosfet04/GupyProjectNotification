'use strict';

const applicationServerPublicKey = '-';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;
let subscription_save

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('sw.js')
        .then(function(swReg) {
            console.log('Service Worker is registered', swReg);

            swRegistration = swReg;
            initialiseUI();
        })

    .catch(function(error) {
        console.error('Service Worker Error', error);
    });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}



function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function initialiseUI() {
    pushButton.addEventListener('click', function() {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();

        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            isSubscribed = !(subscription === null);

            updateSubscriptionOnServer(subscription);

            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }

            updateBtn();
        });
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
        .then(function(subscription) {
            console.log('User is subscribed:', subscription);
            subscription_save = subscription;
            updateSubscriptionOnServer(subscription);
            sendSubscriptionData(JSON.stringify(subscription));
            isSubscribed = true;

            updateBtn();
        })
        .catch(function(err) {
            console.log('Failed to subscribe the user: ', err);
            updateBtn();
        });
}

function updateSubscriptionOnServer(subscription) {

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
        document.querySelector('.js-subscription-details');

    if (subscription) {
        subscriptionJson.textContent = JSON.stringify(subscription);
        subscriptionDetails.classList.remove('is-invisible');


    } else {
        subscriptionDetails.classList.add('is-invisible');


    }
}


function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch(function(error) {
            console.log('Error unsubscribing', error);
        })
        .then(function() {
            removeSubscriptionData(JSON.stringify(subscription_save));
            updateSubscriptionOnServer(null);
            console.log('User is unsubscribed.');
            isSubscribed = false;

            updateBtn();
        });
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
}

function sendSubscriptionData(subscription) {
    return fetch('https://dominio/api/send-subs-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: subscription
        })
        .then((response) => {
            if (response.status !== 200) {
                return response.text()
                    .then((responseText) => {
                        throw new Error(responseText);
                    });
            }
        });
}

function removeSubscriptionData(subscription) {
    return fetch('https://dominio/api/remove-subs-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: subscription
        })
        .then((response) => {
            subscription_save = null;
            if (response.status !== 200) {
                return response.text()
                    .then((responseText) => {
                        throw new Error(responseText);
                    });
            }
        });
}