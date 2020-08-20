var userAgent = navigator.userAgent;
var isAndroid = (/android/gi).test(userAgent);
var isProd = [true, false][1] || isAndroid;

(function (window) {
    var template = function (str, options) {
        return str.replace(/\{\w+\}/g, function ($0) {
            return options[$0.replace(/\{|\}/g, '')];
        });
    };
    var isMobile = function (str) {
        return /^1\d{10}$/g.test(str);
    };
    var isPassword = function (str) {
        return /^[0-9a-zA-Z_]{6,16}$/g.test(str);
    };
    window.stringutil = {
        template  : template,
        isMobile  : isMobile,
        isPassword: isPassword,
    };
})(window);

(function (window) {
    var split = function (array, length) {
        var result = [];
        while (array.length !== 0) {
            result.push(array.splice(0, length));
        }
        return result;
    };

    var numberArray = function (min, max) {
        return new Array(max - min + 1).fill(1).map(function (item, index) {
            return min + index
        });
    };

    var flat = function (array, prop) {
        var _array = [];
        array.forEach((item) => {
            if (Array.isArray(item)) {
                _array = _array.concat(flat(item, prop));
            } else {
                _array.push(item);
                if (prop && Array.isArray(item[prop])) {
                    _array = _array.concat(flat(item[prop], prop));
                }
            }
        });
        return _array;
    };

    var isFunction = function (fun) {
        return typeof fun === 'function'
    }

    /**
     * 根据keys获取values的值
     * @param keys
     * @param values
     */
    var pickByKeys = function (keys, values) {
        const result = {}
        keys.forEach((field) => {
            result[field] = values[field]
        })
        return result
    }

    /**
     * 设置items及子节点为不不可选
     * @param items
     */
    var disableItems = function (items) {
        if (items && items.length > 0) {
            items.forEach((item) => {
                item.disabled = true
                disableItems(item.children)
            })
        }
    }

    /**
     * 根据list构造 (key值为key，value为有相同key值的数组) 的对象
     * @param list
     * @param key
     */
    var groupListByKey = function (list, key) {
        const itemMap = {}
        list.forEach((item) => {
            if (item[key]) {
                itemMap[item[key]] = itemMap[item[key]] || []
                itemMap[item[key]].push(item)
            }
        })
        return itemMap
    }

    var list2Tree = function (options) {
        var list = options.list;
        var parentKey = options.parentKey || 'parentId';
        var idKey = options.idKey || 'id';
        var callback = options.callback;
        // 构造 (ant-design > a-tree|a-table|a-tree-select) 需要的数据
        const itemOptions = [].concat(list).map((item) => {
            return Object.assign({}, isFunction(callback) ? callback(item) : {}, item)
        })

        // 构造节点Map
        const itemMap = groupListByKey(itemOptions, parentKey)
        // 构造子节点
        // 这里由于变量的相互引用会自动设置多级的子节点
        itemOptions.forEach((item) => {
            item.children = itemMap[item[idKey]]
        })

        // 返回根节点
        return itemOptions.filter((item) => !item[parentKey])
    }

    window.arrayutil = {
        flat       : flat,
        split      : split,
        list2Tree  : list2Tree,
        numberArray: numberArray
    };
})(window);

