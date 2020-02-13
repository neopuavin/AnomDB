(function (c) {
    var b = c.ui.dialog.prototype._init;
    var a = 0;
    c.ui.dialog.prototype._init = function () {
        var d = this;
        b.apply(this, arguments);
        uiDialogTitlebar = this.uiDialogTitlebar;
        this.options.originalWidth = this.options.width;
        this.options.originalHeight = this.options.height;
        this.resizeableHandle = this.uiDialog.resizable().find(".ui-resizable-se");
        this.titlebarHeight = parseInt(uiDialogTitlebar.css("height")) + parseInt(uiDialogTitlebar.css("padding-top")) +
            parseInt(uiDialogTitlebar.css("padding-bottom")) + parseInt(this.uiDialog.css("padding-top")) +
            parseInt(this.uiDialog.css("padding-bottom"));

        $('.dialog-minrestore.ui-dialog-titlebar-minrest').remove();
        uiDialogTitlebar.append('<a href="#" title="Restore Dialog" class="dialog-minrestore ui-dialog-titlebar-minrest"><span class="ui-icon ui-icon-newwin"></span></a>');
        $('.dialog-minimize.ui-dialog-titlebar-min').remove();
        uiDialogTitlebar.append('<a href="#" title="Minimize Dialog" class="dialog-minimize ui-dialog-titlebar-min"  style="display:inline-block !important;"><span class="ui-icon ui-icon-minus"></span></a>');

        $('.dialog-maxrestore.ui-dialog-titlebar-maxrest').remove();
        uiDialogTitlebar.append('<a href="#" title="Restore Dialog" class="dialog-maxrestore ui-dialog-titlebar-maxrest"><span class="ui-icon ui-icon-newwin"></span></a>');
        $('.dialog-maximize.ui-dialog-titlebar-max').remove();
        uiDialogTitlebar.append('<a href="#" title="Maximize Dialog" class="dialog-maximize ui-dialog-titlebar-max"><span class="ui-icon ui-icon-arrow-4-diag"></span></a>');

        c(".ui-dialog-titlebar-close").attr("title", "Close Dialog");
        this.uiDialogTitlebarMin = c(".dialog-minimize", uiDialogTitlebar).hover(function () {
            c(this).addClass("ui-state-hover")
        }, function () {
            c(this).removeClass("ui-state-hover")
        }).click(function () {
            d.minimize();
            return false
        });
        this.uiDialogTitlebarMax = c(".dialog-maximize", uiDialogTitlebar).hover(function () {
            c(this).addClass("ui-state-hover")
        }, function () {
            c(this).removeClass("ui-state-hover")
        }).click(function () {
            d.maximize();
            return false
        });
        this.uiDialogTitlebarMinRest = c(".dialog-minrestore", uiDialogTitlebar).hover(function () {
            c(this).addClass("ui-state-hover")
        }, function () {
            c(this).removeClass("ui-state-hover")
        }).click(function () {
            d.restore();
            d.moveToTop(true);
            return false
        }).hide();
        this.uiDialogTitlebarMaxRest = c(".dialog-maxrestore", uiDialogTitlebar).hover(function () {
            c(this).addClass("ui-state-hover")
        }, function () {
            c(this).removeClass("ui-state-hover")
        }).click(function () {
            d.restore();
            d.moveToTop(true);
            return false
        }).hide();
        this.uiDialog.bind("dialogbeforeclose", function (e, f) {
            d.uiDialogTitlebarMaxRest.hide();
            d.uiDialogTitlebarMinRest.hide();
            d.uiDialogTitlebarMax.show();
            d.uiDialogTitlebarMin.show()
        })
    }; c.extend(c.ui.dialog.prototype, {
        restore: function () {
            c(this.element).dialog("option", "resizable", true);
            var k = c(window).height();
            var g = this.options.originalHeight;
            var f = parseInt(this.uiDialog.css("top"));
            if (g + f > k) {
                var e = k - g - 22;
                this.uiDialog.css("top", e)
            }
            var h = c(window).width();
            var j = this.options.originalWidth;
            var d = parseInt(this.uiDialog.css("left"));
            if (j + d > h) {
                var i = h - j - 2;
                this.uiDialog.css("left", i)
            }
            if (this.options.originalHeight >= (k - 11)) {
                c(this.element).dialog("option", "height", (k / 2))
            } else {
                c(this.element).dialog("option", "height", this.options.originalHeight)
            }
            if (this.options.originalWidth >= (h - 11)) {
                c(this.element).dialog("option", "width", (h / 2))
            } else {
                c(this.element).dialog("option", "width", this.options.originalWidth)
            }
            this.element.show();
            this.resizeableHandle.show();
            this.uiDialogTitlebarMaxRest.hide();
            this.uiDialogTitlebarMinRest.hide();
            this.uiDialogTitlebarMin.show();
            this.uiDialogTitlebarMax.show()
        }, minimize: function () {
            c(this.element).dialog("option", "resizable", false);
            this.options.originalWidth = this.options.width;
            this.options.originalHeight = this.options.height;
            //this.uiDialog.animate({ width: 500, height: this.titlebarHeight, top: 0 }, 200);
            this.uiDialog.animate({ width: 500, height: 100, top: 0 }, 200);
            this.element.show();
            this.uiDialogTitlebarMin.hide();
            this.uiDialogTitlebarMinRest.show();
            this.uiDialogTitlebarMax.show();
            this.uiDialogTitlebarMaxRest.hide();
            this.resizeableHandle.hide()
        }, maximize: function () {
            c(this.element).dialog("option", "resizable", false);
            this.options.originalWidth = this.options.width;
            this.options.originalHeight = this.options.height;
            c(this.element).dialog("option", "height", (c(window).height() - 8));
            c(this.element).dialog("option", "width", (c(window).width() - 8));
            this.uiDialog.css("left", 0); this.uiDialog.css("top", 0);
            this.element.show();
            this.uiDialogTitlebarMin.show();
            this.uiDialogTitlebarMinRest.hide();
            this.uiDialogTitlebarMax.hide();
            this.uiDialogTitlebarMaxRest.show();
            this.resizeableHandle.hide()
        }
    })
})(jQuery);