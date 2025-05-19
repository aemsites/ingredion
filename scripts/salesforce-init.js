/*
 Where possible, we changed noninclusive terms to align with our company value of Equality. 
 We maintained certain terms to avoid any effect on customer implementations. 
*/
(function(l) {
    function d() {
        var a = !1,
            b;
        this.settings = {
            appendHelpButton: !0,
            displayHelpButton: !0,
            isExternalPage: !0,
            devMode: !1,
            targetElement: document.body,
            elementForOnlineDisplay: void 0,
            elementForOfflineDisplay: void 0,
            defaultMinimizedText: "",
            disabledMinimizedText: "",
            defaultAssistiveText: "",
            loadingText: "Loading",
            showIcon: void 0,
            enabledFeatures: [],
            entryFeature: "FieldService",
            storageDomain: document.domain,
            language: void 0,
            linkAction: {
                feature: void 0,
                name: void 0,
                valid: !1
            },
            linkActionParameters: {},
            useCustomAuthentication: !1,
            allowGuestUsers: !1,
            requireSLDS: !1,
            hasBottomTabBar: !1
        };
        this.auth = {};
        this.validLinkActions = {};
        this.alwaysWarnOnBeforeUnload = !1;
        Object.defineProperty(this.auth, "oauthToken", {
            get: function() {
                return b;
            },
            set: function(c) {
                this.validateHeaderValue(c) ? 
                    (b = c) ? 
                        (this.setSessionData("ESW_OAUTH_TOKEN", c), this.checkAuthentication()) : 
                        this.deleteSessionData("ESW_OAUTH_TOKEN") : 
                    this.error('"' + c + '" is not a valid OAuth token.');
            }.bind(this)
        });
        this.featureScripts = {};
        this.storedEventHandlers = {};
        this.messageHandlers = {};
        this.storageKeys = [
            "ESW_BODY_SCROLL_POSITION",
            "ESW_IS_MINIMIZED",
            "ESW_MINIMIZED_TEXT",
            "ESW_OAUTH_TOKEN"
        ];
        this.defaultSettings = {};
        this.snippetSettingsFile = {};
        this.eswFrame = void 0;
        this.availableFeatures = ["script", "session"];
        this.outboundMessagesAwaitingIframeLoad = [];
        this.pendingMessages = {};
        this.iframeScriptsToLoad = [];
        this.isAuthenticationRequired = this.isIframeReady = this.hasSessionDataLoaded = 
            this.componentInitInProgress = this.domInitInProgress = !1;
        this.loginPendingSerializedData = void 0;
        this.componentLoaded = !1;
        Object.defineProperty(this, "isButtonDisabled", {
            get: function() {
                return a;
            },
            set: function(c) {
                a = c;
                this.onButtonStatusChange();
            }.bind(this),
            configurable: !0
        });
        this.setupMessageListener();
        this.getLinkActionData();
    }

    var m = [".salesforce.com", ".force.com", ".sfdc.net", ".site.com", ".salesforce-sites.com"],
        n = "liveagent.chatCanceledOnDifferentTab liveagent.fileTransfer.resetFileSelector liveagent.fileTransfer.uploadFile session.deletedSessionData session.onLoad session.sessionData session.updatePrimary".split(" ");

    d.prototype.getLightningOutParamsObj = function() {
        var a = {};
        if (embedded_svc.config && embedded_svc.config.additionalSettings && embedded_svc.config.additionalSettings.labelsLanguage) {
            a = {
                "aura.altLang": embedded_svc.config.additionalSettings.labelsLanguage
            };
        } else if (embedded_svc.settings.language && "" !== embedded_svc.settings.language.trim()) {
            a = {
                "aura.altLang": embedded_svc.settings.language
            };
        }
        a.eswConfigDeveloperName = embedded_svc.settings.eswConfigDevName;
        return a;
    };

    d.prototype.adjustCommunityStorageDomain = function() {
        if (this.isCommunityDomain(this.settings.storageDomain) && 
            this.settings.storageDomain === document.domain) {
            this.settings.storageDomain = this.settings.storageDomain + "/" + 
                window.location.pathname.split("/")[1];
        }
    };

    d.prototype.loadLightningOutScripts = function(a) {
        if ("function" !== typeof Promise) {
            this.loadScriptFromDirectory("common", "promisepolyfill", 
                function() {
                    return this.loadLightningOutScripts(a);
                }.bind(this), 
                !0
            );
        } else {
            return new Promise(function(b, c) {
                try {
                    var e = a && a.baseCoreURL ? a.baseCoreURL : embedded_svc.settings.baseCoreURL;
                    if (window.$Lightning) {
                        b("Lightning Out is already loaded on this page.");
                    } else if (embedded_svc.utils.isCommunityOrSite()) {
                        b("Communities context does not require Lightning Out to use Embedded Service.");
                    } else if (e) {
                        var f = document.createElement("script");
                        f.type = "text/javascript";
                        f.src = e + "/lightning/lightning.out.js";
                        f.onload = function() {
                            b("Lightning Out scripts loaded.");
                        };
                        document.getElementsByTagName("head")[0].appendChild(f);
                    }
                } catch (h) {
                    c(h);
                }
            });
        }
    };

    d.prototype.instantiateLightningOutApplication = function(a) {
        if ("function" !== typeof Promise) {
            this.loadScriptFromDirectory("common", "promisepolyfill",
                function() {
                    return this.instantiateLightningOutApplication(a);
                }.bind(this),
                !0
            );
        } else {
            return new Promise(function(b, c) {
                try {
                    var e = a && a.communityEndpointURL ? a.communityEndpointURL : embedded_svc.settings.communityEndpointURL;
                    var f = a && a.oauthToken ? a.oauthToken : embedded_svc.settings.oauthToken;
                    var h = a && a.paramsObj ? a.paramsObj : embedded_svc.getLightningOutParamsObj() || void 0;
                    
                    if (embedded_svc.utils.isCommunityOrSite()) {
                        b("Communities context already has an Aura context.");
                    } else if (window.$Lightning) {
                        $Lightning.use("embeddedService:sidebarApp",
                            function() {
                                b("Lightning Out application request complete.");
                            },
                            e, f, h
                        );
                    }
                } catch (g) {
                    c(g);
                }
            });
        }
    };

    d.prototype.createEmbeddedServiceComponent = function(a) {
        if ("function" !== typeof Promise) {
            this.loadScriptFromDirectory("common", "promisepolyfill",
                function() {
                    return this.createEmbeddedServiceComponent(a);
                }.bind(this),
                !0
            );
        } else {
            return new Promise(function(b, c) {
                var e = a && a.chatAPISettings ? 
                    embedded_svc.validateStartChatAttributes(a.chatAPISettings) : {};
                try {
                    var f = a && a.attributes ? a.attributes : {
                        configurationData: embedded_svc.settings,
                        chatAPISettings: e
                    };
                    var h = a && a.locator ? a.locator : embedded_svc.settings.targetElement;
                    
                    embedded_svc.preparePageForSidebar();
                    
                    if (window.$Lightning && !document.querySelector(".embeddedServiceSidebar")) {
                        $Lightning.ready($Lightning.createComponent.bind(this,
                            "embeddedService:sidebar",
                            f,
                            h,
                            function(g, k, p) {
                                if ("SUCCESS" === k) {
                                    embedded_svc.utils.addEventHandler("afterInitialization",
                                        function() {
                                            b("Embedded Service component created.");
                                        }
                                    );
                                } else {
                                    c(p);
                                }
                            }
                        ));
                    } else if (embedded_svc.utils.isCommunityOrSite()) {
                        window.dispatchEvent(new CustomEvent("embeddedServiceCreateSidebar", {
                            detail: {
                                componentAttributes: f,
                                resolve: b,
                                reject: c
                            }
                        }));
                    } else if ("undefined" === typeof window.$Lightning) {
                        b("Lightning Out should be loaded on this page before creating the Embedded Service component.");
                    } else {
                        b("Embedded Service component already exists.");
                    }
                } catch (g) {
                    c(g);
                }
            });
        }
    };

    d.prototype.bootstrapEmbeddedService = function(a) {
        if ("function" !== typeof Promise) {
            this.loadScriptFromDirectory("common", "promisepolyfill",
                function() {
                    return embedded_svc.bootstrapEmbeddedService(a);
                },
                !0
            );
        } else {
            return new Promise(function(b, c) {
                try {
                    embedded_svc.loadLightningOutScripts(a)
                        .then(function() {
                            embedded_svc.instantiateLightningOutApplication(a)
                                .then(function() {
                                    embedded_svc.createEmbeddedServiceComponent(a)
                                        .then(function() {
                                            window.requestAnimationFrame(function() {
                                                embedded_svc.hideHelpButton();
                                                b("Embedded Service application and component bootstrapped.");
                                            });
                                        });
                                });
                        });
                } catch (e) {
                    c(e);
                }
            });
        }
    };

    d.prototype.validateStartChatAttributes = function(a) {
        var b = (a = a ? a : {}) && a.prepopulatedPrechatFields ? a.prepopulatedPrechatFields : {},
            c = a && a.extraPrechatInfo ? a.extraPrechatInfo : [],
            e = a && a.extraPrechatFormDetails ? a.extraPrechatFormDetails : [],
            f = a && a.fallbackRouting ? a.fallbackRouting : [],
            h = a && a.directToButtonRouting ? a.directToButtonRouting : void 0,
            g = {
                buttonId: a && a.buttonId ? a.buttonId : void 0,
                userId: a && a.userId ? a.userId : void 0,
                fallback: a && "boolean" === typeof a.fallback ? a.fallback : void 0
            };

        if ("object" === typeof b) {
            a.prepopulatedPrechatFields = b;
        } else {
            throw Error("Validation failed for prepopulatedPrechatFields, received: " + b);
        }

        if (Array.isArray(e)) {
            a.extraPrechatFormDetails = e;
        } else {
            throw Error("Validation failed for extraPrechatFormDetails, received: " + e);
        }

        if (Array.isArray(c)) {
            a.extraPrechatInfo = c;
        } else {
            throw Error("Validation failed for extraPrechatInfo, received: " + c);
        }

        if (Array.isArray(f)) {
            a.fallbackRouting = f;
        } else {
            throw Error("Validation failed for fallbackRouting, received: " + f);
        }

        if ("function" === typeof h) {
            a.directToButtonRouting = h;
        } else {
            embedded_svc.log("Did not receive an actionable parameter for directToButtonRouting, received: " + h);
        }

        if ("object" === typeof g) {
            if (a.directToAgentRouting = g, g.buttonId) {
                if ("string" === typeof g.buttonId && g.buttonId.trim().length) {
                    a.directToAgentRouting.buttonId = g.buttonId.trim();
                    a.directToAgentRouting.fallback = g.fallback;
                    if (g.userId) {
                        if ("string" === typeof g.userId && g.userId.trim().length) {
                            a.directToAgentRouting.userId = g.userId.trim();
                        } else {
                            embedded_svc.log("Did not receive an actionable parameter for directToAgentRouting's userId, received: " + g.userId);
                        }
                    }
                } else {
                    throw Error("Validation failed for directToAgentRouting's buttonId, received: " + g.buttonId);
                }
            } else {
                embedded_svc.log("Did not receive an actionable parameter for directToAgentRouting's buttonId, received: " + g.buttonId);
            }
        } else {
            throw Error("Validation failed for directToAgentRouting, received: " + g);
        }

        return a;
    };

    window.embedded_svc = new d;
    Object.getOwnPropertyNames(l).forEach(function(a) {
        var b = l[a];
        "object" === b ? 
            (window.embedded_svc[a] = {}, Object.keys(b).forEach(function(c) {
                window.embedded_svc[a][c] = b[c];
            })) : 
            window.embedded_svc[a] = b;
    });
})(window.embedded_svc || {}); 