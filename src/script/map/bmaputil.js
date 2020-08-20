(function (window) {
    var zoomcfg = {
        min : 1,
        max : 25,
        zoom: 15
    };

    function createMap(mapContainer, center) {
        var options = {
            // features: ['bg', 'road', 'building', 'point'],
            minZoom         : zoomcfg.min,
            maxZoom         : zoomcfg.max,
            enableAutoResize: true
        };
        if (center) {
            Object.assign(options, {center: center});
        }
        if (BMap) {
            var map = new BMap.Map(mapContainer, options);
            map.centerAndZoom(new BMap.Point(108.182516, 36.933296), zoomcfg.zoom);  // 初始化地图,设置中心点坐标和地图级别
            map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
            return map;
        }
        return {};
    }

    var geolocation = function (map) {
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (r) {
            if (geolocation.getStatus() == BMAP_STATUS_SUCCESS) {
                var mk = new BMap.Marker(r.point);
                map.addOverlay(mk);
                map.panTo(r.point);
            }
        }, {enableHighAccuracy: true});
    };

    var geolocationControl = function (map, success) {
        var geoCtrl = new BMap.GeolocationControl({
            showAddressBar    : true,
            enableAutoLocation: true,
            offset            : new BMap.Size(0, 25)
        });
        geoCtrl.addEventListener("locationSuccess", function (e) {
            console.log(e);
            success && success(e);
        });
        geoCtrl.addEventListener("locationError", function (e) {
            console.log(e);
        });
        map.addControl(geoCtrl);
    };

    var driving = function (map, start, end) {
        var driving = new BMap.DrivingRoute(map, {
            renderOptions: {
                map         : map,
                autoViewport: true
            }
        });
        driving.search(start, end);
    };

    window.bmaputil = {
        zoomcfg           : zoomcfg,
        driving           : driving,
        createMap         : createMap,
        geolocation       : geolocation,
        geolocationControl: geolocationControl,
    }
})(window);