(function() {

  // From CSS
  Backbone.SIDE_MENU_WIDTH = 86;
  Backbone.CARD_MARGIN = 15;
  Backbone.SCREEN_MAX_WIDTH = 675;
  Backbone.SCREEN_MAX_HEIGHT = 375;

  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  Backbone.MembershipModel = Backbone.Model.extend({
    idAttribute: 'Id'
  });

  Backbone.MembershipCollection = Backbone.Collection.extend({
    model: Backbone.MembershipModel
  });


  Backbone.MembershipView = Backbone.View.extend({
    template: undefined,
    className: 'card',
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));

      var screenWidth = Math.max(screen.width, screen.height),
          screenHeight = Math.min(screen.width, screen.height);
      this.$el.css({
        width: Math.min(screenWidth, Backbone.SCREEN_MAX_WIDTH) - Backbone.SIDE_MENU_WIDTH,
        height: Math.min(screenHeight, Backbone.SCREEN_MAX_HEIGHT) - Backbone.CARD_MARGIN*2
      });
      this.$barCode = this.$el.find('.bar-code');

      var id = (this.model.get('PersonId') || '?????');
      if (_.isNumber(id)) id = zeroPad(id, 10);

      JsBarcode(this.$barCode[0], 'P' + id, {
        width: screenWidth < 600 ? 2 : 3,
        height: screenWidth < 600 ? 40 : 50
      });

      return this;
    }
  });
  $('document').ready(function() {
    Backbone.MembershipView.prototype.template = _.template($('#membership-template').html());
  });

  Backbone.MembershipsView = Backbone.View.extend({
    className: 'cards',
    /*events: {
      'scroll': 'onScroll',
      'mousedown': 'onMousedown',
      'mouseup': 'onMouseup',
      'touchstart': 'onMousedown',
      'touchend': 'onMouseup'
    },*/
    initialize: function(options) {
      this.maybeSnap = _.bind(_.debounce(this.maybeSnap, 250), this);
      this.checkScrollDone = _.bind(_.debounce(this.checkScrollDone, 100), this);
      this.onResize = _.bind(_.debounce(this.onResize, 100), this);
      this.lastSnap = 0;
      $(window).on('resize', this.onResize);
    },
    remove: function() {
      $(window).off('resize', this.onResize);
      return Backbone.View.prototype.remove.apply(this, arguments);
    },
    onResize: function() {
      this.render();
    },
    onScroll: function(e) {
      this.scroll = true;
      _.defer(this.checkScrollDone);
    },
    checkScrollDone: function() {
      this.scroll = false;
      if (!this.touch) _.defer(this.maybeSnap);
    },
    onMousedown: function(e) {
      this.touch = true;
      this.$el.stop();
    },
    onMouseup: function(e) {
      this.touch = false;
      _.defer(this.maybeSnap);
    },
    maybeSnap: function() {
      if (this.cards.length == 0 || this.touch || this.scroll) return this;

      var dist = this._getSnapDist();
      if (dist && Math.abs(dist) > 10 && _.now() > this.lastSnap + 1000) {
        console.log('maybeSnap', dist);
        this.$el.animate({scrollTop: this.$el.scrollTop() + dist+'px'});
        this.lastSnap = _.now();
      }
    },
    _getSnapDist: function() {
      var cards = this.$('.card'),
          index = 0,
          dist = cards.first().position().top;
      cards.each(function(i) {
        if (Math.abs($(this).position().top) < Math.abs(dist)) {
          index = i;
          dist = $(this).position().top;
        }
      });
      return dist;
    },
    render: function() {
      this.cards || (this.cards = []);
      for (var i = 0; i < this.cards.length; i++) this.cards[i].remove();
      this.cards = [];

      var deck = this;
      this.collection.each(function(model) {
        var card = new Backbone.MembershipView({
          model: model
        });
        deck.$el.append(card.render().$el);
        deck.cards.push(card);
      });

      var dist = this._getSnapDist();
      if (dist > 0) this.$el.css('scrollTop', this.$el.scrollTop() + dist+'px');
      return this;
    }
  });

}.call(this));