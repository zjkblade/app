Vue.component('e-header', {
    template: `<div id="header" class="header">
        <div class="eui-header">
            <div class="eui-header-left">
                <span v-cloak="" v-if="close" @click="close" class="fs-25" :class="[leftIcon]"></span>
            </div>
            <div class="eui-header-body">
                <span v-if="title" v-cloak="">{{title}}</span>
                <slot name="body"></slot>
            </div>
            <div class="eui-header-right">
                <slot name="right"></slot>
            </div>
        </div>
        <slot></slot>
    </div>`,
    props   : {
        close   : Function,
        leftIcon: {type: String, default: 'iconfont icon-left'},
        title   : {type: String},
    }
});