(function (window) {
    window.apputil = {
        parseparams : function (params, fields) {
            var results = [];
            fields.forEach(function (field) {
                if (params[field] !== undefined && params[field] !== null && params[field] !== '') {
                    results.push(field + '=' + params[field]);
                }
            });
            var query = results.join('&');
            return query ? ('?' + query) : '';
        },
        parseObj    : function (params, fields) {
            return fields.reduce(function (result, field) {
                result[field] = params[field];
                return result;
            }, {});
        },
        objectKeys  : Object.keys || function (object) {
            var keys = [];
            for (var o in object) {
                keys.push(o);
            }
            return keys;
        },
        objectValues: Object.values || function (object) {
            var values = [];
            for (var o in object) {
                values.push(object[o]);
            }
            return values;
        },
        debounce    : (function () {
            var prevTime;
            return function (debounce, callback) {
                if (prevTime) {
                    if (new Date().getTime() - prevTime >= debounce) {
                        callback();
                        prevTime = null;
                    }
                } else {
                    prevTime = new Date().getTime();
                }
            };
        })(),
        isProd      : function () {
            return isProd;
        },
        ready       : function (callback) {
            if (this.isProd()) {
                window.apiready = callback;
            } else {
                $(callback);
            }
        },
        param       : function (name) {
            if (this.isProd()) {
                return api.pageParam[name];
            } else {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = unescape(decodeURI(window.location.search.substr(1))).match(reg);
                if (r != null) return JSON.parse(r[2]);
                return null;
            }
        },
        fixStatusBar: function (name) {
            if (util.app.isProd()) {
                $api.fixStatusBar($api.byId(name));
            } else {
                var ele = $api.byId(name);
                ele.style.paddingTop = '0.26rem';
            }
        },

        pullDownRefresh: function (callback) {
            if (util.app.isProd()) {
                api.setRefreshHeaderInfo({
                    showTime : true,
                    visible  : true,
                    bgColor  : 'rgba(255, 255, 255, 0)',
                    textColor: '#ccc',
                    textDown : '下拉刷新',
                    textUp   : '松开刷新',
                }, function (ret, err) {
                    setTimeout(function () {
                        callback();
                        api.refreshHeaderLoadDone();
                    }, 300);
                });
            }
        },

        appInstalled : function (bundle) {
            if (this.isProd()) {
                return api.appInstalled({sync: true, appBundle: bundle})
            }
        },
        clearStorage : function () {
            $api.clearStorage();
        },
        removeStorage: function (key) {
            $api.rmStorage(key);
        },
        storage      : function (key, value) {
            if (undefined === value) {
                var value = $api.getStorage(key);
                if (value) {
                    if (value.startsWith('string-')) {
                        return value.replace('string-', '');
                    } else if (value.startsWith('boolean-')) {
                        return JSON.parse(value.replace('boolean-', ''));
                    } else if (value.startsWith('number-')) {
                        return +value.replace('number-', '');
                    } else if (value.startsWith('object-')) {
                        return JSON.parse(value.replace('object-', ''));
                    } else {
                        return value;
                    }
                } else {
                    return undefined;
                }
            } else {
                if (typeof value === 'string') {
                    $api.setStorage(key, 'string-' + value);
                } else if (typeof value === 'boolean') {
                    $api.setStorage(key, 'boolean-' + value);
                } else if (typeof value === 'number') {
                    $api.setStorage(key, 'number-' + value);
                } else {
                    $api.setStorage(key, 'object-' + JSON.stringify(value));
                }
            }
        },
        openWindow   : function (name, url, extra) {
            extra = extra || {};
            if (extra.reload) {
                name = name + '-' + new Date().getTime();
            }
            extra.name = name;

            if (this.isProd()) {
                api.openWin({
                    name             : name,
                    url              : url,
                    pageParam        : extra,
                    bgColor          : '#F6F5F8',
                    bounces          : false,
                    hScrollBarEnabled: false,
                    vScrollBarEnabled: false,
                    delay            : 0,
                    animation        : {
                        type    : 'movein',
                        duration: 300
                    }
                });
            } else {
                var params = [];
                for (var param in extra) {
                    params.push(param + '=' + JSON.stringify(extra[param]));
                }
                window.top.location.href = url + (params.length > 0 ? ('?' + encodeURI(escape(params.join('&')))) : '');
            }
        },
        closeWindow  : function (name) {
            if (this.isProd()) {
                api.closeWin({name: name});
            } else {
                window.top.history.back();
            }
        },
        closeToWindow: function (name, url) {
            if (this.isProd()) {
                api.closeToWin({
                    name     : name,
                    animation: {
                        type    : 'reveal',
                        subType : 'from_left',
                        duration: 300
                    }
                });
            } else {
                window.top.location.href = url;
            }
        },
        openFrame    : function (name, url, options, extra) {
            extra = extra || {};
            extra.name = name;
            if (this.isProd()) {
                api.openFrame({
                    name             : name,
                    url              : url,
                    rect             : {
                        x: options.x || 0,
                        y: options.y,
                        w: options.w || 'auto',
                        h: options.h || 'auto'
                    },
                    pageParam        : extra,
                    bounces          : false,
                    hScrollBarEnabled: false,
                    vScrollBarEnabled: false,
                    reload           : true,
                    progress         : true,
                    allowEdit        : true,
                });
            } else {
                var params = [];
                for (var param in extra) {
                    params.push(param + '=' + JSON.stringify(extra[param]));
                }
                var app = document.getElementById('app');
                var frame = document.createElement('iframe');
                var headerHeight = options.y || 0;
                var height = (options.h || (this.winHeight() - headerHeight)) + 'px';
                frame.name = name;
                frame.style.width = '100%';
                frame.style.border = 'none';
                frame.style.height = height;
                frame.src = url + (params.length > 0 ? ('?' + encodeURI(escape(params.join('&')))) : '');
                app.append(frame);
                window.top.frame = frame;
            }
        },
        closeFrame   : function (name) {
            if (this.isProd()) {
                api.closeFrame({
                    name: name,
                    // animation: {
                    //     type    : 'reveal',
                    //     subType : 'from_right',
                    //     duration: 300
                    // }
                });
            } else {
                window.top.document.getElementById('app').removeChild(window.top.document.getElementsByName(name)[0])
            }
        },
        winWidth     : function () {
            if (this.isProd()) {
                return api.winWidth;
            } else {
                return $api.offset($api.byId("app")).w
            }
        },
        winHeight    : function () {
            if (this.isProd()) {
                return api.winHeight;
            } else {
                return $api.offset($api.byId("app")).h
            }
        },
        emit         : function (name, extra) {
            if (this.isProd()) {
                api.sendEvent({name: name, extra: extra});
            } else {
                (function loop(w) {
                    w.postMessage({'event-name': name, extra: extra}, '*');
                    if (w !== w.top) {
                        loop(w.parent);
                    }
                })(window);
                (function loop(w) {
                    if (w.frames[0]) {
                        w.frames[0].postMessage({'event-name': name, extra: extra}, '*')
                        loop(w.frames[0]);
                    }
                })(window);
            }
        },
        listen       : function (name, resolve) {
            if (this.isProd()) {
                api.addEventListener({name: name}, function (ret) {
                    resolve && resolve.apply(null, [ret]);
                });
            } else {
                window.addEventListener('message', function (event) {
                    var data = event.data;
                    if (data['event-name'] === name) {
                        resolve && resolve.apply(null, [{value: data.extra}]);
                    }
                });
            }
        },
        toast        : function (msg) {
            if (this.isProd()) {
                api.toast({msg: msg, duration: 2000, location: 'middle'});
            } else {
                console.info(msg);
            }
        },
        alert        : function (title, msg) {
            if (this.isProd()) {
                api.alert({title: title, msg: msg});
            }
        },
        confirm      : function (title, msg, submit, cancel) {
            if (this.isProd()) {
                api.confirm({title: title, msg: msg}, function (res) {
                    if (res.buttonIndex === 2) {
                        submit && submit();
                    } else {
                        cancel && cancel();
                    }
                });
            }
        },
        openPicker   : function (title, callback) {
            if (util.app.isProd()) {
                api.openPicker({
                    type : 'date',
                    title: title
                }, function (res) {
                    if (res) {
                        callback(new Date(res.year, res.month - 1, res.day));
                    }
                });
            } else {
                callback();
            }
        },
        actionSheet  : function (title, buttons, callback) {
            if (util.app.isProd()) {
                api.actionSheet({
                    title  : title,
                    buttons: buttons
                }, function (res) {
                    var index = res.buttonIndex;
                    if (index <= buttons.length) {
                        callback(index - 1);
                    }
                });
            } else {
                callback(0);
            }
        },
        text2audio   : function (text) {
            var bdtts = api.require('bdTTS');
            bdtts.init();
            bdtts.speak({
                text: text,
            });
        },
        getPicture   : function (sourceType, callback) {
            if (util.app.isProd()) {
                api.getPicture({
                    sourceType      : sourceType,
                    mediaValue      : "pic",
                    destinationType : "url",
                    allowEdit       : true,
                    encodingType    : "jpg",
                    quality         : 40,
                    saveToPhotoAlbum: true
                }, function (res, err) {
                    if (res.data && !err) {
                        callback(res.data);
                    }
                });
            } else {
                callback('');
            }
        },
        imageClip    : function (srcPath, rect, style, callback) {
            if (util.app.isProd()) {
                var imageClip = api.require('FNImageClip');
                imageClip.reset();
                imageClip.open({
                    rect          : {
                        x: 0,
                        y: rect.y,
                        w: api.winWidth,
                        h: rect.h,
                    },
                    srcPath       : srcPath,
                    highDefinition: true,
                    style         : {
                        mask: 'rgba(0,0,0,0.8)',        //（可选项）字符串类型；图片裁剪控件遮罩层背景，支持 rgb，rgba，#；默认：#888
                        clip: {
                            w          : style.width,   //（可选项）数字类型；裁剪区域的宽度，当 appearance 为 circular 时，w 为半径；默认：rect.w / 2
                            h          : style.height,  //（可选项）数字类型；裁剪区域的高度，当 appearance 为 circular 时，h 无效；默认：w
                            borderWidth: 1,             //（可选项）数字类型；裁剪区域边线；默认：0
                            appearance : style.shape,   //（可选项）字符串类型；裁剪区域的形状，支持 circular | rectangle；默认：rectangle
                        }
                    },
                    mode          : 'clip',
                }, function (resp, err) {
                    if (resp && !err) {
                        callback(resp);
                    }
                });
            } else {
                callback('');
            }
        },
        loading      : function (text) {
            if (this.isProd()) {
                api.showProgress({
                    style        : 'default',
                    animationType: 'fade',
                    title        : '',
                    text         : text || '',
                    modal        : true
                });
            }
        },
        hideLoading  : function () {
            if (this.isProd()) {
                api.hideProgress();
            }
        },
    }
})(window);

