class Elements {
  constructor(s) {
    if (typeof s == "string" && (s = document.querySelector(s)), this.element = s, s != null) {
      this.block_name = this.constructor.name.toLowerCase(), this.elements = [], Elements.slots = Elements.slots || {}, s || console.warn('Elements: element of class "%s" not found. Check the constructor argument of instance.', this.constructor.name);
      let t = s.querySelectorAll('[class*="' + this.block_name + '__"]');
      for (var o = 0; o < t.length; o++) {
        let n = t[o].classList.toString().match(/[a-z0-9-]*__[a-z0-9-]*/)[0].split("__")[1];
        s.querySelectorAll(this.block_name + "__" + n).length > 1 ? (this["__" + n] === "undefined" && (this["__" + n] = []), this["__" + n].push(t[o])) : this["__" + n] = t[o], typeof this.elements[n] > "u" && (this.elements[n] = []), this.elements[n].push(t[o]);
      }
    }
  }
  // Создает экземпляр класса для всех блоков этого типа на странице
  static awake() {
    let name = this.name, elements;
    elements = document.querySelectorAll("." + name.toLowerCase());
    for (var i = 0; i < elements.length; i++)
      elements[i], eval("new " + name + "( element )");
  }
  // Определяем какая страница открыта. meta[name="page"] задается на бэкэнде
  static get page() {
    return document.querySelector('meta[name="page"]').getAttribute("content");
  }
  static get assets_path() {
    return document.querySelector('meta[name="assets_path"]').getAttribute("content");
  }
  // url - url
  // raw_data - is a selector of parent element of inputs or json data object
  request(s, o, t = {}) {
    var n = new XMLHttpRequest(), a = "", p, y, h, d = {};
    if (typeof t.file > "u" && (t.file = !1), typeof t.json > "u" && (t.json = !1), typeof t.alert_success > "u" && (t.alert_success = !0), typeof t.alert_error > "u" && (t.alert_error = !0), typeof o == "string") {
      p = document.querySelectorAll(o + " [name]");
      for (var m = 0; m < p.length; m++)
        y = p[m].value, h = p[m].getAttribute("name"), d[h] = y;
    } else
      d = o;
    n.open("POST", s, !0);
    var b = t.json == !1 ? "application/x-www-form-urlencoded; charset=UTF-8" : "application/json; charset=UTF-8";
    if (!t.file && n.setRequestHeader("Content-Type", b), n.onload = () => {
      var e = n.responseText;
      try {
        e = JSON.parse(e);
      } catch (r) {
        console.log(r, e);
      }
      n.status >= 200 && n.status < 400 ? (w(e), _(e)) : (v(e), _(e));
    }, n.onerror = () => {
      let e = n.responseText;
      try {
        e = JSON.parse(e);
      } catch {
        console.log(e);
      }
      t.alert_error && this.broadcast({ event: "alert", payload: e }), v(e), _(e);
    }, t.json == !1)
      for (let e in d)
        a += encodeURIComponent(e) + "=" + encodeURIComponent(d[e]) + "&";
    else
      a = JSON.stringify(d);
    n.send(t.file ? d : a);
    const w = (e) => {
      e.status == 0 ? t.alert_success && this.broadcast({ event: "alert", payload: e }) : e.status == 2 && t.alert_error && this.broadcast({ event: "alert", payload: e }), typeof t.done == "function" && t.done(e);
    };
    function v(e) {
      typeof t.fail == "function" && t.fail(e);
    }
    function _(e) {
      typeof t.always == "function" && t.always(e);
    }
  }
  // Регистрируем слоты и блоки, от которых они ждут сигнала
  receive(s = { event: "", from: "", do: null }) {
    Elements.slots = Elements.slots || {}, Elements.slots[this.block_name] = Elements.slots[this.block_name] || {}, s.from ? Elements.slots[this.block_name][s.from || "*"] = { event: s.event, do: s.do } : (Elements.slots["*"] = Elements.slots["*"] || [], Elements.slots["*"][s.event] = Elements.slots["*"][s.event] || [], Elements.slots["*"][s.event].push(s.do));
  }
  // Транслируем сигнал
  broadcast(s = { event: "", to: "", payload: null }) {
    let o = Elements.slots[s.to], t = o && o[this.block_name];
    t && s.event == t.event ? typeof t.do == "function" && t.do(s.payload) : (o = Elements.slots["*"], o && (t = o[s.event]), t.map((n) => typeof n == "function" && n(s.payload))), o || console.warn('Elements: slots of block "' + s.to + '" not found. Register slots of block using receive function or check block name in send function.'), t || console.warn('Elements: block "' + s.to + '" not contain slot for block "' + this.block_name + '". Check "from" field in receive functions.');
  }
}
class Alert extends Elements {
  constructor(o) {
    super(o), this.receive({ event: "alert", do: this.notification });
  }
  notification({ status: o, message: t }) {
    let n = document.querySelector(".alert-list");
    n === null && (n = document.createElement("div"), n.classList.add("alert-list"), document.body.appendChild(n));
    let a = document.createElement("div"), p = document.createElement("div"), y = "";
    switch (o) {
      case 0:
        y = "alert_success";
        break;
      case 1:
        y = "alert_secondary";
        break;
      case 2:
        y = "alert_error";
        break;
    }
    a.classList.add("alert"), a.classList.add(y), a.classList.add("alert_bounceIn"), p.classList.add("text"), p.innerHTML = t, a.appendChild(p), n.appendChild(a), setTimeout(() => {
      a.classList.remove("alert_bounceIn"), a.classList.add("alert_bounceOut"), setTimeout(() => a.remove(), 650);
    }, 5e3);
  }
}
function dropdown() {
  var s = [], o, t, n, a, p, y;
  s = document.querySelectorAll(".dropdown");
  for (var h = 0; h < s.length; h++) {
    var d, m;
    d = s[h].querySelector(".dropdown__toggle"), m = s[h].querySelector(".dropdown__content"), d != null && m != null && (d.onclick = b);
  }
  function b(r) {
    var f = this.parentNode, l = this, c = f.querySelector(".dropdown__content");
    f.classList.contains("dropdown_active") ? (f.classList.remove("dropdown_active"), window.removeEventListener("click", v, !0), y = f.getAttribute("data-dropdown-onclose"), typeof window[y] == "function" && window[y]()) : (p = f.getAttribute("data-dropdown-onopen"), typeof window[p] == "function" && window[p](), o = _(), t = e(), c.style.marginLeft = "0px", c.style.marginTop = "0px", f.classList.add("dropdown_active"), w(f, l, c), v.prototype.dropdown_toggle = l, window.removeEventListener("click", v), window.addEventListener("click", v, !0));
  }
  function w(r, f, l) {
    var c = f.getBoundingClientRect(), u = l.getBoundingClientRect(), g = Math.round(u.right + window.scrollX), x = Math.round(u.bottom + window.scrollY), H = window.innerWidth - document.documentElement.clientWidth, L = window.innerHeight - document.documentElement.clientHeight;
    n = Number(r.getAttribute("data-dropdown-offset-x") || 0), a = Number(r.getAttribute("data-dropdown-offset-y") || 0), r.setAttribute("data-dropdown-position", "left-top"), l.style.marginLeft = n + "px", l.style.marginTop = a + "px", g + n + H < o && x + a + L < t ? (r.setAttribute("data-dropdown-position", "left-top"), l.style.marginLeft = n + "px", l.style.marginTop = a + "px") : g + n + H > o && x + a + L < t ? (r.setAttribute("data-dropdown-position", "right-top"), l.style.marginLeft = Number(Math.max(c.width, u.width) - Math.min(c.width, u.width) + n) * -1 + "px", l.style.marginTop = a + "px") : g + n + H < o && x + a + L > t ? (r.setAttribute("data-dropdown-position", "left-bottom"), l.style.marginLeft = n + "px", l.style.marginTop = Number(c.height + u.height + a) * -1 + "px") : g + n + H > o && x + a + L > t && (r.setAttribute("data-dropdown-position", "right-bottom"), l.style.marginLeft = Number(Math.max(c.width, u.width) - Math.min(c.width, u.width) + n) * -1 + "px", l.style.marginTop = Number(c.height + u.height + a) * -1 + "px");
  }
  function v(r) {
    var f = document.querySelector(".dropdown_active");
    f != null && r.target !== v.prototype.dropdown_toggle && // Если клик не по туглу
    r.target != f && // Если клик не по дропдауну
    !f.contains(r.target) && (f.classList.remove("dropdown_active"), window.removeEventListener("click", v, !0), y = f.getAttribute("data-dropdown-onclose"), typeof window[y] == "function" && window[y]());
  }
  function _() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    );
  }
  function e() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  }
}
function viewer() {
  var s, o;
  s = document.querySelectorAll("[data-viewer-src]");
  for (var t = 0; t < s.length; t++)
    n(s[t]);
  function n(h) {
    var d, m;
    h.onclick = b;
    function b(e) {
      for (var r = document.querySelectorAll(".viewer_active"), f = 0; f < r.length; f++) r[f].click();
      d = document.createElement("div"), d.onclick = w, d.className = "viewer", m = document.createElement("img"), m.className = "viewer__image", m.setAttribute("src", this.getAttribute("data-viewer-src")), d.appendChild(m), document.body.appendChild(d), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? o = new ZingTouch.Region(d, !1, !0) : o = new ZingTouch.Region(d, !1, !1), a(m, d), p(m, d), y(m, d), _() > v();
    }
    function w(e) {
      e.target === this && (document.body.style.paddingRight = 0, document.body.removeChild(this));
    }
    function v() {
      return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }
    function _() {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
    }
  }
  function a(h, d) {
    o.bind(d, "swipe", function(m) {
      const { velocity: b, currentDirection: w } = m.detail.data[0];
      b >= 1.25 && w >= 60 && w <= 160 && d.click();
    });
  }
  function p(h, d) {
    var m = new Transform(h), b = 0.2, w = 3, v = 0, _;
    h.scale = 1, (function(e, r) {
      var f = "90%";
      if (e.offsetWidth > e.offsetHeight && e.offsetWidth > r.offsetWidth)
        e.style.width = f;
      else if (!(e.offsetWidth > e.offsetHeight && e.offsetWidth <= r.offsetWidth)) {
        if (e.offsetWidth < e.offsetHeight && e.offsetHeight > r.offsetHeight)
          e.style.height = f;
        else if (!(e.offsetWidth < e.offsetHeight && e.offsetHeight <= r.offsetHeight))
          if (e.offsetWidth == e.offsetHeight && e.offsetWidth > r.offsetWidth) {
            var l = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight, c = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            l > c ? e.style.width = f : e.style.height = f;
          } else e.offsetWidth == e.offsetHeight && e.offsetWidth <= r.offsetWidth && (e.style.width = f);
      }
      if (r.addEventListener("wheel", function(g) {
        e.scale = g.deltaY < 0 ? e.scale += 0.1 : e.scale -= 0.1, e.scale = e.scale > w ? w : e.scale < b ? b : e.scale, m.scale(e.scale), g.preventDefault();
      }), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        var u = 7e-3;
        o.bind(r, "tap", function(g) {
          g.target == r && g.detail.events[0].originalEvent.type != "mouseup" && r.click();
        }), o.bind(e, "tap", function(g) {
        }), o.bind(r, "distance", function(g) {
          v == 0 && (v = g.detail.distance), _ = Math.max(v, g.detail.distance) - Math.min(v, g.detail.distance), g.detail.change > 0 ? e.scale += _ * u : e.scale -= _ * u, e.scale = e.scale > w ? w : e.scale < b ? b : e.scale, requestAnimationFrame(function() {
            m.scale(e.scale);
          }), v = g.detail.distance;
        }), document.body.addEventListener("touchend", function(g) {
          v = 0;
        }, !1);
      }
    })(h, d);
  }
  function y(h, d) {
    var m = new Transform(h), b = new ZingTouch.Pan({ threshold: 5 }), w = !1, v = 0, _ = 0, e = 0, r = 0, f = 0, l = 0;
    o.bind(h, b, function(c) {
      var u;
      w || (v = c.detail.events[0].pageX, _ = c.detail.events[0].pageY), e = f + (c.detail.events[0].pageX - v), r = l + (c.detail.events[0].pageY - _), u = Math.max(1 / h.scale, 0.6), m.translate(
        {
          x: e * u,
          y: r * u
        }
      ), w = !0;
    }), window.addEventListener("touchend", function(c) {
      var u = h.getBoundingClientRect();
      w && (f = e, l = r, window.touchend = null, u.width < d.offsetWidth && u.height < d.offsetHeight && (m.translate({ x: 0, y: 0 }), f = 0, l = 0), w = !1);
    }, !1), h.onmousedown = function(c) {
      return v = c.pageX, _ = c.pageY, document.onmousemove = function(u) {
        return e = u.pageX - v + f, r = u.pageY - _ + l, m.translate(
          {
            x: e,
            y: r
          }
        ), !1;
      }, h.onmouseup = function(u) {
        var g = h.getBoundingClientRect();
        f = e, l = r, document.onmousemove = null, h.onmouseup = null, g.width < d.offsetWidth && g.height < d.offsetHeight && (m.translate({ x: 0, y: 0 }), f = 0, l = 0);
      }, window.onmouseup = function() {
        var u = h.getBoundingClientRect();
        f = e, l = r, document.onmousemove = null, h.onmouseup = null, window.onmouseup = null, u.width < d.offsetWidth && u.height < d.offsetHeight && (m.translate({ x: 0, y: 0 }), f = 0, l = 0);
      }, !1;
    };
  }
}
function onbottom(s) {
  window.addEventListener("scroll", function() {
    n() - (o() + t()) == 0 && typeof s == "function" && s();
  });
  function o() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
  }
  function t() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }
  function n() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  }
}
function overlay() {
  var s = [], o, t = [], n, a, p, y, h;
  t = document.querySelectorAll(".overlay"), t = Array.from(t);
  for (var d = 0; d < t.length; ++d)
    if (o = t[d], s = [], s = document.querySelectorAll(o.getAttribute("data-overlay-toggle")), o !== null && s.length > 0) {
      for (var m = 0; m < s.length; m++)
        s[m].onclick = w, s[m].index = d;
      o.classList.add("overlay"), o.onclick = v, p = o.querySelectorAll(o.getAttribute("data-overlay-close"));
      for (var b = 0; b < p.length; b++)
        (function(l, c) {
          l != null && (l.onclick = function(u) {
            c.click(), u.stopPropagation();
          });
        })(p[b], o);
      t[d] = o;
    }
  function w(l) {
    for (var c = document.querySelectorAll(".overlay_active"), u = 0; u < c.length; u++) c[u].click();
    document.body.classList.add("overlay__noscroll"), y = t[this.index].getAttribute("data-overlay-temporary"), h = t[this.index].getAttribute("data-overlay-temporary-duration"), t[this.index].classList.add(y), setTimeout(() => {
      t[this.index].classList.remove(y);
    }, h), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && _(t[this.index]), f() > r() && (document.body.style.paddingRight = e() + "px"), n = t[this.index].getAttribute("data-overlay-custom-x"), n != null && (t[this.index].style.left = n + "px"), a = t[this.index].getAttribute("data-overlay-custom-y"), a != null && (t[this.index].style.top = a + "px"), t[this.index].classList.add("overlay_active");
  }
  function v(l) {
    l.target === this && (document.body.classList.remove("overlay__noscroll"), document.querySelector("html").classList.remove("overlay__noscroll"), document.body.style.paddingRight = 0, this.classList.remove("overlay_active"));
  }
  function _(l) {
    var c = null, u = null, g = null;
    l.addEventListener("touchstart", x, !1), l.addEventListener("touchmove", H, !1), l.addEventListener("gesturestart", L, !1);
    function x(E) {
      E.targetTouches.length === 1 && (c = E.targetTouches[0].clientY);
    }
    function H(E) {
      if (E.targetTouches.length === 1) {
        u = E.targetTouches[0].clientY, g = u - c < 0 ? "down" : "up", l.scrollTop === 0 && g === "up" && E.preventDefault();
        var k = l.scrollHeight - l.scrollTop === l.clientHeight;
        k && g === "down" && E.preventDefault();
      }
    }
    function L(E) {
      return E.preventDefault();
    }
  }
  function e() {
    var l = document.createElement("p");
    l.style.width = "100%", l.style.height = "200px";
    var c = document.createElement("div");
    c.style.position = "absolute", c.style.top = "0px", c.style.left = "0px", c.style.visibility = "hidden", c.style.width = "200px", c.style.height = "150px", c.style.overflow = "hidden", c.appendChild(l), document.body.appendChild(c);
    var u = l.offsetWidth;
    c.style.overflow = "scroll";
    var g = l.offsetWidth;
    return u == g && (g = c.clientWidth), document.body.removeChild(c), u - g;
  }
  function r() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }
  function f() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  }
}
class Tabs extends Elements {
  constructor(o) {
    if (super(o), this.element != null) {
      let t = this.elements.tab, n = this.elements.content;
      for (let a = 0; a < t.length; a++)
        t[a].onclick = () => {
          t.map((y) => {
            y.classList.remove("tabs__tab_active");
            let h = y.querySelector(".text");
            h.classList.remove("text_primary"), h.classList.add("text_secondary");
          }), n.map((y) => y.classList.remove("tabs__content_active")), t[a].classList.add("tabs__tab_active");
          let p = t[a].querySelector(".text");
          p.classList.remove("text_secondary"), p.classList.add("text_primary"), n[a].classList.add("tabs__content_active");
        };
      t[0].click();
    }
  }
}
function up(s) {
  var o, t = !1, n;
  o = document.createElement("div"), o.className = "up", typeof s > "u" && (s = "left"), o.classList.add("up_" + s), window.addEventListener("scroll", a, !1), o.onclick = p, document.body.appendChild(o);
  function a(h) {
    document.body.scrollTop > 70 || document.documentElement.scrollTop > 70 ? (t || o.classList.add("up_active"), t = !0) : (o.onmouseout = y, new RegExp("(\\s|^)up_back(\\s|$)").test(o.className) || (o.classList.remove("up_active"), t = !1));
  }
  function p(h) {
    document.body.scrollTop != 0 || document.documentElement.scrollTop != 0 ? (n = document.documentElement.scrollTop || document.body.scrollTop, document.body.scrollTop = 0, document.documentElement.scrollTop = 0, o.classList.add("up_back")) : (document.documentElement.scrollTop = n, document.body.scrollTop = n, o.classList.remove("up_back"));
  }
  function y() {
    Math.max(document.body.scrollTop, document.documentElement.scrollTop) === 0 && (o.classList.remove("up_active"), o.classList.remove("up_back"), t = !1);
  }
}
export {
  Alert,
  Elements,
  Tabs,
  dropdown,
  onbottom,
  overlay,
  up,
  viewer
};
