App = window.App || {};
App.Main = (function Main() {
    var basicMenu = null;

    function initializeApp() {
        console.log('CleverTap Tizen App initializing...');
        
        // Register the main navigation menu
        // basicMenu = App.Navigation.registerMenu({
        //     domEl: document.querySelector('.nav-container'),
        //     name: 'Basic',
        //     alignment: 'horizontal', // Use all arrow keys for linear navigation
        //     onActiveItemChanged: function(element) {
        //         console.log('Focus changed to:', element.tagName, element.textContent || element.placeholder || element.id);
                
        //         // Scroll focused element into view
        //         element.scrollIntoView({
        //             behavior: 'smooth',
        //             block: 'center'
        //         });
        //     },
        //     onAfterLastItem: function() {
        //         console.log('Reached last item');
        //     },
        //     onBeforeFirstItem: function() {
        //         console.log('Reached first item');
        //     }
        // });

        // Initialize key handler
        // App.KeyHandler.initKeyHandler();
        
        // console.log('Navigation initialized with', basicMenu.getItems().length, 'focusable elements');
    }

    // Handle special input focus for TV
    function handleInputFocus(inputElement) {
        console.log('Input focused:', inputElement.id);
        inputElement.focus();
        
        // In a real TV app, you would show a virtual keyboard here
        // For testing, we'll just log it
        console.log('Virtual keyboard should appear for:', inputElement.id);
    }

    // Handle exit functionality
    function handleExit() {
        console.log('Exit requested');
        try {
            if (typeof tizen !== 'undefined') {
                tizen.application.getCurrentApplication().exit();
            } else {
                console.log('Running in browser - cannot exit');
                if (confirm('Exit CleverTap Tizen Test App?')) {
                    window.close();
                }
            }
        } catch (error) {
            console.log('Exit error:', error);
        }
    }

    // Register additional key handlers for TV remote
    function registerRemoteKeys() {
        // Back/Return key handler
        App.KeyHandler.registerKeyHandler(10009, null, function(event) {
            console.log('Back key pressed');
            handleExit();
        });

        // Exit key handler  
        App.KeyHandler.registerKeyHandler(10182, null, function(event) {
            console.log('Exit key pressed');
            handleExit();
        });

        // Red button - could be used for special functions
        App.KeyHandler.registerKeyHandler(403, 'ColorF0Red', function(event) {
            console.log('Red button pressed');
            // Add custom functionality here
        });

        // Green button
        App.KeyHandler.registerKeyHandler(404, 'ColorF1Green', function(event) {
            console.log('Green button pressed');
            // Add custom functionality here
        });

        // Yellow button
        App.KeyHandler.registerKeyHandler(405, 'ColorF2Yellow', function(event) {
            console.log('Yellow button pressed');
            // Add custom functionality here
        });

        // Blue button
        App.KeyHandler.registerKeyHandler(406, 'ColorF3Blue', function(event) {
            console.log('Blue button pressed');
            // Add custom functionality here
        });
    }

    // Enhanced logging for debugging
    function setupDebugLogging() {
        var originalLog = console.log;
        console.log = function() {
            originalLog.apply(console, arguments);
            // In a real app, you might send this to a debug display
        };
    }

    // Initialize when DOM is ready
    window.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded');
        initializeApp();
        // registerRemoteKeys();
        setupDebugLogging();
    });

    // Fallback initialization
    window.addEventListener('load', function() {
        console.log('Window loaded');
        
        // Double-check initialization
        if (!basicMenu) {
            console.log('Fallback initialization');
            initializeApp();
            // registerRemoteKeys();
        }

        // Log environment info
        if (typeof tizen !== 'undefined') {
            console.log('Running on Tizen TV');
            try {
                var appInfo = tizen.application.getCurrentApplication().appInfo;
                console.log('App ID:', appInfo.id);
                console.log('App Version:', appInfo.version);
            } catch (error) {
                console.log('Could not get app info:', error);
            }
        } else {
            console.log('Running in browser - Tizen APIs not available');
        }

        // Show user agent for debugging
        console.log('User Agent:', navigator.userAgent);
    });

    // Handle app visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('App hidden/paused');
        } else {
            console.log('App visible/resumed');
        }
    });

    // Public API
    return {
        handleInputFocus: handleInputFocus,
        handleExit: handleExit,
        getBasicMenu: function() {
            return basicMenu;
        }
    };
}());