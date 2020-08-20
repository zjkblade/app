var pagination = {
    data    : function () {
        return {
            isLoading: false,
            hasMore  : true,
            current  : 0,
            pageSize : 10,
            records  : [],
        }
    },
    computed: {
        hasData: function () {
            return this.records.length > 0;
        }
    },
    methods : {
        initPageOptions  : function () {
            this.current = 0;
            this.hasMore = true;
            this.records = [];
        },
        getPageOptions   : function (options) {
            var pager = {
                current : ++this.current,
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
