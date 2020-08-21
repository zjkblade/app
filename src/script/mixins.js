var pagination = {
  data: function () {
    return {
      isLoading: false,
      hasMore: true,
      current: 0,
      pageSize: 10,
      records: [],
    }
  },
  computed: {
    hasData: function () {
      return this.records.length > 0;
    }
  },
  methods: {
    initPageOptions: function () {
      this.current = 0;
      this.hasMore = true;
      this.records = [];
    },
    getPageOptions: function (options) {
      var pager = {
        current: ++this.current,
        pageSize: this.pageSize,
      };
      return Object.assign({}, pager, options);
    },
    loadRecordPromise: function (callback) {
      var $this = this;
      if (!$this.isLoading && $this.hasMore) {
        $this.isLoading = true;
        callback(
          function (options) {
            var records = [], pages = 0;
            if (options) {
              records = options.records;
              pages = options.pages;
            }
            $this.records = $this.records.concat(records);
            $this.hasMore = $this.current < pages;
            $this.isLoading = false;
          },
          function () {
            $this.hasMore = false;
            $this.isLoading = false;
          }
        );
      }
    },
  }
};
var winpage = {
  el: '#app',
  data: function () {
    return {
      name: '',
      frm: '',
    };
  },
  mounted: function () {
    var $this = this;
    util.app.ready(function () {
      if ($api.byId("header")) {
        util.app.fixStatusBar('header');
      }
      $this.name = util.app.param('name');
      $this.listen();
      $this.init();
      $this.openFrame();
    });
  },
  methods: {
    listen: function () {
      var $this = this;
      util.app.listen('keyback', function () {
        $this.close();
      });
      util.app.listen('viewappear', function () {
      });
    },
    openFrame: function () {
      var $this = this;
      var headerHeight = $api.byId("header") ? $api.offset($api.byId("header")).h : 0;
      if ($this.frm) {
        util.app.openFrame($this.name, $this.frm, {y: headerHeight}, {id: $this.id});
      }
    },
    close: function () {
      var $this = this;
      util.app.closeWindow($this.name);
    },
    init: function () {
      // 空实现，有需要页面里重写
      var $this = this;
    },
  }
}
var frmpage = {
  el: '#app',
  data: function () {
    return {
      name: ''
    };
  },
  mounted: function () {
    var $this = this;
    util.app.ready(function () {
      $this.name = util.app.param('name');
      $this.listen();
      $this.init();
    });
  },
  methods: {
    close: function () {
      var $this = this;
      util.app.closeWindow($this.name);
    },
    listen: function () {
      // 空实现，有需要页面里重写
      var $this = this;
    },
    init: function () {
      // 空实现，有需要页面里重写
      var $this = this;
    },
  }
}