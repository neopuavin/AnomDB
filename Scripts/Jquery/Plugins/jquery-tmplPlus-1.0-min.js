/*!
* tmplPlus.js: for jQuery Templates Plugin 1.0.0pre
* Additional templating features or support for more advanced/less common scenarios.
* Requires jquery.tmpl.js
* http://github.com/jquery/jquery-tmpl
*
* Copyright 2011, Software Freedom Conservancy, Inc.
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*/
(function(c){var b=c.tmpl.complete,a=c.fn.domManip;c.tmpl.complete=function(e){var d;b(e);for(d in e){d=e[d];if(d.addedTmplItems&&c.inArray(d,d.addedTmplItems)===-1){d.addedTmplItems.push(d)}}for(d in e){d=e[d];if(d.rendered){d.rendered(d)}}};c.extend({tmplCmd:function(h,e,i){var g=[],d;function f(l,p){var r=[],n,k,q=p.length,j,o=0,m=l.length;for(;o<m;){j=l[o++];for(k=0;k<q;){n=p[k++];if(n.data===j){r.push(n)}}}return r}e=c.isArray(e)?e:[e];switch(h){case"find":return f(e,i);case"replace":e.reverse()}c.each(i?f(e,i):e,function(k,j){coll=j.nodes;switch(h){case"update":j.update();break;case"remove":c(coll).remove();if(i){i.splice(c.inArray(j,i),1)}break;case"replace":d=d?c(coll).insertBefore(d)[0]:c(coll).appendTo(coll[0].parentNode)[0];g.unshift(j)}});return g}});c.fn.extend({domManip:function(f,h,j,e){var i=f[1],d=f[0],g;if(f.length>=2&&typeof i==="object"&&!i.nodeType&&!(i instanceof c)){g=c.makeArray(arguments);g[0]=[c.tmpl(c.template(d),i,f[2],f[3])];g[2]=function(k){c.tmpl.afterManip(this,k,j)};return a.apply(this,g)}return a.apply(this,arguments)}})})(jQuery);