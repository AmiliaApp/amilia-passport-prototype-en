(function() {

  Backbone.CommunicationModel = Backbone.Model.extend({
    idAttribute: 'Id'
  });

  Backbone.CommunicationCollection = Backbone.Collection.extend({
    model: Backbone.CommunicationModel
  });


  Backbone.CommunicationView = Backbone.View.extend({
    template: undefined,
    className: 'communication',
    communications: {
      'click a.show-receipt': 'onReceipt'
    },
    onReceipt: function(e) {
      e.prcommunicationDefault();
      var receiptView = new Backbone.ReceiptView({
        model: this.model
      }).render();
      receiptView.$el.hide();
      $('#communications').append(receiptView.$el);
      receiptView.$el.fadeIn();
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.addClass(this.model.get('Status'));
      this.$el.css({
        width: Math.min(Math.max(screen.width, screen.height), Backbone.SCREEN_MAX_WIDTH) - Backbone.SIDE_MENU_WIDTH
      });
      return this;
    }
  });
  $('document').ready(function() {
    Backbone.CommunicationView.prototype.template = _.template($('#communication-template').html());
  });

  Backbone.CommunicationsView = Backbone.View.extend({
    className: 'communications',
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
        var view = new Backbone.CommunicationView({
          model: model
        });

        self.$el.append(view.render().$el);
        self.views.push(view);
      });
      return this;
    }
  });

}.call(this));