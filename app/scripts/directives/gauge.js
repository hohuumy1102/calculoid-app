'use strict';
/*global calculoid */
/*global Parser */
calculoid.directive('gauge', function() {

    return {
        link: function(scope, elem, attrs) {
            var gauge = {
                'type': 'Gauge',
                'displayed': true,
                'data': [
                    ['Label', 'Value'],
                    ['Memory', 80],
                    ['CPU', 55],
                    ['Network', 68]
                ],
                'options': {
                    'width': 400,
                    'height': 120,
                    'redFrom': 90,
                    'redTo': 100,
                    'yellowFrom':75,
                    'yellowTo': 90,
                    'minorTicks': 5
                }
            }
        }
    };
});
