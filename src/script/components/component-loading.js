Vue.component('e-loading', {
    template: `<div>
        <div v-cloak="" v-if="hasMore"  class="eui-loading">
            <div class="eui-loading-icon"></div>
            <div class="eui-loading-text">数据正在加载，请稍候..</div>
        </div>
        <div v-cloak="" v-if="!hasMore" class="eui-loading flex-column flex-center">
            <div v-if="hasData" class="eui-loading-text">没有更多数据了</div>
            <div v-if="!hasData" class="eui-loading-text">没有查询到数据</div>
        </div>
    </div>`,
    props   : {
        hasData: {type: Boolean, default: true},
        hasMore: {type: Boolean, default: true},
    }
});