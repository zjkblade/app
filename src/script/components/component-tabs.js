Vue.component('e-tabs', {
    template: `<div class="fixed bottom eui-tabs eui-tabs-v bg-white no-padding">
        <div v-for="(tab, index) in tabs" class="eui-tab" :class="{active:tabSelected === tab.name}" @click="clickTab(tab, index)">
            <span class="fs-25 iconfont" :class="[tab.icon, {active:tabSelected === tab.name}]"></span>
            <span class="fs-12" v-cloak="">{{tab.label}}</span>
        </div>
    </div>`,
    props   : {
        tabs       : {type: Array, default: []},
        tabSelected: {type: String},
    },
    methods : {
        clickTab: function (tab, index) {
            this.$emit('event-tab-click', tab, index);
        }
    }
});

Vue.component('e-top-tabs', {
    template: `<div v-cloak=""  slot="body" class="eui-tabs eui-tabs-top eui-tabs-v relative">
            <div class="eui-tab" v-cloak="" v-for="tab in tabs" :class="{active:tabSelected === tab.name}" @click="clickTab(tab.name)">
                <span v-cloak="">{{tab.label}}</span>
                <span class="absolute tab-border"></span>
            </div>
        </div>`,
    props   : {
        tabs       : {type: Array, default: []},
        tabSelected: {type: String},
    },
    methods : {
        clickTab: function (tabName) {
            this.$emit('event-tab-click', tabName);
        }
    }
});
