/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'components/jquery/jquery',
        '{%= name%}': '{%= name%}'
    }
});

define(['jquery', '{%= name%}'], function ($, {%= name%}) {
    console.log('Loaded!!');
    var {%= name%} = new {%= title%}();
});