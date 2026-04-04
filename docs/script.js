// better-seo.js docs — theme toggle, syntax highlighting, copy-to-clipboard
;(function () {
  "use strict"

  // --- Theme toggle ---
  function initTheme() {
    var stored = localStorage.getItem("bs-theme")
    if (stored) {
      document.documentElement.setAttribute("data-theme", stored)
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      document.documentElement.setAttribute("data-theme", "light")
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme")
    var next = current === "light" ? "dark" : "light"
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem("bs-theme", next)
    var btn = document.querySelector(".theme-toggle")
    if (btn) btn.innerHTML = next === "light" ? "&#9788;" : "&#9790;"
  }

  // --- Mobile sidebar ---
  function initSidebar() {
    var toggle = document.getElementById("menu-toggle")
    var sidebar = document.getElementById("sidebar")
    var overlay = document.getElementById("sidebar-overlay")
    if (!toggle || !sidebar) return

    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open")
      if (overlay) overlay.classList.toggle("visible")
    })

    if (overlay) {
      overlay.addEventListener("click", function () {
        sidebar.classList.remove("open")
        overlay.classList.remove("visible")
      })
    }

    document.querySelectorAll(".sidebar-link").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < 768) {
          sidebar.classList.remove("open")
          if (overlay) overlay.classList.remove("visible")
        }
      })
    })
  }

  // --- Active link ---
  function initActiveLink() {
    var path = window.location.pathname.replace(/\/+$/, "")
    document.querySelectorAll(".sidebar-link").forEach(function (link) {
      var href = (link.getAttribute("href") || "").replace(/\/+$/, "")
      if (
        href &&
        (path === href || (href.endsWith("/index.html") && path === href.replace("index.html", "")))
      ) {
        link.classList.add("active")
      }
    })
  }

  // --- Syntax highlighting (lightweight) ---
  function highlightCode() {
    var keywords =
      /\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|interface|type|async|await|new|this|typeof|instanceof|void|delete|in|of|yield|switch|case|break|continue|do|try|catch|finally|throw|extends|implements|declare|namespace|module|enum|readonly|abstract|override|satisfies|as|keyof|infer|is)\b/g
    var builtins =
      /\b(console|document|window|process|require|module|exports|Promise|Array|Object|String|Number|Boolean|Map|Set|JSON|Math|Error|RegExp|Date|Symbol|Proxy|Reflect|URL|fetch|setTimeout|setInterval|clearTimeout|clearInterval)\b/g
    var booleans = /\b(true|false|null|undefined|NaN|Infinity)\b/g

    document.querySelectorAll("pre code").forEach(function (block) {
      if (block.dataset.highlighted) return
      block.dataset.highlighted = "true"

      var html = block.innerHTML

      // Strings (preserve first to avoid conflicts)
      html = html.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="token-string">$&</span>')
      // Comments
      html = html.replace(/(\/\/[^\n]*)/g, '<span class="token-comment">$&</span>')
      html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$&</span>')
      // Keywords
      html = html.replace(keywords, '<span class="token-keyword">$&</span>')
      // Booleans/null
      html = html.replace(booleans, '<span class="token-boolean">$&</span>')
      // Numbers
      html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$&</span>')
      // Builtins
      html = html.replace(builtins, '<span class="token-builtin">$&</span>')
      // Functions (word followed by paren)
      html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="token-function">$1</span>')

      block.innerHTML = html
    })
  }

  // --- Copy to clipboard ---
  function initCopyButtons() {
    document.querySelectorAll("pre").forEach(function (pre) {
      if (pre.querySelector(".copy-btn")) return
      var wrapper = pre.parentElement
      if (!wrapper.classList.contains("code-block-wrapper")) {
        var wrap = document.createElement("div")
        wrap.className = "code-block-wrapper"
        pre.parentNode.insertBefore(wrap, pre)
        wrap.appendChild(pre)
        wrapper = wrap
      }
      var btn = document.createElement("button")
      btn.className = "copy-btn"
      btn.textContent = "Copy"
      btn.addEventListener("click", function () {
        var code = pre.querySelector("code") || pre
        var text = code.textContent || code.innerText
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Copied!"
          btn.classList.add("copied")
          setTimeout(function () {
            btn.textContent = "Copy"
            btn.classList.remove("copied")
          }, 2000)
        })
      })
      wrapper.appendChild(btn)
    })
  }

  // --- Init ---
  document.addEventListener("DOMContentLoaded", function () {
    initTheme()
    initSidebar()
    initActiveLink()
    highlightCode()
    initCopyButtons()

    // Theme button
    var themeBtn = document.querySelector(".theme-toggle")
    if (themeBtn) {
      themeBtn.addEventListener("click", toggleTheme)
      var isLight = document.documentElement.getAttribute("data-theme") === "light"
      themeBtn.innerHTML = isLight ? "&#9788;" : "&#9790;"
    }
  })
})()
