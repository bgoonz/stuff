(function (e) {
  function t(t) {
    function s(e) {
      if (n.active) {
        h(e);
        t.getPlaceholder().trigger("plotselecting", [a()]);
      }
    }
    function o(t) {
      if (t.which != 1) return;
      document.body.focus();
      if (document.onselectstart !== undefined && r.onselectstart == null) {
        r.onselectstart = document.onselectstart;
        document.onselectstart = function () {
          return false;
        };
      }
      if (document.ondrag !== undefined && r.ondrag == null) {
        r.ondrag = document.ondrag;
        document.ondrag = function () {
          return false;
        };
      }
      c(n.first, t);
      n.active = true;
      i = function (e) {
        u(e);
      };
      e(document).one("mouseup", i);
    }
    function u(e) {
      i = null;
      if (document.onselectstart !== undefined)
        document.onselectstart = r.onselectstart;
      if (document.ondrag !== undefined) document.ondrag = r.ondrag;
      n.active = false;
      h(e);
      if (m()) f();
      else {
        t.getPlaceholder().trigger("plotunselected", []);
        t.getPlaceholder().trigger("plotselecting", [null]);
      }
      return false;
    }
    function a() {
      if (!m()) return null;
      if (!n.show) return null;
      var r = {},
        i = n.first,
        s = n.second;
      e.each(t.getAxes(), function (e, t) {
        if (t.used) {
          var n = t.c2p(i[t.direction]),
            o = t.c2p(s[t.direction]);
          r[e] = { from: Math.min(n, o), to: Math.max(n, o) };
        }
      });
      return r;
    }
    function f() {
      var e = a();
      t.getPlaceholder().trigger("plotselected", [e]);
      if (e.xaxis && e.yaxis)
        t.getPlaceholder().trigger("selected", [
          {
            x1: e.xaxis.from,
            y1: e.yaxis.from,
            x2: e.xaxis.to,
            y2: e.yaxis.to,
          },
        ]);
    }
    function l(e, t, n) {
      return t < e ? e : t > n ? n : t;
    }
    function c(e, r) {
      var i = t.getOptions();
      var s = t.getPlaceholder().offset();
      var o = t.getPlotOffset();
      e.x = l(0, r.pageX - s.left - o.left, t.width());
      e.y = l(0, r.pageY - s.top - o.top, t.height());
      if (i.selection.mode == "y") e.x = e == n.first ? 0 : t.width();
      if (i.selection.mode == "x") e.y = e == n.first ? 0 : t.height();
    }
    function h(e) {
      if (e.pageX == null) return;
      c(n.second, e);
      if (m()) {
        n.show = true;
        t.triggerRedrawOverlay();
      } else p(true);
    }
    function p(e) {
      if (n.show) {
        n.show = false;
        t.triggerRedrawOverlay();
        if (!e) t.getPlaceholder().trigger("plotunselected", []);
      }
    }
    function d(e, n) {
      var r,
        i,
        s,
        o,
        u = t.getAxes();
      for (var a in u) {
        r = u[a];
        if (r.direction == n) {
          o = n + r.n + "axis";
          if (!e[o] && r.n == 1) o = n + "axis";
          if (e[o]) {
            i = e[o].from;
            s = e[o].to;
            break;
          }
        }
      }
      if (!e[o]) {
        r = n == "x" ? t.getXAxes()[0] : t.getYAxes()[0];
        i = e[n + "1"];
        s = e[n + "2"];
      }
      if (i != null && s != null && i > s) {
        var f = i;
        i = s;
        s = f;
      }
      return { from: i, to: s, axis: r };
    }
    function v(e, r) {
      var i,
        s,
        o = t.getOptions();
      if (o.selection.mode == "y") {
        n.first.x = 0;
        n.second.x = t.width();
      } else {
        s = d(e, "x");
        n.first.x = s.axis.p2c(s.from);
        n.second.x = s.axis.p2c(s.to);
      }
      if (o.selection.mode == "x") {
        n.first.y = 0;
        n.second.y = t.height();
      } else {
        s = d(e, "y");
        n.first.y = s.axis.p2c(s.from);
        n.second.y = s.axis.p2c(s.to);
      }
      n.show = true;
      t.triggerRedrawOverlay();
      if (!r && m()) f();
    }
    function m() {
      var e = t.getOptions().selection.minSize;
      return (
        Math.abs(n.second.x - n.first.x) >= e &&
        Math.abs(n.second.y - n.first.y) >= e
      );
    }
    var n = {
      first: { x: -1, y: -1 },
      second: { x: -1, y: -1 },
      show: false,
      active: false,
    };
    var r = {};
    var i = null;
    t.clearSelection = p;
    t.setSelection = v;
    t.getSelection = a;
    t.hooks.bindEvents.push(function (e, t) {
      var n = e.getOptions();
      if (n.selection.mode != null) {
        t.mousemove(s);
        t.mousedown(o);
      }
    });
    t.hooks.drawOverlay.push(function (t, r) {
      if (n.show && m()) {
        var i = t.getPlotOffset();
        var s = t.getOptions();
        r.save();
        r.translate(i.left, i.top);
        var o = e.color.parse(s.selection.color);
        r.strokeStyle = o.scale("a", 0.8).toString();
        r.lineWidth = 1;
        r.lineJoin = s.selection.shape;
        r.fillStyle = o.scale("a", 0.4).toString();
        var u = Math.min(n.first.x, n.second.x) + 0.5,
          a = Math.min(n.first.y, n.second.y) + 0.5,
          f = Math.abs(n.second.x - n.first.x) - 1,
          l = Math.abs(n.second.y - n.first.y) - 1;
        r.fillRect(u, a, f, l);
        r.strokeRect(u, a, f, l);
        r.restore();
      }
    });
    t.hooks.shutdown.push(function (t, n) {
      n.unbind("mousemove", s);
      n.unbind("mousedown", o);
      if (i) e(document).unbind("mouseup", i);
    });
  }
  e.plot.plugins.push({
    init: t,
    options: {
      selection: { mode: null, color: "#e8cfac", shape: "round", minSize: 5 },
    },
    name: "selection",
    version: "1.1",
  });
})(jQuery);
