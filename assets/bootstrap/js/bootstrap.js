/* ========================================================================
 * Bootstrap: alert.js v3.1.1
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.1.1
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.1.1
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    if ($next.hasClass('active')) return this.sliding = false

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid.bs.carousel', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid.bs.carousel') }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid.bs.carousel')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.1.1
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).focus()
  }

  function clearMenus(e) {
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.1.1
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal', '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.1.1
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return
      var that = this;

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.hoverState = null

      var complete = function() {
        that.$element.trigger('shown.bs.' + that.type)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one($.support.transition.end, complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth,
      height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.1.1
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content')[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow')
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.1.1
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.1.1
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    this.$window = $(window)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.RESET = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$window.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$window.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (this.affixed == 'top') position.top += scrollTop

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin) this.$element.css('top', '')

    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({ top: scrollHeight - offsetBottom - this.$element.height() })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      $spy.affix(data)
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.1.1
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.1.1
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var href
    var process  = $.proxy(this.process, this)

    this.$element       = $(element).is('body') ? $(window) : $(element)
    this.$body          = $('body')
    this.$scrollElement = this.$element.on('scroll.bs.scroll-spy.data-api', process)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.offsets        = $([])
    this.targets        = $([])
    this.activeTarget   = null

    this.refresh()
    this.process()
  }

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = this.$element[0] == window ? 'offset' : 'position'

    this.offsets = $([])
    this.targets = $([])

    var self     = this
    var $targets = this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
    var maxScroll    = scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets.last()[0]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate( targets[i] )
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.1.1
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd',
      'MozTransition'    : 'transitionend',
      'OTransition'      : 'oTransitionEnd otransitionend',
      'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(jQuery);
/*
  
 * @project:	jGravity
 * @version:	0.8 - 29/04/2012
 * @author:		Craig Thomas - www.tinybigideas.com
 * @project:	http://tinybigideas.com/plugins/jquery-gravity/
 * @license:	jGravity is licensed under a Open Source Initiative OSI MIT License: http://opensource.org/licenses/mit-license.php
 * @changlog:	http://tinybigideas.com/plugins/jquery-gravity/
 
 */
 
