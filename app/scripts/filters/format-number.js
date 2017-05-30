'use strict';
/*global calculoid */
calculoid.filter('formatNumber', function() {
    return function(input, separatorThousand, separatorDecimal) {
        if (typeof input === 'undefined') return 0;
        if (typeof separatorThousand === 'undefined') separatorThousand = ',';
        if (separatorThousand === 'espace') separatorThousand = ' ';
        if (typeof separatorDecimal === 'undefined') separatorDecimal = '.';
        var parts = input.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separatorThousand);
        return parts.join(separatorDecimal);
    };
});
