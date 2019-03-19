// ==UserScript==
// @name         Bilibili Evolved (Preview)
// @version      1.7.17
// @description  Bilibili Evolved 的预览版, 可以抢先体验新功能.
// @author       Grant Howard, Coulomb-G
// @copyright    2019, Grant Howard (https://github.com/the1812) & Coulomb-G (https://github.com/Coulomb-G)
// @license      MIT
// @match        *://*.bilibili.com/*
// @match        *://*.bilibili.com
// @run-at       document-start
// @updateURL    https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js
// @downloadURL  https://github.com/the1812/Bilibili-Evolved/raw/preview/bilibili-evolved.preview.user.js
// @supportURL   https://github.com/the1812/Bilibili-Evolved/issues
// @homepage     https://github.com/the1812/Bilibili-Evolved
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_setClipboard
// @grant        GM_info
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://cdn.bootcss.com/jszip/3.1.5/jszip.min.js
// @icon         https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/logo-small.png
// @icon64       https://raw.githubusercontent.com/the1812/Bilibili-Evolved/preview/images/logo.png
// ==/UserScript==
import { settings, loadSettings, saveSettings, onSettingsChange } from './settings';
import { logError, raiseEvent, loadLazyPanel, contentLoaded, fixed } from './utils';
import { Ajax } from './ajax';
import { loadResources } from './resource-loader';
import { Toast } from './toast-holder';
import { DoubleClickEvent } from './double-click-event';
import { Observer } from './observer';
import { SpinQuery } from './spin-query';
import { ColorProcessor } from './color-processor';
// [Offline build placeholder]
import { ResourceType } from './resource-type';
import { Resource } from './resource';
import { StyleManager } from './style-manager';
import { ResourceManager } from './resource-manager';

try
{
    const events = {};
    for (const name of ["init", "styleLoaded", "scriptLoaded"])
    {
        events[name] = {
            completed: false,
            subscribers: [],
            complete()
            {
                this.completed = true;
                this.subscribers.forEach(it => it());
            },
        };
    }
    if (unsafeWindow.bilibiliEvolved === undefined)
    {
        unsafeWindow.bilibiliEvolved = { addons: [] };
    }
    Object.assign(unsafeWindow.bilibiliEvolved, {
        subscribe(type, callback)
        {
            const event = events[type];
            if (callback)
            {
                if (event && !event.completed)
                {
                    event.subscribers.push(callback);
                }
                else
                {
                    callback();
                }
            }
            else
            {
                return new Promise((resolve) => this.subscribe(type, () => resolve()));
            }
        },
    });
    loadResources();
    loadSettings();
    const resources = new ResourceManager();
    events.init.complete();
    resources.styleManager.prefetchStyles();
    events.styleLoaded.complete();

    Object.assign(unsafeWindow.bilibiliEvolved, {
        SpinQuery,
        Toast,
        Observer,
        DoubleClickEvent,
        StyleManager,
        ResourceManager,
        Resource,
        ResourceType,
        Ajax,
        loadSettings,
        saveSettings,
        onSettingsChange,
        logError,
        raiseEvent,
        loadLazyPanel,
        contentLoaded,
        fixed,
        settings,
        resources,
        theWorld: waitTime =>
        {
            if (waitTime > 0)
            {
                setTimeout(() => { debugger; }, waitTime);
            }
            else
            {
                debugger;
            }
        },
        monkeyInfo: GM_info,
        monkeyApis: {
            getValue: GM_getValue,
            setValue: GM_setValue,
            setClipboard: GM_setClipboard,
            addValueChangeListener: GM_addValueChangeListener,
        },
    });
    const applyScripts = () => resources.fetch()
        .then(() =>
        {
            events.scriptLoaded.complete();
            const addons = new Proxy(unsafeWindow.bilibiliEvolved.addons || [], {
                apply: function (target, thisArg, argumentsList)
                {
                    return thisArg[target].apply(this, argumentsList);
                },
                deleteProperty: function (target, property)
                {
                    return true;
                },
                set: function (target, property, value)
                {
                    if (target[property] === undefined)
                    {
                        resources.applyWidget(value);
                    }
                    target[property] = value;
                    return true;
                }
            });
            addons.forEach(it => resources.applyWidget(it));
            Object.assign(unsafeWindow.bilibiliEvolved, { addons });
        })
        .catch(error => logError(error));
    contentLoaded(applyScripts);
}
catch (error)
{
    logError(error);
}