(function(a){a.fn.extend({jGravity:function(b){var c={target:"div, span, img, ol, ul, li, a, blockquote, button, input, embed, h1, h2, h3, h4, h5, h6, label, object, option, p, pre, span, table",ignoreClass:"",weight:20,depth:1,drag:true};var b=a.extend(c,b);return this.each(function(){function b_(){var a=false;if(by[0]!=window.screenX){bx[0]=(window.screenX-by[0])*50;by[0]=window.screenX;a=true}if(by[1]!=window.screenY){bx[1]=(window.screenY-by[1])*50;by[1]=window.screenY;a=true}if(by[2]!=window.innerWidth){by[2]=window.innerWidth;a=true}if(by[3]!=window.innerHeight){by[3]=window.innerHeight;a=true}return a}function b$(a){var b=curtop=0;if(a.offsetParent){do{b+=a.offsetLeft;curtop+=a.offsetTop}while(a=a.offsetParent)}return[b,curtop]}function bZ(){if(bF){bv.DestroyBody(bD[0]);bv.DestroyBody(bD[1]);bv.DestroyBody(bD[2]);bv.DestroyBody(bD[3]);bD[0]=null;bD[1]=null;bD[2]=null;bD[3]=null}bD[0]=bW(bv,by[2]/2,-bE,by[2],bE);bD[1]=bW(bv,by[2]/2,by[3]+bE,by[2],bE);bD[2]=bW(bv,-bE,by[3]/2,bE,by[3]);bD[3]=bW(bv,by[2]+bE,by[3]/2,bE,by[3]);bF=true}function bY(){var a=new h;a.Set(bG,bH);var b=new l;b.minVertex.Set(bG-1,bH-1);b.maxVertex.Set(bG+1,bH+1);var c=10;var d=new Array;var e=bv.Query(b,d,c);var f=null;for(var g=0;g<e;++g){if(d[g].m_body.IsStatic()==false){if(d[g].TestPoint(a)){f=d[g].m_body;break}}}return f}function bX(){if(c.drag==true){if(bA&&!bw){var a=bY();if(a){var b=new bm;b.body1=bv.m_groundBody;b.body2=a;b.target.Set(bG,bH);b.maxForce=3e4*a.m_mass;b.timeStep=bC;bw=bv.CreateJoint(b);a.WakeUp()}}if(!bA){if(bw){bv.DestroyJoint(bw);bw=null}}if(bw){var d=new h(bG,bH);bw.SetTarget(d)}}}function bW(a,b,c,d,e,f,g){if(typeof f=="undefined")f=true;var h=new F;if(!f)h.density=1;h.extents.Set(d,e);var i=new M;i.AddShape(h);i.position.Set(b,c);i.userData={element:g};return a.CreateBody(i)}function bV(){if(b_())bZ();bx[0]+=(0-bx[0])*.5;bx[1]+=(0-bx[1])*.5;bv.m_gravity.x=bN.x*350+bx[0];bv.m_gravity.y=bN.y*350+bx[1];bX();bv.Step(bC,bB);for(i=0;i<bK.length;i++){var a=bL[i];var b=bK[i];b.style.left=a.m_position0.x-(bM[i][2]>>1)+"px";b.style.top=a.m_position0.y-(bM[i][3]>>1)+"px";var c="rotate("+a.m_rotation0*57.2957795+"deg)";b.style.WebkitTransform=c;b.style.MozTransform=c;b.style.OTransform=c}}function bU(){return false}function bT(){bI[0]=window.event.clientX;bI[1]=window.event.clientY;return false}function bS(){if(!bz)bP();bG=window.event.clientX;bH=window.event.clientY}function bR(){bA=false;return false}function bQ(){bA=true;return false}function bP(){bz=true;setInterval(bV,c.weight)}function bO(){bt=document.getElementById("canvas");document.onmousedown=bQ;document.onmouseup=bR;document.onmousemove=bS;bu=new l;bu.minVertex.Set(-200,-200);bu.maxVertex.Set(screen.width+200,screen.height+200);bv=new bb(bu,new h(0,0),true);bZ();bK=a(".box2d");for(i=0;i<bK.length;i++){var b=bK[i];bM[i]=b$(b);bM[i][2]=b.offsetWidth;bM[i][3]=b.offsetHeight}for(i=0;i<bK.length;i++){var b=bK[i];b.style.position="absolute";b.style.left=bM[i][0]+"px";b.style.top=bM[i][1]+"px";b.onmousedown=bT;b.onmouseup=bU;bL[i]=bW(bv,bM[i][0]+(bM[i][2]>>1),bM[i][1]+(bM[i][3]>>1),bM[i][2]/2,bM[i][3]/2,false)}}function e(a){if(!a)return[];if(a.toArray)return a.toArray();var b=a.length||0,c=new Array(b);while(b--)c[b]=a[b];return c}var c=b;if(c.target=="everything"){c.target="body *"}if(c.weight=="light"){c.weight=50}else if(c.weight=="heavy"){c.weight=1}a(c.target).each(function(){if(a(this).children().length<c.depth&&!a(this).hasClass(c.ignoreClass)){a(this).addClass("box2d");a(this).css("zIndex","999")}});var f={create:function(){function a(){this.initialize.apply(this,arguments)}var b=null,c=e(arguments);if(Object.isFunction(c[0]))b=c.shift();Object.extend(a,f.Methods);a.superclass=b;a.subclasses=[];if(b){var d=function(){};d.prototype=b.prototype;a.prototype=new d;b.subclasses.push(a)}for(var g=0;g<c.length;g++)a.addMethods(c[g]);if(!a.prototype.initialize)a.prototype.initialize=this.emptyFunction;a.prototype.constructor=a;return a},emptyFunction:function(){}};f.Methods={addMethods:function(a){var b=this.superclass&&this.superclass.prototype;var c=Object.keys(a);if(!Object.keys({toString:true}).length)c.push("toString","valueOf");for(var d=0,e=c.length;d<e;d++){var f=c[d],g=a[f];if(b&&Object.isFunction(g)&&g.argumentNames().first()=="$super"){var h=g,g=Object.extend(function(a){return function(){return b[a].apply(this,arguments)}}(f).wrap(h),{valueOf:function(){return h},toString:function(){return h.toString()}})}this.prototype[f]=g}return this}};Object.extend=function(a,b){for(var c in b)a[c]=b[c];return a};Object.extend(Object,{inspect:function(a){try{if(Object.isUndefined(a))return"undefined";if(a===null)return"null";return a.inspect?a.inspect():String(a)}catch(b){if(b instanceof RangeError)return"...";throw b}},toJSON:function(a){var b=typeof a;switch(b){case"undefined":case"function":case"unknown":return;case"boolean":return a.toString()}if(a===null)return"null";if(a.toJSON)return a.toJSON();if(Object.isElement(a))return;var c=[];for(var d in a){var e=Object.toJSON(a[d]);if(!Object.isUndefined(e))c.push(d.toJSON()+": "+e)}return"{"+c.join(", ")+"}"},toQueryString:function(a){return $H(a).toQueryString()},toHTML:function(a){return a&&a.toHTML?a.toHTML():String.interpret(a)},keys:function(a){var b=[];for(var c in a)b.push(c);return b},values:function(a){var b=[];for(var c in a)b.push(a[c]);return b},clone:function(a){return Object.extend({},a)},isElement:function(a){return a&&a.nodeType==1},isArray:function(a){return a!=null&&typeof a=="object"&&"splice"in a&&"join"in a},isHash:function(a){return a instanceof Hash},isFunction:function(a){return typeof a=="function"},isString:function(a){return typeof a=="string"},isNumber:function(a){return typeof a=="number"},isUndefined:function(a){return typeof a=="undefined"}});if(WebKit=navigator.userAgent.indexOf("AppleWebKit/")>-1){e=function(a){if(!a)return[];if(!(Object.isFunction(a)&&a=="[object NodeList]")&&a.toArray)return a.toArray();var b=a.length||0,c=new Array(b);while(b--)c[b]=a[b];return c}}var g=f.create();g.prototype={initialize:function(){}};g.USHRT_MAX=65535;g.b2_pi=Math.PI;g.b2_massUnitsPerKilogram=1;g.b2_timeUnitsPerSecond=1;g.b2_lengthUnitsPerMeter=30;g.b2_maxManifoldPoints=2;g.b2_maxShapesPerBody=64;g.b2_maxPolyVertices=8;g.b2_maxProxies=1024;g.b2_maxPairs=8*g.b2_maxProxies;g.b2_linearSlop=.005*g.b2_lengthUnitsPerMeter;g.b2_angularSlop=2/180*g.b2_pi;g.b2_velocityThreshold=1*g.b2_lengthUnitsPerMeter/g.b2_timeUnitsPerSecond;g.b2_maxLinearCorrection=.2*g.b2_lengthUnitsPerMeter;g.b2_maxAngularCorrection=8/180*g.b2_pi;g.b2_contactBaumgarte=.2;g.b2_timeToSleep=.5*g.b2_timeUnitsPerSecond;g.b2_linearSleepTolerance=.01*g.b2_lengthUnitsPerMeter/g.b2_timeUnitsPerSecond;g.b2_angularSleepTolerance=2/180/g.b2_timeUnitsPerSecond;g.b2Assert=function(a){if(!a){var b;b.x++}};var h=f.create();h.prototype={initialize:function(a,b){this.x=a;this.y=b},SetZero:function(){this.x=0;this.y=0},Set:function(a,b){this.x=a;this.y=b},SetV:function(a){this.x=a.x;this.y=a.y},Negative:function(){return new h(-this.x,-this.y)},Copy:function(){return new h(this.x,this.y)},Add:function(a){this.x+=a.x;this.y+=a.y},Subtract:function(a){this.x-=a.x;this.y-=a.y},Multiply:function(a){this.x*=a;this.y*=a},MulM:function(a){var b=this.x;this.x=a.col1.x*b+a.col2.x*this.y;this.y=a.col1.y*b+a.col2.y*this.y},MulTM:function(a){var b=k.b2Dot(this,a.col1);this.y=k.b2Dot(this,a.col2);this.x=b},CrossVF:function(a){var b=this.x;this.x=a*this.y;this.y=-a*b},CrossFV:function(a){var b=this.x;this.x=-a*this.y;this.y=a*b},MinV:function(a){this.x=this.x<a.x?this.x:a.x;this.y=this.y<a.y?this.y:a.y},MaxV:function(a){this.x=this.x>a.x?this.x:a.x;this.y=this.y>a.y?this.y:a.y},Abs:function(){this.x=Math.abs(this.x);this.y=Math.abs(this.y)},Length:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},Normalize:function(){var a=this.Length();if(a<Number.MIN_VALUE){return 0}var b=1/a;this.x*=b;this.y*=b;return a},IsValid:function(){return k.b2IsValid(this.x)&&k.b2IsValid(this.y)},x:null,y:null};h.Make=function(a,b){return new h(a,b)};var j=f.create();j.prototype={initialize:function(a,b,c){if(a==null)a=0;this.col1=new h;this.col2=new h;if(b!=null&&c!=null){this.col1.SetV(b);this.col2.SetV(c)}else{var d=Math.cos(a);var e=Math.sin(a);this.col1.x=d;this.col2.x=-e;this.col1.y=e;this.col2.y=d}},Set:function(a){var b=Math.cos(a);var c=Math.sin(a);this.col1.x=b;this.col2.x=-c;this.col1.y=c;this.col2.y=b},SetVV:function(a,b){this.col1.SetV(a);this.col2.SetV(b)},Copy:function(){return new j(0,this.col1,this.col2)},SetM:function(a){this.col1.SetV(a.col1);this.col2.SetV(a.col2)},AddM:function(a){this.col1.x+=a.col1.x;this.col1.y+=a.col1.y;this.col2.x+=a.col2.x;this.col2.y+=a.col2.y},SetIdentity:function(){this.col1.x=1;this.col2.x=0;this.col1.y=0;this.col2.y=1},SetZero:function(){this.col1.x=0;this.col2.x=0;this.col1.y=0;this.col2.y=0},Invert:function(a){var b=this.col1.x;var c=this.col2.x;var d=this.col1.y;var e=this.col2.y;var f=b*e-c*d;f=1/f;a.col1.x=f*e;a.col2.x=-f*c;a.col1.y=-f*d;a.col2.y=f*b;return a},Solve:function(a,b,c){var d=this.col1.x;var e=this.col2.x;var f=this.col1.y;var g=this.col2.y;var h=d*g-e*f;h=1/h;a.x=h*(g*b-e*c);a.y=h*(d*c-f*b);return a},Abs:function(){this.col1.Abs();this.col2.Abs()},col1:new h,col2:new h};var k=f.create();k.prototype={initialize:function(){}};k.b2IsValid=function(a){return isFinite(a)};k.b2Dot=function(a,b){return a.x*b.x+a.y*b.y};k.b2CrossVV=function(a,b){return a.x*b.y-a.y*b.x};k.b2CrossVF=function(a,b){var c=new h(b*a.y,-b*a.x);return c};k.b2CrossFV=function(a,b){var c=new h(-a*b.y,a*b.x);return c};k.b2MulMV=function(a,b){var c=new h(a.col1.x*b.x+a.col2.x*b.y,a.col1.y*b.x+a.col2.y*b.y);return c};k.b2MulTMV=function(a,b){var c=new h(k.b2Dot(b,a.col1),k.b2Dot(b,a.col2));return c};k.AddVV=function(a,b){var c=new h(a.x+b.x,a.y+b.y);return c};k.SubtractVV=function(a,b){var c=new h(a.x-b.x,a.y-b.y);return c};k.MulFV=function(a,b){var c=new h(a*b.x,a*b.y);return c};k.AddMM=function(a,b){var c=new j(0,k.AddVV(a.col1,b.col1),k.AddVV(a.col2,b.col2));return c};k.b2MulMM=function(a,b){var c=new j(0,k.b2MulMV(a,b.col1),k.b2MulMV(a,b.col2));return c};k.b2MulTMM=function(a,b){var c=new h(k.b2Dot(a.col1,b.col1),k.b2Dot(a.col2,b.col1));var d=new h(k.b2Dot(a.col1,b.col2),k.b2Dot(a.col2,b.col2));var e=new j(0,c,d);return e};k.b2Abs=function(a){return a>0?a:-a};k.b2AbsV=function(a){var b=new h(k.b2Abs(a.x),k.b2Abs(a.y));return b};k.b2AbsM=function(a){var b=new j(0,k.b2AbsV(a.col1),k.b2AbsV(a.col2));return b};k.b2Min=function(a,b){return a<b?a:b};k.b2MinV=function(a,b){var c=new h(k.b2Min(a.x,b.x),k.b2Min(a.y,b.y));return c};k.b2Max=function(a,b){return a>b?a:b};k.b2MaxV=function(a,b){var c=new h(k.b2Max(a.x,b.x),k.b2Max(a.y,b.y));return c};k.b2Clamp=function(a,b,c){return k.b2Max(b,k.b2Min(a,c))};k.b2ClampV=function(a,b,c){return k.b2MaxV(b,k.b2MinV(a,c))};k.b2Swap=function(a,b){var c=a[0];a[0]=b[0];b[0]=c};k.b2Random=function(){return Math.random()*2-1};k.b2NextPowerOfTwo=function(a){a|=a>>1&2147483647;a|=a>>2&1073741823;a|=a>>4&268435455;a|=a>>8&16777215;a|=a>>16&65535;return a+1};k.b2IsPowerOfTwo=function(a){var b=a>0&&(a&a-1)==0;return b};k.tempVec2=new h;k.tempVec3=new h;k.tempVec4=new h;k.tempVec5=new h;k.tempMat=new j;var l=f.create();l.prototype={IsValid:function(){var a=this.maxVertex.x;var b=this.maxVertex.y;a=this.maxVertex.x;b=this.maxVertex.y;a-=this.minVertex.x;b-=this.minVertex.y;var c=a>=0&&b>=0;c=c&&this.minVertex.IsValid()&&this.maxVertex.IsValid();return c},minVertex:new h,maxVertex:new h,initialize:function(){this.minVertex=new h;this.maxVertex=new h}};var m=f.create();m.prototype={IsLower:function(){return(this.value&1)==0},IsUpper:function(){return(this.value&1)==1},Swap:function(a){var b=this.value;var c=this.proxyId;var d=this.stabbingCount;this.value=a.value;this.proxyId=a.proxyId;this.stabbingCount=a.stabbingCount;a.value=b;a.proxyId=c;a.stabbingCount=d},value:0,proxyId:0,stabbingCount:0,initialize:function(){}};var n=f.create();n.prototype={lowerValues:[0,0],upperValues:[0,0],initialize:function(){this.lowerValues=[0,0];this.upperValues=[0,0]}};var o=f.create();o.prototype={SetBuffered:function(){this.status|=o.e_pairBuffered},ClearBuffered:function(){this.status&=~o.e_pairBuffered},IsBuffered:function(){return(this.status&o.e_pairBuffered)==o.e_pairBuffered},SetRemoved:function(){this.status|=o.e_pairRemoved},ClearRemoved:function(){this.status&=~o.e_pairRemoved},IsRemoved:function(){return(this.status&o.e_pairRemoved)==o.e_pairRemoved},SetFinal:function(){this.status|=o.e_pairFinal},IsFinal:function(){return(this.status&o.e_pairFinal)==o.e_pairFinal},userData:null,proxyId1:0,proxyId2:0,next:0,status:0,initialize:function(){}};o.b2_nullPair=g.USHRT_MAX;o.b2_nullProxy=g.USHRT_MAX;o.b2_tableCapacity=g.b2_maxPairs;o.b2_tableMask=o.b2_tableCapacity-1;o.e_pairBuffered=1;o.e_pairRemoved=2;o.e_pairFinal=4;var p=f.create();p.prototype={PairAdded:function(a,b){return null},PairRemoved:function(a,b,c){},initialize:function(){}};var q=f.create();q.prototype={proxyId1:0,proxyId2:0,initialize:function(){}};var r=f.create();r.prototype={initialize:function(){var a=0;this.m_hashTable=new Array(o.b2_tableCapacity);for(a=0;a<o.b2_tableCapacity;++a){this.m_hashTable[a]=o.b2_nullPair}this.m_pairs=new Array(g.b2_maxPairs);for(a=0;a<g.b2_maxPairs;++a){this.m_pairs[a]=new o}this.m_pairBuffer=new Array(g.b2_maxPairs);for(a=0;a<g.b2_maxPairs;++a){this.m_pairBuffer[a]=new q}for(a=0;a<g.b2_maxPairs;++a){this.m_pairs[a].proxyId1=o.b2_nullProxy;this.m_pairs[a].proxyId2=o.b2_nullProxy;this.m_pairs[a].userData=null;this.m_pairs[a].status=0;this.m_pairs[a].next=a+1}this.m_pairs[g.b2_maxPairs-1].next=o.b2_nullPair;this.m_pairCount=0},Initialize:function(a,b){this.m_broadPhase=a;this.m_callback=b},AddBufferedPair:function(a,b){var c=this.AddPair(a,b);if(c.IsBuffered()==false){c.SetBuffered();this.m_pairBuffer[this.m_pairBufferCount].proxyId1=c.proxyId1;this.m_pairBuffer[this.m_pairBufferCount].proxyId2=c.proxyId2;++this.m_pairBufferCount}c.ClearRemoved();if(s.s_validate){this.ValidateBuffer()}},RemoveBufferedPair:function(a,b){var c=this.Find(a,b);if(c==null){return}if(c.IsBuffered()==false){c.SetBuffered();this.m_pairBuffer[this.m_pairBufferCount].proxyId1=c.proxyId1;this.m_pairBuffer[this.m_pairBufferCount].proxyId2=c.proxyId2;++this.m_pairBufferCount}c.SetRemoved();if(s.s_validate){this.ValidateBuffer()}},Commit:function(){var a=0;var b=0;var c=this.m_broadPhase.m_proxyPool;for(a=0;a<this.m_pairBufferCount;++a){var d=this.Find(this.m_pairBuffer[a].proxyId1,this.m_pairBuffer[a].proxyId2);d.ClearBuffered();var e=c[d.proxyId1];var f=c[d.proxyId2];if(d.IsRemoved()){if(d.IsFinal()==true){this.m_callback.PairRemoved(e.userData,f.userData,d.userData)}this.m_pairBuffer[b].proxyId1=d.proxyId1;this.m_pairBuffer[b].proxyId2=d.proxyId2;++b}else{if(d.IsFinal()==false){d.userData=this.m_callback.PairAdded(e.userData,f.userData);d.SetFinal()}}}for(a=0;a<b;++a){this.RemovePair(this.m_pairBuffer[a].proxyId1,this.m_pairBuffer[a].proxyId2)}this.m_pairBufferCount=0;if(s.s_validate){this.ValidateTable()}},AddPair:function(a,b){if(a>b){var c=a;a=b;b=c}var d=r.Hash(a,b)&o.b2_tableMask;var e=e=this.FindHash(a,b,d);if(e!=null){return e}var f=this.m_freePair;e=this.m_pairs[f];this.m_freePair=e.next;e.proxyId1=a;e.proxyId2=b;e.status=0;e.userData=null;e.next=this.m_hashTable[d];this.m_hashTable[d]=f;++this.m_pairCount;return e},RemovePair:function(a,b){if(a>b){var c=a;a=b;b=c}var d=r.Hash(a,b)&o.b2_tableMask;var e=this.m_hashTable[d];var f=null;while(e!=o.b2_nullPair){if(r.Equals(this.m_pairs[e],a,b)){var g=e;if(f){f.next=this.m_pairs[e].next}else{this.m_hashTable[d]=this.m_pairs[e].next}var h=this.m_pairs[g];var i=h.userData;h.next=this.m_freePair;h.proxyId1=o.b2_nullProxy;h.proxyId2=o.b2_nullProxy;h.userData=null;h.status=0;this.m_freePair=g;--this.m_pairCount;return i}else{f=this.m_pairs[e];e=f.next}}return null},Find:function(a,b){if(a>b){var c=a;a=b;b=c}var d=r.Hash(a,b)&o.b2_tableMask;return this.FindHash(a,b,d)},FindHash:function(a,b,c){var d=this.m_hashTable[c];while(d!=o.b2_nullPair&&r.Equals(this.m_pairs[d],a,b)==false){d=this.m_pairs[d].next}if(d==o.b2_nullPair){return null}return this.m_pairs[d]},ValidateBuffer:function(){},ValidateTable:function(){},m_broadPhase:null,m_callback:null,m_pairs:null,m_freePair:0,m_pairCount:0,m_pairBuffer:null,m_pairBufferCount:0,m_hashTable:null};r.Hash=function(a,b){var c=b<<16&4294901760|a;c=~c+(c<<15&4294934528);c=c^c>>12&1048575;c=c+(c<<2&4294967292);c=c^c>>4&268435455;c=c*2057;c=c^c>>16&65535;return c};r.Equals=function(a,b,c){return a.proxyId1==b&&a.proxyId2==c};r.EqualsPair=function(a,b){return a.proxyId1==b.proxyId1&&a.proxyId2==b.proxyId2};var s=f.create();s.prototype={initialize:function(a,b){this.m_pairManager=new r;this.m_proxyPool=new Array(g.b2_maxPairs);this.m_bounds=new Array(2*g.b2_maxProxies);this.m_queryResults=new Array(g.b2_maxProxies);this.m_quantizationFactor=new h;var c=0;this.m_pairManager.Initialize(this,b);this.m_worldAABB=a;this.m_proxyCount=0;for(c=0;c<g.b2_maxProxies;c++){this.m_queryResults[c]=0}this.m_bounds=new Array(2);for(c=0;c<2;c++){this.m_bounds[c]=new Array(2*g.b2_maxProxies);for(var d=0;d<2*g.b2_maxProxies;d++){this.m_bounds[c][d]=new m}}var e=a.maxVertex.x;var f=a.maxVertex.y;e-=a.minVertex.x;f-=a.minVertex.y;this.m_quantizationFactor.x=g.USHRT_MAX/e;this.m_quantizationFactor.y=g.USHRT_MAX/f;var i;for(c=0;c<g.b2_maxProxies-1;++c){i=new B;this.m_proxyPool[c]=i;i.SetNext(c+1);i.timeStamp=0;i.overlapCount=s.b2_invalid;i.userData=null}i=new B;this.m_proxyPool[g.b2_maxProxies-1]=i;i.SetNext(o.b2_nullProxy);i.timeStamp=0;i.overlapCount=s.b2_invalid;i.userData=null;this.m_freeProxy=0;this.m_timeStamp=1;this.m_queryResultCount=0},InRange:function(a){var b;var c;var d;var e;b=a.minVertex.x;c=a.minVertex.y;b-=this.m_worldAABB.maxVertex.x;c-=this.m_worldAABB.maxVertex.y;d=this.m_worldAABB.minVertex.x;e=this.m_worldAABB.minVertex.y;d-=a.maxVertex.x;e-=a.maxVertex.y;b=k.b2Max(b,d);c=k.b2Max(c,e);return k.b2Max(b,c)<0},GetProxy:function(a){if(a==o.b2_nullProxy||this.m_proxyPool[a].IsValid()==false){return null}return this.m_proxyPool[a]},CreateProxy:function(a,b){var c=0;var d;var e=this.m_freeProxy;d=this.m_proxyPool[e];this.m_freeProxy=d.GetNext();d.overlapCount=0;d.userData=b;var f=2*this.m_proxyCount;var g=new Array;var h=new Array;this.ComputeBounds(g,h,a);for(var i=0;i<2;++i){var j=this.m_bounds[i];var k=0;var l=0;var n=[k];var o=[l];this.Query(n,o,g[i],h[i],j,f,i);k=n[0];l=o[0];var p=new Array;var q=0;var r=f-l;var s;var t;for(q=0;q<r;q++){p[q]=new m;s=p[q];t=j[l+q];s.value=t.value;s.proxyId=t.proxyId;s.stabbingCount=t.stabbingCount}r=p.length;var u=l+2;for(q=0;q<r;q++){t=p[q];s=j[u+q];s.value=t.value;s.proxyId=t.proxyId;s.stabbingCount=t.stabbingCount}p=new Array;r=l-k;for(q=0;q<r;q++){p[q]=new m;s=p[q];t=j[k+q];s.value=t.value;s.proxyId=t.proxyId;s.stabbingCount=t.stabbingCount}r=p.length;u=k+1;for(q=0;q<r;q++){t=p[q];s=j[u+q];s.value=t.value;s.proxyId=t.proxyId;s.stabbingCount=t.stabbingCount}++l;j[k].value=g[i];j[k].proxyId=e;j[l].value=h[i];j[l].proxyId=e;j[k].stabbingCount=k==0?0:j[k-1].stabbingCount;j[l].stabbingCount=j[l-1].stabbingCount;for(c=k;c<l;++c){j[c].stabbingCount++}for(c=k;c<f+2;++c){var v=this.m_proxyPool[j[c].proxyId];if(j[c].IsLower()){v.lowerBounds[i]=c}else{v.upperBounds[i]=c}}}++this.m_proxyCount;for(var w=0;w<this.m_queryResultCount;++w){this.m_pairManager.AddBufferedPair(e,this.m_queryResults[w])}this.m_pairManager.Commit();this.m_queryResultCount=0;this.IncrementTimeStamp();return e},DestroyProxy:function(a){var b=this.m_proxyPool[a];var c=2*this.m_proxyCount;for(var d=0;d<2;++d){var e=this.m_bounds[d];var f=b.lowerBounds[d];var g=b.upperBounds[d];var h=e[f].value;var i=e[g].value;var j=new Array;var k=0;var l=g-f-1;var n;var o;for(k=0;k<l;k++){j[k]=new m;n=j[k];o=e[f+1+k];n.value=o.value;n.proxyId=o.proxyId;n.stabbingCount=o.stabbingCount}l=j.length;var p=f;for(k=0;k<l;k++){o=j[k];n=e[p+k];n.value=o.value;n.proxyId=o.proxyId;n.stabbingCount=o.stabbingCount}j=new Array;l=c-g-1;for(k=0;k<l;k++){j[k]=new m;n=j[k];o=e[g+1+k];n.value=o.value;n.proxyId=o.proxyId;n.stabbingCount=o.stabbingCount}l=j.length;p=g-1;for(k=0;k<l;k++){o=j[k];n=e[p+k];n.value=o.value;n.proxyId=o.proxyId;n.stabbingCount=o.stabbingCount}l=c-2;for(var q=f;q<l;++q){var r=this.m_proxyPool[e[q].proxyId];if(e[q].IsLower()){r.lowerBounds[d]=q}else{r.upperBounds[d]=q}}l=g-1;for(var t=f;t<l;++t){e[t].stabbingCount--}this.Query([0],[0],h,i,e,c-2,d)}for(var u=0;u<this.m_queryResultCount;++u){this.m_pairManager.RemoveBufferedPair(a,this.m_queryResults[u])}this.m_pairManager.Commit();this.m_queryResultCount=0;this.IncrementTimeStamp();b.userData=null;b.overlapCount=s.b2_invalid;b.lowerBounds[0]=s.b2_invalid;b.lowerBounds[1]=s.b2_invalid;b.upperBounds[0]=s.b2_invalid;b.upperBounds[1]=s.b2_invalid;b.SetNext(this.m_freeProxy);this.m_freeProxy=a;--this.m_proxyCount},MoveProxy:function(a,b){var c=0;var d=0;var e;var f;var h;var i=0;var j;if(a==o.b2_nullProxy||g.b2_maxProxies<=a){return}if(b.IsValid()==false){return}var k=2*this.m_proxyCount;var l=this.m_proxyPool[a];var m=new n;this.ComputeBounds(m.lowerValues,m.upperValues,b);var p=new n;for(c=0;c<2;++c){p.lowerValues[c]=this.m_bounds[c][l.lowerBounds[c]].value;p.upperValues[c]=this.m_bounds[c][l.upperBounds[c]].value}for(c=0;c<2;++c){var q=this.m_bounds[c];var r=l.lowerBounds[c];var s=l.upperBounds[c];var t=m.lowerValues[c];var u=m.upperValues[c];var v=t-q[r].value;var w=u-q[s].value;q[r].value=t;q[s].value=u;if(v<0){d=r;while(d>0&&t<q[d-1].value){e=q[d];f=q[d-1];var x=f.proxyId;var y=this.m_proxyPool[f.proxyId];f.stabbingCount++;if(f.IsUpper()==true){if(this.TestOverlap(m,y)){this.m_pairManager.AddBufferedPair(a,x)}y.upperBounds[c]++;e.stabbingCount++}else{y.lowerBounds[c]++;e.stabbingCount--}l.lowerBounds[c]--;e.Swap(f);--d}}if(w>0){d=s;while(d<k-1&&q[d+1].value<=u){e=q[d];h=q[d+1];i=h.proxyId;j=this.m_proxyPool[i];h.stabbingCount++;if(h.IsLower()==true){if(this.TestOverlap(m,j)){this.m_pairManager.AddBufferedPair(a,i)}j.lowerBounds[c]--;e.stabbingCount++}else{j.upperBounds[c]--;e.stabbingCount--}l.upperBounds[c]++;e.Swap(h);d++}}if(v>0){d=r;while(d<k-1&&q[d+1].value<=t){e=q[d];h=q[d+1];i=h.proxyId;j=this.m_proxyPool[i];h.stabbingCount--;if(h.IsUpper()){if(this.TestOverlap(p,j)){this.m_pairManager.RemoveBufferedPair(a,i)}j.upperBounds[c]--;e.stabbingCount--}else{j.lowerBounds[c]--;e.stabbingCount++}l.lowerBounds[c]++;e.Swap(h);d++}}if(w<0){d=s;while(d>0&&u<q[d-1].value){e=q[d];f=q[d-1];x=f.proxyId;y=this.m_proxyPool[x];f.stabbingCount--;if(f.IsLower()==true){if(this.TestOverlap(p,y)){this.m_pairManager.RemoveBufferedPair(a,x)}y.lowerBounds[c]++;e.stabbingCount--}else{y.upperBounds[c]++;e.stabbingCount++}l.upperBounds[c]--;e.Swap(f);d--}}}},Commit:function(){this.m_pairManager.Commit()},QueryAABB:function(a,b,c){var d=new Array;var e=new Array;this.ComputeBounds(d,e,a);var f=0;var g=0;var h=[f];var i=[g];this.Query(h,i,d[0],e[0],this.m_bounds[0],2*this.m_proxyCount,0);this.Query(h,i,d[1],e[1],this.m_bounds[1],2*this.m_proxyCount,1);var j=0;for(var k=0;k<this.m_queryResultCount&&j<c;++k,++j){var l=this.m_proxyPool[this.m_queryResults[k]];b[k]=l.userData}this.m_queryResultCount=0;this.IncrementTimeStamp();return j},Validate:function(){var a;var b;var c;var d;for(var e=0;e<2;++e){var f=this.m_bounds[e];var g=2*this.m_proxyCount;var h=0;for(var i=0;i<g;++i){var j=f[i];if(j.IsLower()==true){h++}else{h--}}}},ComputeBounds:function(a,b,c){var d=c.minVertex.x;var e=c.minVertex.y;d=k.b2Min(d,this.m_worldAABB.maxVertex.x);e=k.b2Min(e,this.m_worldAABB.maxVertex.y);d=k.b2Max(d,this.m_worldAABB.minVertex.x);e=k.b2Max(e,this.m_worldAABB.minVertex.y);var f=c.maxVertex.x;var h=c.maxVertex.y;f=k.b2Min(f,this.m_worldAABB.maxVertex.x);h=k.b2Min(h,this.m_worldAABB.maxVertex.y);f=k.b2Max(f,this.m_worldAABB.minVertex.x);h=k.b2Max(h,this.m_worldAABB.minVertex.y);a[0]=this.m_quantizationFactor.x*(d-this.m_worldAABB.minVertex.x)&g.USHRT_MAX-1;b[0]=this.m_quantizationFactor.x*(f-this.m_worldAABB.minVertex.x)&65535|1;a[1]=this.m_quantizationFactor.y*(e-this.m_worldAABB.minVertex.y)&g.USHRT_MAX-1;b[1]=this.m_quantizationFactor.y*(h-this.m_worldAABB.minVertex.y)&65535|1},TestOverlapValidate:function(a,b){for(var c=0;c<2;++c){var d=this.m_bounds[c];if(d[a.lowerBounds[c]].value>d[b.upperBounds[c]].value)return false;if(d[a.upperBounds[c]].value<d[b.lowerBounds[c]].value)return false}return true},TestOverlap:function(a,b){for(var c=0;c<2;++c){var d=this.m_bounds[c];if(a.lowerValues[c]>d[b.upperBounds[c]].value)return false;if(a.upperValues[c]<d[b.lowerBounds[c]].value)return false}return true},Query:function(a,b,c,d,e,f,g){var h=s.BinarySearch(e,f,c);var i=s.BinarySearch(e,f,d);for(var j=h;j<i;++j){if(e[j].IsLower()){this.IncrementOverlapCount(e[j].proxyId)}}if(h>0){var k=h-1;var l=e[k].stabbingCount;while(l){if(e[k].IsLower()){var m=this.m_proxyPool[e[k].proxyId];if(h<=m.upperBounds[g]){this.IncrementOverlapCount(e[k].proxyId);--l}}--k}}a[0]=h;b[0]=i},IncrementOverlapCount:function(a){var b=this.m_proxyPool[a];if(b.timeStamp<this.m_timeStamp){b.timeStamp=this.m_timeStamp;b.overlapCount=1}else{b.overlapCount=2;this.m_queryResults[this.m_queryResultCount]=a;++this.m_queryResultCount}},IncrementTimeStamp:function(){if(this.m_timeStamp==g.USHRT_MAX){for(var a=0;a<g.b2_maxProxies;++a){this.m_proxyPool[a].timeStamp=0}this.m_timeStamp=1}else{++this.m_timeStamp}},m_pairManager:new r,m_proxyPool:new Array(g.b2_maxPairs),m_freeProxy:0,m_bounds:new Array(2*g.b2_maxProxies),m_queryResults:new Array(g.b2_maxProxies),m_queryResultCount:0,m_worldAABB:null,m_quantizationFactor:new h,m_proxyCount:0,m_timeStamp:0};s.s_validate=false;s.b2_invalid=g.USHRT_MAX;s.b2_nullEdge=g.USHRT_MAX;s.BinarySearch=function(a,b,c){var d=0;var e=b-1;while(d<=e){var f=Math.floor((d+e)/2);if(a[f].value>c){e=f-1}else if(a[f].value<c){d=f+1}else{return f}}return d};var t=f.create();t.prototype={initialize:function(){}};t.b2_nullFeature=255;t.ClipSegmentToLine=function(a,b,c,d){var e=0;var f=b[0].v;var g=b[1].v;var h=k.b2Dot(c,b[0].v)-d;var i=k.b2Dot(c,b[1].v)-d;if(h<=0)a[e++]=b[0];if(i<=0)a[e++]=b[1];if(h*i<0){var j=h/(h-i);var l=a[e].v;l.x=f.x+j*(g.x-f.x);l.y=f.y+j*(g.y-f.y);if(h>0){a[e].id=b[0].id}else{a[e].id=b[1].id}++e}return e};t.EdgeSeparation=function(a,b,c){var d=a.m_vertices;var e=c.m_vertexCount;var f=c.m_vertices;var g=a.m_normals[b].x;var h=a.m_normals[b].y;var i=g;var j=a.m_R;g=j.col1.x*i+j.col2.x*h;h=j.col1.y*i+j.col2.y*h;var k=g;var l=h;j=c.m_R;i=k*j.col1.x+l*j.col1.y;l=k*j.col2.x+l*j.col2.y;k=i;var m=0;var n=Number.MAX_VALUE;for(var o=0;o<e;++o){var p=f[o];var q=p.x*k+p.y*l;if(q<n){n=q;m=o}}j=a.m_R;var r=a.m_position.x+(j.col1.x*d[b].x+j.col2.x*d[b].y);var s=a.m_position.y+(j.col1.y*d[b].x+j.col2.y*d[b].y);j=c.m_R;var t=c.m_position.x+(j.col1.x*f[m].x+j.col2.x*f[m].y);var u=c.m_position.y+(j.col1.y*f[m].x+j.col2.y*f[m].y);t-=r;u-=s;var v=t*g+u*h;return v};t.FindMaxSeparation=function(a,b,c,d){var e=b.m_vertexCount;var f=c.m_position.x-b.m_position.x;var g=c.m_position.y-b.m_position.y;var h=f*b.m_R.col1.x+g*b.m_R.col1.y;var i=f*b.m_R.col2.x+g*b.m_R.col2.y;var j=0;var k=-Number.MAX_VALUE;for(var l=0;l<e;++l){var m=b.m_normals[l].x*h+b.m_normals[l].y*i;if(m>k){k=m;j=l}}var n=t.EdgeSeparation(b,j,c);if(n>0&&d==false){return n}var o=j-1>=0?j-1:e-1;var p=t.EdgeSeparation(b,o,c);if(p>0&&d==false){return p}var q=j+1<e?j+1:0;var r=t.EdgeSeparation(b,q,c);if(r>0&&d==false){return r}var s=0;var u;var v=0;if(p>n&&p>r){v=-1;s=o;u=p}else if(r>n){v=1;s=q;u=r}else{a[0]=j;return n}while(true){if(v==-1)j=s-1>=0?s-1:e-1;else j=s+1<e?s+1:0;n=t.EdgeSeparation(b,j,c);if(n>0&&d==false){return n}if(n>u){s=j;u=n}else{break}}a[0]=s;return u};t.FindIncidentEdge=function(a,b,c,d){var e=b.m_vertexCount;var f=b.m_vertices;var g=d.m_vertexCount;var h=d.m_vertices;var i=c;var j=c+1==e?0:c+1;var k=f[j];var l=k.x;var m=k.y;k=f[i];l-=k.x;m-=k.y;var n=l;l=m;m=-n;var o=1/Math.sqrt(l*l+m*m);l*=o;m*=o;var p=l;var q=m;n=p;var r=b.m_R;p=r.col1.x*n+r.col2.x*q;q=r.col1.y*n+r.col2.y*q;var s=p;var t=q;r=d.m_R;n=s*r.col1.x+t*r.col1.y;t=s*r.col2.x+t*r.col2.y;s=n;var u=0;var v=0;var w=Number.MAX_VALUE;for(var x=0;x<g;++x){var y=x;var z=x+1<g?x+1:0;k=h[z];var A=k.x;var B=k.y;k=h[y];A-=k.x;B-=k.y;n=A;A=B;B=-n;o=1/Math.sqrt(A*A+B*B);A*=o;B*=o;var C=A*s+B*t;if(C<w){w=C;u=y;v=z}}var D;D=a[0];k=D.v;k.SetV(h[u]);k.MulM(d.m_R);k.Add(d.m_position);D.id.features.referenceFace=c;D.id.features.incidentEdge=u;D.id.features.incidentVertex=u;D=a[1];k=D.v;k.SetV(h[v]);k.MulM(d.m_R);k.Add(d.m_position);D.id.features.referenceFace=c;D.id.features.incidentEdge=u;D.id.features.incidentVertex=v};t.b2CollidePolyTempVec=new h;t.b2CollidePoly=function(a,b,c,d){a.pointCount=0;var e=0;var f=[e];var h=t.FindMaxSeparation(f,b,c,d);e=f[0];if(h>0&&d==false)return;var i=0;var j=[i];var k=t.FindMaxSeparation(j,c,b,d);i=j[0];if(k>0&&d==false)return;var l;var m;var n=0;var o=0;var p=.98;var q=.001;if(k>p*h+q){l=c;m=b;n=i;o=1}else{l=b;m=c;n=e;o=0}var r=[new C,new C];t.FindIncidentEdge(r,l,n,m);var s=l.m_vertexCount;var u=l.m_vertices;var v=u[n];var w=n+1<s?u[n+1]:u[0];var x=w.x-v.x;var y=w.y-v.y;var z=w.x-v.x;var A=w.y-v.y;var B=z;var D=l.m_R;z=D.col1.x*B+D.col2.x*A;A=D.col1.y*B+D.col2.y*A;var E=1/Math.sqrt(z*z+A*A);z*=E;A*=E;var F=z;var G=A;B=F;F=G;G=-B;var H=v.x;var I=v.y;B=H;D=l.m_R;H=D.col1.x*B+D.col2.x*I;I=D.col1.y*B+D.col2.y*I;H+=l.m_position.x;I+=l.m_position.y;var J=w.x;var K=w.y;B=J;D=l.m_R;J=D.col1.x*B+D.col2.x*K;K=D.col1.y*B+D.col2.y*K;J+=l.m_position.x;K+=l.m_position.y;var L=F*H+G*I;var M=-(z*H+A*I);var N=z*J+A*K;var O=[new C,new C];var P=[new C,new C];var Q=0;t.b2CollidePolyTempVec.Set(-z,-A);Q=t.ClipSegmentToLine(O,r,t.b2CollidePolyTempVec,M);if(Q<2)return;t.b2CollidePolyTempVec.Set(z,A);Q=t.ClipSegmentToLine(P,O,t.b2CollidePolyTempVec,N);if(Q<2)return;if(o){a.normal.Set(-F,-G)}else{a.normal.Set(F,G)}var R=0;for(var S=0;S<g.b2_maxManifoldPoints;++S){var T=P[S].v;var U=F*T.x+G*T.y-L;if(U<=0||d==true){var V=a.points[R];V.separation=U;V.position.SetV(P[S].v);V.id.Set(P[S].id);V.id.features.flip=o;++R}}a.pointCount=R};t.b2CollideCircle=function(a,b,c,d){a.pointCount=0;var e=c.m_position.x-b.m_position.x;var f=c.m_position.y-b.m_position.y;var g=e*e+f*f;var h=b.m_radius+c.m_radius;if(g>h*h&&d==false){return}var i;if(g<Number.MIN_VALUE){i=-h;a.normal.Set(0,1)}else{var j=Math.sqrt(g);i=j-h;var k=1/j;a.normal.x=k*e;a.normal.y=k*f}a.pointCount=1;var l=a.points[0];l.id.set_key(0);l.separation=i;l.position.x=c.m_position.x-c.m_radius*a.normal.x;l.position.y=c.m_position.y-c.m_radius*a.normal.y};t.b2CollidePolyAndCircle=function(a,b,c,d){a.pointCount=0;var e;var f;var g;var h=c.m_position.x-b.m_position.x;var i=c.m_position.y-b.m_position.y;var j=b.m_R;var k=h*j.col1.x+i*j.col1.y;i=h*j.col2.x+i*j.col2.y;h=k;var l;var m=0;var n=-Number.MAX_VALUE;var o=c.m_radius;for(var p=0;p<b.m_vertexCount;++p){var q=b.m_normals[p].x*(h-b.m_vertices[p].x)+b.m_normals[p].y*(i-b.m_vertices[p].y);if(q>o){return}if(q>n){n=q;m=p}}if(n<Number.MIN_VALUE){a.pointCount=1;var r=b.m_normals[m];a.normal.x=j.col1.x*r.x+j.col2.x*r.y;a.normal.y=j.col1.y*r.x+j.col2.y*r.y;e=a.points[0];e.id.features.incidentEdge=m;e.id.features.incidentVertex=t.b2_nullFeature;e.id.features.referenceFace=t.b2_nullFeature;e.id.features.flip=0;e.position.x=c.m_position.x-o*a.normal.x;e.position.y=c.m_position.y-o*a.normal.y;e.separation=n-o;return}var s=m;var u=s+1<b.m_vertexCount?s+1:0;var v=b.m_vertices[u].x-b.m_vertices[s].x;var w=b.m_vertices[u].y-b.m_vertices[s].y;var x=Math.sqrt(v*v+w*w);v/=x;w/=x;if(x<Number.MIN_VALUE){f=h-b.m_vertices[s].x;g=i-b.m_vertices[s].y;l=Math.sqrt(f*f+g*g);f/=l;g/=l;if(l>o){return}a.pointCount=1;a.normal.Set(j.col1.x*f+j.col2.x*g,j.col1.y*f+j.col2.y*g);e=a.points[0];e.id.features.incidentEdge=t.b2_nullFeature;e.id.features.incidentVertex=s;e.id.features.referenceFace=t.b2_nullFeature;e.id.features.flip=0;e.position.x=c.m_position.x-o*a.normal.x;e.position.y=c.m_position.y-o*a.normal.y;e.separation=l-o;return}var y=(h-b.m_vertices[s].x)*v+(i-b.m_vertices[s].y)*w;e=a.points[0];e.id.features.incidentEdge=t.b2_nullFeature;e.id.features.incidentVertex=t.b2_nullFeature;e.id.features.referenceFace=t.b2_nullFeature;e.id.features.flip=0;var z,A;if(y<=0){z=b.m_vertices[s].x;A=b.m_vertices[s].y;e.id.features.incidentVertex=s}else if(y>=x){z=b.m_vertices[u].x;A=b.m_vertices[u].y;e.id.features.incidentVertex=u}else{z=v*y+b.m_vertices[s].x;A=w*y+b.m_vertices[s].y;e.id.features.incidentEdge=s}f=h-z;g=i-A;l=Math.sqrt(f*f+g*g);f/=l;g/=l;if(l>o){return}a.pointCount=1;a.normal.Set(j.col1.x*f+j.col2.x*g,j.col1.y*f+j.col2.y*g);e.position.x=c.m_position.x-o*a.normal.x;e.position.y=c.m_position.y-o*a.normal.y;e.separation=l-o};t.b2TestOverlap=function(a,b){var c=b.minVertex;var d=a.maxVertex;var e=c.x-d.x;var f=c.y-d.y;c=a.minVertex;d=b.maxVertex;var g=c.x-d.x;var h=c.y-d.y;if(e>0||f>0)return false;if(g>0||h>0)return false;return true};var u=f.create();u.prototype={set_referenceFace:function(a){this._referenceFace=a;this._m_id._key=this._m_id._key&4294967040|this._referenceFace&255},get_referenceFace:function(){return this._referenceFace},_referenceFace:0,set_incidentEdge:function(a){this._incidentEdge=a;this._m_id._key=this._m_id._key&4294902015|this._incidentEdge<<8&65280},get_incidentEdge:function(){return this._incidentEdge},_incidentEdge:0,set_incidentVertex:function(a){this._incidentVertex=a;this._m_id._key=this._m_id._key&4278255615|this._incidentVertex<<16&16711680},get_incidentVertex:function(){return this._incidentVertex},_incidentVertex:0,set_flip:function(a){this._flip=a;this._m_id._key=this._m_id._key&16777215|this._flip<<24&4278190080},get_flip:function(){return this._flip},_flip:0,_m_id:null,initialize:function(){}};var v=f.create();v.prototype={initialize:function(){this.features=new u;this.features._m_id=this},Set:function(a){this.set_key(a._key)},Copy:function(){var a=new v;a.set_key(this._key);return a},get_key:function(){return this._key},set_key:function(a){this._key=a;this.features._referenceFace=this._key&255;this.features._incidentEdge=(this._key&65280)>>8&255;this.features._incidentVertex=(this._key&16711680)>>16&255;this.features._flip=(this._key&4278190080)>>24&255},features:new u,_key:0};var x=f.create();x.prototype={position:new h,separation:null,normalImpulse:null,tangentImpulse:null,id:new v,initialize:function(){this.position=new h;this.id=new v}};var y=f.create();y.prototype={initialize:function(){}};y.ProcessTwo=function(a,b,c,d,e){var f=-e[1].x;var g=-e[1].y;var h=e[0].x-e[1].x;var i=e[0].y-e[1].y;var j=Math.sqrt(h*h+i*i);h/=j;i/=j;var k=f*h+g*i;if(k<=0||j<Number.MIN_VALUE){a.SetV(c[1]);b.SetV(d[1]);c[0].SetV(c[1]);d[0].SetV(d[1]);e[0].SetV(e[1]);return 1}k/=j;a.x=c[1].x+k*(c[0].x-c[1].x);a.y=c[1].y+k*(c[0].y-c[1].y);b.x=d[1].x+k*(d[0].x-d[1].x);b.y=d[1].y+k*(d[0].y-d[1].y);return 2};y.ProcessThree=function(a,b,c,d,e){var f=e[0].x;var g=e[0].y;var h=e[1].x;var i=e[1].y;var j=e[2].x;var k=e[2].y;var l=h-f;var m=i-g;var n=j-f;var o=k-g;var p=j-h;var q=k-i;var r=-(f*l+g*m);var s=h*l+i*m;var t=-(f*n+g*o);var u=j*n+k*o;var v=-(h*p+i*q);var w=j*p+k*q;if(u<=0&&w<=0){a.SetV(c[2]);b.SetV(d[2]);c[0].SetV(c[2]);d[0].SetV(d[2]);e[0].SetV(e[2]);return 1}var x=l*o-m*n;var y=x*(f*i-g*h);var z=x*(h*k-i*j);if(z<=0&&v>=0&&w>=0){var A=v/(v+w);a.x=c[1].x+A*(c[2].x-c[1].x);a.y=c[1].y+A*(c[2].y-c[1].y);b.x=d[1].x+A*(d[2].x-d[1].x);b.y=d[1].y+A*(d[2].y-d[1].y);c[0].SetV(c[2]);d[0].SetV(d[2]);e[0].SetV(e[2]);return 2}var B=x*(j*g-k*f);if(B<=0&&t>=0&&u>=0){var A=t/(t+u);a.x=c[0].x+A*(c[2].x-c[0].x);a.y=c[0].y+A*(c[2].y-c[0].y);b.x=d[0].x+A*(d[2].x-d[0].x);b.y=d[0].y+A*(d[2].y-d[0].y);c[1].SetV(c[2]);d[1].SetV(d[2]);e[1].SetV(e[2]);return 2}var C=z+B+y;C=1/C;var D=z*C;var E=B*C;var F=1-D-E;a.x=D*c[0].x+E*c[1].x+F*c[2].x;a.y=D*c[0].y+E*c[1].y+F*c[2].y;b.x=D*d[0].x+E*d[1].x+F*d[2].x;b.y=D*d[0].y+E*d[1].y+F*d[2].y;return 3};y.InPoinsts=function(a,b,c){for(var d=0;d<c;++d){if(a.x==b[d].x&&a.y==b[d].y){return true}}return false};y.Distance=function(a,b,c,d){var e=new Array(3);var f=new Array(3);var g=new Array(3);var h=0;a.SetV(c.m_position);b.SetV(d.m_position);var i=0;var j=20;for(var l=0;l<j;++l){var m=b.x-a.x;var n=b.y-a.y;var o=c.Support(m,n);var p=d.Support(-m,-n);i=m*m+n*n;var q=p.x-o.x;var r=p.y-o.y;var s=m*q+n*r;if(i-b2Dot(m*q+n*r)<=.01*i){if(h==0){a.SetV(o);b.SetV(p)}y.g_GJK_Iterations=l;return Math.sqrt(i)}switch(h){case 0:e[0].SetV(o);f[0].SetV(p);g[0]=w;a.SetV(e[0]);b.SetV(f[0]);++h;break;case 1:e[1].SetV(o);f[1].SetV(p);g[1].x=q;g[1].y=r;h=y.ProcessTwo(a,b,e,f,g);break;case 2:e[2].SetV(o);f[2].SetV(p);g[2].x=q;g[2].y=r;h=y.ProcessThree(a,b,e,f,g);break}if(h==3){y.g_GJK_Iterations=l;return 0}var t=-Number.MAX_VALUE;for(var u=0;u<h;++u){t=k.b2Max(t,g[u].x*g[u].x+g[u].y*g[u].y)}if(h==3||i<=100*Number.MIN_VALUE*t){y.g_GJK_Iterations=l;return Math.sqrt(i)}}y.g_GJK_Iterations=j;return Math.sqrt(i)};y.g_GJK_Iterations=0;var z=f.create();z.prototype={initialize:function(){this.points=new Array(g.b2_maxManifoldPoints);for(var a=0;a<g.b2_maxManifoldPoints;a++){this.points[a]=new x}this.normal=new h},points:null,normal:null,pointCount:0};var A=f.create();A.prototype={R:new j,center:new h,extents:new h,initialize:function(){this.R=new j;this.center=new h;this.extents=new h}};var B=f.create();B.prototype={GetNext:function(){return this.lowerBounds[0]},SetNext:function(a){this.lowerBounds[0]=a},IsValid:function(){return this.overlapCount!=s.b2_invalid},lowerBounds:[0,0],upperBounds:[0,0],overlapCount:0,timeStamp:0,userData:null,initialize:function(){this.lowerBounds=[0,0];this.upperBounds=[0,0]}};var C=f.create();C.prototype={v:new h,id:new v,initialize:function(){this.v=new h;this.id=new v}};var D=f.create();D.prototype={TestPoint:function(a){return false},GetUserData:function(){return this.m_userData},GetType:function(){return this.m_type},GetBody:function(){return this.m_body},GetPosition:function(){return this.m_position},GetRotationMatrix:function(){return this.m_R},ResetProxy:function(a){},GetNext:function(){return this.m_next},initialize:function(a,b){this.m_R=new j;this.m_position=new h;this.m_userData=a.userData;this.m_friction=a.friction;this.m_restitution=a.restitution;this.m_body=b;this.m_proxyId=o.b2_nullProxy;this.m_maxRadius=0;this.m_categoryBits=a.categoryBits;this.m_maskBits=a.maskBits;this.m_groupIndex=a.groupIndex},DestroyProxy:function(){if(this.m_proxyId!=o.b2_nullProxy){this.m_body.m_world.m_broadPhase.DestroyProxy(this.m_proxyId);this.m_proxyId=o.b2_nullProxy}},Synchronize:function(a,b,c,d){},QuickSync:function(a,b){},Support:function(a,b,c){},GetMaxRadius:function(){return this.m_maxRadius},m_next:null,m_R:new j,m_position:new h,m_type:0,m_userData:null,m_body:null,m_friction:null,m_restitution:null,m_maxRadius:null,m_proxyId:0,m_categoryBits:0,m_maskBits:0,m_groupIndex:0};D.Create=function(a,b,c){switch(a.type){case D.e_circleShape:{return new H(a,b,c)};case D.e_boxShape:case D.e_polyShape:{return new K(a,b,c)}}return null};D.Destroy=function(a){if(a.m_proxyId!=o.b2_nullProxy)a.m_body.m_world.m_broadPhase.DestroyProxy(a.m_proxyId)};D.e_unknownShape=-1;D.e_circleShape=0;D.e_boxShape=1;D.e_polyShape=2;D.e_meshShape=3;D.e_shapeTypeCount=4;D.PolyMass=function(a,b,c,d){var e=new h;e.SetZero();var f=0;var g=0;var i=new h(0,0);var j=1/3;for(var l=0;l<c;++l){var m=i;var n=b[l];var o=l+1<c?b[l+1]:b[0];var p=k.SubtractVV(n,m);var q=k.SubtractVV(o,m);var r=k.b2CrossVV(p,q);var s=.5*r;f+=s;var t=new h;t.SetV(m);t.Add(n);t.Add(o);t.Multiply(j*s);e.Add(t);var u=m.x;var v=m.y;var w=p.x;var x=p.y;var y=q.x;var z=q.y;var A=j*(.25*(w*w+y*w+y*y)+(u*w+u*y))+.5*u*u;var B=j*(.25*(x*x+z*x+z*z)+(v*x+v*z))+.5*v*v;g+=r*(A+B)}a.mass=d*f;e.Multiply(1/f);a.center=e;g=d*(g-f*k.b2Dot(e,e));a.I=g};D.PolyCentroid=function(a,b,c){var d=0;var e=0;var f=0;var g=0;var h=0;var i=1/3;for(var j=0;j<b;++j){var k=g;var l=h;var m=a[j].x;var n=a[j].y;var o=j+1<b?a[j+1].x:a[0].x;var p=j+1<b?a[j+1].y:a[0].y;var q=m-k;var r=n-l;var s=o-k;var t=p-l;var u=q*t-r*s;var v=.5*u;f+=v;d+=v*i*(k+m+o);e+=v*i*(l+n+p)}d*=1/f;e*=1/f;c.Set(d,e)};var E=f.create();E.prototype={initialize:function(){this.type=D.e_unknownShape;this.userData=null;this.localPosition=new h(0,0);this.localRotation=0;this.friction=.2;this.restitution=0;this.density=0;this.categoryBits=1;this.maskBits=65535;this.groupIndex=0},ComputeMass:function(a){a.center=new h(0,0);if(this.density==0){a.mass=0;a.center.Set(0,0);a.I=0}switch(this.type){case D.e_circleShape:{var b=this;a.mass=this.density*g.b2_pi*b.radius*b.radius;a.center.Set(0,0);a.I=.5*a.mass*b.radius*b.radius}break;case D.e_boxShape:{var c=this;a.mass=4*this.density*c.extents.x*c.extents.y;a.center.Set(0,0);a.I=a.mass/3*k.b2Dot(c.extents,c.extents)}break;case D.e_polyShape:{var d=this;D.PolyMass(a,d.vertices,d.vertexCount,this.density)}break;default:a.mass=0;a.center.Set(0,0);a.I=0;break}},type:0,userData:null,localPosition:null,localRotation:null,friction:null,restitution:null,density:null,categoryBits:0,maskBits:0,groupIndex:0};var F=f.create();Object.extend(F.prototype,E.prototype);Object.extend(F.prototype,{initialize:function(){this.type=D.e_unknownShape;this.userData=null;this.localPosition=new h(0,0);this.localRotation=0;this.friction=.2;this.restitution=0;this.density=0;this.categoryBits=1;this.maskBits=65535;this.groupIndex=0;this.type=D.e_boxShape;this.extents=new h(1,1)},extents:null});var G=f.create();Object.extend(G.prototype,E.prototype);Object.extend(G.prototype,{initialize:function(){this.type=D.e_unknownShape;this.userData=null;this.localPosition=new h(0,0);this.localRotation=0;this.friction=.2;this.restitution=0;this.density=0;this.categoryBits=1;this.maskBits=65535;this.groupIndex=0;this.type=D.e_circleShape;this.radius=1},radius:null});var H=f.create();Object.extend(H.prototype,D.prototype);Object.extend(H.prototype,{TestPoint:function(a){var b=new h;b.SetV(a);b.Subtract(this.m_position);return k.b2Dot(b,b)<=this.m_radius*this.m_radius},initialize:function(a,b,c){this.m_R=new j;this.m_position=new h;this.m_userData=a.userData;this.m_friction=a.friction;this.m_restitution=a.restitution;this.m_body=b;this.m_proxyId=o.b2_nullProxy;this.m_maxRadius=0;this.m_categoryBits=a.categoryBits;this.m_maskBits=a.maskBits;this.m_groupIndex=a.groupIndex;this.m_localPosition=new h;var d=a;this.m_localPosition.Set(a.localPosition.x-c.x,a.localPosition.y-c.y);this.m_type=D.e_circleShape;this.m_radius=d.radius;this.m_R.SetM(this.m_body.m_R);var e=this.m_R.col1.x*this.m_localPosition.x+this.m_R.col2.x*this.m_localPosition.y;var f=this.m_R.col1.y*this.m_localPosition.x+this.m_R.col2.y*this.m_localPosition.y;this.m_position.x=this.m_body.m_position.x+e;this.m_position.y=this.m_body.m_position.y+f;this.m_maxRadius=Math.sqrt(e*e+f*f)+this.m_radius;var g=new l;g.minVertex.Set(this.m_position.x-this.m_radius,this.m_position.y-this.m_radius);g.maxVertex.Set(this.m_position.x+this.m_radius,this.m_position.y+this.m_radius);var i=this.m_body.m_world.m_broadPhase;if(i.InRange(g)){this.m_proxyId=i.CreateProxy(g,this)}else{this.m_proxyId=o.b2_nullProxy}if(this.m_proxyId==o.b2_nullProxy){this.m_body.Freeze()}},Synchronize:function(a,b,c,d){this.m_R.SetM(d);this.m_position.x=d.col1.x*this.m_localPosition.x+d.col2.x*this.m_localPosition.y+c.x;this.m_position.y=d.col1.y*this.m_localPosition.x+d.col2.y*this.m_localPosition.y+c.y;if(this.m_proxyId==o.b2_nullProxy){return}var e=a.x+(b.col1.x*this.m_localPosition.x+b.col2.x*this.m_localPosition.y);var f=a.y+(b.col1.y*this.m_localPosition.x+b.col2.y*this.m_localPosition.y);var g=Math.min(e,this.m_position.x);var h=Math.min(f,this.m_position.y);var i=Math.max(e,this.m_position.x);var j=Math.max(f,this.m_position.y);var k=new l;k.minVertex.Set(g-this.m_radius,h-this.m_radius);k.maxVertex.Set(i+this.m_radius,j+this.m_radius);var m=this.m_body.m_world.m_broadPhase;if(m.InRange(k)){m.MoveProxy(this.m_proxyId,k)}else{this.m_body.Freeze()}},QuickSync:function(a,b){this.m_R.SetM(b);this.m_position.x=b.col1.x*this.m_localPosition.x+b.col2.x*this.m_localPosition.y+a.x;this.m_position.y=b.col1.y*this.m_localPosition.x+b.col2.y*this.m_localPosition.y+a.y},ResetProxy:function(a){if(this.m_proxyId==o.b2_nullProxy){return}var b=a.GetProxy(this.m_proxyId);a.DestroyProxy(this.m_proxyId);b=null;var c=new l;c.minVertex.Set(this.m_position.x-this.m_radius,this.m_position.y-this.m_radius);c.maxVertex.Set(this.m_position.x+this.m_radius,this.m_position.y+this.m_radius);if(a.InRange(c)){this.m_proxyId=a.CreateProxy(c,this)}else{this.m_proxyId=o.b2_nullProxy}if(this.m_proxyId==o.b2_nullProxy){this.m_body.Freeze()}},Support:function(a,b,c){var d=Math.sqrt(a*a+b*b);a/=d;b/=d;c.Set(this.m_position.x+this.m_radius*a,this.m_position.y+this.m_radius*b)},m_localPosition:new h,m_radius:null});var I=f.create();I.prototype={mass:0,center:new h(0,0),I:0,initialize:function(){this.center=new h(0,0)}};var J=f.create();Object.extend(J.prototype,E.prototype);Object.extend(J.prototype,{initialize:function(){this.type=D.e_unknownShape;this.userData=null;this.localPosition=new h(0,0);this.localRotation=0;this.friction=.2;this.restitution=0;this.density=0;this.categoryBits=1;this.maskBits=65535;this.groupIndex=0;this.vertices=new Array(g.b2_maxPolyVertices);this.type=D.e_polyShape;this.vertexCount=0;for(var a=0;a<g.b2_maxPolyVertices;a++){this.vertices[a]=new h}},vertices:new Array(g.b2_maxPolyVertices),vertexCount:0});var K=f.create();Object.extend(K.prototype,D.prototype);Object.extend(K.prototype,{TestPoint:function(a){var b=new h;b.SetV(a);b.Subtract(this.m_position);b.MulTM(this.m_R);for(var c=0;c<this.m_vertexCount;++c){var d=new h;d.SetV(b);d.Subtract(this.m_vertices[c]);var e=k.b2Dot(this.m_normals[c],d);if(e>0){return false}}return true},initialize:function(a,b,c){this.m_R=new j;this.m_position=new h;this.m_userData=a.userData;this.m_friction=a.friction;this.m_restitution=a.restitution;this.m_body=b;this.m_proxyId=o.b2_nullProxy;this.m_maxRadius=0;this.m_categoryBits=a.categoryBits;this.m_maskBits=a.maskBits;this.m_groupIndex=a.groupIndex;this.syncAABB=new l;this.syncMat=new j;this.m_localCentroid=new h;this.m_localOBB=new A;var d=0;var e;var f;var i;var k=new l;this.m_vertices=new Array(g.b2_maxPolyVertices);this.m_coreVertices=new Array(g.b2_maxPolyVertices);this.m_normals=new Array(g.b2_maxPolyVertices);this.m_type=D.e_polyShape;var m=new j(a.localRotation);if(a.type==D.e_boxShape){this.m_localCentroid.x=a.localPosition.x-c.x;this.m_localCentroid.y=a.localPosition.y-c.y;var n=a;this.m_vertexCount=4;e=n.extents.x;f=n.extents.y;var p=Math.max(0,e-2*g.b2_linearSlop);var q=Math.max(0,f-2*g.b2_linearSlop);i=this.m_vertices[0]=new h;i.x=m.col1.x*e+m.col2.x*f;i.y=m.col1.y*e+m.col2.y*f;i=this.m_vertices[1]=new h;i.x=m.col1.x*-e+m.col2.x*f;i.y=m.col1.y*-e+m.col2.y*f;i=this.m_vertices[2]=new h;i.x=m.col1.x*-e+m.col2.x*-f;i.y=m.col1.y*-e+m.col2.y*-f;i=this.m_vertices[3]=new h;i.x=m.col1.x*e+m.col2.x*-f;i.y=m.col1.y*e+m.col2.y*-f;i=this.m_coreVertices[0]=new h;i.x=m.col1.x*p+m.col2.x*q;i.y=m.col1.y*p+m.col2.y*q;i=this.m_coreVertices[1]=new h;i.x=m.col1.x*-p+m.col2.x*q;i.y=m.col1.y*-p+m.col2.y*q;i=this.m_coreVertices[2]=new h;i.x=m.col1.x*-p+m.col2.x*-q;i.y=m.col1.y*-p+m.col2.y*-q;i=this.m_coreVertices[3]=new h;i.x=m.col1.x*p+m.col2.x*-q;i.y=m.col1.y*p+m.col2.y*-q}else{var r=a;this.m_vertexCount=r.vertexCount;D.PolyCentroid(r.vertices,r.vertexCount,K.tempVec);var s=K.tempVec.x;var t=K.tempVec.y;this.m_localCentroid.x=a.localPosition.x+(m.col1.x*s+m.col2.x*t)-c.x;this.m_localCentroid.y=a.localPosition.y+(m.col1.y*s+m.col2.y*t)-c.y;for(d=0;d<this.m_vertexCount;++d){this.m_vertices[d]=new h;this.m_coreVertices[d]=new h;e=r.vertices[d].x-s;f=r.vertices[d].y-t;this.m_vertices[d].x=m.col1.x*e+m.col2.x*f;this.m_vertices[d].y=m.col1.y*e+m.col2.y*f;var u=this.m_vertices[d].x;var v=this.m_vertices[d].y;var w=Math.sqrt(u*u+v*v);if(w>Number.MIN_VALUE){u*=1/w;v*=1/w}this.m_coreVertices[d].x=this.m_vertices[d].x-2*g.b2_linearSlop*u;this.m_coreVertices[d].y=this.m_vertices[d].y-2*g.b2_linearSlop*v}}var x=Number.MAX_VALUE;var y=Number.MAX_VALUE;var z=-Number.MAX_VALUE;var B=-Number.MAX_VALUE;this.m_maxRadius=0;for(d=0;d<this.m_vertexCount;++d){var C=this.m_vertices[d];x=Math.min(x,C.x);y=Math.min(y,C.y);z=Math.max(z,C.x);B=Math.max(B,C.y);this.m_maxRadius=Math.max(this.m_maxRadius,C.Length())}this.m_localOBB.R.SetIdentity();this.m_localOBB.center.Set((x+z)*.5,(y+B)*.5);this.m_localOBB.extents.Set((z-x)*.5,(B-y)*.5);var E=0;var F=0;for(d=0;d<this.m_vertexCount;++d){this.m_normals[d]=new h;E=d;F=d+1<this.m_vertexCount?d+1:0;this.m_normals[d].x=this.m_vertices[F].y-this.m_vertices[E].y;this.m_normals[d].y=-(this.m_vertices[F].x-this.m_vertices[E].x);this.m_normals[d].Normalize()}for(d=0;d<this.m_vertexCount;++d){E=d;F=d+1<this.m_vertexCount?d+1:0}this.m_R.SetM(this.m_body.m_R);this.m_position.x=this.m_body.m_position.x+(this.m_R.col1.x*this.m_localCentroid.x+this.m_R.col2.x*this.m_localCentroid.y);this.m_position.y=this.m_body.m_position.y+(this.m_R.col1.y*this.m_localCentroid.x+this.m_R.col2.y*this.m_localCentroid.y);K.tAbsR.col1.x=this.m_R.col1.x*this.m_localOBB.R.col1.x+this.m_R.col2.x*this.m_localOBB.R.col1.y;K.tAbsR.col1.y=this.m_R.col1.y*this.m_localOBB.R.col1.x+this.m_R.col2.y*this.m_localOBB.R.col1.y;K.tAbsR.col2.x=this.m_R.col1.x*this.m_localOBB.R.col2.x+this.m_R.col2.x*this.m_localOBB.R.col2.y;K.tAbsR.col2.y=this.m_R.col1.y*this.m_localOBB.R.col2.x+this.m_R.col2.y*this.m_localOBB.R.col2.y;K.tAbsR.Abs();e=K.tAbsR.col1.x*this.m_localOBB.extents.x+K.tAbsR.col2.x*this.m_localOBB.extents.y;f=K.tAbsR.col1.y*this.m_localOBB.extents.x+K.tAbsR.col2.y*this.m_localOBB.extents.y;var G=this.m_position.x+(this.m_R.col1.x*this.m_localOBB.center.x+this.m_R.col2.x*this.m_localOBB.center.y);var H=this.m_position.y+(this.m_R.col1.y*this.m_localOBB.center.x+this.m_R.col2.y*this.m_localOBB.center.y);k.minVertex.x=G-e;k.minVertex.y=H-f;k.maxVertex.x=G+e;k.maxVertex.y=H+f;var I=this.m_body.m_world.m_broadPhase;if(I.InRange(k)){this.m_proxyId=I.CreateProxy(k,this)}else{this.m_proxyId=o.b2_nullProxy}if(this.m_proxyId==o.b2_nullProxy){this.m_body.Freeze()}},syncAABB:new l,syncMat:new j,Synchronize:function(a,b,c,d){this.m_R.SetM(d);this.m_position.x=this.m_body.m_position.x+(d.col1.x*this.m_localCentroid.x+d.col2.x*this.m_localCentroid.y);this.m_position.y=this.m_body.m_position.y+(d.col1.y*this.m_localCentroid.x+d.col2.y*this.m_localCentroid.y);if(this.m_proxyId==o.b2_nullProxy){return}var e;var f;var g=b.col1;var h=b.col2;var i=this.m_localOBB.R.col1;var j=this.m_localOBB.R.col2;this.syncMat.col1.x=g.x*i.x+h.x*i.y;this.syncMat.col1.y=g.y*i.x+h.y*i.y;this.syncMat.col2.x=g.x*j.x+h.x*j.y;this.syncMat.col2.y=g.y*j.x+h.y*j.y;this.syncMat.Abs();e=this.m_localCentroid.x+this.m_localOBB.center.x;f=this.m_localCentroid.y+this.m_localOBB.center.y;var k=a.x+(b.col1.x*e+b.col2.x*f);var l=a.y+(b.col1.y*e+b.col2.y*f);e=this.syncMat.col1.x*this.m_localOBB.extents.x+this.syncMat.col2.x*this.m_localOBB.extents.y;f=this.syncMat.col1.y*this.m_localOBB.extents.x+this.syncMat.col2.y*this.m_localOBB.extents.y;this.syncAABB.minVertex.x=k-e;this.syncAABB.minVertex.y=l-f;this.syncAABB.maxVertex.x=k+e;this.syncAABB.maxVertex.y=l+f;g=d.col1;h=d.col2;i=this.m_localOBB.R.col1;j=this.m_localOBB.R.col2;this.syncMat.col1.x=g.x*i.x+h.x*i.y;this.syncMat.col1.y=g.y*i.x+h.y*i.y;this.syncMat.col2.x=g.x*j.x+h.x*j.y;this.syncMat.col2.y=g.y*j.x+h.y*j.y;this.syncMat.Abs();e=this.m_localCentroid.x+this.m_localOBB.center.x;f=this.m_localCentroid.y+this.m_localOBB.center.y;k=c.x+(d.col1.x*e+d.col2.x*f);l=c.y+(d.col1.y*e+d.col2.y*f);e=this.syncMat.col1.x*this.m_localOBB.extents.x+this.syncMat.col2.x*this.m_localOBB.extents.y;f=this.syncMat.col1.y*this.m_localOBB.extents.x+this.syncMat.col2.y*this.m_localOBB.extents.y;this.syncAABB.minVertex.x=Math.min(this.syncAABB.minVertex.x,k-e);this.syncAABB.minVertex.y=Math.min(this.syncAABB.minVertex.y,l-f);this.syncAABB.maxVertex.x=Math.max(this.syncAABB.maxVertex.x,k+e);this.syncAABB.maxVertex.y=Math.max(this.syncAABB.maxVertex.y,l+f);var m=this.m_body.m_world.m_broadPhase;if(m.InRange(this.syncAABB)){m.MoveProxy(this.m_proxyId,this.syncAABB)}else{this.m_body.Freeze()}},QuickSync:function(a,b){this.m_R.SetM(b);this.m_position.x=a.x+(b.col1.x*this.m_localCentroid.x+b.col2.x*this.m_localCentroid.y);this.m_position.y=a.y+(b.col1.y*this.m_localCentroid.x+b.col2.y*this.m_localCentroid.y)},ResetProxy:function(a){if(this.m_proxyId==o.b2_nullProxy){return}var b=a.GetProxy(this.m_proxyId);a.DestroyProxy(this.m_proxyId);b=null;var c=k.b2MulMM(this.m_R,this.m_localOBB.R);var d=k.b2AbsM(c);var e=k.b2MulMV(d,this.m_localOBB.extents);var f=k.b2MulMV(this.m_R,this.m_localOBB.center);f.Add(this.m_position);var g=new l;g.minVertex.SetV(f);g.minVertex.Subtract(e);g.maxVertex.SetV(f);g.maxVertex.Add(e);if(a.InRange(g)){this.m_proxyId=a.CreateProxy(g,this)}else{this.m_proxyId=o.b2_nullProxy}if(this.m_proxyId==o.b2_nullProxy){this.m_body.Freeze()}},Support:function(a,b,c){var d=a*this.m_R.col1.x+b*this.m_R.col1.y;var e=a*this.m_R.col2.x+b*this.m_R.col2.y;var f=0;var g=this.m_coreVertices[0].x*d+this.m_coreVertices[0].y*e;for(var h=1;h<this.m_vertexCount;++h){var i=this.m_coreVertices[h].x*d+this.m_coreVertices[h].y*e;if(i>g){f=h;g=i}}c.Set(this.m_position.x+(this.m_R.col1.x*this.m_coreVertices[f].x+this.m_R.col2.x*this.m_coreVertices[f].y),this.m_position.y+(this.m_R.col1.y*this.m_coreVertices[f].x+this.m_R.col2.y*this.m_coreVertices[f].y))},m_localCentroid:new h,m_localOBB:new A,m_vertices:null,m_coreVertices:null,m_vertexCount:0,m_normals:null});K.tempVec=new h;K.tAbsR=new j;var L=f.create();L.prototype={SetOriginPosition:function(a,b){if(this.IsFrozen()){return}this.m_rotation=b;this.m_R.Set(this.m_rotation);this.m_position=k.AddVV(a,k.b2MulMV(this.m_R,this.m_center));this.m_position0.SetV(this.m_position);this.m_rotation0=this.m_rotation;for(var c=this.m_shapeList;c!=null;c=c.m_next){c.Synchronize(this.m_position,this.m_R,this.m_position,this.m_R)}this.m_world.m_broadPhase.Commit()},GetOriginPosition:function(){return k.SubtractVV(this.m_position,k.b2MulMV(this.m_R,this.m_center))},SetCenterPosition:function(a,b){if(this.IsFrozen()){return}this.m_rotation=b;this.m_R.Set(this.m_rotation);this.m_position.SetV(a);this.m_position0.SetV(this.m_position);this.m_rotation0=this.m_rotation;for(var c=this.m_shapeList;c!=null;c=c.m_next){c.Synchronize(this.m_position,this.m_R,this.m_position,this.m_R)}this.m_world.m_broadPhase.Commit()},GetCenterPosition:function(){return this.m_position},GetRotation:function(){return this.m_rotation},GetRotationMatrix:function(){return this.m_R},SetLinearVelocity:function(a){this.m_linearVelocity.SetV(a)},GetLinearVelocity:function(){return this.m_linearVelocity},SetAngularVelocity:function(a){this.m_angularVelocity=a},GetAngularVelocity:function(){return this.m_angularVelocity},ApplyForce:function(a,b){if(this.IsSleeping()==false){this.m_force.Add(a);this.m_torque+=k.b2CrossVV(k.SubtractVV(b,this.m_position),a)}},ApplyTorque:function(a){if(this.IsSleeping()==false){this.m_torque+=a}},ApplyImpulse:function(a,b){if(this.IsSleeping()==false){this.m_linearVelocity.Add(k.MulFV(this.m_invMass,a));this.m_angularVelocity+=this.m_invI*k.b2CrossVV(k.SubtractVV(b,this.m_position),a)}},GetMass:function(){return this.m_mass},GetInertia:function(){return this.m_I},GetWorldPoint:function(a){return k.AddVV(this.m_position,k.b2MulMV(this.m_R,a))},GetWorldVector:function(a){return k.b2MulMV(this.m_R,a)},GetLocalPoint:function(a){return k.b2MulTMV(this.m_R,k.SubtractVV(a,this.m_position))},GetLocalVector:function(a){return k.b2MulTMV(this.m_R,a)},IsStatic:function(){return(this.m_flags&L.e_staticFlag)==L.e_staticFlag},IsFrozen:function(){return(this.m_flags&L.e_frozenFlag)==L.e_frozenFlag},IsSleeping:function(){return(this.m_flags&L.e_sleepFlag)==L.e_sleepFlag},AllowSleeping:function(a){if(a){this.m_flags|=L.e_allowSleepFlag}else{this.m_flags&=~L.e_allowSleepFlag;this.WakeUp()}},WakeUp:function(){this.m_flags&=~L.e_sleepFlag;this.m_sleepTime=0},GetShapeList:function(){return this.m_shapeList},GetContactList:function(){return this.m_contactList},GetJointList:function(){return this.m_jointList},GetNext:function(){return this.m_next},GetUserData:function(){return this.m_userData},initialize:function(a,b){this.sMat0=new j;this.m_position=new h;this.m_R=new j(0);this.m_position0=new h;var c=0;var d;var e;this.m_flags=0;this.m_position.SetV(a.position);this.m_rotation=a.rotation;this.m_R.Set(this.m_rotation);this.m_position0.SetV(this.m_position);this.m_rotation0=this.m_rotation;this.m_world=b;this.m_linearDamping=k.b2Clamp(1-a.linearDamping,0,1);this.m_angularDamping=k.b2Clamp(1-a.angularDamping,0,1);this.m_force=new h(0,0);this.m_torque=0;this.m_mass=0;var f=new Array(g.b2_maxShapesPerBody);for(c=0;c<g.b2_maxShapesPerBody;c++){f[c]=new I}this.m_shapeCount=0;this.m_center=new h(0,0);for(c=0;c<g.b2_maxShapesPerBody;++c){d=a.shapes[c];if(d==null)break;e=f[c];d.ComputeMass(e);this.m_mass+=e.mass;this.m_center.x+=e.mass*(d.localPosition.x+e.center.x);this.m_center.y+=e.mass*(d.localPosition.y+e.center.y);++this.m_shapeCount}if(this.m_mass>0){this.m_center.Multiply(1/this.m_mass);this.m_position.Add(k.b2MulMV(this.m_R,this.m_center))}else{this.m_flags|=L.e_staticFlag}this.m_I=0;for(c=0;c<this.m_shapeCount;++c){d=a.shapes[c];e=f[c];this.m_I+=e.I;var i=k.SubtractVV(k.AddVV(d.localPosition,e.center),this.m_center);this.m_I+=e.mass*k.b2Dot(i,i)}if(this.m_mass>0){this.m_invMass=1/this.m_mass}else{this.m_invMass=0}if(this.m_I>0&&a.preventRotation==false){this.m_invI=1/this.m_I}else{this.m_I=0;this.m_invI=0}this.m_linearVelocity=k.AddVV(a.linearVelocity,k.b2CrossFV(a.angularVelocity,this.m_center));this.m_angularVelocity=a.angularVelocity;this.m_jointList=null;this.m_contactList=null;this.m_prev=null;this.m_next=null;this.m_shapeList=null;for(c=0;c<this.m_shapeCount;++c){d=a.shapes[c];var l=D.Create(d,this,this.m_center);l.m_next=this.m_shapeList;this.m_shapeList=l}this.m_sleepTime=0;if(a.allowSleep){this.m_flags|=L.e_allowSleepFlag}if(a.isSleeping){this.m_flags|=L.e_sleepFlag}if(this.m_flags&L.e_sleepFlag||this.m_invMass==0){this.m_linearVelocity.Set(0,0);this.m_angularVelocity=0}this.m_userData=a.userData},Destroy:function(){var a=this.m_shapeList;while(a){var b=a;a=a.m_next;D.Destroy(b)}},sMat0:new j,SynchronizeShapes:function(){this.sMat0.Set(this.m_rotation0);for(var a=this.m_shapeList;a!=null;a=a.m_next){a.Synchronize(this.m_position0,this.sMat0,this.m_position,this.m_R)}},QuickSyncShapes:function(){for(var a=this.m_shapeList;a!=null;a=a.m_next){a.QuickSync(this.m_position,this.m_R)}},IsConnected:function(a){for(var b=this.m_jointList;b!=null;b=b.next){if(b.other==a)return b.joint.m_collideConnected==false}return false},Freeze:function(){this.m_flags|=L.e_frozenFlag;this.m_linearVelocity.SetZero();this.m_angularVelocity=0;for(var a=this.m_shapeList;a!=null;a=a.m_next){a.DestroyProxy()}},m_flags:0,m_position:new h,m_rotation:null,m_R:new j(0),m_position0:new h,m_rotation0:null,m_linearVelocity:null,m_angularVelocity:null,m_force:null,m_torque:null,m_center:null,m_world:null,m_prev:null,m_next:null,m_shapeList:null,m_shapeCount:0,m_jointList:null,m_contactList:null,m_mass:null,m_invMass:null,m_I:null,m_invI:null,m_linearDamping:null,m_angularDamping:null,m_sleepTime:null,m_userData:null};L.e_staticFlag=1;L.e_frozenFlag=2;L.e_islandFlag=4;L.e_sleepFlag=8;L.e_allowSleepFlag=16;L.e_destroyFlag=32;var M=f.create();M.prototype={initialize:function(){this.shapes=new Array;this.userData=null;for(var a=0;a<g.b2_maxShapesPerBody;a++){this.shapes[a]=null}this.position=new h(0,0);this.rotation=0;this.linearVelocity=new h(0,0);this.angularVelocity=0;this.linearDamping=0;this.angularDamping=0;this.allowSleep=true;this.isSleeping=false;this.preventRotation=false},userData:null,shapes:new Array,position:null,rotation:null,linearVelocity:null,angularVelocity:null,linearDamping:null,angularDamping:null,allowSleep:null,isSleeping:null,preventRotation:null,AddShape:function(a){for(var b=0;b<g.b2_maxShapesPerBody;++b){if(this.shapes[b]==null){this.shapes[b]=a;break}}}};var N=f.create();N.prototype={ShouldCollide:function(a,b){if(a.m_groupIndex==b.m_groupIndex&&a.m_groupIndex!=0){return a.m_groupIndex>0}var c=(a.m_maskBits&b.m_categoryBits)!=0&&(a.m_categoryBits&b.m_maskBits)!=0;return c},initialize:function(){}};N.b2_defaultFilter=new N;var O=f.create();O.prototype={initialize:function(a,b,c,d){var e=0;this.m_bodyCapacity=a;this.m_contactCapacity=b;this.m_jointCapacity=c;this.m_bodyCount=0;this.m_contactCount=0;this.m_jointCount=0;this.m_bodies=new Array(a);for(e=0;e<a;e++)this.m_bodies[e]=null;this.m_contacts=new Array(b);for(e=0;e<b;e++)this.m_contacts[e]=null;this.m_joints=new Array(c);for(e=0;e<c;e++)this.m_joints[e]=null;this.m_allocator=d},Clear:function(){this.m_bodyCount=0;this.m_contactCount=0;this.m_jointCount=0},Solve:function(a,b){var c=0;var d;for(c=0;c<this.m_bodyCount;++c){d=this.m_bodies[c];if(d.m_invMass==0)continue;d.m_linearVelocity.Add(k.MulFV(a.dt,k.AddVV(b,k.MulFV(d.m_invMass,d.m_force))));d.m_angularVelocity+=a.dt*d.m_invI*d.m_torque;d.m_linearVelocity.Multiply(d.m_linearDamping);d.m_angularVelocity*=d.m_angularDamping;d.m_position0.SetV(d.m_position);d.m_rotation0=d.m_rotation}var e=new V(this.m_contacts,this.m_contactCount,this.m_allocator);e.PreSolve();for(c=0;c<this.m_jointCount;++c){this.m_joints[c].PrepareVelocitySolver()}for(c=0;c<a.iterations;++c){e.SolveVelocityConstraints();for(var f=0;f<this.m_jointCount;++f){this.m_joints[f].SolveVelocityConstraints(a)}}for(c=0;c<this.m_bodyCount;++c){d=this.m_bodies[c];if(d.m_invMass==0)continue;d.m_position.x+=a.dt*d.m_linearVelocity.x;d.m_position.y+=a.dt*d.m_linearVelocity.y;d.m_rotation+=a.dt*d.m_angularVelocity;d.m_R.Set(d.m_rotation)}for(c=0;c<this.m_jointCount;++c){this.m_joints[c].PreparePositionSolver()}if(bb.s_enablePositionCorrection){for(O.m_positionIterationCount=0;O.m_positionIterationCount<a.iterations;++O.m_positionIterationCount){var h=e.SolvePositionConstraints(g.b2_contactBaumgarte);var i=true;for(c=0;c<this.m_jointCount;++c){var j=this.m_joints[c].SolvePositionConstraints();i=i&&j}if(h&&i){break}}}e.PostSolve();for(c=0;c<this.m_bodyCount;++c){d=this.m_bodies[c];if(d.m_invMass==0)continue;d.m_R.Set(d.m_rotation);d.SynchronizeShapes();d.m_force.Set(0,0);d.m_torque=0}},UpdateSleep:function(a){var b=0;var c;var d=Number.MAX_VALUE;var e=g.b2_linearSleepTolerance*g.b2_linearSleepTolerance;var f=g.b2_angularSleepTolerance*g.b2_angularSleepTolerance;for(b=0;b<this.m_bodyCount;++b){c=this.m_bodies[b];if(c.m_invMass==0){continue}if((c.m_flags&L.e_allowSleepFlag)==0){c.m_sleepTime=0;d=0}if((c.m_flags&L.e_allowSleepFlag)==0||c.m_angularVelocity*c.m_angularVelocity>f||k.b2Dot(c.m_linearVelocity,c.m_linearVelocity)>e){c.m_sleepTime=0;d=0}else{c.m_sleepTime+=a;d=k.b2Min(d,c.m_sleepTime)}}if(d>=g.b2_timeToSleep){for(b=0;b<this.m_bodyCount;++b){c=this.m_bodies[b];c.m_flags|=L.e_sleepFlag}}},AddBody:function(a){this.m_bodies[this.m_bodyCount++]=a},AddContact:function(a){this.m_contacts[this.m_contactCount++]=a},AddJoint:function(a){this.m_joints[this.m_jointCount++]=a},m_allocator:null,m_bodies:null,m_contacts:null,m_joints:null,m_bodyCount:0,m_jointCount:0,m_contactCount:0,m_bodyCapacity:0,m_contactCapacity:0,m_jointCapacity:0,m_positionError:null};O.m_positionIterationCount=0;var P=f.create();P.prototype={dt:null,inv_dt:null,iterations:0,initialize:function(){}};var Q=f.create();Q.prototype={other:null,contact:null,prev:null,next:null,initialize:function(){}};var R=f.create();R.prototype={GetManifolds:function(){return null},GetManifoldCount:function(){return this.m_manifoldCount},GetNext:function(){return this.m_next},GetShape1:function(){return this.m_shape1},GetShape2:function(){return this.m_shape2},initialize:function(a,b){this.m_node1=new Q;this.m_node2=new Q;this.m_flags=0;if(!a||!b){this.m_shape1=null;this.m_shape2=null;return}this.m_shape1=a;this.m_shape2=b;this.m_manifoldCount=0;this.m_friction=Math.sqrt(this.m_shape1.m_friction*this.m_shape2.m_friction);this.m_restitution=k.b2Max(this.m_shape1.m_restitution,this.m_shape2.m_restitution);this.m_prev=null;this.m_next=null;this.m_node1.contact=null;this.m_node1.prev=null;this.m_node1.next=null;this.m_node1.other=null;this.m_node2.contact=null;this.m_node2.prev=null;this.m_node2.next=null;this.m_node2.other=null},Evaluate:function(){},m_flags:0,m_prev:null,m_next:null,m_node1:new Q,m_node2:new Q,m_shape1:null,m_shape2:null,m_manifoldCount:0,m_friction:null,m_restitution:null};R.e_islandFlag=1;R.e_destroyFlag=2;R.AddType=function(a,b,c,d){R.s_registers[c][d].createFcn=a;R.s_registers[c][d].destroyFcn=b;R.s_registers[c][d].primary=true;if(c!=d){R.s_registers[d][c].createFcn=a;R.s_registers[d][c].destroyFcn=b;R.s_registers[d][c].primary=false}};R.InitializeRegisters=function(){R.s_registers=new Array(D.e_shapeTypeCount);for(var a=0;a<D.e_shapeTypeCount;a++){R.s_registers[a]=new Array(D.e_shapeTypeCount);for(var b=0;b<D.e_shapeTypeCount;b++){R.s_registers[a][b]=new U}}R.AddType(W.Create,W.Destroy,D.e_circleShape,D.e_circleShape);R.AddType(Z.Create,Z.Destroy,D.e_polyShape,D.e_circleShape);R.AddType(_.Create,_.Destroy,D.e_polyShape,D.e_polyShape)};R.Create=function(a,b,c){if(R.s_initialized==false){R.InitializeRegisters();R.s_initialized=true}var d=a.m_type;var e=b.m_type;var f=R.s_registers[d][e].createFcn;if(f){if(R.s_registers[d][e].primary){return f(a,b,c)}else{var g=f(b,a,c);for(var h=0;h<g.GetManifoldCount();++h){var i=g.GetManifolds()[h];i.normal=i.normal.Negative()}return g}}else{return null}};R.Destroy=function(a,b){if(a.GetManifoldCount()>0){a.m_shape1.m_body.WakeUp();a.m_shape2.m_body.WakeUp()}var c=a.m_shape1.m_type;var d=a.m_shape2.m_type;var e=R.s_registers[c][d].destroyFcn;e(a,b)};R.s_registers=null;R.s_initialized=false;var S=f.create();S.prototype={initialize:function(){this.normal=new h;this.points=new Array(g.b2_maxManifoldPoints);for(var a=0;a<g.b2_maxManifoldPoints;a++){this.points[a]=new T}},points:null,normal:new h,manifold:null,body1:null,body2:null,friction:null,restitution:null,pointCount:0};var T=f.create();T.prototype={localAnchor1:new h,localAnchor2:new h,normalImpulse:null,tangentImpulse:null,positionImpulse:null,normalMass:null,tangentMass:null,separation:null,velocityBias:null,initialize:function(){this.localAnchor1=new h;this.localAnchor2=new h}};var U=f.create();U.prototype={createFcn:null,destroyFcn:null,primary:null,initialize:function(){}};var V=f.create();V.prototype={initialize:function(a,b,c){this.m_constraints=new Array;this.m_allocator=c;var d=0;var e;var f;this.m_constraintCount=0;for(d=0;d<b;++d){this.m_constraintCount+=a[d].GetManifoldCount()}for(d=0;d<this.m_constraintCount;d++){this.m_constraints[d]=new S}var h=0;for(d=0;d<b;++d){var i=a[d];var j=i.m_shape1.m_body;var k=i.m_shape2.m_body;var l=i.GetManifoldCount();var m=i.GetManifolds();var n=i.m_friction;var o=i.m_restitution;var p=j.m_linearVelocity.x;var q=j.m_linearVelocity.y;var r=k.m_linearVelocity.x;var s=k.m_linearVelocity.y;var t=j.m_angularVelocity;var u=k.m_angularVelocity;for(var v=0;v<l;++v){var w=m[v];var x=w.normal.x;var y=w.normal.y;var z=this.m_constraints[h];z.body1=j;z.body2=k;z.manifold=w;z.normal.x=x;z.normal.y=y;z.pointCount=w.pointCount;z.friction=n;z.restitution=o;for(var A=0;A<z.pointCount;++A){var B=w.points[A];var C=z.points[A];C.normalImpulse=B.normalImpulse;C.tangentImpulse=B.tangentImpulse;C.separation=B.separation;var D=B.position.x-j.m_position.x;var E=B.position.y-j.m_position.y;var F=B.position.x-k.m_position.x;var G=B.position.y-k.m_position.y;e=C.localAnchor1;f=j.m_R;e.x=D*f.col1.x+E*f.col1.y;e.y=D*f.col2.x+E*f.col2.y;e=C.localAnchor2;f=k.m_R;e.x=F*f.col1.x+G*f.col1.y;e.y=F*f.col2.x+G*f.col2.y;var H=D*D+E*E;var I=F*F+G*G;var J=D*x+E*y;var K=F*x+G*y;var L=j.m_invMass+k.m_invMass;L+=j.m_invI*(H-J*J)+k.m_invI*(I-K*K);C.normalMass=1/L;var M=y;var N=-x;var O=D*M+E*N;var P=F*M+G*N;var Q=j.m_invMass+k.m_invMass;Q+=j.m_invI*(H-O*O)+k.m_invI*(I-P*P);C.tangentMass=1/Q;C.velocityBias=0;if(C.separation>0){C.velocityBias=-60*C.separation}var R=r+ -u*G-p- -t*E;var T=s+u*F-q-t*D;var U=z.normal.x*R+z.normal.y*T;if(U<-g.b2_velocityThreshold){C.velocityBias+=-z.restitution*U}}++h}}},PreSolve:function(){var a;var b;var c;for(var d=0;d<this.m_constraintCount;++d){var e=this.m_constraints[d];var f=e.body1;var g=e.body2;var h=f.m_invMass;var i=f.m_invI;var j=g.m_invMass;var k=g.m_invI;var l=e.normal.x;var m=e.normal.y;var n=m;var o=-l;var p=0;var q=0;if(bb.s_enableWarmStarting){q=e.pointCount;for(p=0;p<q;++p){var r=e.points[p];var s=r.normalImpulse*l+r.tangentImpulse*n;var t=r.normalImpulse*m+r.tangentImpulse*o;c=f.m_R;a=r.localAnchor1;var u=c.col1.x*a.x+c.col2.x*a.y;var v=c.col1.y*a.x+c.col2.y*a.y;c=g.m_R;a=r.localAnchor2;var w=c.col1.x*a.x+c.col2.x*a.y;var x=c.col1.y*a.x+c.col2.y*a.y;f.m_angularVelocity-=i*(u*t-v*s);f.m_linearVelocity.x-=h*s;f.m_linearVelocity.y-=h*t;g.m_angularVelocity+=k*(w*t-x*s);g.m_linearVelocity.x+=j*s;g.m_linearVelocity.y+=j*t;r.positionImpulse=0}}else{q=e.pointCount;for(p=0;p<q;++p){var y=e.points[p];y.normalImpulse=0;y.tangentImpulse=0;y.positionImpulse=0}}}},SolveVelocityConstraints:function(){var a=0;var b;var c;var d;var e;var f;var g;var h;var i;var j;var l;var m;var n;var o;for(var p=0;p<this.m_constraintCount;++p){var q=this.m_constraints[p];var r=q.body1;var s=q.body2;var t=r.m_angularVelocity;var u=r.m_linearVelocity;var v=s.m_angularVelocity;var w=s.m_linearVelocity;var x=r.m_invMass;var y=r.m_invI;var z=s.m_invMass;var A=s.m_invI;var B=q.normal.x;var C=q.normal.y;var D=C;var E=-B;var F=q.pointCount;for(a=0;a<F;++a){b=q.points[a];n=r.m_R;o=b.localAnchor1;c=n.col1.x*o.x+n.col2.x*o.y;d=n.col1.y*o.x+n.col2.y*o.y;n=s.m_R;o=b.localAnchor2;e=n.col1.x*o.x+n.col2.x*o.y;f=n.col1.y*o.x+n.col2.y*o.y;g=w.x+ -v*f-u.x- -t*d;h=w.y+v*e-u.y-t*c;var G=g*B+h*C;i=-b.normalMass*(G-b.velocityBias);j=k.b2Max(b.normalImpulse+i,0);i=j-b.normalImpulse;l=i*B;m=i*C;u.x-=x*l;u.y-=x*m;t-=y*(c*m-d*l);w.x+=z*l;w.y+=z*m;v+=A*(e*m-f*l);b.normalImpulse=j;g=w.x+ -v*f-u.x- -t*d;h=w.y+v*e-u.y-t*c;var H=g*D+h*E;i=b.tangentMass*-H;var I=q.friction*b.normalImpulse;j=k.b2Clamp(b.tangentImpulse+i,-I,I);i=j-b.tangentImpulse;l=i*D;m=i*E;u.x-=x*l;u.y-=x*m;t-=y*(c*m-d*l);w.x+=z*l;w.y+=z*m;v+=A*(e*m-f*l);b.tangentImpulse=j}r.m_angularVelocity=t;s.m_angularVelocity=v}},SolvePositionConstraints:function(a){var b=0;var c;var d;for(var e=0;e<this.m_constraintCount;++e){var f=this.m_constraints[e];var h=f.body1;var i=f.body2;var j=h.m_position;var l=h.m_rotation;var m=i.m_position;var n=i.m_rotation;var o=h.m_invMass;var p=h.m_invI;var q=i.m_invMass;var r=i.m_invI;var s=f.normal.x;var t=f.normal.y;var u=t;var v=-s;var w=f.pointCount;for(var x=0;x<w;++x){var y=f.points[x];c=h.m_R;d=y.localAnchor1;var z=c.col1.x*d.x+c.col2.x*d.y;var A=c.col1.y*d.x+c.col2.y*d.y;c=i.m_R;d=y.localAnchor2;var B=c.col1.x*d.x+c.col2.x*d.y;var C=c.col1.y*d.x+c.col2.y*d.y;var D=j.x+z;var E=j.y+A;var F=m.x+B;var G=m.y+C;var H=F-D;var I=G-E;var J=H*s+I*t+y.separation;b=k.b2Min(b,J);var K=a*k.b2Clamp(J+g.b2_linearSlop,-g.b2_maxLinearCorrection,0);var L=-y.normalMass*K;var M=y.positionImpulse;y.positionImpulse=k.b2Max(M+L,0);L=y.positionImpulse-M;var N=L*s;var O=L*t;j.x-=o*N;j.y-=o*O;l-=p*(z*O-A*N);h.m_R.Set(l);m.x+=q*N;m.y+=q*O;n+=r*(B*O-C*N);i.m_R.Set(n)}h.m_rotation=l;i.m_rotation=n}return b>=-g.b2_linearSlop},PostSolve:function(){for(var a=0;a<this.m_constraintCount;++a){var b=this.m_constraints[a];var c=b.manifold;for(var d=0;d<b.pointCount;++d){var e=c.points[d];var f=b.points[d];e.normalImpulse=f.normalImpulse;e.tangentImpulse=f.tangentImpulse}}},m_allocator:null,m_constraints:new Array,m_constraintCount:0};var W=f.create();Object.extend(W.prototype,R.prototype);Object.extend(W.prototype,{initialize:function(a,b){this.m_node1=new Q;this.m_node2=new Q;this.m_flags=0;if(!a||!b){this.m_shape1=null;this.m_shape2=null;return}this.m_shape1=a;this.m_shape2=b;this.m_manifoldCount=0;this.m_friction=Math.sqrt(this.m_shape1.m_friction*this.m_shape2.m_friction);this.m_restitution=k.b2Max(this.m_shape1.m_restitution,this.m_shape2.m_restitution);this.m_prev=null;this.m_next=null;this.m_node1.contact=null;this.m_node1.prev=null;this.m_node1.next=null;this.m_node1.other=null;this.m_node2.contact=null;this.m_node2.prev=null;this.m_node2.next=null;this.m_node2.other=null;this.m_manifold=[new z];this.m_manifold[0].pointCount=0;this.m_manifold[0].points[0].normalImpulse=0;this.m_manifold[0].points[0].tangentImpulse=0},Evaluate:function(){t.b2CollideCircle(this.m_manifold[0],this.m_shape1,this.m_shape2,false);if(this.m_manifold[0].pointCount>0){this.m_manifoldCount=1}else{this.m_manifoldCount=0}},GetManifolds:function(){return this.m_manifold},m_manifold:[new z]});W.Create=function(a,b,c){return new W(a,b)};W.Destroy=function(a,b){};var X=f.create();X.prototype={initialize:function(){}};X.R1=new j;X.R2=new j;X.x1=new h;X.x2=new h;X.Conservative=function(a,b){var c=a.GetBody();var e=b.GetBody();var f=c.m_position.x-c.m_position0.x;var h=c.m_position.y-c.m_position0.y;var i=c.m_rotation-c.m_rotation0;var j=e.m_position.x-e.m_position0.x;var k=e.m_position.y-e.m_position0.y;var l=e.m_rotation-e.m_rotation0;var m=a.GetMaxRadius();var n=b.GetMaxRadius();var o=c.m_position0.x;var p=c.m_position0.y;var q=c.m_rotation0;var r=e.m_position0.x;var s=e.m_position0.y;var t=e.m_rotation0;var u=o;var v=p;var w=q;var x=r;var z=s;var A=t;X.R1.Set(w);X.R2.Set(A);a.QuickSync(p1,X.R1);b.QuickSync(p2,X.R2);var B=0;var C=10;var D;var E;var F=0;var G=true;for(var H=0;H<C;++H){var I=y.Distance(X.x1,X.x2,a,b);if(I<g.b2_linearSlop){if(H==0){G=false}else{G=true}break}if(H==0){D=X.x2.x-X.x1.x;E=X.x2.y-X.x1.y;var J=Math.sqrt(D*D+E*E);var K=D*(f-j)+E*(h-k)+Math.abs(i)*m+Math.abs(l)*n;if(Math.abs(K)<Number.MIN_VALUE){G=false;break}F=1/K}var L=I*F;var M=B+L;if(M<0||1<M){G=false;break}if(M<(1+100*Number.MIN_VALUE)*B){G=true;break}B=M;u=o+B*v1.x;v=p+B*v1.y;w=q+B*i;x=r+B*v2.x;z=s+B*v2.y;A=t+B*l;X.R1.Set(w);X.R2.Set(A);a.QuickSync(p1,X.R1);b.QuickSync(p2,X.R2)}if(G){D=X.x2.x-X.x1.x;E=X.x2.y-X.x1.y;var N=Math.sqrt(D*D+E*E);if(N>FLT_EPSILON){d*=b2_linearSlop/N}if(c.IsStatic()){c.m_position.x=u;c.m_position.y=v}else{c.m_position.x=u-D;c.m_position.y=v-E}c.m_rotation=w;c.m_R.Set(w);c.QuickSyncShapes();if(e.IsStatic()){e.m_position.x=x;e.m_position.y=z}else{e.m_position.x=x+D;e.m_position.y=z+E}e.m_position.x=x+D;e.m_position.y=z+E;e.m_rotation=A;e.m_R.Set(A);e.QuickSyncShapes();return true}a.QuickSync(c.m_position,c.m_R);b.QuickSync(e.m_position,e.m_R);return false};var Y=f.create();Object.extend(Y.prototype,R.prototype);Object.extend(Y.prototype,{initialize:function(a,b){this.m_node1=new Q;this.m_node2=new Q;this.m_flags=0;if(!a||!b){this.m_shape1=null;this.m_shape2=null;return}this.m_shape1=a;this.m_shape2=b;this.m_manifoldCount=0;this.m_friction=Math.sqrt(this.m_shape1.m_friction*this.m_shape2.m_friction);this.m_restitution=k.b2Max(this.m_shape1.m_restitution,this.m_shape2.m_restitution);this.m_prev=null;this.m_next=null;this.m_node1.contact=null;this.m_node1.prev=null;this.m_node1.next=null;this.m_node1.other=null;this.m_node2.contact=null;this.m_node2.prev=null;this.m_node2.next=null;this.m_node2.other=null},Evaluate:function(){},GetManifolds:function(){return null}});var Z=f.create();Object.extend(Z.prototype,R.prototype);Object.extend(Z.prototype,{initialize:function(a,b){this.m_node1=new Q;this.m_node2=new Q;this.m_flags=0;if(!a||!b){this.m_shape1=null;this.m_shape2=null;return}this.m_shape1=a;this.m_shape2=b;this.m_manifoldCount=0;this.m_friction=Math.sqrt(this.m_shape1.m_friction*this.m_shape2.m_friction);this.m_restitution=k.b2Max(this.m_shape1.m_restitution,this.m_shape2.m_restitution);this.m_prev=null;this.m_next=null;this.m_node1.contact=null;this.m_node1.prev=null;this.m_node1.next=null;this.m_node1.other=null;this.m_node2.contact=null;this.m_node2.prev=null;this.m_node2.next=null;this.m_node2.other=null;this.m_manifold=[new z];g.b2Assert(this.m_shape1.m_type==D.e_polyShape);g.b2Assert(this.m_shape2.m_type==D.e_circleShape);this.m_manifold[0].pointCount=0;this.m_manifold[0].points[0].normalImpulse=0;this.m_manifold[0].points[0].tangentImpulse=0},Evaluate:function(){t.b2CollidePolyAndCircle(this.m_manifold[0],this.m_shape1,this.m_shape2,false);if(this.m_manifold[0].pointCount>0){this.m_manifoldCount=1}else{this.m_manifoldCount=0}},GetManifolds:function(){return this.m_manifold},m_manifold:[new z]});Z.Create=function(a,b,c){return new Z(a,b)};Z.Destroy=function(a,b){};var _=f.create();Object.extend(_.prototype,R.prototype);Object.extend(_.prototype,{initialize:function(a,b){this.m_node1=new Q;this.m_node2=new Q;this.m_flags=0;if(!a||!b){this.m_shape1=null;this.m_shape2=null;return}this.m_shape1=a;this.m_shape2=b;this.m_manifoldCount=0;this.m_friction=Math.sqrt(this.m_shape1.m_friction*this.m_shape2.m_friction);this.m_restitution=k.b2Max(this.m_shape1.m_restitution,this.m_shape2.m_restitution);this.m_prev=null;this.m_next=null;this.m_node1.contact=null;this.m_node1.prev=null;this.m_node1.next=null;this.m_node1.other=null;this.m_node2.contact=null;this.m_node2.prev=null;this.m_node2.next=null;this.m_node2.other=null;this.m0=new z;this.m_manifold=[new z];this.m_manifold[0].pointCount=0},m0:new z,Evaluate:function(){var a=this.m_manifold[0];var b=this.m0.points;for(var c=0;c<a.pointCount;c++){var d=b[c];var e=a.points[c];d.normalImpulse=e.normalImpulse;d.tangentImpulse=e.tangentImpulse;d.id=e.id.Copy()}this.m0.pointCount=a.pointCount;t.b2CollidePoly(a,this.m_shape1,this.m_shape2,false);if(a.pointCount>0){var f=[false,false];for(var g=0;g<a.pointCount;++g){var h=a.points[g];h.normalImpulse=0;h.tangentImpulse=0;var i=h.id.key;for(var j=0;j<this.m0.pointCount;++j){if(f[j]==true)continue;var k=this.m0.points[j];var l=k.id;if(l.key==i){f[j]=true;h.normalImpulse=k.normalImpulse;h.tangentImpulse=k.tangentImpulse;break}}}this.m_manifoldCount=1}else{this.m_manifoldCount=0}},GetManifolds:function(){return this.m_manifold},m_manifold:[new z]});_.Create=function(a,b,c){return new _(a,b)};_.Destroy=function(a,b){};var ba=f.create();Object.extend(ba.prototype,p.prototype);Object.extend(ba.prototype,{initialize:function(){this.m_nullContact=new Y;this.m_world=null;this.m_destroyImmediate=false},PairAdded:function(a,b){var c=a;var d=b;var e=c.m_body;var f=d.m_body;if(e.IsStatic()&&f.IsStatic()){return this.m_nullContact}if(c.m_body==d.m_body){return this.m_nullContact}if(f.IsConnected(e)){return this.m_nullContact}if(this.m_world.m_filter!=null&&this.m_world.m_filter.ShouldCollide(c,d)==false){return this.m_nullContact}if(f.m_invMass==0){var g=c;c=d;d=g;var h=e;e=f;f=h}var i=R.Create(c,d,this.m_world.m_blockAllocator);if(i==null){return this.m_nullContact}else{i.m_prev=null;i.m_next=this.m_world.m_contactList;if(this.m_world.m_contactList!=null){this.m_world.m_contactList.m_prev=i}this.m_world.m_contactList=i;this.m_world.m_contactCount++}return i},PairRemoved:function(a,b,c){if(c==null){return}var d=c;if(d!=this.m_nullContact){if(this.m_destroyImmediate==true){this.DestroyContact(d);d=null}else{d.m_flags|=R.e_destroyFlag}}},DestroyContact:function(a){if(a.m_prev){a.m_prev.m_next=a.m_next}if(a.m_next){a.m_next.m_prev=a.m_prev}if(a==this.m_world.m_contactList){this.m_world.m_contactList=a.m_next}if(a.GetManifoldCount()>0){var b=a.m_shape1.m_body;var c=a.m_shape2.m_body;var d=a.m_node1;var e=a.m_node2;b.WakeUp();c.WakeUp();if(d.prev){d.prev.next=d.next}if(d.next){d.next.prev=d.prev}if(d==b.m_contactList){b.m_contactList=d.next}d.prev=null;d.next=null;if(e.prev){e.prev.next=e.next}if(e.next){e.next.prev=e.prev}if(e==c.m_contactList){c.m_contactList=e.next}e.prev=null;e.next=null}R.Destroy(a,this.m_world.m_blockAllocator);--this.m_world.m_contactCount},CleanContactList:function(){var a=this.m_world.m_contactList;while(a!=null){var b=a;a=a.m_next;if(b.m_flags&R.e_destroyFlag){this.DestroyContact(b);b=null}}},Collide:function(){var a;var b;var c;var d;for(var e=this.m_world.m_contactList;e!=null;e=e.m_next){if(e.m_shape1.m_body.IsSleeping()&&e.m_shape2.m_body.IsSleeping()){continue}var f=e.GetManifoldCount();e.Evaluate();var g=e.GetManifoldCount();if(f==0&&g>0){a=e.m_shape1.m_body;b=e.m_shape2.m_body;c=e.m_node1;d=e.m_node2;c.contact=e;c.other=b;c.prev=null;c.next=a.m_contactList;if(c.next!=null){c.next.prev=e.m_node1}a.m_contactList=e.m_node1;d.contact=e;d.other=a;d.prev=null;d.next=b.m_contactList;if(d.next!=null){d.next.prev=d}b.m_contactList=d}else if(f>0&&g==0){a=e.m_shape1.m_body;b=e.m_shape2.m_body;c=e.m_node1;d=e.m_node2;if(c.prev){c.prev.next=c.next}if(c.next){c.next.prev=c.prev}if(c==a.m_contactList){a.m_contactList=c.next}c.prev=null;c.next=null;if(d.prev){d.prev.next=d.next}if(d.next){d.next.prev=d.prev}if(d==b.m_contactList){b.m_contactList=d.next}d.prev=null;d.next=null}}},m_world:null,m_nullContact:new Y,m_destroyImmediate:null});var bb=f.create();bb.prototype={initialize:function(a,b,c){this.step=new P;this.m_contactManager=new ba;this.m_listener=null;this.m_filter=N.b2_defaultFilter;this.m_bodyList=null;this.m_contactList=null;this.m_jointList=null;this.m_bodyCount=0;this.m_contactCount=0;this.m_jointCount=0;this.m_bodyDestroyList=null;this.m_allowSleep=c;this.m_gravity=b;this.m_contactManager.m_world=this;this.m_broadPhase=new s(a,this.m_contactManager);var d=new M;this.m_groundBody=this.CreateBody(d)},SetListener:function(a){this.m_listener=a},SetFilter:function(a){this.m_filter=a},CreateBody:function(a){var b=new L(a,this);b.m_prev=null;b.m_next=this.m_bodyList;if(this.m_bodyList){this.m_bodyList.m_prev=b}this.m_bodyList=b;++this.m_bodyCount;return b},DestroyBody:function(a){if(a.m_flags&L.e_destroyFlag){return}if(a.m_prev){a.m_prev.m_next=a.m_next}if(a.m_next){a.m_next.m_prev=a.m_prev}if(a==this.m_bodyList){this.m_bodyList=a.m_next}a.m_flags|=L.e_destroyFlag;--this.m_bodyCount;a.m_prev=null;a.m_next=this.m_bodyDestroyList;this.m_bodyDestroyList=a},CleanBodyList:function(){this.m_contactManager.m_destroyImmediate=true;var a=this.m_bodyDestroyList;while(a){var b=a;a=a.m_next;var c=b.m_jointList;while(c){var d=c;c=c.next;if(this.m_listener){this.m_listener.NotifyJointDestroyed(d.joint)}this.DestroyJoint(d.joint)}b.Destroy()}this.m_bodyDestroyList=null;this.m_contactManager.m_destroyImmediate=false},CreateJoint:function(a){var b=be.Create(a,this.m_blockAllocator);b.m_prev=null;b.m_next=this.m_jointList;if(this.m_jointList){this.m_jointList.m_prev=b}this.m_jointList=b;++this.m_jointCount;b.m_node1.joint=b;b.m_node1.other=b.m_body2;b.m_node1.prev=null;b.m_node1.next=b.m_body1.m_jointList;if(b.m_body1.m_jointList)b.m_body1.m_jointList.prev=b.m_node1;b.m_body1.m_jointList=b.m_node1;b.m_node2.joint=b;b.m_node2.other=b.m_body1;b.m_node2.prev=null;b.m_node2.next=b.m_body2.m_jointList;if(b.m_body2.m_jointList)b.m_body2.m_jointList.prev=b.m_node2;b.m_body2.m_jointList=b.m_node2;if(a.collideConnected==false){var c=a.body1.m_shapeCount<a.body2.m_shapeCount?a.body1:a.body2;for(var d=c.m_shapeList;d;d=d.m_next){d.ResetProxy(this.m_broadPhase)}}return b},DestroyJoint:function(a){var b=a.m_collideConnected;if(a.m_prev){a.m_prev.m_next=a.m_next}if(a.m_next){a.m_next.m_prev=a.m_prev}if(a==this.m_jointList){this.m_jointList=a.m_next}var c=a.m_body1;var d=a.m_body2;c.WakeUp();d.WakeUp();if(a.m_node1.prev){a.m_node1.prev.next=a.m_node1.next}if(a.m_node1.next){a.m_node1.next.prev=a.m_node1.prev}if(a.m_node1==c.m_jointList){c.m_jointList=a.m_node1.next}a.m_node1.prev=null;a.m_node1.next=null;if(a.m_node2.prev){a.m_node2.prev.next=a.m_node2.next}if(a.m_node2.next){a.m_node2.next.prev=a.m_node2.prev}if(a.m_node2==d.m_jointList){d.m_jointList=a.m_node2.next}a.m_node2.prev=null;a.m_node2.next=null;be.Destroy(a,this.m_blockAllocator);--this.m_jointCount;if(b==false){var e=c.m_shapeCount<d.m_shapeCount?c:d;for(var f=e.m_shapeList;f;f=f.m_next){f.ResetProxy(this.m_broadPhase)}}},GetGroundBody:function(){return this.m_groundBody},step:new P,Step:function(a,b){var c;var d;this.step.dt=a;this.step.iterations=b;if(a>0){this.step.inv_dt=1/a}else{this.step.inv_dt=0}this.m_positionIterationCount=0;this.m_contactManager.CleanContactList();this.CleanBodyList();this.m_contactManager.Collide();var e=new O(this.m_bodyCount,this.m_contactCount,this.m_jointCount,this.m_stackAllocator);for(c=this.m_bodyList;c!=null;c=c.m_next){c.m_flags&=~L.e_islandFlag}for(var f=this.m_contactList;f!=null;f=f.m_next){f.m_flags&=~R.e_islandFlag}for(var g=this.m_jointList;g!=null;g=g.m_next){g.m_islandFlag=false}var h=this.m_bodyCount;var i=new Array(this.m_bodyCount);for(var j=0;j<this.m_bodyCount;j++)i[j]=null;for(var l=this.m_bodyList;l!=null;l=l.m_next){if(l.m_flags&(L.e_staticFlag|L.e_islandFlag|L.e_sleepFlag|L.e_frozenFlag)){continue}e.Clear();var m=0;i[m++]=l;l.m_flags|=L.e_islandFlag;while(m>0){c=i[--m];e.AddBody(c);c.m_flags&=~L.e_sleepFlag;if(c.m_flags&L.e_staticFlag){continue}for(var n=c.m_contactList;n!=null;n=n.next){if(n.contact.m_flags&R.e_islandFlag){continue}e.AddContact(n.contact);n.contact.m_flags|=R.e_islandFlag;d=n.other;if(d.m_flags&L.e_islandFlag){continue}i[m++]=d;d.m_flags|=L.e_islandFlag}for(var o=c.m_jointList;o!=null;o=o.next){if(o.joint.m_islandFlag==true){continue}e.AddJoint(o.joint);o.joint.m_islandFlag=true;d=o.other;if(d.m_flags&L.e_islandFlag){continue}i[m++]=d;d.m_flags|=L.e_islandFlag}}e.Solve(this.step,this.m_gravity);this.m_positionIterationCount=k.b2Max(this.m_positionIterationCount,O.m_positionIterationCount);if(this.m_allowSleep){e.UpdateSleep(a)}for(var p=0;p<e.m_bodyCount;++p){c=e.m_bodies[p];if(c.m_flags&L.e_staticFlag){c.m_flags&=~L.e_islandFlag}if(c.IsFrozen()&&this.m_listener){var q=this.m_listener.NotifyBoundaryViolated(c);if(q==bc.b2_destroyBody){this.DestroyBody(c);c=null;e.m_bodies[p]=null}}}}this.m_broadPhase.Commit()},Query:function(a,b,c){var d=new Array;var e=this.m_broadPhase.QueryAABB(a,d,c);for(var f=0;f<e;++f){b[f]=d[f]}return e},GetBodyList:function(){return this.m_bodyList},GetJointList:function(){return this.m_jointList},GetContactList:function(){return this.m_contactList},m_blockAllocator:null,m_stackAllocator:null,m_broadPhase:null,m_contactManager:new ba,m_bodyList:null,m_contactList:null,m_jointList:null,m_bodyCount:0,m_contactCount:0,m_jointCount:0,m_bodyDestroyList:null,m_gravity:null,m_allowSleep:null,m_groundBody:null,m_listener:null,m_filter:null,m_positionIterationCount:0};bb.s_enablePositionCorrection=1;bb.s_enableWarmStarting=1;var bc=f.create();bc.prototype={NotifyJointDestroyed:function(a){},NotifyBoundaryViolated:function(a){return bc.b2_freezeBody},initialize:function(){}};bc.b2_freezeBody=0;bc.b2_destroyBody=1;var bd=f.create();bd.prototype={other:null,joint:null,prev:null,next:null,initialize:function(){}};var be=f.create();be.prototype={GetType:function(){return this.m_type},GetAnchor1:function(){return null},GetAnchor2:function(){return null},GetReactionForce:function(a){return null},GetReactionTorque:function(a){return 0},GetBody1:function(){return this.m_body1},GetBody2:function(){return this.m_body2},GetNext:function(){return this.m_next},GetUserData:function(){return this.m_userData},initialize:function(a){this.m_node1=new bd;this.m_node2=new bd;this.m_type=a.type;this.m_prev=null;this.m_next=null;this.m_body1=a.body1;this.m_body2=a.body2;this.m_collideConnected=a.collideConnected;this.m_islandFlag=false;this.m_userData=a.userData},PrepareVelocitySolver:function(){},SolveVelocityConstraints:function(a){},PreparePositionSolver:function(){},SolvePositionConstraints:function(){return false},m_type:0,m_prev:null,m_next:null,m_node1:new bd,m_node2:new bd,m_body1:null,m_body2:null,m_islandFlag:null,m_collideConnected:null,m_userData:null};be.Create=function(a,b){var c=null;switch(a.type){case be.e_distanceJoint:{c=new bg(a)}break;case be.e_mouseJoint:{c=new bl(a)}break;case be.e_prismaticJoint:{c=new bn(a)}break;case be.e_revoluteJoint:{c=new br(a)}break;case be.e_pulleyJoint:{c=new bp(a)}break;case be.e_gearJoint:{c=new bj(a)}break;default:break}return c};be.Destroy=function(a,b){};be.e_unknownJoint=0;be.e_revoluteJoint=1;be.e_prismaticJoint=2;be.e_distanceJoint=3;be.e_pulleyJoint=4;be.e_mouseJoint=5;be.e_gearJoint=6;be.e_inactiveLimit=0;be.e_atLowerLimit=1;be.e_atUpperLimit=2;be.e_equalLimits=3;var bf=f.create();bf.prototype={initialize:function(){this.type=be.e_unknownJoint;this.userData=null;this.body1=null;this.body2=null;this.collideConnected=false},type:0,userData:null,body1:null,body2:null,collideConnected:null};var bg=f.create();Object.extend(bg.prototype,be.prototype);Object.extend(bg.prototype,{initialize:function(a){this.m_node1=new bd;this.m_node2=new bd;this.m_type=a.type;this.m_prev=null;this.m_next=null;this.m_body1=a.body1;this.m_body2=a.body2;this.m_collideConnected=a.collideConnected;this.m_islandFlag=false;this.m_userData=a.userData;this.m_localAnchor1=new h;this.m_localAnchor2=new h;this.m_u=new h;var b;var c;var d;b=this.m_body1.m_R;c=a.anchorPoint1.x-this.m_body1.m_position.x;d=a.anchorPoint1.y-this.m_body1.m_position.y;this.m_localAnchor1.x=c*b.col1.x+d*b.col1.y;this.m_localAnchor1.y=c*b.col2.x+d*b.col2.y;b=this.m_body2.m_R;c=a.anchorPoint2.x-this.m_body2.m_position.x;d=a.anchorPoint2.y-this.m_body2.m_position.y;this.m_localAnchor2.x=c*b.col1.x+d*b.col1.y;this.m_localAnchor2.y=c*b.col2.x+d*b.col2.y;c=a.anchorPoint2.x-a.anchorPoint1.x;d=a.anchorPoint2.y-a.anchorPoint1.y;this.m_length=Math.sqrt(c*c+d*d);this.m_impulse=0},PrepareVelocitySolver:function(){var a;a=this.m_body1.m_R;var b=a.col1.x*this.m_localAnchor1.x+a.col2.x*this.m_localAnchor1.y;var c=a.col1.y*this.m_localAnchor1.x+a.col2.y*this.m_localAnchor1.y;a=this.m_body2.m_R;var d=a.col1.x*this.m_localAnchor2.x+a.col2.x*this.m_localAnchor2.y;var e=a.col1.y*this.m_localAnchor2.x+a.col2.y*this.m_localAnchor2.y;this.m_u.x=this.m_body2.m_position.x+d-this.m_body1.m_position.x-b;this.m_u.y=this.m_body2.m_position.y+e-this.m_body1.m_position.y-c;var f=Math.sqrt(this.m_u.x*this.m_u.x+this.m_u.y*this.m_u.y);if(f>g.b2_linearSlop){this.m_u.Multiply(1/f)}else{this.m_u.SetZero()}var h=b*this.m_u.y-c*this.m_u.x;var i=d*this.m_u.y-e*this.m_u.x;this.m_mass=this.m_body1.m_invMass+this.m_body1.m_invI*h*h+this.m_body2.m_invMass+this.m_body2.m_invI*i*i;this.m_mass=1/this.m_mass;if(bb.s_enableWarmStarting){var j=this.m_impulse*this.m_u.x;var k=this.m_impulse*this.m_u.y;this.m_body1.m_linearVelocity.x-=this.m_body1.m_invMass*j;this.m_body1.m_linearVelocity.y-=this.m_body1.m_invMass*k;this.m_body1.m_angularVelocity-=this.m_body1.m_invI*(b*k-c*j);this.m_body2.m_linearVelocity.x+=this.m_body2.m_invMass*j;this.m_body2.m_linearVelocity.y+=this.m_body2.m_invMass*k;this.m_body2.m_angularVelocity+=this.m_body2.m_invI*(d*k-e*j)}else{this.m_impulse=0}},SolveVelocityConstraints:function(a){var b;b=this.m_body1.m_R;var c=b.col1.x*this.m_localAnchor1.x+b.col2.x*this.m_localAnchor1.y;var d=b.col1.y*this.m_localAnchor1.x+b.col2.y*this.m_localAnchor1.y;b=this.m_body2.m_R;var e=b.col1.x*this.m_localAnchor2.x+b.col2.x*this.m_localAnchor2.y;var f=b.col1.y*this.m_localAnchor2.x+b.col2.y*this.m_localAnchor2.y;var g=this.m_body1.m_linearVelocity.x+ -this.m_body1.m_angularVelocity*d;var h=this.m_body1.m_linearVelocity.y+this.m_body1.m_angularVelocity*c;var i=this.m_body2.m_linearVelocity.x+ -this.m_body2.m_angularVelocity*f;var j=this.m_body2.m_linearVelocity.y+this.m_body2.m_angularVelocity*e;var k=this.m_u.x*(i-g)+this.m_u.y*(j-h);var l=-this.m_mass*k;this.m_impulse+=l;var m=l*this.m_u.x;var n=l*this.m_u.y;this.m_body1.m_linearVelocity.x-=this.m_body1.m_invMass*m;this.m_body1.m_linearVelocity.y-=this.m_body1.m_invMass*n;this.m_body1.m_angularVelocity-=this.m_body1.m_invI*(c*n-d*m);this.m_body2.m_linearVelocity.x+=this.m_body2.m_invMass*m;this.m_body2.m_linearVelocity.y+=this.m_body2.m_invMass*n;this.m_body2.m_angularVelocity+=this.m_body2.m_invI*(e*n-f*m)},SolvePositionConstraints:function(){var a;a=this.m_body1.m_R;var b=a.col1.x*this.m_localAnchor1.x+a.col2.x*this.m_localAnchor1.y;var c=a.col1.y*this.m_localAnchor1.x+a.col2.y*this.m_localAnchor1.y;a=this.m_body2.m_R;var d=a.col1.x*this.m_localAnchor2.x+a.col2.x*this.m_localAnchor2.y;var e=a.col1.y*this.m_localAnchor2.x+a.col2.y*this.m_localAnchor2.y;var f=this.m_body2.m_position.x+d-this.m_body1.m_position.x-b;var h=this.m_body2.m_position.y+e-this.m_body1.m_position.y-c;var i=Math.sqrt(f*f+h*h);f/=i;h/=i;var j=i-this.m_length;j=k.b2Clamp(j,-g.b2_maxLinearCorrection,g.b2_maxLinearCorrection);var l=-this.m_mass*j;this.m_u.Set(f,h);var m=l*this.m_u.x;var n=l*this.m_u.y;this.m_body1.m_position.x-=this.m_body1.m_invMass*m;this.m_body1.m_position.y-=this.m_body1.m_invMass*n;this.m_body1.m_rotation-=this.m_body1.m_invI*(b*n-c*m);this.m_body2.m_position.x+=this.m_body2.m_invMass*m;this.m_body2.m_position.y+=this.m_body2.m_invMass*n;this.m_body2.m_rotation+=this.m_body2.m_invI*(d*n-e*m);this.m_body1.m_R.Set(this.m_body1.m_rotation);this.m_body2.m_R.Set(this.m_body2.m_rotation);return k.b2Abs(j)<g.b2_linearSlop},GetAnchor1:function(){return k.AddVV(this.m_body1.m_position,k.b2MulMV(this.m_body1.m_R,this.m_localAnchor1))},GetAnchor2:function(){return k.AddVV(this.m_body2.m_position,k.b2MulMV(this.m_body2.m_R,this.m_localAnchor2))},GetReactionForce:function(a){var b=new h;b.SetV(this.m_u);b.Multiply(this.m_impulse*a);return b},GetReactionTorque:function(a){return 0},m_localAnchor1:new h,m_localAnchor2:new h,m_u:new h,m_impulse:null,m_mass:null,m_length:null});var bh=f.create();Object.extend(bh.prototype,bf.prototype);Object.extend(bh.prototype,{initialize:function(){this.type=be.e_unknownJoint;this.userData=null;this.body1=null;this.body2=null;this.collideConnected=false;this.anchorPoint1=new h;this.anchorPoint2=new h;this.type=be.e_distanceJoint},anchorPoint1:new h,anchorPoint2:new h});var bi=f.create();bi.prototype={linear1:new h,angular1:null,linear2:new h,angular2:null,SetZero:function(){this.linear1.SetZero();this.angular1=0;this.linear2.SetZero();this.angular2=0},Set:function(a,b,c,d){this.linear1.SetV(a);this.angular1=b;this.linear2.SetV(c);this.angular2=d},Compute:function(a,b,c,d){return this.linear1.x*a.x+this.linear1.y*a.y+this.angular1*b+(this.linear2.x*c.x+this.linear2.y*c.y)+this.angular2*d},initialize:function(){this.linear1=new h;this.linear2=new h}};var bj=f.create();Object.extend(bj.prototype,be.prototype);Object.extend(bj.prototype,{GetAnchor1:function(){var a=this.m_body1.m_R;return new h(this.m_body1.m_position.x+(a.col1.x*this.m_localAnchor1.x+a.col2.x*this.m_localAnchor1.y),this.m_body1.m_position.y+(a.col1.y*this.m_localAnchor1.x+a.col2.y*this.m_localAnchor1.y))},GetAnchor2:function(){var a=this.m_body2.m_R;return new h(this.m_body2.m_position.x+(a.col1.x*this.m_localAnchor2.x+a.col2.x*this.m_localAnchor2.y),this.m_body2.m_position.y+(a.col1.y*this.m_localAnchor2.x+a.col2.y*this.m_localAnchor2.y))},GetReactionForce:function(a){return new h},GetReactionTorque:function(a){return 0},GetRatio:function(){return this.m_ratio},initialize:function(a){this.m_node1=new bd;this.m_node2=new bd;this.m_type=a.type;this.m_prev=null;this.m_next=null;this.m_body1=a.body1;this.m_body2=a.body2;this.m_collideConnected=a.collideConnected;this.m_islandFlag=false;this.m_userData=a.userData;this.m_groundAnchor1=new h;this.m_groundAnchor2=new h;this.m_localAnchor1=new h;this.m_localAnchor2=new h;this.m_J=new bi;this.m_revolute1=null;this.m_prismatic1=null;this.m_revolute2=null;this.m_prismatic2=null;var b;var c;this.m_ground1=a.joint1.m_body1;this.m_body1=a.joint1.m_body2;if(a.joint1.m_type==be.e_revoluteJoint){this.m_revolute1=a.joint1;this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);b=this.m_revolute1.GetJointAngle()}else{this.m_prismatic1=a.joint1;this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);b=this.m_prismatic1.GetJointTranslation()}this.m_ground2=a.joint2.m_body1;this.m_body2=a.joint2.m_body2;if(a.joint2.m_type==be.e_revoluteJoint){this.m_revolute2=a.joint2;this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);c=this.m_revolute2.GetJointAngle()}else{this.m_prismatic2=a.joint2;this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);c=this.m_prismatic2.GetJointTranslation()}this.m_ratio=a.ratio;this.m_constant=b+this.m_ratio*c;this.m_impulse=0},PrepareVelocitySolver:function(){var a=this.m_ground1;var b=this.m_ground2;var c=this.m_body1;var d=this.m_body2;var e;var f;var g;var h;var i;var j;var k;var l=0;this.m_J.SetZero();if(this.m_revolute1){this.m_J.angular1=-1;l+=c.m_invI}else{i=a.m_R;j=this.m_prismatic1.m_localXAxis1;e=i.col1.x*j.x+i.col2.x*j.y;f=i.col1.y*j.x+i.col2.y*j.y;i=c.m_R;g=i.col1.x*this.m_localAnchor1.x+i.col2.x*this.m_localAnchor1.y;h=i.col1.y*this.m_localAnchor1.x+i.col2.y*this.m_localAnchor1.y;k=g*f-h*e;this.m_J.linear1.Set(-e,-f);this.m_J.angular1=-k;l+=c.m_invMass+c.m_invI*k*k}if(this.m_revolute2){this.m_J.angular2=-this.m_ratio;l+=this.m_ratio*this.m_ratio*d.m_invI}else{i=b.m_R;j=this.m_prismatic2.m_localXAxis1;e=i.col1.x*j.x+i.col2.x*j.y;f=i.col1.y*j.x+i.col2.y*j.y;i=d.m_R;g=i.col1.x*this.m_localAnchor2.x+i.col2.x*this.m_localAnchor2.y;h=i.col1.y*this.m_localAnchor2.x+i.col2.y*this.m_localAnchor2.y;k=g*f-h*e;this.m_J.linear2.Set(-this.m_ratio*e,-this.m_ratio*f);this.m_J.angular2=-this.m_ratio*k;l+=this.m_ratio*this.m_ratio*(d.m_invMass+d.m_invI*k*k)}this.m_mass=1/l;c.m_linearVelocity.x+=c.m_invMass*this.m_impulse*this.m_J.linear1.x;c.m_linearVelocity.y+=c.m_invMass*this.m_impulse*this.m_J.linear1.y;c.m_angularVelocity+=c.m_invI*this.m_impulse*this.m_J.angular1;d.m_linearVelocity.x+=d.m_invMass*this.m_impulse*this.m_J.linear2.x;d.m_linearVelocity.y+=d.m_invMass*this.m_impulse*this.m_J.linear2.y;d.m_angularVelocity+=d.m_invI*this.m_impulse*this.m_J.angular2},SolveVelocityConstraints:function(a){var b=this.m_body1;var c=this.m_body2;var d=this.m_J.Compute(b.m_linearVelocity,b.m_angularVelocity,c.m_linearVelocity,c.m_angularVelocity);var e=-this.m_mass*d;this.m_impulse+=e;b.m_linearVelocity.x+=b.m_invMass*e*this.m_J.linear1.x;b.m_linearVelocity.y+=b.m_invMass*e*this.m_J.linear1.y;b.m_angularVelocity+=b.m_invI*e*this.m_J.angular1;c.m_linearVelocity.x+=c.m_invMass*e*this.m_J.linear2.x;c.m_linearVelocity.y+=c.m_invMass*e*this.m_J.linear2.y;c.m_angularVelocity+=c.m_invI*e*this.m_J.angular2},SolvePositionConstraints:function(){var a=0;var b=this.m_body1;var c=this.m_body2;var d;var e;if(this.m_revolute1){d=this.m_revolute1.GetJointAngle()}else{d=this.m_prismatic1.GetJointTranslation()}if(this.m_revolute2){e=this.m_revolute2.GetJointAngle()}else{e=this.m_prismatic2.GetJointTranslation()}var f=this.m_constant-(d+this.m_ratio*e);var h=-this.m_mass*f;b.m_position.x+=b.m_invMass*h*this.m_J.linear1.x;b.m_position.y+=b.m_invMass*h*this.m_J.linear1.y;b.m_rotation+=b.m_invI*h*this.m_J.angular1;c.m_position.x+=c.m_invMass*h*this.m_J.linear2.x;c.m_position.y+=c.m_invMass*h*this.m_J.linear2.y;c.m_rotation+=c.m_invI*h*this.m_J.angular2;b.m_R.Set(b.m_rotation);c.m_R.Set(c.m_rotation);return a<g.b2_linearSlop},m_ground1:null,m_ground2:null,m_revolute1:null,m_prismatic1:null,m_revolute2:null,m_prismatic2:null,m_groundAnchor1:new h,m_groundAnchor2:new h,m_localAnchor1:new h,m_localAnchor2:new h,m_J:new bi,m_constant:null,m_ratio:null,m_mass:null,m_impulse:null});var bk=f.create();Object.extend(bk.prototype,bf.prototype);Object.extend(bk.prototype,{initialize:function(){this.type=be.e_gearJoint;this.joint1=null;this.joint2=null;this.ratio=1},joint1:null,joint2:null,ratio:null});var bl=f.create();Object.extend(bl.prototype,be.prototype);Object.extend(bl.prototype,{GetAnchor1:function(){return this.m_target},GetAnchor2:function(){var a=k.b2MulMV(this.m_body2.m_R,this.m_localAnchor);a.Add(this.m_body2.m_position);return a},GetReactionForce:function(a){var b=new h;b.SetV(this.m_impulse);b.Multiply(a);return b},GetReactionTorque:function(a){return 0},SetTarget:function(a){this.m_body2.WakeUp();this.m_target=a},initialize:function(a){this.m_node1=new bd;this.m_node2=new bd;this.m_type=a.type;this.m_prev=null;this.m_next=null;this.m_body1=a.body1;this.m_body2=a.body2;this.m_collideConnected=a.collideConnected;this.m_islandFlag=false;this.m_userData=a.userData;this.K=new j;this.K1=new j;this.K2=new j;this.m_localAnchor=new h;this.m_target=new h;this.m_impulse=new h;this.m_ptpMass=new j;this.m_C=new h;this.m_target.SetV(a.target);var b=this.m_target.x-this.m_body2.m_position.x;var c=this.m_target.y-this.m_body2.m_position.y;this.m_localAnchor.x=b*this.m_body2.m_R.col1.x+c*this.m_body2.m_R.col1.y;this.m_localAnchor.y=b*this.m_body2.m_R.col2.x+c*this.m_body2.m_R.col2.y;this.m_maxForce=a.maxForce;this.m_impulse.SetZero();var d=this.m_body2.m_mass;var e=2*g.b2_pi*a.frequencyHz;var f=2*d*a.dampingRatio*e;var i=d*e*e;this.m_gamma=1/(f+a.timeStep*i);this.m_beta=a.timeStep*i/(f+a.timeStep*i)},K:new j,K1:new j,K2:new j,PrepareVelocitySolver:function(){var a=this.m_body2;var b;b=a.m_R;var c=b.col1.x*this.m_localAnchor.x+b.col2.x*this.m_localAnchor.y;var d=b.col1.y*this.m_localAnchor.x+b.col2.y*this.m_localAnchor.y;var e=a.m_invMass;var f=a.m_invI;this.K1.col1.x=e;this.K1.col2.x=0;this.K1.col1.y=0;this.K1.col2.y=e;this.K2.col1.x=f*d*d;this.K2.col2.x=-f*c*d;this.K2.col1.y=-f*c*d;this.K2.col2.y=f*c*c;this.K.SetM(this.K1);this.K.AddM(this.K2);this.K.col1.x+=this.m_gamma;this.K.col2.y+=this.m_gamma;this.K.Invert(this.m_ptpMass);this.m_C.x=a.m_position.x+c-this.m_target.x;this.m_C.y=a.m_position.y+d-this.m_target.y;a.m_angularVelocity*=.98;var g=this.m_impulse.x;var h=this.m_impulse.y;a.m_linearVelocity.x+=e*g;a.m_linearVelocity.y+=e*h;a.m_angularVelocity+=f*(c*h-d*g)},SolveVelocityConstraints:function(a){var b=this.m_body2;var c;c=b.m_R;var d=c.col1.x*this.m_localAnchor.x+c.col2.x*this.m_localAnchor.y;var e=c.col1.y*this.m_localAnchor.x+c.col2.y*this.m_localAnchor.y;var f=b.m_linearVelocity.x+ -b.m_angularVelocity*e;var g=b.m_linearVelocity.y+b.m_angularVelocity*d;c=this.m_ptpMass;var h=f+this.m_beta*a.inv_dt*this.m_C.x+this.m_gamma*this.m_impulse.x;var i=g+this.m_beta*a.inv_dt*this.m_C.y+this.m_gamma*this.m_impulse.y;var j=-(c.col1.x*h+c.col2.x*i);var k=-(c.col1.y*h+c.col2.y*i);var l=this.m_impulse.x;var m=this.m_impulse.y;this.m_impulse.x+=j;this.m_impulse.y+=k;var n=this.m_impulse.Length();if(n>a.dt*this.m_maxForce){this.m_impulse.Multiply(a.dt*this.m_maxForce/n)}j=this.m_impulse.x-l;k=this.m_impulse.y-m;b.m_linearVelocity.x+=b.m_invMass*j;b.m_linearVelocity.y+=b.m_invMass*k;b.m_angularVelocity+=b.m_invI*(d*k-e*j)},SolvePositionConstraints:function(){return true},m_localAnchor:new h,m_target:new h,m_impulse:new h,m_ptpMass:new j,m_C:new h,m_maxForce:null,m_beta:null,m_gamma:null});var bm=f.create();Object.extend(bm.prototype,bf.prototype);Object.extend(bm.prototype,{initialize:function(){this.type=be.e_unknownJoint;this.userData=null;this.body1=null;this.body2=null;this.collideConnected=false;this.target=new h;this.type=be.e_mouseJoint;this.maxForce=0;this.frequencyHz=5;this.dampingRatio=.7;this.timeStep=1/60},target:new h,maxForce:null,frequencyHz:null,dampingRatio:null,timeStep:null});var bn=f.create();Object.extend(bn.prototype,be.prototype);Object.extend(bn.prototype,{GetAnchor1:function(){var a=this.m_body1;var b=new h;b.SetV(this.m_localAnchor1);b.MulM(a.m_R);b.Add(a.m_position);return b},GetAnchor2:function(){var a=this.m_body2;var b=new h;b.SetV(this.m_localAnchor2);b.MulM(a.m_R);b.Add(a.m_position);return b},GetJointTranslation:function(){var a=this.m_body1;var b=this.m_body2;var c;c=a.m_R;var d=c.col1.x*this.m_localAnchor1.x+c.col2.x*this.m_localAnchor1.y;var e=c.col1.y*this.m_localAnchor1.x+c.col2.y*this.m_localAnchor1.y;c=b.m_R;var f=c.col1.x*this.m_localAnchor2.x+c.col2.x*this.m_localAnchor2.y;var g=c.col1.y*this.m_localAnchor2.x+c.col2.y*this.m_localAnchor2.y;var h=a.m_position.x+d;var i=a.m_position.y+e;var j=b.m_position.x+f;var k=b.m_position.y+g;var l=j-h;var m=k-i;c=a.m_R;var n=c.col1.x*this.m_localXAxis1.x+c.col2.x*this.m_localXAxis1.y;var o=c.col1.y*this.m_localXAxis1.x+c.col2.y*this.m_localXAxis1.y;var p=n*l+o*m;return p},GetJointSpeed:function(){var a=this.m_body1;var b=this.m_body2;var c;c=a.m_R;var d=c.col1.x*this.m_localAnchor1.x+c.col2.x*this.m_localAnchor1.y;var e=c.col1.y*this.m_localAnchor1.x+c.col2.y*this.m_localAnchor1.y;c=b.m_R;var f=c.col1.x*this.m_localAnchor2.x+c.col2.x*this.m_localAnchor2.y;var g=c.col1.y*this.m_localAnchor2.x+c.col2.y*this.m_localAnchor2.y;var h=a.m_position.x+d;var i=a.m_position.y+e;var j=b.m_position.x+f;var k=b.m_position.y+g;var l=j-h;var m=k-i;c=a.m_R;var n=c.col1.x*this.m_localXAxis1.x+c.col2.x*this.m_localXAxis1.y;var o=c.col1.y*this.m_localXAxis1.x+c.col2.y*this.m_localXAxis1.y;var p=a.m_linearVelocity;var q=b.m_linearVelocity;var r=a.m_angularVelocity;var s=b.m_angularVelocity;var t=l*-r*o+m*r*n+(n*(q.x+ -s*g-p.x- -r*e)+o*(q.y+s*f-p.y-r*d));return t},GetMotorForce:function(a){return a*this.m_motorImpulse},SetMotorSpeed:function(a){this.m_motorSpeed=a},SetMotorForce:function(a){this.m_maxMotorForce=a},GetReactionForce:function(a){var b=a*this.m_limitImpulse;var c;c=this.m_body1.m_R;var d=b*(c.col1.x*this.m_localXAxis1.x+c.col2.x*this.m_localXAxis1.y);var e=b*(c.col1.y*this.m_localXAxis1.x+c.col2.y*this.m_localXAxis1.y);var f=b*(c.col1.x*this.m_localYAxis1.x+c.col2.x*this.m_localYAxis1.y);var g=b*(c.col1.y*this.m_localYAxis1.x+c.col2.y*this.m_localYAxis1.y);return new h(d+f,e+g)},GetReactionTorque:function(a){return a*this.m_angularImpulse},initialize:function(a){this.m_node1=new bd;this.m_node2=new bd;this.m_type=a.type;this.m_prev=null;this.m_next=null;this.m_body1=a.body1;this.m_body2=a.body2;this.m_collideConnected=a.collideConnected;this.m_islandFlag=false;this.m_userData=a.userData;this.m_localAnchor1=new h;this.m_localAnchor2=new h;this.m_localXAxis1=new h;this.m_localYAxis1=new h;this.m_linearJacobian=new bi;this.m_motorJacobian=new bi;var b;var c;var d;b=this.m_body1.m_R;c=a.anchorPoint.x-this.m_body1.m_position.x;d=a.anchorPoint.y-this.m_body1.m_position.y;this.m_localAnchor1.Set(c*b.col1.x+d*b.col1.y,c*b.col2.x+d*b.col2.y);b=this.m_body2.m_R;c=a.anchorPoint.x-this.m_body2.m_position.x;d=a.anchorPoint.y-this.m_body2.m_position.y;this.m_localAnchor2.Set(c*b.col1.x+d*b.col1.y,c*b.col2.x+d*b.col2.y);b=this.m_body1.m_R;c=a.axis.x;d=a.axis.y;this.m_localXAxis1.Set(c*b.col1.x+d*b.col1.y,c*b.col2.x+d*b.col2.y);this.m_localYAxis1.x=-this.m_localXAxis1.y;this.m_localYAxis1.y=this.m_localXAxis1.x;this.m_initialAngle=this.m_body2.m_rotation-this.m_body1.m_rotation;this.m_linearJacobian.SetZero();this.m_linearMass=0;this.m_linearImpulse=0;this.m_angularMass=0;this.m_angularImpulse=0;this.m_motorJacobian.SetZero();this.m_motorMass=0;this.m_motorImpulse=0;this.m_limitImpulse=0;this.m_limitPositionImpulse=0;this.m_lowerTranslation=a.lowerTranslation;this.m_upperTranslation=a.upperTranslation;this.m_maxMotorForce=a.motorForce;this.m_motorSpeed=a.motorSpeed;this.m_enableLimit=a.enableLimit;this.m_enableMotor=a.enableMotor},PrepareVelocitySolver:function(){var a=this.m_body1;var b=this.m_body2;var c;c=a.m_R;var d=c.col1.x*this.m_localAnchor1.x+c.col2.x*this.m_localAnchor1.y;var e=c.col1.y*this.m_localAnchor1.x+c.col2.y*this.m_localAnchor1.y;c=b.m_R;var f=c.col1.x*this.m_localAnchor2.x+c.col2.x*this.m_localAnchor2.y;var h=c.col1.y*this.m_localAnchor2.x+c.col2.y*this.m_localAnchor2.y;var i=a.m_invMass;var j=b.m_invMass;var l=a.m_invI;var m=b.m_invI;c=a.m_R;var n=c.col1.x*this.m_localYAxis1.x+c.col2.x*this.m_localYAxis1.y;var o=c.col1.y*this.m_localYAxis1.x+c.col2.y*this.m_localYAxis1.y;var p=b.m_position.x+f-a.m_position.x;var q=b.m_position.y+h-a.m_position.y;this.m_linearJacobian.linear1.x=-n;this.m_linearJacobian.linear1.y=-o;this.m_linearJacobian.linear2.x=n;this.m_linearJacobian.linear2.y=o;this.m_linearJacobian.angular1=-(p*o-q*n);this.m_linearJacobian.angular2=f*o-h*n;this.m_linearMass=i+l*this.m_linearJacobian.angular1*this.m_linearJacobian.angular1+j+m*this.m_linearJacobian.angular2*this.m_linearJacobian.angular2;this.m_linearMass=1/this.m_linearMass;this.m_angularMass=1/(l+m);if(this.m_enableLimit||this.m_enableMotor){c=a.m_R;var r=c.col1.x*this.m_localXAxis1.x+c.col2.x*this.m_localXAxis1.y;var s=c.col1.y*this.m_localXAxis1.x+c.col2.y*this.m_localXAxis1.y;this.m_motorJacobian.linear1.x=-r;this.m_motorJacobian.linear1.y=-s;this.m_motorJacobian.linear2.x=r;this.m_motorJacobian.linear2.y=s;this.m_motorJacobian.angular1=-(p*s-q*r);this.m_motorJacobian.angular2=f*s-h*r;this.m_motorMass=i+l*this.m_motorJacobian.angular1*this.m_motorJacobian.angular1+j+m*this.m_motorJacobian.angular2*this.m_motorJacobian.angular2;this.m_motorMass=1/this.m_motorMass;if(this.m_enableLimit){var t=p-d;var u=q-e;var v=r*t+s*u;if(k.b2Abs(this.m_upperTranslation-this.m_lowerTranslation)<2*g.b2_linearSlop){this.m_limitState=be.e_equalLimits}else if(v<=this.m_lowerTranslation){if(this.m_limitState!=be.e_atLowerLimit){this.m_limitImpulse=0}this.m_limitState=be.e_atLowerLimit}else if(v>=this.m_upperTranslation){if(this.m_limitState!=be.e_atUpperLimit){this.m_limitImpulse=0}this.m_limitState=be.e_atUpperLimit}else{this.m_limitState=be.e_inactiveLimit;this.m_limitImpulse=0}}}if(this.m_enableMotor==false){this.m_motorImpulse=0}if(this.m_enableLimit==false){this.m_limitImpulse=0}if(bb.s_enableWarmStarting){var w=this.m_linearImpulse*this.m_linearJacobian.linear1.x+(this.m_motorImpulse+this.m_limitImpulse)*this.m_motorJacobian.linear1.x;var x=this.m_linearImpulse*this.m_linearJacobian.linear1.y+(this.m_motorImpulse+this.m_limitImpulse)*this.m_motorJacobian.linear1.y;var y=this.m_linearImpulse*this.m_linearJacobian.linear2.x+(this.m_motorImpulse+this.m_limitImpulse)*this.m_motorJacobian.linear2.x;var z=this.m_linearImpulse*this.m_linearJacobian.linear2.y+(this.m_motorImpulse+this.m_limitImpulse)*this.m_motorJacobian.linear2.y;var A=this.m_linearImpulse*this.m_linearJacobian.angular1-this.m_angularImpulse+(this.m_motorImpulse+this.m_limitImpulse)*this.m_motorJacobian.angular1;var B=this.m_linearImpulse*this.m_linearJacobian.angular2+this.m_angularImpulse+(this.m_motorImpulse+this.m_limitImpulse)*this.m_motorJacobian.angular2;a.m_linearVelocity.x+=i*w;a.m_linearVelocity.y+=i*x;a.m_angularVelocity+=l*A;b.m_linearVelocity.x+=j*y;b.m_linearVelocity.y+=j*z;b.m_angularVelocity+=m*B}else{this.m_linearImpulse=0;this.m_angularImpulse=0;this.m_limitImpulse=0;this.m_motorImpulse=0}this.m_limitPositionImpulse=0},SolveVelocityConstraints:function(a){var b=this.m_body1;var c=this.m_body2;var d=b.m_invMass;var e=c.m_invMass;var f=b.m_invI;var g=c.m_invI;var h;var i=this.m_linearJacobian.Compute(b.m_linearVelocity,b.m_angularVelocity,c.m_linearVelocity,c.m_angularVelocity);var j=-this.m_linearMass*i;this.m_linearImpulse+=j;b.m_linearVelocity.x+=d*j*this.m_linearJacobian.linear1.x;b.m_linearVelocity.y+=d*j*this.m_linearJacobian.linear1.y;b.m_angularVelocity+=f*j*this.m_linearJacobian.angular1;c.m_linearVelocity.x+=e*j*this.m_linearJacobian.linear2.x;c.m_linearVelocity.y+=e*j*this.m_linearJacobian.linear2.y;c.m_angularVelocity+=g*j*this.m_linearJacobian.angular2;var l=c.m_angularVelocity-b.m_angularVelocity;var m=-this.m_angularMass*l;this.m_angularImpulse+=m;b.m_angularVelocity-=f*m;c.m_angularVelocity+=g*m;if(this.m_enableMotor&&this.m_limitState!=be.e_equalLimits){var n=this.m_motorJacobian.Compute(b.m_linearVelocity,b.m_angularVelocity,c.m_linearVelocity,c.m_angularVelocity)-this.m_motorSpeed;var o=-this.m_motorMass*n;var p=this.m_motorImpulse;this.m_motorImpulse=k.b2Clamp(this.m_motorImpulse+o,-a.dt*this.m_maxMotorForce,a.dt*this.m_maxMotorForce);o=this.m_motorImpulse-p;b.m_linearVelocity.x+=d*o*this.m_motorJacobian.linear1.x;b.m_linearVelocity.y+=d*o*this.m_motorJacobian.linear1.y;b.m_angularVelocity+=f*o*this.m_motorJacobian.angular1;c.m_linearVelocity.x+=e*o*this.m_motorJacobian.linear2.x;c.m_linearVelocity.y+=e*o*this.m_motorJacobian.linear2.y;c.m_angularVelocity+=g*o*this.m_motorJacobian.angular2}if(this.m_enableLimit&&this.m_limitState!=be.e_inactiveLimit){var q=this.m_motorJacobian.Compute(b.m_linearVelocity,b.m_angularVelocity,c.m_linearVelocity,c.m_angularVelocity);var r=-this.m_motorMass*q;if(this.m_limitState==be.e_equalLimits){this.m_limitImpulse+=r}else if(this.m_limitState==be.e_atLowerLimit){h=this.m_limitImpulse;this.m_limitImpulse=k.b2Max(this.m_limitImpulse+r,0);r=this.m_limitImpulse-h}else if(this.m_limitState==be.e_atUpperLimit){h=this.m_limitImpulse;this.m_limitImpulse=k.b2Min(this.m_limitImpulse+r,0);r=this.m_limitImpulse-h}b.m_linearVelocity.x+=d*r*this.m_motorJacobian.linear1.x;b.m_linearVelocity.y+=d*r*this.m_motorJacobian.linear1.y;b.m_angularVelocity+=f*r*this.m_motorJacobian.angular1;c.m_linearVelocity.x+=e*r*this.m_motorJacobian.linear2.x;c.m_linearVelocity.y+=e*r*this.m_motorJacobian.linear2.y;c.m_angularVelocity+=g*r*this.m_motorJacobian.angular2}},SolvePositionConstraints:function(){var a;var b;var c=this.m_body1;var d=this.m_body2;var e=c.m_invMass;var f=d.m_invMass;var h=c.m_invI;var i=d.m_invI;var j;j=c.m_R;var l=j.col1.x*this.m_localAnchor1.x+j.col2.x*this.m_localAnchor1.y;var m=j.col1.y*this.m_localAnchor1.x+j.col2.y*this.m_localAnchor1.y;j=d.m_R;var n=j.col1.x*this.m_localAnchor2.x+j.col2.x*this.m_localAnchor2.y;var o=j.col1.y*this.m_localAnchor2.x+j.col2.y*this.m_localAnchor2.y;var p=c.m_position.x+l;var q=c.m_position.y+m;var r=d.m_position.x+n;var s=d.m_position.y+o;var t=r-p;var u=s-q;j=c.m_R;var v=j.col1.x*this.m_localYAxis1.x+j.col2.x*this.m_localYAxis1.y;var w=j.col1.y*this.m_localYAxis1.x+j.col2.y*this.m_localYAxis1.y;var x=v*t+w*u;x=k.b2Clamp(x,-g.b2_maxLinearCorrection,g.b2_maxLinearCorrection);var y=-this.m_linearMass*x;c.m_position.x+=e*y*this.m_linearJacobian.linear1.x;c.m_position.y+=e*y*this.m_linearJacobian.linear1.y;c.m_rotation+=h*y*this.m_linearJacobian.angular1;d.m_position.x+=f*y*this.m_linearJacobian.linear2.x;d.m_position.y+=f*y*this.m_linearJacobian.linear2.y;d.m_rotation+=i*y*this.m_linearJacobian.angular2;var z=k.b2Abs(x);var A=d.m_rotation-c.m_rotation-this.m_initialAngle;A=k.b2Clamp(A,-g.b2_maxAngularCorrection,g.b2_maxAngularCorrection);var B=-this.m_angularMass*A;c.m_rotation-=c.m_invI*B;c.m_R.Set(c.m_rotation);d.m_rotation+=d.m_invI*B;d.m_R.Set(d.m_rotation);var C=k.b2Abs(A);if(this.m_enableLimit&&this.m_limitState!=be.e_inactiveLimit){j=c.m_R;l=j.col1.x*this.m_localAnchor1.x+j.col2.x*this.m_localAnchor1.y;m=j.col1.y*this.m_localAnchor1.x+j.col2.y*this.m_localAnchor1.y;j=d.m_R;n=j.col1.x*this.m_localAnchor2.x+j.col2.x*this.m_localAnchor2.y;o=j.col1.y*this.m_localAnchor2.x+j.col2.y*this.m_localAnchor2.y;p=c.m_position.x+l;q=c.m_position.y+m;r=d.m_position.x+n;s=d.m_position.y+o;t=r-p;u=s-q;j=c.m_R;var D=j.col1.x*this.m_localXAxis1.x+j.col2.x*this.m_localXAxis1.y;var E=j.col1.y*this.m_localXAxis1.x+j.col2.y*this.m_localXAxis1.y;var F=D*t+E*u;var G=0;if(this.m_limitState==be.e_equalLimits){a=k.b2Clamp(F,-g.b2_maxLinearCorrection,g.b2_maxLinearCorrection);G=-this.m_motorMass*a;z=k.b2Max(z,k.b2Abs(A))}else if(this.m_limitState==be.e_atLowerLimit){a=F-this.m_lowerTranslation;z=k.b2Max(z,-a);a=k.b2Clamp(a+g.b2_linearSlop,-g.b2_maxLinearCorrection,0);G=-this.m_motorMass*a;b=this.m_limitPositionImpulse;this.m_limitPositionImpulse=k.b2Max(this.m_limitPositionImpulse+G,0);G=this.m_limitPositionImpulse-b}else if(this.m_limitState==be.e_atUpperLimit){a=F-this.m_upperTranslation;z=k.b2Max(z,a);a=k.b2Clamp(a-g.b2_linearSlop,0,g.b2_maxLinearCorrection);G=-this.m_motorMass*a;b=this.m_limitPositionImpulse;this.m_limitPositionImpulse=k.b2Min(this.m_limitPositionImpulse+G,0);G=this.m_limitPositionImpulse-b}c.m_position.x+=e*G*this.m_motorJacobian.linear1.x;c.m_position.y+=e*G*this.m_motorJacobian.linear1.y;c.m_rotation+=h*G*this.m_motorJacobian.angular1;c.m_R.Set(c.m_rotation);d.m_position.x+=f*G*this.m_motorJacobian.linear2.x;d.m_position.y+=f*G*this.m_motorJacobian.linear2.y;d.m_rotation+=i*G*this.m_motorJacobian.angular2;d.m_R.Set(d.m_rotation)}return z<=g.b2_linearSlop&&C<=g.b2_angularSlop},m_localAnchor1:new h,m_localAnchor2:new h,m_localXAxis1:new h,m_localYAxis1:new h,m_initialAngle:null,m_linearJacobian:new bi,m_linearMass:null,m_linearImpulse:null,m_angularMass:null,m_angularImpulse:null,m_motorJacobian:new bi,m_motorMass:null,m_motorImpulse:null,m_limitImpulse:null,m_limitPositionImpulse:null,m_lowerTranslation:null,m_upperTranslation:null,m_maxMotorForce:null,m_motorSpeed:null,m_enableLimit:null,m_enableMotor:null,m_limitState:0});var bo=f.create();Object.extend(bo.prototype,bf.prototype);Object.extend(bo.prototype,{initialize:function(){this.type=be.e_unknownJoint;this.userData=null;this.body1=null;this.body2=null;this.collideConnected=false;this.type=be.e_prismaticJoint;this.anchorPoint=new h(0,0);this.axis=new h(0,0);this.lowerTranslation=0;this.upperTranslation=0;this.motorForce=0;this.motorSpeed=0;this.enableLimit=false;this.enableMotor=false},anchorPoint:null,axis:null,lowerTranslation:null,upperTranslation:null,motorForce:null,motorSpeed:null,enableLimit:null,enableMotor:null});var bp=f.create();Object.extend(bp.prototype,be.prototype);Object.extend(bp.prototype,{GetAnchor1:function(){var a=this.m_body1.m_R;return new h(this.m_body1.m_position.x+(a.col1.x*this.m_localAnchor1.x+a.col2.x*this.m_localAnchor1.y),this.m_body1.m_position.y+(a.col1.y*this.m_localAnchor1.x+a.col2.y*this.m_localAnchor1.y))},GetAnchor2:function(){var a=this.m_body2.m_R;return new h(this.m_body2.m_position.x+(a.col1.x*this.m_localAnchor2.x+a.col2.x*this.m_localAnchor2.y),this.m_body2.m_position.y+(a.col1.y*this.m_localAnchor2.x+a.col2.y*this.m_localAnchor2.y))},GetGroundPoint1:function(){return new h(this.m_ground.m_position.x+this.m_groundAnchor1.x,this.m_ground.m_position.y+this.m_groundAnchor1.y)},GetGroundPoint2:function(){return new h(this.m_ground.m_position.x+this.m_groundAnchor2.x,this.m_ground.m_position.y+this.m_groundAnchor2.y)},GetReactionForce:function(a){return new h},GetReactionTorque:function(a){return 0},GetLength1:function(){var a;a=this.m_body1.m_R;var b=this.m_body1.m_position.x+(a.col1.x*this.m_localAnchor1.x+a.col2.x*this.m_localAnchor1.y);var c=this.m_body1.m_position.y+(a.col1.y*this.m_localAnchor1.x+a.col2.y*this.m_localAnchor1.y);var d=b-(this.m_ground.m_position.x+this.m_groundAnchor1.x);var e=c-(this.m_ground.m_position.y+this.m_groundAnchor1.y);return Math.sqrt(d*d+e*e)},GetLength2:function(){var a;a=this.m_body2.m_R;var b=this.m_body2.m_position.x+(a.col1.x*this.m_localAnchor2.x+a.col2.x*this.m_localAnchor2.y);var c=this.m_body2.m_position.y+(a.col1.y*this.m_localAnchor2.x+a.col2.y*this.m_localAnchor2.y);var d=b-(this.m_ground.m_position.x+this.m_groundAnchor2.x);var e=c-(this.m_ground.m_position.y+this.m_groundAnchor2.y);return Math.sqrt(d*d+e*e)},GetRatio:function(){return this.m_ratio},initialize:function(a){this.m_node1=new bd;this.m_node2=new bd;this.m_type=a.type;this.m_prev=null;this.m_next=null;this.m_body1=a.body1;this.m_body2=a.body2;this.m_collideConnected=a.collideConnected;this.m_islandFlag=false;this.m_userData=a.userData;this.m_groundAnchor1=new h;this.m_groundAnchor2=new h;this.m_localAnchor1=new h;this.m_localAnchor2=new h;this.m_u1=new h;this.m_u2=new h;var b;var c;var d;this.m_ground=this.m_body1.m_world.m_groundBody;this.m_groundAnchor1.x=a.groundPoint1.x-this.m_ground.m_position.x;this.m_groundAnchor1.y=a.groundPoint1.y-this.m_ground.m_position.y;this.m_groundAnchor2.x=a.groundPoint2.x-this.m_ground.m_position.x;this.m_groundAnchor2.y=a.groundPoint2.y-this.m_ground.m_position.y;b=this.m_body1.m_R;c=a.anchorPoint1.x-this.m_body1.m_position.x;d=a.anchorPoint1.y-this.m_body1.m_position.y;this.m_localAnchor1.x=c*b.col1.x+d*b.col1.y;this.m_localAnchor1.y=c*b.col2.x+d*b.col2.y;b=this.m_body2.m_R;c=a.anchorPoint2.x-this.m_body2.m_position.x;d=a.anchorPoint2.y-this.m_body2.m_position.y;this.m_localAnchor2.x=c*b.col1.x+d*b.col1.y;this.m_localAnchor2.y=c*b.col2.x+d*b.col2.y;this.m_ratio=a.ratio;c=a.groundPoint1.x-a.anchorPoint1.x;d=a.groundPoint1.y-a.anchorPoint1.y;var e=Math.sqrt(c*c+d*d);c=a.groundPoint2.x-a.anchorPoint2.x;d=a.groundPoint2.y-a.anchorPoint2.y;var f=Math.sqrt(c*c+d*d);var g=k.b2Max(.5*bp.b2_minPulleyLength,e);var i=k.b2Max(.5*bp.b2_minPulleyLength,f);this.m_constant=g+this.m_ratio*i;this.m_maxLength1=k.b2Clamp(a.maxLength1,g,this.m_constant-this.m_ratio*bp.b2_minPulleyLength);this.m_maxLength2=k.b2Clamp(a.maxLength2,i,(this.m_constant-bp.b2_minPulleyLength)/this.m_ratio);this.m_pulleyImpulse=0;this.m_limitImpulse1=0;this.m_limitImpulse2=0},PrepareVelocitySolver:function(){var a=this.m_body1;var b=this.m_body2;var c;c=a.m_R;var d=c.col1.x*this.m_localAnchor1.x+c.col2.x*this.m_localAnchor1.y;var e=c.col1.y*this.m_localAnchor1.x+c.col2.y*this.m_localAnchor1.y;c=b.m_R;var f=c.col1.x*this.m_localAnchor2.x+c.col2.x*this.m_localAnchor2.y;var h=c.col1.y*this.m_localAnchor2.x+c.col2.y*this.m_localAnchor2.y;var i=a.m_position.x+d;var j=a.m_position.y+e;var k=b.m_position.x+f;var l=b.m_position.y+h;var m=this.m_ground.m_position.x+this.m_groundAnchor1.x;var n=this.m_ground.m_position.y+this.m_groundAnchor1.y;var o=this.m_ground.m_position.x+this.m_groundAnchor2.x;var p=this.m_ground.m_position.y+this.m_groundAnchor2.y;this.m_u1.Set(i-m,j-n);this.m_u2.Set(k-o,l-p);var q=this.m_u1.Length();var r=this.m_u2.Length();if(q>g.b2_linearSlop){this.m_u1.Multiply(1/q)}else{this.m_u1.SetZero()}if(r>g.b2_linearSlop){this.m_u2.Multiply(1/r)}else{this.m_u2.SetZero()}if(q<this.m_maxLength1){this.m_limitState1=be.e_inactiveLimit;this.m_limitImpulse1=0}else{this.m_limitState1=be.e_atUpperLimit;this.m_limitPositionImpulse1=0}if(r<this.m_maxLength2){this.m_limitState2=be.e_inactiveLimit;this.m_limitImpulse2=0}else{this.m_limitState2=be.e_atUpperLimit;this.m_limitPositionImpulse2=0}var s=d*this.m_u1.y-e*this.m_u1.x;var t=f*this.m_u2.y-h*this.m_u2.x;this.m_limitMass1=a.m_invMass+a.m_invI*s*s;this.m_limitMass2=b.m_invMass+b.m_invI*t*t;this.m_pulleyMass=this.m_limitMass1+this.m_ratio*this.m_ratio*this.m_limitMass2;this.m_limitMass1=1/this.m_limitMass1;this.m_limitMass2=1/this.m_limitMass2;this.m_pulleyMass=1/this.m_pulleyMass;var u=(-this.m_pulleyImpulse-this.m_limitImpulse1)*this.m_u1.x;var v=(-this.m_pulleyImpulse-this.m_limitImpulse1)*this.m_u1.y;var w=(-this.m_ratio*this.m_pulleyImpulse-this.m_limitImpulse2)*this.m_u2.x;var x=(-this.m_ratio*this.m_pulleyImpulse-this.m_limitImpulse2)*this.m_u2.y;a.m_linearVelocity.x+=a.m_invMass*u;a.m_linearVelocity.y+=a.m_invMass*v;a.m_angularVelocity+=a.m_invI*(d*v-e*u);b.m_linearVelocity.x+=b.m_invMass*w;b.m_linearVelocity.y+=b.m_invMass*x;b.m_angularVelocity+=b.m_invI*(f*x-h*w)},SolveVelocityConstraints:function(a){var b=this.m_body1;var c=this.m_body2;var d;d=b.m_R;var e=d.col1.x*this.m_localAnchor1.x+d.col2.x*this.m_localAnchor1.y;var f=d.col1.y*this.m_localAnchor1.x+d.col2.y*this.m_localAnchor1.y;d=c.m_R;var g=d.col1.x*this.m_localAnchor2.x+d.col2.x*this.m_localAnchor2.y;var h=d.col1.y*this.m_localAnchor2.x+d.col2.y*this.m_localAnchor2.y;var i;var j;var l;var m;var n;var o;var p;var q;var r;var s;var t;i=b.m_linearVelocity.x+ -b.m_angularVelocity*f;j=b.m_linearVelocity.y+b.m_angularVelocity*e;l=c.m_linearVelocity.x+ -c.m_angularVelocity*h;m=c.m_linearVelocity.y+c.m_angularVelocity*g;r=-(this.m_u1.x*i+this.m_u1.y*j)-this.m_ratio*(this.m_u2.x*l+this.m_u2.y*m);s=-this.m_pulleyMass*r;this.m_pulleyImpulse+=s;n=-s*this.m_u1.x;o=-s*this.m_u1.y;p=-this.m_ratio*s*this.m_u2.x;q=-this.m_ratio*s*this.m_u2.y;b.m_linearVelocity.x+=b.m_invMass*n;b.m_linearVelocity.y+=b.m_invMass*o;b.m_angularVelocity+=b.m_invI*(e*o-f*n);c.m_linearVelocity.x+=c.m_invMass*p;c.m_linearVelocity.y+=c.m_invMass*q;c.m_angularVelocity+=c.m_invI*(g*q-h*p);if(this.m_limitState1==be.e_atUpperLimit){i=b.m_linearVelocity.x+ -b.m_angularVelocity*f;j=b.m_linearVelocity.y+b.m_angularVelocity*e;r=-(this.m_u1.x*i+this.m_u1.y*j);s=-this.m_limitMass1*r;t=this.m_limitImpulse1;this.m_limitImpulse1=k.b2Max(0,this.m_limitImpulse1+s);s=this.m_limitImpulse1-t;n=-s*this.m_u1.x;o=-s*this.m_u1.y;b.m_linearVelocity.x+=b.m_invMass*n;b.m_linearVelocity.y+=b.m_invMass*o;b.m_angularVelocity+=b.m_invI*(e*o-f*n)}if(this.m_limitState2==be.e_atUpperLimit){l=c.m_linearVelocity.x+ -c.m_angularVelocity*h;m=c.m_linearVelocity.y+c.m_angularVelocity*g;r=-(this.m_u2.x*l+this.m_u2.y*m);s=-this.m_limitMass2*r;t=this.m_limitImpulse2;this.m_limitImpulse2=k.b2Max(0,this.m_limitImpulse2+s);s=this.m_limitImpulse2-t;p=-s*this.m_u2.x;q=-s*this.m_u2.y;c.m_linearVelocity.x+=c.m_invMass*p;c.m_linearVelocity.y+=c.m_invMass*q;c.m_angularVelocity+=c.m_invI*(g*q-h*p)}},SolvePositionConstraints:function(){var a=this.m_body1;var b=this.m_body2;var c;var d=this.m_ground.m_position.x+this.m_groundAnchor1.x;var e=this.m_ground.m_position.y+this.m_groundAnchor1.y;var f=this.m_ground.m_position.x+this.m_groundAnchor2.x;var h=this.m_ground.m_position.y+this.m_groundAnchor2.y;var i;var j;var l;var m;var n;var o;var p;var q;var r;var s;var t;var u;var v;var w=0;{c=a.m_R;i=c.col1.x*this.m_localAnchor1.x+c.col2.x*this.m_localAnchor1.y;j=c.col1.y*this.m_localAnchor1.x+c.col2.y*this.m_localAnchor1.y;c=b.m_R;l=c.col1.x*this.m_localAnchor2.x+c.col2.x*this.m_localAnchor2.y;m=c.col1.y*this.m_localAnchor2.x+c.col2.y*this.m_localAnchor2.y;n=a.m_position.x+i;o=a.m_position.y+j;p=b.m_position.x+l;q=b.m_position.y+m;this.m_u1.Set(n-d,o-e);this.m_u2.Set(p-f,q-h);r=this.m_u1.Length();s=this.m_u2.Length();if(r>g.b2_linearSlop){this.m_u1.Multiply(1/r)}else{this.m_u1.SetZero()}if(s>g.b2_linearSlop){this.m_u2.Multiply(1/s)}else{this.m_u2.SetZero()}t=this.m_constant-r-this.m_ratio*s;w=k.b2Max(w,Math.abs(t));t=k.b2Clamp(t,-g.b2_maxLinearCorrection,g.b2_maxLinearCorrection);u=-this.m_pulleyMass*t;n=-u*this.m_u1.x;o=-u*this.m_u1.y;p=-this.m_ratio*u*this.m_u2.x;q=-this.m_ratio*u*this.m_u2.y;a.m_position.x+=a.m_invMass*n;a.m_position.y+=a.m_invMass*o;a.m_rotation+=a.m_invI*(i*o-j*n);b.m_position.x+=b.m_invMass*p;b.m_position.y+=b.m_invMass*q;b.m_rotation+=b.m_invI*(l*q-m*p);a.m_R.Set(a.m_rotation);b.m_R.Set(b.m_rotation)}if(this.m_limitState1==be.e_atUpperLimit){c=a.m_R;i=c.col1.x*this.m_localAnchor1.x+c.col2.x*this.m_localAnchor1.y;j=c.col1.y*this.m_localAnchor1.x+c.col2.y*this.m_localAnchor1.y;n=a.m_position.x+i;o=a.m_position.y+j;this.m_u1.Set(n-d,o-e);r=this.m_u1.Length();if(r>g.b2_linearSlop){this.m_u1.x*=1/r;this.m_u1.y*=1/r}else{this.m_u1.SetZero()}t=this.m_maxLength1-r;w=k.b2Max(w,-t);t=k.b2Clamp(t+g.b2_linearSlop,-g.b2_maxLinearCorrection,0);u=-this.m_limitMass1*t;v=this.m_limitPositionImpulse1;this.m_limitPositionImpulse1=k.b2Max(0,this.m_limitPositionImpulse1+u);u=this.m_limitPositionImpulse1-v;n=-u*this.m_u1.x;o=-u*this.m_u1.y;a.m_position.x+=a.m_invMass*n;a.m_position.y+=a.m_invMass*o;a.m_rotation+=a.m_invI*(i*o-j*n);a.m_R.Set(a.m_rotation)}if(this.m_limitState2==be.e_atUpperLimit){c=b.m_R;l=c.col1.x*this.m_localAnchor2.x+c.col2.x*this.m_localAnchor2.y;m=c.col1.y*this.m_localAnchor2.x+c.col2.y*this.m_localAnchor2.y;p=b.m_position.x+l;q=b.m_position.y+m;this.m_u2.Set(p-f,q-h);s=this.m_u2.Length();if(s>g.b2_linearSlop){this.m_u2.x*=1/s;this.m_u2.y*=1/s}else{this.m_u2.SetZero()}t=this.m_maxLength2-s;w=k.b2Max(w,-t);t=k.b2Clamp(t+g.b2_linearSlop,-g.b2_maxLinearCorrection,0);u=-this.m_limitMass2*t;v=this.m_limitPositionImpulse2;this.m_limitPositionImpulse2=k.b2Max(0,this.m_limitPositionImpulse2+u);u=this.m_limitPositionImpulse2-v;p=-u*this.m_u2.x;q=-u*this.m_u2.y;b.m_position.x+=b.m_invMass*p;b.m_position.y+=b.m_invMass*q;b.m_rotation+=b.m_invI*(l*q-m*p);b.m_R.Set(b.m_rotation)}return w<g.b2_linearSlop},m_ground:null,m_groundAnchor1:new h,m_groundAnchor2:new h,m_localAnchor1:new h,m_localAnchor2:new h,m_u1:new h,m_u2:new h,m_constant:null,m_ratio:null,m_maxLength1:null,m_maxLength2:null,m_pulleyMass:null,m_limitMass1:null,m_limitMass2:null,m_pulleyImpulse:null,m_limitImpulse1:null,m_limitImpulse2:null,m_limitPositionImpulse1:null,m_limitPositionImpulse2:null,m_limitState1:0,m_limitState2:0});bp.b2_minPulleyLength=g.b2_lengthUnitsPerMeter;var bq=f.create();Object.extend(bq.prototype,bf.prototype);Object.extend(bq.prototype,{initialize:function(){this.type=be.e_unknownJoint;this.userData=null;this.body1=null;this.body2=null;this.collideConnected=false;this.groundPoint1=new h;this.groundPoint2=new h;this.anchorPoint1=new h;this.anchorPoint2=new h;this.type=be.e_pulleyJoint;this.groundPoint1.Set(-1,1);this.groundPoint2.Set(1,1);this.anchorPoint1.Set(-1,0);this.anchorPoint2.Set(1,0);this.maxLength1=.5*bp.b2_minPulleyLength;this.maxLength2=.5*bp.b2_minPulleyLength;this.ratio=1;this.collideConnected=true},groundPoint1:new h,groundPoint2:new h,anchorPoint1:new h,anchorPoint2:new h,maxLength1:null,maxLength2:null,ratio:null});var br=f.create();Object.extend(br.prototype,be.prototype);Object.extend(br.prototype,{GetAnchor1:function(){var a=this.m_body1.m_R;return new h(this.m_body1.m_position.x+(a.col1.x*this.m_localAnchor1.x+a.col2.x*this.m_localAnchor1.y),this.m_body1.m_position.y+(a.col1.y*this.m_localAnchor1.x+a.col2.y*this.m_localAnchor1.y))},GetAnchor2:function(){var a=this.m_body2.m_R;return new h(this.m_body2.m_position.x+(a.col1.x*this.m_localAnchor2.x+a.col2.x*this.m_localAnchor2.y),this.m_body2.m_position.y+(a.col1.y*this.m_localAnchor2.x+a.col2.y*this.m_localAnchor2.y))},GetJointAngle:function(){return this.m_body2.m_rotation-this.m_body1.m_rotation},GetJointSpeed:function(){return this.m_body2.m_angularVelocity-this.m_body1.m_angularVelocity},GetMotorTorque:function(a){return a*this.m_motorImpulse},SetMotorSpeed:function(a){this.m_motorSpeed=a},SetMotorTorque:function(a){this.m_maxMotorTorque=a},GetReactionForce:function(a){var b=this.m_ptpImpulse.Copy();b.Multiply(a);return b},GetReactionTorque:function(a){return a*this.m_limitImpulse},initialize:function(a){this.m_node1=new bd;this.m_node2=new bd;this.m_type=a.type;this.m_prev=null;this.m_next=null;this.m_body1=a.body1;this.m_body2=a.body2;this.m_collideConnected=a.collideConnected;this.m_islandFlag=false;this.m_userData=a.userData;this.K=new j;this.K1=new j;this.K2=new j;this.K3=new j;this.m_localAnchor1=new h;this.m_localAnchor2=new h;this.m_ptpImpulse=new h;this.m_ptpMass=new j;var b;var c;var d;b=this.m_body1.m_R;c=a.anchorPoint.x-this.m_body1.m_position.x;d=a.anchorPoint.y-this.m_body1.m_position.y;this.m_localAnchor1.x=c*b.col1.x+d*b.col1.y;this.m_localAnchor1.y=c*b.col2.x+d*b.col2.y;b=this.m_body2.m_R;c=a.anchorPoint.x-this.m_body2.m_position.x;d=a.anchorPoint.y-this.m_body2.m_position.y;this.m_localAnchor2.x=c*b.col1.x+d*b.col1.y;this.m_localAnchor2.y=c*b.col2.x+d*b.col2.y;this.m_intialAngle=this.m_body2.m_rotation-this.m_body1.m_rotation;this.m_ptpImpulse.Set(0,0);this.m_motorImpulse=0;this.m_limitImpulse=0;this.m_limitPositionImpulse=0;this.m_lowerAngle=a.lowerAngle;this.m_upperAngle=a.upperAngle;this.m_maxMotorTorque=a.motorTorque;this.m_motorSpeed=a.motorSpeed;this.m_enableLimit=a.enableLimit;this.m_enableMotor=a.enableMotor},K:new j,K1:new j,K2:new j,K3:new j,PrepareVelocitySolver:function(){var a=this.m_body1;var b=this.m_body2;var c;c=a.m_R;var d=c.col1.x*this.m_localAnchor1.x+c.col2.x*this.m_localAnchor1.y;var e=c.col1.y*this.m_localAnchor1.x+c.col2.y*this.m_localAnchor1.y;c=b.m_R;var f=c.col1.x*this.m_localAnchor2.x+c.col2.x*this.m_localAnchor2.y;var h=c.col1.y*this.m_localAnchor2.x+c.col2.y*this.m_localAnchor2.y;var i=a.m_invMass;var j=b.m_invMass;var l=a.m_invI;var m=b.m_invI;this.K1.col1.x=i+j;this.K1.col2.x=0;this.K1.col1.y=0;this.K1.col2.y=i+j;this.K2.col1.x=l*e*e;this.K2.col2.x=-l*d*e;this.K2.col1.y=-l*d*e;this.K2.col2.y=l*d*d;this.K3.col1.x=m*h*h;this.K3.col2.x=-m*f*h;this.K3.col1.y=-m*f*h;this.K3.col2.y=m*f*f;this.K.SetM(this.K1);this.K.AddM(this.K2);this.K.AddM(this.K3);this.K.Invert(this.m_ptpMass);this.m_motorMass=1/(l+m);if(this.m_enableMotor==false){this.m_motorImpulse=0}if(this.m_enableLimit){var n=b.m_rotation-a.m_rotation-this.m_intialAngle;if(k.b2Abs(this.m_upperAngle-this.m_lowerAngle)<2*g.b2_angularSlop){this.m_limitState=be.e_equalLimits}else if(n<=this.m_lowerAngle){if(this.m_limitState!=be.e_atLowerLimit){this.m_limitImpulse=0}this.m_limitState=be.e_atLowerLimit}else if(n>=this.m_upperAngle){if(this.m_limitState!=be.e_atUpperLimit){this.m_limitImpulse=0}this.m_limitState=be.e_atUpperLimit}else{this.m_limitState=be.e_inactiveLimit;this.m_limitImpulse=0}}else{this.m_limitImpulse=0}if(bb.s_enableWarmStarting){a.m_linearVelocity.x-=i*this.m_ptpImpulse.x;a.m_linearVelocity.y-=i*this.m_ptpImpulse.y;a.m_angularVelocity-=l*(d*this.m_ptpImpulse.y-e*this.m_ptpImpulse.x+this.m_motorImpulse+this.m_limitImpulse);b.m_linearVelocity.x+=j*this.m_ptpImpulse.x;b.m_linearVelocity.y+=j*this.m_ptpImpulse.y;b.m_angularVelocity+=m*(f*this.m_ptpImpulse.y-h*this.m_ptpImpulse.x+this.m_motorImpulse+this.m_limitImpulse)}else{this.m_ptpImpulse.SetZero();this.m_motorImpulse=0;this.m_limitImpulse=0}this.m_limitPositionImpulse=0},SolveVelocityConstraints:function(a){var b=this.m_body1;var c=this.m_body2;var d;d=b.m_R;var e=d.col1.x*this.m_localAnchor1.x+d.col2.x*this.m_localAnchor1.y;var f=d.col1.y*this.m_localAnchor1.x+d.col2.y*this.m_localAnchor1.y;d=c.m_R;var g=d.col1.x*this.m_localAnchor2.x+d.col2.x*this.m_localAnchor2.y;var h=d.col1.y*this.m_localAnchor2.x+d.col2.y*this.m_localAnchor2.y;var i;var j=c.m_linearVelocity.x+ -c.m_angularVelocity*h-b.m_linearVelocity.x- -b.m_angularVelocity*f;var l=c.m_linearVelocity.y+c.m_angularVelocity*g-b.m_linearVelocity.y-b.m_angularVelocity*e;var m=-(this.m_ptpMass.col1.x*j+this.m_ptpMass.col2.x*l);var n=-(this.m_ptpMass.col1.y*j+this.m_ptpMass.col2.y*l);this.m_ptpImpulse.x+=m;this.m_ptpImpulse.y+=n;b.m_linearVelocity.x-=b.m_invMass*m;b.m_linearVelocity.y-=b.m_invMass*n;b.m_angularVelocity-=b.m_invI*(e*n-f*m);c.m_linearVelocity.x+=c.m_invMass*m;c.m_linearVelocity.y+=c.m_invMass*n;c.m_angularVelocity+=c.m_invI*(g*n-h*m);if(this.m_enableMotor&&this.m_limitState!=be.e_equalLimits){var o=c.m_angularVelocity-b.m_angularVelocity-this.m_motorSpeed;var p=-this.m_motorMass*o;var q=this.m_motorImpulse;this.m_motorImpulse=k.b2Clamp(this.m_motorImpulse+p,-a.dt*this.m_maxMotorTorque,a.dt*this.m_maxMotorTorque);p=this.m_motorImpulse-q;b.m_angularVelocity-=b.m_invI*p;c.m_angularVelocity+=c.m_invI*p}if(this.m_enableLimit&&this.m_limitState!=be.e_inactiveLimit){var r=c.m_angularVelocity-b.m_angularVelocity;var s=-this.m_motorMass*r;if(this.m_limitState==be.e_equalLimits){this.m_limitImpulse+=s}else if(this.m_limitState==be.e_atLowerLimit){i=this.m_limitImpulse;this.m_limitImpulse=k.b2Max(this.m_limitImpulse+s,0);s=this.m_limitImpulse-i}else if(this.m_limitState==be.e_atUpperLimit){i=this.m_limitImpulse;this.m_limitImpulse=k.b2Min(this.m_limitImpulse+s,0);s=this.m_limitImpulse-i}b.m_angularVelocity-=b.m_invI*s;c.m_angularVelocity+=c.m_invI*s}},SolvePositionConstraints:function(){var a;var b;var c=this.m_body1;var d=this.m_body2;var e=0;var f;f=c.m_R;var h=f.col1.x*this.m_localAnchor1.x+f.col2.x*this.m_localAnchor1.y;var i=f.col1.y*this.m_localAnchor1.x+f.col2.y*this.m_localAnchor1.y;f=d.m_R;var j=f.col1.x*this.m_localAnchor2.x+f.col2.x*this.m_localAnchor2.y;var l=f.col1.y*this.m_localAnchor2.x+f.col2.y*this.m_localAnchor2.y;var m=c.m_position.x+h;var n=c.m_position.y+i;var o=d.m_position.x+j;var p=d.m_position.y+l;var q=o-m;var r=p-n;e=Math.sqrt(q*q+r*r);var s=c.m_invMass;var t=d.m_invMass;var u=c.m_invI;var v=d.m_invI;this.K1.col1.x=s+t;this.K1.col2.x=0;this.K1.col1.y=0;this.K1.col2.y=s+t;this.K2.col1.x=u*i*i;this.K2.col2.x=-u*h*i;this.K2.col1.y=-u*h*i;this.K2.col2.y=u*h*h;this.K3.col1.x=v*l*l;this.K3.col2.x=-v*j*l;this.K3.col1.y=-v*j*l;this.K3.col2.y=v*j*j;this.K.SetM(this.K1);this.K.AddM(this.K2);this.K.AddM(this.K3);this.K.Solve(br.tImpulse,-q,-r);var w=br.tImpulse.x;var x=br.tImpulse.y;c.m_position.x-=c.m_invMass*w;c.m_position.y-=c.m_invMass*x;c.m_rotation-=c.m_invI*(h*x-i*w);c.m_R.Set(c.m_rotation);d.m_position.x+=d.m_invMass*w;d.m_position.y+=d.m_invMass*x;d.m_rotation+=d.m_invI*(j*x-l*w);d.m_R.Set(d.m_rotation);var y=0;if(this.m_enableLimit&&this.m_limitState!=be.e_inactiveLimit){var z=d.m_rotation-c.m_rotation-this.m_intialAngle;var A=0;if(this.m_limitState==be.e_equalLimits){b=k.b2Clamp(z,-g.b2_maxAngularCorrection,g.b2_maxAngularCorrection);A=-this.m_motorMass*b;y=k.b2Abs(b)}else if(this.m_limitState==be.e_atLowerLimit){b=z-this.m_lowerAngle;y=k.b2Max(0,-b);b=k.b2Clamp(b+g.b2_angularSlop,-g.b2_maxAngularCorrection,0);A=-this.m_motorMass*b;a=this.m_limitPositionImpulse;this.m_limitPositionImpulse=k.b2Max(this.m_limitPositionImpulse+A,0);A=this.m_limitPositionImpulse-a}else if(this.m_limitState==be.e_atUpperLimit){b=z-this.m_upperAngle;y=k.b2Max(0,b);b=k.b2Clamp(b-g.b2_angularSlop,0,g.b2_maxAngularCorrection);A=-this.m_motorMass*b;a=this.m_limitPositionImpulse;this.m_limitPositionImpulse=k.b2Min(this.m_limitPositionImpulse+A,0);A=this.m_limitPositionImpulse-a}c.m_rotation-=c.m_invI*A;c.m_R.Set(c.m_rotation);d.m_rotation+=d.m_invI*A;d.m_R.Set(d.m_rotation)}return e<=g.b2_linearSlop&&y<=g.b2_angularSlop},m_localAnchor1:new h,m_localAnchor2:new h,m_ptpImpulse:new h,m_motorImpulse:null,m_limitImpulse:null,m_limitPositionImpulse:null,m_ptpMass:new j,m_motorMass:null,m_intialAngle:null,m_lowerAngle:null,m_upperAngle:null,m_maxMotorTorque:null,m_motorSpeed:null,m_enableLimit:null,m_enableMotor:null,m_limitState:0});br.tImpulse=new h;var bs=f.create();Object.extend(bs.prototype,bf.prototype);Object.extend(bs.prototype,{initialize:function(){this.type=be.e_unknownJoint;this.userData=null;this.body1=null;this.body2=null;this.collideConnected=false;this.type=be.e_revoluteJoint;this.anchorPoint=new h(0,0);this.lowerAngle=0;this.upperAngle=0;this.motorTorque=0;this.motorSpeed=0;this.enableLimit=false;this.enableMotor=false},anchorPoint:null,lowerAngle:null,upperAngle:null,motorTorque:null,motorSpeed:null,enableLimit:null,enableMotor:null});var bt,bu,bv,bw;var bx=[0,0];var by=[window.screenX,window.screenY,window.innerWidth,window.innerHeight];var bz=false;var bA=false;var bB=1;var bC=1/25;var bD=new Array;var bE=200;var bF=false;var bG=0;var bH=0;var bI=new Array;var bJ=0;var bK=new Array;var bL=new Array;var bM=new Array;var bN={x:0,y:1};b_();bO()})}})})(jQuery)