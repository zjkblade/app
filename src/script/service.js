(function (window) {
    window.CONSTANT = {
        APP_TOKEN              : 'APP_TOKEN',
    }
})(window);
(function (window) {
    // var domain = 'http://vehicle.erp12580.com/yinling';
    var domain = 'http://61.185.0.150:5188/yinling';
    var request = function (method, path, data, headers) {

        var token = util.app.storage(CONSTANT.APP_TOKEN);
        var isTokenRequest = path.startsWith('/oauth/token');
        var authorization = isTokenRequest ? 'Basic Y3NwLWNsaToxMjM0NTY=' : (token ? ('bearer ' + token) : '');

        headers = headers || {};
        headers['Authorization'] = authorization;
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';

        // 200      OK
        // 20001    20001
        // 201      Created
        // 401      Unauthorized
        // 403      Forbidden
        // 404      Not Found

        var url = domain + path;
        return new Promise(function (resolve, reject) {
            var success = function (res) {
                var successCodes = [200, 201, 20001, 20002, 20003, 20004];
                if (successCodes.indexOf(res.code) > -1) {
                    resolve(res.data);
                } else {
                    if (isTokenRequest) {
                        resolve(res);
                    } else {
                        resolve(res.data);
                        util.app.toast(res.msg);
                    }
                }
            };

            var error = function (err) {
                var status = err.statusCode || err.status;
                if (status === 401) {
                    util.app.toast('会话过期，请重新登录');
                } else if (status === 403) {
                    util.app.toast('请求未授权');
                } else if (status === 403) {
                    util.app.toast('您访问的资源不存在');
                } else {
                    var error = err.responseJSON || err.body;
                    if (error) {
                        util.app.toast(error.msg || error.error);
                    }
                }
                reject && reject(null);
            };

            if (util.app.isProd()) {
                api.ajax({
                    url    : url,
                    method : method,
                    headers: headers,
                    data   : {body: data || null},
                    timeout: 60,
                    cache  : true,
                }, function (res, err) {
                    if (err) {
                        error(err);
                    } else if (res) {
                        success(res);
                    }
                });
            } else {
                var isJsonType = headers['Content-Type'] === 'application/json';
                $.ajax({
                    url        : url,
                    type       : method,
                    headers    : headers,
                    data       : data ? (isJsonType ? JSON.stringify(data) : data) : null,
                    contentType: headers['Content-Type'],
                    success    : success,
                    error      : error
                })
            }
        });
    };

    var get = function (url, headers) {
        return request('get', url, null, headers);
    };
    var put = function (url, data, headers) {
        return request('put', url, data, headers);
    };
    var post = function (url, data, headers) {
        return request('post', url, data, headers);
    };
    var delete1 = function (url, data, headers) {
        return request('delete', url, data, headers);
    };

    window.service = {
        get: get, put: put, post: post, delete: delete1, request: request
    };
})(window);

