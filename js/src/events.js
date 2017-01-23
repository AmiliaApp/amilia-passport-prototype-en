(function() {

  Backbone.EventModel = Backbone.Model.extend({
    idAttribute: 'Id'
  });

  Backbone.EventCollection = Backbone.Collection.extend({
    model: Backbone.EventModel
  });


  Backbone.EventView = Backbone.View.extend({
    template: undefined,
    className: 'event',
    events: {
      'click a.show-receipt': 'onReceipt'
    },
    onReceipt: function(e) {
      e.preventDefault();
      var receiptView = new Backbone.ReceiptView({
        model: this.model
      }).render();
      receiptView.$el.hide();
      $('#events').append(receiptView.$el);
      receiptView.$el.fadeIn();
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.css({
        width: Math.min(Math.max(screen.width, screen.height), Backbone.SCREEN_MAX_WIDTH) - Backbone.SIDE_MENU_WIDTH
      });
      return this;
    }
  });
  $('document').ready(function() {
    Backbone.EventView.prototype.template = _.template($('#event-template').html());
  });

  Backbone.EventsView = Backbone.View.extend({
    className: 'events',
    initialize: function(options) {
      this.onResize = _.bind(_.debounce(this.onResize, 100), this);
      $(window).on('resize', this.onResize);
    },
    remove: function() {
      $(window).off('resize', this.onResize);
      return Backbone.View.prototype.remove.apply(this, arguments);
    },
    onResize: function() {
      this.render();
    },
    render: function() {
      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];
      this.$el.empty();

      var self = this,
          lastDateString = '';
      this.collection.each(function(model) {
        var view = new Backbone.EventView({
          model: model
        });

        var date = model.get('DateString');
        if (lastDateString != date) self.$el.append('<div class="event-date">' + date + '</div>');
        lastDateString = date;

        self.$el.append(view.render().$el);
        self.views.push(view);
      });
      return this;
    }
  });

}.call(this));