(function (window) {
    var defaultFormat = 'yyyy-MM-dd HH:mm:ss';
    var _date = function (date) {
        return {
            'y+': date.getFullYear(),
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
            'H+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            'S+': date.getMilliseconds()
        };
    };
    var parse = function (dateString, format) {
        format = format || defaultFormat;
        var o = _date(new Date());
        for (var k in o) {
            var re = new RegExp(k);
            if (re.test(format)) {
                o[k] = (dateString + '').substr(re.exec(format).index, format.match(re).toString().length);
            }
        }
        return new Date(+o['y+'], +o['M+'] - 1, +o['d+'], +o['H+'], +o['m+'], +o['s+'], +o['S+']);
    };
    var format = function (date, fmt) {
        fmt = fmt || defaultFormat;
        if (typeof date === 'string') {
            date = date.replace(/-/g, '/');
        }
        date = new Date(date);
        var o = _date(date);
        var week = {
            '0': '/u65e5',
            '1': '/u4e00',
            '2': '/u4e8c',
            '3': '/u4e09',
            '4': '/u56db',
            '5': '/u4e94',
            '6': '/u516d'
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[date.getDay() + '']);
        }
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    };
    var addDay = function (date, day) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + day);
    };
    var dayOfDate = function (date) {
        return date.getDay();
    };
    var firstOfMonth = function (date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };
    var lastOfMonth = function (date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    };
    var calendar = function (date, withTrail) {
        var firstDate = firstOfMonth(date);
        var lastDate = lastOfMonth(date);
        var firstDay = dayOfDate(firstDate);
        var daysOfMonth = lastDate.getDate() - firstDate.getDate() + 1;
        var length1 = firstDay + daysOfMonth;
        var length2 = length1 % 7 !== 0 ? (length1 + (7 - (length1 % 7))) : length1;
        var array = new Array(length2);
        for (var index = 0; index < length2; index++) {
            var _date = null;
            var isBefore = index < firstDay;
            var isAfter = index > length1 - 1;
            var year = firstDate.getFullYear();
            var month = firstDate.getMonth();
            if (isBefore || isAfter) {
                if (withTrail) {
                    _date = isBefore ? new Date(year, month, index - firstDay + 1) : new Date(year, month + 1, index - length1 + 1);
                }
            } else {
                _date = new Date(year, month, firstDate.getDate() + index - firstDay);
            }
            if (_date) {
                array[index] = {
                    date        : _date.getDate(),
                    currentMonth: !isBefore && !isAfter,
                    datestr     : format(_date, 'yyyy-MM-dd')
                };
            }
        }
        return array;
    };


    var isLeapYear = function (year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    };

    var getMaxDates = function (years, months) {
        return months === 2 ? (util.date.isLeapYear(years) ? 29 : 28) : [1, 3, 5, 7, 8, 10, 12].indexOf(months) > -1 ? 31 : 30;
    };

    window.dateutil = {
        parse      : parse,
        format     : format,
        addDay     : addDay,
        calendar   : calendar,
        isLeapYear : isLeapYear,
        getMaxDates: getMaxDates
    }
})(window);

(function (window) {

    if (!apputil.isProd()) {
        window.document.addEventListener('keyup', function (event) {
            if (event.key === 'Escape') {
                window.top.history.back();
            }
        });
    }

    window.util = {
        app   : apputil,
        date  : dateutil,
        array : arrayutil,
        string: stringutil
    };

    // if ('addEventListener' in document) {
    //     document.addEventListener('DOMContentLoaded', function () {
    //         FastClick.attach(document.body);
    //     }, false);
    // }
})(window);
