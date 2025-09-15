App = window.App || {};
App.KeyHandler = (function KeyHandler() {
    var handledDelegated = [];
    var handledButtons = [];
    var isKeyHandlerEnabled = true;

    function registerKey(key) {
        try {
            tizen.tvinputdevice.registerKey(key);
        } catch (error) {
            console.log('Running in browser - TV key registration not available');
        }
    }

    function registerKeyHandler(keyCode, keyName, handler) {
        if (keyName) {
            registerKey(keyName);
        }

        document.addEventListener('keydown', function keyHandler(event) {
            if (event.keyCode === keyCode) {
                handler(event);
            }
        });
    }

    function addHandlerForDelegated(parentElementSelector, handler) {
        handledDelegated.push({
            delegatedSelector: parentElementSelector,
            handler: handler
        });
    }

    function addHandlersForButtons(buttonsWithHandlers) {
        buttonsWithHandlers.forEach(function (buttonWithHandler) {
            handledButtons.push({
                elementSelector: buttonWithHandler.elementSelector,
                handler: buttonWithHandler.handler
            });
        });
    }

    function initKeyHandler() {
        document.addEventListener('keydown', function onKeyDown(event) {
            var isHandled = false;

            if (!isKeyHandlerEnabled) {
                return;
            }

            // Handle button clicks with Enter key
            handledButtons.forEach(function (buttonWithHandler) {
                var elem = document.querySelector(buttonWithHandler.elementSelector);

                if (event.keyCode === 13 && elem && elem.classList.contains('active')) {
                    buttonWithHandler.handler(event);
                    isHandled = true;
                }
            });

            // Handle delegated elements
            if (!isHandled) {
                handledDelegated.forEach(function handleDelegated(delegatedWithHandler) {
                    var i = 0;
                    var delegated = document.querySelector(delegatedWithHandler.delegatedSelector);
                    var children = delegated ? delegated.querySelectorAll('[data-list-item]') : [];

                    if (event.keyCode === 13) {
                        for (i; i < children.length; i += 1) {
                            if (children[i].classList.contains('active')) {
                                delegatedWithHandler.handler(children[i]);
                                break;
                            }
                        }
                    }
                });
            }

            // Handle Enter key for active elements
            if (!isHandled && event.keyCode === 13) {
                var activeElement = document.querySelector('[data-list-item].active');
                if (activeElement) {
                    if (activeElement.tagName === 'BUTTON') {
                        activeElement.click();
                    } else if (activeElement.tagName === 'INPUT') {
                        activeElement.focus();
                    }
                }
            }
        });

        // Register TV remote keys
        try {
            registerKey('ColorF0Red');
            registerKey('ColorF1Green');
            registerKey('ColorF2Yellow');
            registerKey('ColorF3Blue');
            registerKey('MediaPlay');
            registerKey('MediaPause');
            registerKey('MediaStop');
            console.log('TV remote keys registered');
        } catch (error) {
            console.log('Running in browser - TV keys not available');
        }
    }

    function enableKeyHandler() {
        isKeyHandlerEnabled = true;
    }

    function disableKeyHandler() {
        isKeyHandlerEnabled = false;
    }

    return {
        addHandlerForDelegated: addHandlerForDelegated,
        addHandlersForButtons: addHandlersForButtons,
        registerKeyHandler: registerKeyHandler,
        initKeyHandler: initKeyHandler,
        enableKeyHandler: enableKeyHandler,
        disableKeyHandler: disableKeyHandler
    };
}());