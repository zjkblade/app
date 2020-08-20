Vue.component('e-picker', {
    template: `<div class="eui-modal" :class="{visible:visible}"
         @touchmove.prevent="pickerHandler('move', pickerType, $event)"
         @touchend.stop="pickerHandler('end')"
         @click.prevent="pickerClick(false)">
        <div class="eui-block absolute bottom" @click.stop="">
            <div class="eui-card radius-top">
                <div class="eui-card-header padding-lr-16 padding-tb-0">
                    <div class="eui-block eui-list">
                        <div class="eui-item">
                            <div class="eui-item-left" @click="pickerClick(false)">
                                <span class="eui-link">关闭</span>
                            </div>
                            <div class="eui-item-body flex-center">
                                <span v-cloak="" class="fs-15 color-121415">{{title}}</span>
                            </div>
                            <div class="eui-item-right" @click="pickerClick(true)">
                                <span class="eui-link">确定</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="eui-card-body no-padding">
                    <div v-cloak="" v-if="showPickerTitle" class="flex-center padding-tb-5">
                        <div v-for="title in pickerTitles" class="flex-center flex-equal">
                            <span v-cloak="">{{title}}</span>
                        </div>
                    </div>
                    <div class="picker relative">
                        <div class="picker-mask"><div></div></div>
                        <div class="picker-items" v-for="field in fields" @touchstart.stop="pickerHandler('start', field, $event)">
                            <div class="picker-item" :ref="'picker-' + field" :style="fieldStyle[field]">
                                <div v-for="(item, index) in pickerOptions[field]" >
                                    <span v-if="pickerKey" v-cloak  :class="{active: isActive(field, index) , next: isActive(field, index -1), prev: isActive(field, index + 1)}">{{item[pickerLabel]}}</span>
                                    <span v-if="!pickerKey" v-cloak  :class="{active: isActive(field, index) , next: isActive(field, index -1), prev: isActive(field, index + 1)}">{{item}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    props   : {
        pickerKey      : {type: String, default: ''},
        pickerLabel    : {type: String, default: ''},
        title          : {type: Boolean, default: ''},
        showPickerTitle: {type: Boolean, default: false},
        visible        : {type: Boolean, default: false},
        pickerValue    : {type: Object, default: {}},
        pickerFields   : {type: Object, default: {}},
        pickerOptions  : {type: Array, default: []},
    },
    data    : function () {
        return {
            speed     : 1,
            itemHeight: 38,
            pickerType: '',
            positionY : null,
            pickerEle : null,
        }
    },
    computed: {

        fields      : function () {
            var $this = this;
            return Object.keys($this.pickerFields);
        },
        pickerTitles: function () {
            var $this = this;
            return Object.keys($this.pickerFields).map(function (filed) {
                return $this.pickerFields[filed].label
            });
        },
        fieldStyle  : function () {
            var $this = this;
            var itemHeight = $this.itemHeight;

            var style = $this.fields.reduce(function (result, field) {
                var index;
                var pickerOptionsValues = $this.pickerOptions[field];
                var value = $this.pickerValue[field];

                if (value) {
                    if ($this.pickerKey) {
                        pickerOptionsValues = pickerOptionsValues.map(function (item) {
                            return item[$this.pickerKey];
                        });
                        index = pickerOptionsValues.indexOf(value[$this.pickerKey]);
                    } else {
                        index = pickerOptionsValues.indexOf(value);
                    }
                    result[field] = {
                        height: ($this.pickerOptions[field].length * itemHeight) + 'px',
                        top   : ((2 - index) * itemHeight) + 'px'
                    };
                } else {
                    result[field] = {
                        height: ($this.pickerOptions[field].length * itemHeight) + 'px',
                        top   : (3 * itemHeight) + 'px'
                    };
                }
                return result;
            }, {});
            return style;
        }
    },
    methods : {
        isActive(field, index) {
            var key = this.pickerKey;
            var value = this.pickerValue[field];
            var option = this.pickerOptions[field][index];
            return (key && value && option) ? value[key] === option[key] : value === option;
        },
        pickerHandler: function (type, field, event) {
            var $this = this;
            if (type === 'start') {
                $this.pickerType = field;
                $this.pickerEle = $this.$refs['picker-' + field][0];
                var targetTouche = event.targetTouches && event.targetTouches[0];
                if (targetTouche) {
                    $this.positionY = targetTouche.pageY;
                }
            } else if (type === 'end') {
                var itemHeight = $this.itemHeight;
                if ($this.pickerType) {
                    var values = $this.pickerOptions[$this.pickerType];
                    var style = getComputedStyle($this.pickerEle);

                    var indexMin = 0;
                    var indexMax = values.length - 1;

                    var topMax = (2 - indexMin) * itemHeight;
                    var topMin = (2 - indexMax) * itemHeight;

                    var top = Math.round((parseInt(style.top) / itemHeight)) * itemHeight;
                    top = top >= topMax ? topMax : (top <= topMin ? topMin : top);

                    var index = 2 - top / itemHeight;
                    index = index >= indexMax ? indexMax : (index <= indexMin ? indexMin : index);


                    $this.pickerEle.style.top = top + 'px';
                    $this.pickerValue[$this.pickerType] = values[index];


                    // 年月改变的时候计算每月的天数
                    if ($this.pickerType === 'year' || $this.pickerType === 'month') {
                        var year = $this.pickerValue.year;
                        var month = $this.pickerValue.month;
                        var datesMax = util.date.getMaxDates(year, month);
                        if ($this.pickerValue.date > datesMax) {
                            $this.pickerValue.date = datesMax;
                            $this.$refs['picker-date'][0].style.top = (2 - datesMax) * itemHeight + 'px';
                        }
                    }

                    if ($this.pickerType === 'workType1') {
                        var workType1 = $this.pickerValue.workType1;
                        if (workType1) {
                            $this.pickerOptions.workType2 = workType1.children;
                        } else {
                            $this.pickerOptions.workType2 = [];
                        }
                    }

                    $this.$forceUpdate();
                    $this.pickerType = '';
                    $this.positionY = null;
                    $this.pickerEle = null;
                }
            } else if (type === 'move') {
                util.app.debounce(50, function () {
                    if ($this.pickerEle) {
                        var style = getComputedStyle($this.pickerEle);
                        var targetTouche = event.targetTouches && event.targetTouches[0];
                        if (targetTouche) {
                            $this.pickerEle.style.top = (parseInt(style.top) + (targetTouche.pageY - $this.positionY) * $this.speed) + 'px';
                            $this.positionY = targetTouche.pageY;
                        }
                    }
                });
            }
        },
        pickerClick  : function (isOk) {
            var $this = this;
            var results = $this.fields.filter(function (field) {
                return $this.pickerValue[field] !== null && $this.pickerValue[field] !== undefined;
            });
            var result = (isOk && results.length === $this.fields.length) ? $this.pickerValue : null;
            $this.$emit('event-picker-callback', false, result);
        }
    }
});

Vue.component('e-date-picker', {
    template: `<e-picker title="请选择时间" :visible="visible" :show-picker-title="true" :picker-value="pickerValue" :picker-fields="pickerFields" :picker-options="pickerOptions" @event-picker-callback="pickerCallback"></e-picker>`,
    props   : {
        pickerValue : {type: Object, default: {year: '', month: '', date: ''}},
        visible     : {type: Boolean, default: false},
        pickerFields: {
            type: Object, default: {
                year : {label: '年', name: 'year'},
                month: {label: '月', name: 'month'},
                date : {label: '日', name: 'date'},
            }
        },
    },
    data    : function () {
        return {
            itemHeight     : 38,
            showPickerTitle: true,
        }
    },
    computed: {
        pickerOptions: function () {
            var $this = this;
            var today = new Date();
            var thisYear = today.getFullYear();
            var pickerOptions = {
                year  : util.array.numberArray(thisYear - 2, thisYear + 2),
                month : util.array.numberArray(1, 12),
                date  : util.array.numberArray(1, util.date.getMaxDates($this.pickerValue.year, $this.pickerValue.month)),
                hour  : util.array.numberArray(0, 23),
                minute: util.array.numberArray(0, 59),
                second: util.array.numberArray(0, 59)
            };
            return pickerOptions;
        },
    },
    methods : {
        pickerCallback: function (visible, value) {
            this.$emit('event-picker-callback', visible, value);
        }
    }
});