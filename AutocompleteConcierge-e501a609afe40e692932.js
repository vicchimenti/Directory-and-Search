/*! For license information please see AutocompleteConcierge-e501a609afe40e692932.js.LICENSE.txt */
(self.webpackChunktemplate_stencils = self.webpackChunktemplate_stencils || []).push([[641], {
    38630: function(e, t, r) {
        "use strict";
        r.r(t),
        r.d(t, {
            default: function() {
                return h
            }
        });
        var n = r(67294)
          , o = r(45697)
          , a = r.n(o)
          , s = r(27354)
          , c = r(61228);
        class l {
            constructor(e) {
                if (!e || 0 === e.length)
                    throw new Error("At least one adapter is required for AutocompleteService");
                this.autocompleteAdapters = [],
                Array.from(e).forEach((e => {
                    if (!e || !e.hasOwnProperty("autocomplete"))
                        throw new Error(`${e.constructor.name} is not implemented yet`);
                    this.registerAdapter(e)
                }
                ))
            }
            registerAdapter(e) {
                this.autocompleteAdapters.push(e)
            }
            getResults(e, t) {
                return Promise.all(this.autocompleteAdapters.map((r => r.getResults(e, t).then((e => e.json()))))).then((e => {
                    const t = [];
                    let r = 0
                      , n = 0;
                    return e.map(( (e, o) => (r += e.length,
                    t[o] = [],
                    e.length && e.forEach((e => {
                        t[o][n++] = e
                    }
                    )),
                    t))),
                    {
                        results: t,
                        count: r
                    }
                }
                )).catch((e => (console.error(e),
                {
                    results: [],
                    count: 0,
                    error: e
                })))
            }
        }
        var i = r(29439)
          , u = r(97999)
          , m = r(79963);
        function d() {
            return d = Object.assign ? Object.assign.bind() : function(e) {
                for (var t = 1; t < arguments.length; t++) {
                    var r = arguments[t];
                    for (var n in r)
                        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
                }
                return e
            }
            ,
            d.apply(this, arguments)
        }
        function p(e) {
            let {fetching: t, onSubmit: r, componentId: o} = e;
            return t ? n.createElement("div", {
                className: "autocomplete-concierge__loader",
                "aria-hidden": "true"
            }, n.createElement("svg", {
                className: "autocomplete-concierge__icon",
                role: "img",
                focusable: !1
            }, n.createElement("use", {
                href: "#spinner"
            }))) : n.createElement("button", {
                type: "submit",
                className: "autocomplete-concierge__submit",
                onClick: r,
                "aria-labelledby": `${o}-submit-label`
            }, n.createElement("svg", {
                className: "autocomplete-concierge__icon",
                role: "img",
                focusable: !1
            }, n.createElement("title", {
                id: `${o}-submit-label`
            }, "Submit search"), n.createElement("use", {
                href: "#search"
            })))
        }
        function f(e) {
            const {id: t, templates: o, placeholder: a, debounce: l, action: u, method: f, hiddenFields: h, inputAttributes: v, showSubmit: E, onClose: b, showClear: y, showLoader: g} = e
              , {setSelectedIndex: _, selectedIndex: C, count: w, fetchResults: N, fetching: S} = (0,
            i.o)()
              , [k,P] = (0,
            n.useState)(null)
              , [O,x] = (0,
            n.useState)(null)
              , [j,T] = (0,
            n.useState)(null)
              , [I,A] = (0,
            n.useState)("")
              , [R,$] = (0,
            n.useState)("")
              , [L,U] = (0,
            n.useState)(!1)
              , [D,q] = (0,
            n.useState)("autocomplete-concierge__results")
              , M = (0,
            n.useRef)()
              , F = (0,
            n.useRef)()
              , W = (0,
            n.useRef)(null)
              , Z = (0,
            m.uY)()
              , [K,Y] = (0,
            m.S5)()
              , {keyboardProps: B} = (0,
            s.v5)({
                onKeyUp: e => {
                    let t = -1;
                    if (27 === e.keyCode)
                        return U(!1),
                        _(-1),
                        j || b(),
                        void (W.current && W.current.focus());
                    if (40 === e.keyCode && (t = C + 1 >= w ? 0 : C + 1,
                    K[t] && K[t].scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "start"
                    })),
                    38 === e.keyCode && (t = C - 1 < 0 ? w - 1 : C - 1,
                    K[t] && K[t].scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "start"
                    })),
                    13 === e.keyCode) {
                        if (-1 === C)
                            return void x(!0);
                        K[C].click()
                    }
                    _(t),
                    P(t),
                    U(!0)
                }
                ,
                onKeyDown: e => (40 === e.keyCode || 38 === e.keyCode || 13 === e.keyCode || 27 === e.keyCode ? e.preventDefault() : W.current.focus(),
                !1)
            })
              , {focusWithinProps: Q} = (0,
            s.L_)({
                onFocusWithin: () => {
                    U(!0)
                }
                ,
                onBlurWithin: () => {
                    U(!1)
                }
            });
            (0,
            n.useEffect)(( () => {
                T(( () => L && w > 0))
            }
            ), [w, L]),
            (0,
            n.useEffect)(( () => {
                const e = ["autocomplete-concierge__results"];
                S && j && (e.push("autocomplete-concierge__results--expanding"),
                q(e.join(" "))),
                !S && j && (e.push("autocomplete-concierge__results--open"),
                q(e.join(" "))),
                S || j || (e.push("autocomplete-concierge__results--collapsing"),
                q(e.join(" ")))
            }
            ), [j]),
            (0,
            n.useEffect)(( () => {
                const e = (0,
                m.jS)(document.location.href, "query");
                A(e || "")
            }
            ), []),
            (0,
            n.useEffect)(( () => {
                if (!I)
                    return;
                $(w > 0 ? `${w} results for ${I}` : `No results found for ${I}`)
            }
            ), [w, I]),
            (0,
            n.useEffect)(( () => {
                const e = setTimeout((async () => {
                    "" === I && W.current.focus(),
                    await N(I, o)
                }
                ), l);
                return () => clearTimeout(e)
            }
            ), [I]),
            (0,
            n.useEffect)(( () => {
                if (O && M.current && W.current) {
                    if (W.current.value = I,
                    Z) {
                        const e = {
                            TYPE: "SUBMIT",
                            title: "NEEDS_REFRESH",
                            url: Z.buildSubmitUrl(M.current),
                            time: Date.now()
                        };
                        return void Z.trackedEventWithCb(e, M.current.submit())
                    }
                    M.current.submit()
                }
            }
            ), [O]);
            const V = (e, t, r) => {
                if (Z) {
                    const n = {
                        TYPE: "CLICK",
                        url: e,
                        query: I,
                        title: t
                    };
                    Z.trackedEventWithCb(n, r)
                }
                r && !Z && r()
            }
              , z = (0,
            n.useCallback)(( (e, t) => {
                e.preventDefault();
                const {action: r, action_t: n, title: o} = t;
                if ("Q" === n || void 0 === n)
                    return A(r || t),
                    void x(!0);
                V(r, o, ( () => document.location.href = r))
            }
            ), []);
            return n.createElement("div", d({
                className: "autocomplete-concierge no-wysiwyg",
                role: "search"
            }, Q), n.createElement("form", {
                ref: M,
                action: u,
                method: f,
                className: "autocomplete-concierge__form"
            }, n.createElement("label", {
                className: "sr-only",
                "aria-live": "polite",
                id: `${t}-label`
            }, R), g && n.createElement(p, {
                fetching: S,
                onSubmit: () => x(!0),
                componentId: t
            }), n.createElement("input", d({
                id: `${t}-inputField`,
                ref: W,
                type: "text",
                autoComplete: "off",
                role: "combobox",
                "aria-expanded": j,
                "aria-haspopup": "grid",
                "aria-labelledby": `${t}-label`,
                "aria-autocomplete": "list",
                "aria-controls": `${t}-grid`,
                "aria-activedescendant": -1 === k ? void 0 : k,
                onChange: e => {
                    let {currentTarget: {value: t}} = e;
                    A(t)
                }
                ,
                value: I,
                placeholder: a,
                className: "autocomplete-concierge__input",
                name: "query"
            }, B, v)), h && h.map((e => n.createElement("input", {
                key: e.id,
                type: "hidden",
                name: e.name,
                value: e.value
            }))), n.createElement("button", {
                type: "button",
                className: ["autocomplete-concierge__submit", !y || y && 0 === I.length ? "hidden" : ""].join(" "),
                onClick: () => A(""),
                onKeyUp: e => {
                    e.preventDefault(),
                    13 === e.keyCode && A("")
                }
            }, n.createElement("svg", {
                className: "autocomplete-concierge__icon",
                role: "img",
                focusable: !1
            }, n.createElement("title", null, "Clear search"), n.createElement("use", {
                href: "#close"
            })), "Clear"), E && !g && n.createElement("button", {
                type: "submit",
                className: "autocomplete-concierge__submit",
                onClick: () => x(!0),
                "aria-labelledby": `${t}-submit-label`
            }, n.createElement("svg", {
                className: "autocomplete-concierge__icon",
                role: "img",
                focusable: !1
            }, n.createElement("title", {
                id: `${t}-submit-label`
            }, "Submit search"), n.createElement("use", {
                href: "#search"
            })))), n.createElement("div", d({
                ref: F,
                role: "grid",
                "aria-labelledby": `${t}-label`,
                "aria-hidden": !j,
                id: `${t}-grid`,
                className: D,
                tabIndex: -1
            }, B, {
                style: {
                    display: j ? "" : "none"
                }
            }), o && o.map(( (e, t) => function(e) {
                const {template: t} = e
                  , o = (0,
                n.useMemo)(( () => (0,
                n.lazy)(( () => r(42276)(`./${t}`)))), []);
                return n.createElement(n.Suspense, {
                    key: `component-${t}`,
                    fallback: n.createElement("span", {
                        className: "sr-only"
                    }, "Loading template...")
                }, n.createElement(o, e))
            }({
                ...e,
                templateId: t,
                handleClick: z,
                trackedClick: V,
                childRefs: Y
            })))), n.createElement(c.U4, {
                onDismiss: () => T(!1)
            }))
        }
        function h(e) {
            const {adapters: t} = e
              , r = new l(t);
            return n.createElement(i.Z, {
                initialState: u.E3,
                reducer: u.ZP,
                autocompleteService: r
            }, n.createElement(f, e))
        }
        const {string: v, arrayOf: E, shape: b, number: y, bool: g, func: _} = a();
        h.propTypes = {
            id: v,
            templates: E(b({
                id: v,
                label: v,
                template: v,
                serviceUrl: v,
                params: v
            })).isRequired,
            placeholder: v,
            debounce: y,
            action: v,
            method: v,
            showSubmit: g,
            isOpen: g,
            onClose: _,
            showClear: g,
            showLoader: g
        },
        h.defaultProps = {
            id: "autocomplete-search",
            placeholder: "Start your search here...",
            debounce: 500,
            action: "search.html",
            method: "GET",
            showSubmit: !0,
            isOpen: !1,
            onClose: () => {}
            ,
            showClear: !1,
            showLoader: !1
        }
    },
    25699: function(e, t, r) {
        "use strict";
        r.r(t),
        r.d(t, {
            default: function() {
                return f
            }
        });
        var n = r(67294)
          , o = r(86871)
          , a = r(56078)
          , s = r(61228)
          , c = r(6365)
          , l = r(15090);
        function i() {
            return i = Object.assign ? Object.assign.bind() : function(e) {
                for (var t = 1; t < arguments.length; t++) {
                    var r = arguments[t];
                    for (var n in r)
                        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
                }
                return e
            }
            ,
            i.apply(this, arguments)
        }
        function u(e) {
            let {titleId: t, title: r, onClose: o, children: a, className: c} = e;
            return n.createElement(s.Xj, null, n.createElement("div", {
                className: "no-wysiwyg modal-wrapper " + (c ? `${c}-wrapper` : "")
            }, n.createElement(l.MT, {
                contain: !0,
                restoreFocus: !0,
                autoFocus: !0
            }, n.createElement(m, {
                titleId: t,
                title: r,
                onClose: o,
                className: c
            }, a))))
        }
        function m(e) {
            let {titleId: t, title: r, onClose: o, children: a, className: u} = e;
            const m = {
                "aria-describedby": t,
                title: r,
                onClose: o,
                isDismissable: !0,
                isOpen: !0
            }
              , d = n.useRef()
              , p = n.useRef()
              , f = (0,
            l.bO)()
              , {overlayProps: h, underlayProps: v} = (0,
            s.Ir)(m, p);
            (0,
            s.tk)();
            const {modalProps: E} = (0,
            s.dd)()
              , {dialogProps: b, titleProps: y} = (0,
            c.R)(m, p);
            return (0,
            n.useEffect)(( () => {
                d.current.removeAttribute("hidden"),
                f.focusFirst()
            }
            ), [d]),
            n.createElement("div", i({
                ref: d
            }, v, {
                hidden: !0,
                className: `modal ${u || ""}`
            }), n.createElement("div", i({
                ref: p
            }, h, b, E, {
                "aria-modal": "true",
                tabIndex: "-1",
                className: "modal__content " + (u ? `${u}__content` : "")
            }), t ? "" : n.createElement("h2", i({}, y, {
                className: "" + (u ? `${u}__title` : "")
            }), r), a))
        }
        var d = r(38630);
        function p() {
            return p = Object.assign ? Object.assign.bind() : function(e) {
                for (var t = 1; t < arguments.length; t++) {
                    var r = arguments[t];
                    for (var n in r)
                        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
                }
                return e
            }
            ,
            p.apply(this, arguments)
        }
        function f(e) {
            const [t,r] = (0,
            n.useState)(!1)
              , c = (0,
            n.useCallback)(( () => {
                r(!1)
            }
            ), []);
            (0,
            a.j)();
            const l = (0,
            o.Z)()
              , {adapters: i} = e;
            return n.createElement(s.N3, {
                className: "no-wysiwyg autocomplete-wrapper"
            }, n.createElement("button", {
                type: "button",
                className: "autocomplete-wrapper__action",
                onClick: () => r(!t)
            }, n.createElement("svg", {
                className: "autocomplete-wrapper__icon"
            }, n.createElement("title", null, "Search"), n.createElement("use", {
                href: "#search"
            }))), t && n.createElement(u, {
                titleId: l,
                className: "autocomplete-modal",
                onClose: c
            }, n.createElement("header", {
                className: "autocomplete-modal__header"
            }, n.createElement("button", {
                type: "button",
                onClick: c,
                className: "autocomplete-modal__header-close"
            }, n.createElement("svg", {
                className: "autocomplete-modal__icon"
            }, n.createElement("title", null, "Close modal"), n.createElement("use", {
                href: "#close"
            })))), n.createElement("div", {
                className: "autocomplete-modal__body"
            }, n.createElement(d.default, p({}, e, {
                adapters: i,
                onClose: c
            })))))
        }
    },
    29439: function(e, t, r) {
        "use strict";
        r.d(t, {
            o: function() {
                return s
            }
        });
        var n = r(67294)
          , o = r(97999);
        const a = (0,
        n.createContext)();
        a.displayName = "PNP-STORE";
        const s = () => (0,
        n.useContext)(a);
        t.Z = function(e) {
            let {children: t, initialState: r, reducer: s, autocompleteService: c} = e;
            const [l,i] = (0,
            n.useReducer)(s, r)
              , u = (0,
            n.useMemo)(( () => (0,
            o.Ix)(i, c)), [])
              , m = (0,
            n.useMemo)(( () => ({
                ...u,
                dispatch: i,
                ...l
            })));
            return n.createElement(a.Provider, {
                value: m
            }, t)
        }
    },
    97999: function(e, t, r) {
        "use strict";
        r.d(t, {
            E3: function() {
                return l
            },
            Ix: function() {
                return i
            }
        });
        const n = "PNP/AUTOCOMPLETE/UPDATE_RESULTS"
          , o = "PNP/AUTOCOMPLETE/SET_SELECTED"
          , a = "PNP/AUTOCOMPLETE/LOAD_REQUEST"
          , s = "PNP/AUTOCOMPLETE/LOAD_FAILED"
          , c = "PNP/AUTOCOMPLETE/LOAD_SUCCESS"
          , l = {
            results: [],
            count: 0,
            query: "",
            selectedIndex: -1,
            fetching: !1,
            error: ""
        }
          , i = (e, t) => ({
            updateResults: (t, r) => {
                e({
                    type: n,
                    results: t,
                    count: r
                })
            }
            ,
            setSelectedIndex: t => {
                e({
                    type: o,
                    selectedIndex: t
                })
            }
            ,
            fetchResults: async r => {
                if (!r)
                    return void e({
                        type: n,
                        results: [],
                        count: 0
                    });
                e({
                    type: a
                });
                const {results: o, count: l, error: i} = await t.getResults(r);
                if (i)
                    return console.error("There was an error fetching results from the service."),
                    console.info(i.message),
                    e({
                        type: n,
                        results: [],
                        count: 0
                    }),
                    void e({
                        type: s,
                        error: i.message
                    });
                e({
                    type: n,
                    results: o,
                    count: l,
                    query: r
                }),
                e({
                    type: c
                })
            }
        });
        t.ZP = function() {
            let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : l
              , t = arguments.length > 1 ? arguments[1] : void 0;
            switch (t.type) {
            case a:
                return {
                    ...e,
                    fetching: !0
                };
            case s:
                return {
                    ...e,
                    error: t.error,
                    fetching: !1
                };
            case c:
                return {
                    ...e,
                    fetching: !1
                };
            case n:
                return {
                    ...e,
                    results: t.results,
                    count: t.count,
                    query: t.query,
                    selectedIndex: -1
                };
            case o:
                return {
                    ...e,
                    selectedIndex: t.selectedIndex
                };
            default:
                return {
                    ...e
                }
            }
        }
    },
    42276: function(e, t, r) {
        var n = {
            "./cemetery--v15": [98938, 938],
            "./cemetery--v15.jsx": [98938, 938],
            "./cemetery--v16": [97841, 841],
            "./cemetery--v16.jsx": [97841, 841],
            "./faqs--v15": [81524, 524],
            "./faqs--v15.jsx": [81524, 524],
            "./faqs--v16": [20080, 80],
            "./faqs--v16.jsx": [20080, 80],
            "./organic": [44113, 856, 113],
            "./organic.jsx": [44113, 856, 113],
            "./people--v15": [62140, 140],
            "./people--v15.jsx": [62140, 140],
            "./people--v16": [12507, 507],
            "./people--v16.jsx": [12507, 507],
            "./planning_applications--v15": [53298, 298],
            "./planning_applications--v15.jsx": [53298, 298],
            "./planning_applications--v16": [38504, 504],
            "./planning_applications--v16.jsx": [38504, 504],
            "./programs--v15": [86588, 588],
            "./programs--v15.jsx": [86588, 588],
            "./programs--v16": [32723, 723],
            "./programs--v16.jsx": [32723, 723],
            "./roadworks--v15": [75554, 554],
            "./roadworks--v15.jsx": [75554, 554],
            "./roadworks--v16": [54563, 563],
            "./roadworks--v16.jsx": [54563, 563],
            "./services--v15": [91362, 362],
            "./services--v15.jsx": [91362, 362],
            "./services--v16 ": [45542, 542],
            "./services--v16 .jsx": [45542, 542]
        };
        function o(e) {
            if (!r.o(n, e))
                return Promise.resolve().then((function() {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND",
                    t
                }
                ));
            var t = n[e]
              , o = t[0];
            return Promise.all(t.slice(1).map(r.e)).then((function() {
                return r(o)
            }
            ))
        }
        o.keys = function() {
            return Object.keys(n)
        }
        ,
        o.id = 42276,
        e.exports = o
    }
}]);
//# sourceMappingURL=AutocompleteConcierge-e501a609afe40e692932.js.map
