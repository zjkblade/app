!function (e) {
    var t = {};

    function n(o) {
        if (t[o]) return t[o].exports;
        var i = t[o] = {i: o, l: !1, exports: {}};
        return e[o].call(i.exports, i, i.exports, n), i.l = !0, i.exports
    }

    n.m = e, n.c = t, n.d = function (e, t, o) {
        n.o(e, t) || Object.defineProperty(e, t, {configurable: !1, enumerable: !0, get: o})
    }, n.r = function (e) {
        Object.defineProperty(e, "__esModule", {value: !0})
    }, n.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return n.d(t, "a", t), t
    }, n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, n.p = "", n(n.s = 0)
}([function (e, t) {
    !function (e, t) {
        var n, o, i, r = document, u = window, d = r.documentElement;

        function c() {
            var n = d.getBoundingClientRect().width;
            t || (t = 540), n > t && (n = t);
            var r = 100 * n / e;
            if (i = "html{font-size:" + r + "px !important}", o = document.getElementById("rootsize") || document.createElement("style"), document.getElementById("rootsize") || (document.getElementsByTagName("head")[0].appendChild(o), o.id = "rootsize"), o.styleSheet) o.styleSheet.disabled || (o.styleSheet.cssText = i); else try {
                o.innerHTML = i
            } catch (e) {
                o.innerText = i
            }
            d.style.fontSize = r + "px"
        }

        c(), u.addEventListener("resize", function () {
            clearTimeout(n), n = setTimeout(c, 300)
        }, !1), u.addEventListener("pageshow", function (e) {
            e.persisted && (clearTimeout(n), n = setTimeout(c, 300))
        }, !1), "complete" === r.readyState ? r.body.style.fontSize = "16px" : r.addEventListener("DOMContentLoaded", function (e) {
            r.body.style.fontSize = "16px"
        }, !1)
    }(375, 667)
}]);