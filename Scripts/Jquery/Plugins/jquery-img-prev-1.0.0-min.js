
/*
 * Image preview script 
 * written by Alen Grakalic (http://cssglobe.com)
 * for more info visit http://cssglobe.com/post/1695/easiest-tooltip-and-image-preview-using-jquery
 */
this.ImagePreview = function () {
    xOffset = 200; yOffset = -350;

    $("a.preview").hover(function (e) {
        if ($(this).hasClass("preview")) {
            this.t = this.title;
            this.title = "";
            var t = this.t != "" ? "<br/>" + this.t : "";
            $("body").append("<p id='preview'><img src='" + this.href + "' alt='Image preview' style='width: 300px; height: 300px !important' />" + t + "</p>");
            $("#preview").css("top", e.pageY - xOffset + "px").css("left", e.pageX + yOffset + "px").fadeIn("fast")
        }
    }, function () {
        if ($(this).hasClass("preview")) {
            this.title = this.t; $("#preview").remove()
        }
    }); $("a.preview").mousemove(function (e) {
        if ($(this).hasClass("preview")) {
            $("#preview").css("top", e.pageY - xOffset + "px").css("left", e.pageX + yOffset + "px")
        }
    })
}
