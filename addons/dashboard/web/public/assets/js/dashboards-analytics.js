/**
 * @namespace: addons/dashboard/web/public/assets/js/dashboards-analytics.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

document.addEventListener('DOMContentLoaded', function (o) {
    var e = config.colors.cardColor,
        r = config.colors.headingColor,
        t = config.colors.bodyColor,
        i = config.colors.textMuted,
        s = config.colors.borderColor,
        a = config.fontFamily,
        n = document.querySelector('#orderChart'),
        l = {
            chart: { height: 80, type: 'area', toolbar: { show: !1 }, sparkline: { enabled: !0 } },
            markers: {
                size: 6,
                colors: 'transparent',
                strokeColors: 'transparent',
                strokeWidth: 4,
                discrete: [
                    {
                        fillColor: e,
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        strokeColor: config.colors.success,
                        strokeWidth: 2,
                        size: 6,
                        radius: 8,
                    },
                ],
                offsetX: -1,
                hover: { size: 7 },
            },
            grid: { show: !1, padding: { top: 15, right: 7, left: 0 } },
            colors: [config.colors.success],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    gradientToColors: [config.colors.cardColor],
                    opacityTo: 0.4,
                    stops: [0, 100],
                },
            },
            dataLabels: { enabled: !1 },
            stroke: { width: 2, curve: 'smooth' },
            series: [{ data: [180, 175, 275, 140, 205, 190, 295] }],
            xaxis: { show: !1, lines: { show: !1 }, labels: { show: !1 }, stroke: { width: 0 }, axisBorder: { show: !1 } },
            yaxis: { stroke: { width: 0 }, show: !1 },
        },
        n = (null !== n && new ApexCharts(n, l).render(), document.querySelector('#totalRevenueChart')),
        l = {
            series: [
                { name: new Date().getFullYear() - 1, data: [18, 7, 15, 29, 18, 12, 9] },
                { name: new Date().getFullYear() - 2, data: [-13, -18, -9, -14, -8, -17, -15] },
            ],
            chart: { height: 300, stacked: !0, type: 'bar', toolbar: { show: !1 } },
            plotOptions: {
                bar: {
                    horizontal: !1,
                    columnWidth: '30%',
                    borderRadius: 8,
                    startingShape: 'rounded',
                    endingShape: 'rounded',
                    borderRadiusApplication: 'around',
                },
            },
            colors: [config.colors.primary, config.colors.info],
            dataLabels: { enabled: !1 },
            stroke: { curve: 'smooth', width: 6, lineCap: 'round', colors: [e] },
            legend: {
                show: !0,
                horizontalAlign: 'left',
                position: 'top',
                markers: { size: 4, radius: 12, shape: 'circle', strokeWidth: 0 },
                fontSize: '13px',
                fontFamily: a,
                fontWeight: 400,
                labels: { colors: t, useSeriesColors: !1 },
                itemMargin: { horizontal: 10 },
            },
            grid: { strokeDashArray: 7, borderColor: s, padding: { top: 0, bottom: -8, left: 20, right: 20 } },
            fill: { opacity: [1, 1] },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                labels: { style: { fontSize: '13px', fontFamily: a, colors: i } },
                axisTicks: { show: !1 },
                axisBorder: { show: !1 },
            },
            yaxis: { labels: { style: { fontSize: '13px', fontFamily: a, colors: i } } },
            responsive: [
                { breakpoint: 1700, options: { plotOptions: { bar: { borderRadius: 10, columnWidth: '35%' } } } },
                { breakpoint: 1440, options: { plotOptions: { bar: { borderRadius: 12, columnWidth: '43%' } } } },
                { breakpoint: 1300, options: { plotOptions: { bar: { borderRadius: 11, columnWidth: '45%' } } } },
                { breakpoint: 1200, options: { plotOptions: { bar: { borderRadius: 11, columnWidth: '37%' } } } },
                { breakpoint: 1040, options: { plotOptions: { bar: { borderRadius: 12, columnWidth: '45%' } } } },
                { breakpoint: 991, options: { plotOptions: { bar: { borderRadius: 12, columnWidth: '33%' } } } },
                { breakpoint: 768, options: { plotOptions: { bar: { borderRadius: 11, columnWidth: '28%' } } } },
                { breakpoint: 640, options: { plotOptions: { bar: { borderRadius: 11, columnWidth: '30%' } } } },
                { breakpoint: 576, options: { plotOptions: { bar: { borderRadius: 10, columnWidth: '38%' } } } },
                { breakpoint: 440, options: { plotOptions: { bar: { borderRadius: 10, columnWidth: '50%' } } } },
                { breakpoint: 380, options: { plotOptions: { bar: { borderRadius: 9, columnWidth: '60%' } } } },
            ],
            states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
        },
        n = (null !== n && new ApexCharts(n, l).render(), document.querySelector('#growthChart')),
        l = {
            series: [78],
            labels: ['Growth'],
            chart: { height: 210, type: 'radialBar' },
            plotOptions: {
                radialBar: {
                    size: 150,
                    offsetY: 10,
                    startAngle: -150,
                    endAngle: 150,
                    hollow: { size: '55%' },
                    track: { background: e, strokeWidth: '100%' },
                    dataLabels: {
                        name: { offsetY: 15, color: t, fontSize: '15px', fontWeight: '500', fontFamily: a },
                        value: { offsetY: -25, color: r, fontSize: '22px', fontWeight: '500', fontFamily: a },
                    },
                },
            },
            colors: [config.colors.primary],
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    shadeIntensity: 0.5,
                    gradientToColors: [config.colors.primary],
                    inverseColors: !0,
                    opacityFrom: 1,
                    opacityTo: 0.6,
                    stops: [30, 70, 100],
                },
            },
            stroke: { dashArray: 5 },
            grid: { padding: { top: -35, bottom: -10 } },
            states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
        },
        n = (null !== n && new ApexCharts(n, l).render(), document.querySelector('#revenueChart')),
        l = {
            chart: { height: 95, type: 'bar', toolbar: { show: !1 } },
            plotOptions: {
                bar: {
                    barHeight: '80%',
                    columnWidth: '75%',
                    startingShape: 'rounded',
                    endingShape: 'rounded',
                    borderRadius: 4,
                    distributed: !0,
                },
            },
            grid: { show: !1, padding: { top: -20, bottom: -12, left: -10, right: 0 } },
            colors: [
                config.colors_label.primary,
                config.colors_label.primary,
                config.colors_label.primary,
                config.colors_label.primary,
                config.colors.primary,
                config.colors_label.primary,
                config.colors_label.primary,
            ],
            dataLabels: { enabled: !1 },
            series: [{ data: [40, 95, 60, 45, 90, 50, 75] }],
            legend: { show: !1 },
            xaxis: {
                categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                axisBorder: { show: !1 },
                axisTicks: { show: !1 },
                labels: { style: { colors: i, fontSize: '13px' } },
            },
            yaxis: { labels: { show: !1 } },
        },
        n = (null !== n && new ApexCharts(n, l).render(), document.querySelector('#profileReportChart')),
        l = {
            chart: {
                height: 75,
                width: 240,
                type: 'line',
                toolbar: { show: !1 },
                dropShadow: { enabled: !0, top: 10, left: 5, blur: 3, color: config.colors.warning, opacity: 0.15 },
                sparkline: { enabled: !0 },
            },
            grid: { show: !1, padding: { right: 8 } },
            colors: [config.colors.warning],
            dataLabels: { enabled: !1 },
            stroke: { width: 5, curve: 'smooth' },
            series: [{ data: [110, 270, 145, 245, 205, 285] }],
            xaxis: { show: !1, lines: { show: !1 }, labels: { show: !1 }, axisBorder: { show: !1 } },
            yaxis: { show: !1 },
        },
        n = (null !== n && new ApexCharts(n, l).render(), document.querySelector('#orderStatisticsChart')),
        l = {
            chart: { height: 165, width: 136, type: 'donut', offsetX: 15 },
            labels: ['Electronic', 'Sports', 'Decor', 'Fashion'],
            series: [50, 85, 25, 40],
            colors: [config.colors.success, config.colors.primary, config.colors.secondary, config.colors.info],
            stroke: { width: 5, colors: [e] },
            dataLabels: {
                enabled: !1,
                formatter: function (o, e) {
                    return parseInt(o) + '%';
                },
            },
            legend: { show: !1 },
            grid: { padding: { top: 0, bottom: 0, right: 15 } },
            states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: !0,
                            value: {
                                fontSize: '1.125rem',
                                fontFamily: a,
                                fontWeight: 500,
                                color: r,
                                offsetY: -17,
                                formatter: function (o) {
                                    return parseInt(o) + '%';
                                },
                            },
                            name: { offsetY: 17, fontFamily: a },
                            total: {
                                show: !0,
                                fontSize: '13px',
                                color: t,
                                label: 'Weekly',
                                formatter: function (o) {
                                    return '38%';
                                },
                            },
                        },
                    },
                },
            },
        },
        e = (null !== n && new ApexCharts(n, l).render(), document.querySelector('#incomeChart')),
        r = {
            series: [{ data: [21, 30, 22, 42, 26, 35, 29] }],
            chart: { height: 200, parentHeightOffset: 0, parentWidthOffset: 0, toolbar: { show: !1 }, type: 'area' },
            dataLabels: { enabled: !1 },
            stroke: { width: 3, curve: 'smooth' },
            legend: { show: !1 },
            markers: {
                size: 6,
                colors: 'transparent',
                strokeColors: 'transparent',
                strokeWidth: 4,
                discrete: [
                    {
                        fillColor: config.colors.white,
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        strokeColor: config.colors.primary,
                        strokeWidth: 2,
                        size: 6,
                        radius: 8,
                    },
                ],
                offsetX: -1,
                hover: { size: 7 },
            },
            colors: [config.colors.primary],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.3,
                    gradientToColors: [config.colors.cardColor],
                    opacityTo: 0.3,
                    stops: [0, 100],
                },
            },
            grid: { borderColor: s, strokeDashArray: 8, padding: { top: -20, bottom: -8, left: 0, right: 8 } },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                axisBorder: { show: !1 },
                axisTicks: { show: !1 },
                labels: { show: !0, style: { fontSize: '13px', colors: i } },
            },
            yaxis: { labels: { show: !1 }, min: 10, max: 50, tickAmount: 4 },
        },
        n = (null !== e && new ApexCharts(e, r).render(), document.querySelector('#expensesOfWeek')),
        l = {
            series: [65],
            chart: { width: 60, height: 60, type: 'radialBar' },
            plotOptions: {
                radialBar: {
                    startAngle: 0,
                    endAngle: 360,
                    strokeWidth: '8',
                    hollow: { margin: 2, size: '40%' },
                    track: { background: s },
                    dataLabels: {
                        show: !0,
                        name: { show: !1 },
                        value: {
                            formatter: function (o) {
                                return '$' + parseInt(o);
                            },
                            offsetY: 5,
                            color: t,
                            fontSize: '12px',
                            fontFamily: a,
                            show: !0,
                        },
                    },
                },
            },
            fill: { type: 'solid', colors: config.colors.primary },
            stroke: { lineCap: 'round' },
            grid: { padding: { top: -10, bottom: -15, left: -10, right: -10 } },
            states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
        };
    null !== n && new ApexCharts(n, l).render();
});
