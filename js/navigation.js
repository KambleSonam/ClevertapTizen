App = window.App || {};
App.Navigation = (function Navigation() {
    var activeMenu = null;
    var Menus = {};
    var isEnabled = true;

    function toggleFocusOnActiveItem() {
        if (activeMenu && activeMenu.getItems().length > 0) {
            var activeItem = activeMenu.getItems()[activeMenu.getFocusedElemIdx()];
            if (activeItem) {
                activeItem.classList.toggle('active');
            }
        }
    }

    function updateFocusIndicator() {
        var indicator = document.getElementById('focus-indicator');
        if (indicator && activeMenu) {
            var items = activeMenu.getItems();
            indicator.textContent = `Focus: ${activeMenu.getFocusedElemIdx() + 1}/${items.length}`;
        }
    }

    // window.addEventListener('keydown', function keyHandler(event) {
    //     if (!isEnabled || !activeMenu) {
    //         return;
    //     }

    //     // Prevent default scroll behavior
    //     if ([37, 38, 39, 40].includes(event.keyCode)) {
    //         event.preventDefault();
    //     }

    //     switch (event.keyCode) {
    //         case 39: // right
    //             activeMenu.onKeyRight();
    //             break;
    //         case 37: // left
    //             activeMenu.onKeyLeft();
    //             break;
    //         case 38: // up
    //             activeMenu.onKeyUp();
    //             break;
    //         case 40: // down
    //             activeMenu.onKeyDown();
    //             break;
    //         case 13: // enter
    //             activeMenu.onKeyEnter();
    //             break;
    //         case 10009: // return/back
    //             activeMenu.onKeyReturn();
    //             break;
    //         default:
    //             console.log('Unhandled key:', event.keyCode);
    //     }
    // }, true);

    function previousItem(menu) {
        var currentIndex = menu.getFocusedElemIdx();

        if (currentIndex !== 0) {
            toggleFocusOnActiveItem();
        }

        menu.setFocusedElemIdx(
            Math.max(currentIndex - 1, 0)
        );

        if (menu.getFocusedElemIdx() !== menu.getSelectedElemIdx()) {
            var selectedItem = menu.getItems()[menu.getSelectedElemIdx()];
            if (selectedItem) {
                selectedItem.classList.remove('selected');
            }
        }

        if (currentIndex === 0) {
            menu.onBeforeFirstItem();
        } else {
            var focusedItem = menu.getItems()[menu.getFocusedElemIdx()];
            menu.onActiveItemChanged(focusedItem);
            toggleFocusOnActiveItem();
            updateFocusIndicator();
        }
    }

    function nextItem(menu) {
        var currentIndex = menu.getFocusedElemIdx();

        if (currentIndex !== menu.getItems().length - 1) {
            toggleFocusOnActiveItem();
        }

        menu.setFocusedElemIdx(
            Math.min(currentIndex + 1, menu.getItems().length - 1)
        );

        if (menu.getFocusedElemIdx() !== menu.getSelectedElemIdx()) {
            var selectedItem = menu.getItems()[menu.getSelectedElemIdx()];
            if (selectedItem) {
                selectedItem.classList.remove('selected');
            }
        }

        if (currentIndex === menu.getItems().length - 1) {
            menu.onAfterLastItem();
        } else {
            var focusedItem = menu.getItems()[menu.getFocusedElemIdx()];
            menu.onActiveItemChanged(focusedItem);
            toggleFocusOnActiveItem();
            updateFocusIndicator();
        }
    }

    function removeMenuConnections(connectionName) {
        return function (menuName) {
            var currentMenu = Menus[menuName];

            if (currentMenu && currentMenu.previousMenu === connectionName) {
                currentMenu.previousMenu = null;
            } else if (currentMenu && currentMenu.nextMenu === connectionName) {
                currentMenu.nextMenu = null;
            }
        };
    }

    function changeActiveMenu(name, index) {
        if (activeMenu) {
            toggleFocusOnActiveItem();
        }
        
        activeMenu = Menus[name] || activeMenu;
        
        if (activeMenu && index !== undefined) {
            activeMenu.setFocusedElemIdx(
                Math.max(0, Math.min(activeMenu.getItems().length - 1, index))
            );
        }
        
        if (activeMenu) {
            toggleFocusOnActiveItem();
            updateFocusIndicator();
        }
    }

    function registerMenu(config) {
        var domEl = config.domEl;
        var focusedElemIdx = 0;
        var selectedItemIdx = 0;
        var menu = {
            name: config.name,
            syncWith: config.syncWith,
            getSelectedElemIdx: function getSelectedElemIdx() {
                return selectedItemIdx;
            },
            nextMenu: config.nextMenu,
            previousMenu: config.previousMenu,
            getItems: function getItems() {
                return domEl.querySelectorAll('[data-list-item]');
            },
            getFocusedElemIdx: function getFocusedElemIdx() {
                return focusedElemIdx;
            },
            setFocusedElemIdx: function setFocusedElemIdx(index) {
                var items = menu.getItems();
                focusedElemIdx = Math.min(items.length - 1, Math.max(0, index));
            },
            setFocusedElemName: function setFocusedElemName(name) {
                var items = menu.getItems();
                var i;

                toggleFocusOnActiveItem();

                for (i = 0; i < items.length; i += 1) {
                    if (items[i].classList.contains(name)) {
                        menu.setFocusedElemIdx(i);
                        break;
                    }
                }

                toggleFocusOnActiveItem();
                updateFocusIndicator();
            },
            onKeyRight: function onKeyRight() { 
                nextItem(menu);
            },
            onKeyLeft: function onKeyLeft() { 
                previousItem(menu);
            },
            onKeyUp: function onKeyUp() { 
                previousItem(menu);
            },
            onKeyDown: function onKeyDown() { 
                nextItem(menu);
            },
            onKeyEnter: function onKeyEnter() {
                if (config.selectionVisible) {
                    var currentSelected = menu.getItems()[selectedItemIdx];
                    if (currentSelected) {
                        currentSelected.classList.remove('selected');
                    }
                    selectedItemIdx = focusedElemIdx;
                    var newSelected = menu.getItems()[selectedItemIdx];
                    if (newSelected) {
                        newSelected.classList.add('selected');
                    }
                }
            },
            onKeyReturn: function onKeyReturn() { 
                console.log('Return key pressed');
            },
            onActiveItemChanged: config.onActiveItemChanged || function onFocusedElemChanged() { },
            onAfterLastItem: config.onAfterLastItem || function onAfterLastItem() {},
            onBeforeFirstItem: config.onBeforeFirstItem || function onBeforeFirstItem() {},
            onNextMenu: config.onNextMenu || function onNextMenu() {},
            onPreviousMenu: config.onPreviousMenu || function onPreviousMenu() {}
        };

        // For single menu navigation, use all arrow keys for linear navigation
        if (config.alignment === 'vertical') {
            menu.onKeyUp = previousItem.bind(null, menu);
            menu.onKeyDown = nextItem.bind(null, menu);
            menu.onKeyLeft = changeToPreviousMenu;
            menu.onKeyRight = changeToNextMenu;
        } else {
            // Default horizontal behavior - all arrows navigate linearly
            menu.onKeyLeft = previousItem.bind(null, menu);
            menu.onKeyRight = nextItem.bind(null, menu);
            menu.onKeyUp = previousItem.bind(null, menu);
            menu.onKeyDown = nextItem.bind(null, menu);
        }

        Menus[config.name] = menu;

        if (!activeMenu) {
            activeMenu = menu;
            toggleFocusOnActiveItem();
            updateFocusIndicator();
        }

        return menu;

        function changeToPreviousMenu() {
            if (menu.previousMenu && !Menus[menu.previousMenu].getItems().length) {
                return;
            }

            if (menu.previousMenu && Menus[menu.previousMenu].syncWith === menu.name) {
                Menus[menu.previousMenu].setFocusedElemIdx(menu.getFocusedElemIdx());
            }

            changeActiveMenu(menu.previousMenu);
            menu.onPreviousMenu();
        }

        function changeToNextMenu() {
            if (menu.nextMenu && !Menus[menu.nextMenu].getItems().length) {
                return;
            }

            if (menu.nextMenu && Menus[menu.nextMenu].syncWith === menu.name) {
                Menus[menu.nextMenu].setFocusedElemIdx(menu.getFocusedElemIdx());
            }

            changeActiveMenu(menu.nextMenu);
            menu.onNextMenu();
        }
    }

    function unregisterMenu(name) {
        var menu = Menus[name];

        if (!menu) {
            return;
        }

        if (menu.name === activeMenu.name) {
            if (menu.previousMenu) {
                changeActiveMenu(menu.previousMenu);
            } else if (menu.nextMenu) {
                changeActiveMenu(menu.nextMenu);
            } else {
                toggleFocusOnActiveItem();
                activeMenu = null;
            }
        }

        Object.getOwnPropertyNames(Menus)
            .forEach(removeMenuConnections(name));

        delete Menus[name];
    }

    function disable() {
        isEnabled = false;
    }

    function enable() {
        isEnabled = true;
    }

    function getMenu(menuName) {
        return Menus[menuName];
    }

    function getActiveMenu() {
        return activeMenu;
    }

    return {
        registerMenu: registerMenu,
        unregisterMenu: unregisterMenu,
        changeActiveMenu: changeActiveMenu,
        getMenu: getMenu,
        disable: disable,
        enable: enable,
        getActiveMenu: getActiveMenu
    };
}());