(function (window) {
    window.apiservice = {
        authToken                      : function (options) {
            return service.post(
                '/oauth/token' + util.app.parseparams(options, ['grant_type', 'username', 'password']),
                null,
                {'Content-Type': 'application/x-www-form-urlencoded'}
            );
        },
        /**
         * 这个接口可以获取所有系统字典
         * @returns {Promise<unknown>}
         */
        sysdicAll                      : function () {
            return service.post('/back/sysDict/queryAll');
        },
        /**
         * 工作区域
         * @returns {Promise<unknown>}
         */
        workingZoneAll                 : function () {
            return service.post('/back/workingZone/queryAll');
        },
        workingZonePage                : function (data) {
            return service.post('/back/workingZone/queryPage', data);
        },
        /**
         *
         * @returns {Promise<unknown>}
         */
        sysDict                        : function (data) {
            return service.post('/back/sysDict/queryPage', data);
        },
        /**
         * @returns {Promise<unknown>}
         */
        userInfo                       : function () {
            return service.get('/back/user/get');
        },
        /**
         * @returns {Promise<unknown>}
         */
        roleAll                        : function () {
            return service.get('/back/role/list');
        },
        /**
         * 查询角色详情
         * @param roleId
         * @returns {Promise<unknown>}
         */
        roleInfo                       : function (roleId) {
            return service.get(util.string.template('/back/role/findById/{roleId}', {roleId: roleId}));
        },
        /**
         * 用户修改自己的密码
         * @param options
         * @returns {Promise<unknown>}
         */
        modifyUserPwd                  : function (options) {
            return service.post('/back/user/modifyPwd', util.app.parseObj(options, [
                'pwd_new', 'pwd_old', 'user_id'
            ]));
        },
        getUserDataIds                 : function (options) {
            return service.get('/back/user/getUserDataIds' + util.app.parseparams(options, [
                'userId'
            ]));
        },
        /**
         * 用户修改自己的密码
         * @param options
         * @returns {Promise<unknown>}
         */
        modifyUser                     : function (options) {
            return service.post('/back/user/edit', util.app.parseObj(options, [
                'userId', 'deptId'
            ]));
        },
        queryUserPage                  : function (data) {
            return service.post('/back/user/queryPage', data);
        },
        /**
         *
         * @param id
         * @returns {Promise<unknown>}
         */
        collaborationInfo              : function (id) {
            return service.get(util.string.template('/back/collaboration/{id}', {id: id}));
        },
        collaborationAll               : function () {
            return service.post('/back/collaboration/queryAll');
        },
        /**
         * 查询部门详情
         * @param deptId
         * @returns {Promise<unknown>}
         */
        deptInfo                       : function (deptId) {
            return service.get(util.string.template('/back/dept/findById/{deptId}', {deptId: deptId}));
        },
        getDataPms                     : function (userId) {
            return service.get(util.string.template('/back/user/queryDataPms?userId={userId}', {userId: userId}));
        },
        /**
         * 部门下拉选择列表
         * @param options
         * @returns {Promise<unknown>}
         */
        deptList                       : function (options) {
            return service.get('/back/dept/findList' + util.app.parseparams(options, ['keyWord']));
        },
        /**
         * 批量删除
         * @returns {Promise<unknown>}
         */
        messageDelete                  : function (msgIds) {
            return service.post('/back/message/delete', {msgIds: msgIds});
        },
        /**
         * 删除单个
         * @returns {Promise<unknown>}
         */
        messageDeleteOne               : function (msgId) {
            return service.delete(util.string.template('/back/message/deleteOne/{msgId}', {msgId: msgId}));
        },
        /**
         * 查询消息
         * @param options
         * @returns {Promise<unknown>}
         */
        messagePage                    : function (options) {
            return service.post('/back/message/query', options);
        },
        /**
         * 读取消息
         * @param options
         * @returns {Promise<unknown>}
         */
        messageRead                    : function (options) {
            return service.get('/back/message/read' + util.app.parseparams(options, ['msgId']));
        },
        /**
         * 获取所有车辆
         * @returns {Promise<unknown>}
         */
        vehicleAll                     : function () {
            return service.post('/back/vehicle/queryAll');
        },
        /**
         * 获取车辆分页列表
         * @param options
         * @returns {Promise<unknown>}
         */
        vehiclePage                    : function (options) {
            return service.post('/back/vehicle/queryPage', options);
        },
        /**
         * 查询车辆
         * @param id
         * @returns {Promise<unknown>}
         */
        vehicleInfo                    : function (id) {
            return service.get(util.string.template('/back/vehicle/{id}', {id: id}));
        },
        /**
         * 查询车辆当前GPS
         * @param data
         * @returns {Promise<unknown>}
         */
        vehicleGps                     : function (options) {
            return service.get('/back/vehicle/gps' + util.app.parseparams(options, ['id']));
        },
        /**
         * 查询车辆GPS列表
         * @param data
         * @returns {Promise<unknown>}
         */
        vehicleGpsList                 : function (options) {
            return service.get('/back/vehicle/gpsList' + util.app.parseparams(options, ['id', 'startTime', 'endTime']));
        },
        /**
         * 人员下拉选择列表
         * @returns {Promise<unknown>}
         */
        docPerson                      : function () {
            return service.get('/back/docPerson/selectBy');
        },
        /**
         * 部门
         * @returns {Promise<unknown>}
         */
        deptAll                        : function () {
            return service.get('/back/dept/get');
        },
        /**
         * 所有井别
         * @returns {Promise<unknown>}
         */
        oilWellTypeAll                 : function () {
            return service.post('/back/oilWellType/queryAll');
        },
        oilWellTypePage                : function (data) {
            return service.post('/back/oilWellType/queryPage', data);
        },
        /**
         * 所有油井
         * @returns {Promise<unknown>}
         */
        oilWellAll                     : function () {
            return service.post('/back/oilWell/queryAll');
        },
        oilWellPage                    : function (data) {
            return service.post('/back/oilWell/queryPage', data);
        },
        /**
         * 所有车型
         * @returns {Promise<unknown>}
         */
        vehicleTypeAll                 : function () {
            return service.post('/back/vehicleType/queryAll');
        },
        vehicleTypePage                : function (data) {
            return service.post('/back/vehicleType/queryPage', data);
        },
        /**
         * 用车申请分页
         * @returns {Promise<unknown>}
         */
        vehicleApplicationPage         : function (data) {
            return service.post('/back/vehicleApplication/queryPage', data);
        },
        vehicleApplicationApprove      : function (data) {
            return service.post('/back/vehicleApplication/approve' + util.app.parseparams(data, [
                'id',
                'status',
                'comment',
            ]));
        },
        /**
         * 用车提交审批
         * @param data
         * @returns {Promise<unknown>}
         */
        vehicleApplicationApplication  : function (data) {
            return service.post('/back/vehicleApplication/application', data);
        },
        /**
         * 添加申请单
         * @param data
         * @returns {Promise<unknown>}
         */
        vehicleApplicationAdd          : function (data) {
            return service.post('/back/vehicleApplication/', data);
        },
        /**
         * 修改申请单
         * @param data
         * @returns {Promise<unknown>}
         */
        vehicleApplicationEdit         : function (data) {
            return service.put('/back/vehicleApplication/', data);
        },
        /**
         * 查询用车申请单
         * @param id
         * @returns {Promise<unknown>}
         */
        vehicleApplicationInfo         : function (id) {
            return service.get(util.string.template('/back/vehicleApplication/{id}', {id: id}));
        },
        vehicleApplicationDelete       : function (id) {
            return service.delete(util.string.template('/back/vehicleApplication/{id}', {id: id}));
        },
        vehicleApplicationAprover      : function (id) {
            return service.get(util.string.template('/back/vehicleApplication/currentAprover?id={id}', {id: id}));
        },
        /**
         * 查询调派单
         * @param id
         * @returns {Promise<unknown>}
         */
        vehicleOrderInfo               : function (id) {
            return service.get(util.string.template('/back/vehicleOrder/{id}', {id: id}));
        },
        /**
         *
         * @param data
         * @returns {Promise<unknown>}
         */
        vehicleOrderEdit               : function (data) {
            return service.put('/back/vehicleOrder/', data);
        },
        /**
         *
         * @param orderId
         * @returns {Promise<unknown>}
         */
        vehicleOrderApprove            : function (query) {
            return service.post('/back/vehicleOrder/userApprove' + query, {});
        },
        /**
         * 获取调派单分页列表
         * @param data
         * @returns {Promise<unknown>}
         */
        vehicleOrderPage               : function (data) {
            return service.post('/back/vehicleOrder/queryPage', data);
        },
        /**
         * 外协，内部司机抢单
         * @param data
         * @returns {Promise<unknown>}
         */
        vehicleOrderGrab               : function (query) {
            // orderId
            // vehicleId ,collaborationId
            return service.post('/back/vehicleOrder/grab' + query);
        },
        /**
         *
         * @param query
         * @returns {Promise<unknown>}
         */
        vehicleOrderCancel             : function (query) {
            // orderId
            return service.post('/back/vehicleOrder/cancelOrder' + query);
        },
        /**
         * 外协指派单子给外协司机
         * @param query
         * @returns {Promise<unknown>}
         */
        vehicleOrderCollaborationAssign: function (query) {
            // orderId
            // vehicleId
            return service.post('/back/vehicleOrder/collaborationAssign' + query);
        },
        vehicleOrderAssign             : function (query) {
            // orderId
            // vehicleId
            return service.post('/back/vehicleOrder/assign' + query);
        },
        /**
         * 司机接单
         * @param orderId
         * @returns {Promise<unknown>}
         */
        vehicleOrderReceiveOrder       : function (orderId) {
            // orderId
            return service.post('/back/vehicleOrder/receiveOrder?orderId=' + orderId);
        },
        /**
         * 开始订单
         * @param orderId
         * @returns {Promise<unknown>}
         */
        vehicleOrderStartOrder         : function (orderId) {
            // orderId
            return service.post('/back/vehicleOrder/startOrder?orderId=' + orderId);
        },
        /**
         * 暂停订单
         * @param orderId
         * @returns {Promise<unknown>}
         */
        vehicleOrderPauseOrder         : function (orderId) {
            // orderId
            return service.post('/back/vehicleOrder/pauseOrder?orderId=' + orderId);
        },
        /**
         * 恢复订单
         * @param orderId
         * @returns {Promise<unknown>}
         */
        vehicleOrderResumeOrder        : function (orderId) {
            // orderId
            return service.post('/back/vehicleOrder/resumeOrder?orderId=' + orderId);
        },
        /**
         * 完成订单
         * @param orderId
         * @returns {Promise<unknown>}
         */
        vehicleOrderFinishOrder        : function (orderId) {
            // orderId
            return service.post('/back/vehicleOrder/finishOrder?orderId=' + orderId);
        },
        /**
         * 评价订单
         * @param orderId
         * @returns {Promise<unknown>}
         */
        vehicleOrderEvaluateOrder      : function (query) {
            // orderId
            // evalScore
            // evalContent
            return service.post('/back/vehicleOrder/evaluateOrder' + query);
        },
        vehicleOrderPersonStats        : function (query) {
            // roleSign=dispatch
            return service.get('/back/vehicleOrder/personStats' + query);
        },
        workTypePage                   : function () {
            return service.post('/back/vehicleWorkType/queryPage', {});
        },
    };
})(window);