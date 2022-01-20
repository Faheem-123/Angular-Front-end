

var myExtObject = (function () {

  return {
    func1: function () {
      alert('function 1 called');
    },
    func2: function () {
      alert('function 2 called');
    },
    loadIrx: function (data, link) {

      $("#post_form").attr("action", link);
      $("#RxInput").val(data);
      $("#post_form").submit();
    },
    loadHTMLContents: function (html) {
      var frame = document.getElementById("htmlDiv");
      frame.innerHTML = html;
    },
    postForm: function (data, patid) {

      //	loadIrx(data,"https://secure.newcropaccounts.com/InterfaceV7/RxEntry.aspx");
      var postData = data;
      debugger;
      $.ajax({

        type: "post",
        url: "https://preproduction.newcropaccounts.com/InterfaceV7/RxEntry.aspx",
        data: { RxInput: postData },
        //contentType: "application/x-www-form-urlencoded; charset:utf-8",
        contentType: "application/x-www-form-urlencoded",
        // AcceptEncoding: "gzip, deflate, br",
        //dataType:"xml",
        success: function (response) {
          debugger;
          //alert(response);
          //getParentApp('flexproject').postPageResponse(true,patid);
        },
        error: function () {
          alert("Error" + error);
          //	getParentApp('flexproject').postPageResponse(false,patid);
        }
      });
    },
    getParentApp: function (appName) {
      if (navigator.appName.indexOf("Microsoft") != -1) {
        return this.parent.window[appName];
      }
      else {
        return this.parent.document[appName];
      }
    },
    getHTMLContents: function () {
      debugger;
      //GetHTML_doProcess();
      var frame = document.getElementById("htmlDiv");
      var finalHTML = "<html><body>" + frame.innerHTML + "</body></html>";
      //alert(finalHTML);
      return finalHTML;
      //getParentApp('flexproject').getHTML(finalHTML);
    },
    setInputTextHeight: function () {
      if (document.formname.elements != null) {
        for (i = 0; i < document.formname.elements.length; i++) {
          var name = "";
          if (document.formname.elements[i].type == "text") {
            if (document.formname.elements[1].id != "") {
              name = document.formname.elements[i].id;
              document.getElementById(document.formname.elements[i].id).style.height = "21px";
              document.getElementById(document.formname.elements[i].id).style.fontSize = '13px';
              //$("#"+name ).style( "font-style", 'normal');
            }
          }
          // if(document.formname.elements[i].type=="textarea")
          // {
          // 	if(document.formname.elements[1].id != ""){
          // 		document.getElementById(document.formname.elements[i].id).style.height="35px"
          // 	}
          // }
        }
      }
    },

    GetHTML_doProcess: function () {
      try {
        debugger
        var i = 0;
        var oldRadName = "";
        if (document.formname.elements != null) {
          for (i = 0; i < document.formname.elements.length; i++) {
            var name = "";
            if (document.formname.elements[i].type == "text" || document.formname.elements[i].type == "date") {
              if (document.formname.elements[1].id != "") {
                name = document.formname.elements[i].id;
                $("#" + name).attr("value", document.getElementById(name).value);
              }
            }
            else if (document.formname.elements[i].type == "checkbox") {
              name = document.formname.elements[i].id;
              $("#" + name).attr("checked", document.getElementById(name).checked);

            }
            else if (document.formname.elements[i].type == "radio") {
              name = document.formname.elements[i].name;
              if (name != oldRadName) {
                oldRadName = name;
                var radItems = document.getElementsByName(name);
                for (var x = 0; x < radItems.length; x++) {
                  $("#" + radItems[x].id).attr("checked", radItems[x].checked);
                }
              }
            }
            else if (document.formname.elements[i].type == "textarea") {
              name = document.formname.elements[i].id;
              $("#" + name).html(document.getElementById(name).value);
            }
            else if (document.formname.elements[i].type == "select-one") {
              name = document.formname.elements[i].name;
              if (name != oldRadName) {
                oldRadName = name;
                var cmbItems = document.getElementsByName("cmbbx")[0].getElementsByTagName("option");
                for (var x = 0; x < cmbItems.length; x++) {
                  $("#" + cmbItems[x].id).attr("selected", cmbItems[x].selected);
                }
              }
            }
            name = "";
          }
        }
      }
      catch (err) {
        //alert(err)
      }
    },
    resizeTextarea: function (id) {
      debugger;
      var a = document.getElementById(id);
      a.style.height = 'auto';
      a.style.height = a.scrollHeight + 'px';
    },
    setHealthcheckProvidersSignatureInfo: function (Provider1_Sign_Info, Provider2_Sign_Info) {
      try {
        var i = 0;
        var oldRadName = "";
        if (document.formname.elements != null) {
          for (i = 0; i < document.formname.elements.length; i++) {
            var name = "";
            if (document.formname.elements[i].type == "text") {
              if (document.formname.elements[1].id != "") {
                name = document.formname.elements[i].id;
                if (name == "txt_provider_1") {
                  $("#" + name).attr("value", Provider1_Sign_Info);
                }
                if (name == "txt_provider_2") {
                  $("#" + name).attr("value", Provider2_Sign_Info);
                }
              }
            }
            name = "";
          }
        }
      }
      catch (err) {
        //alert(err)
      }
    }
  }

})(myExtObject || {})


var webGlObject = (function () {
  return {
    init: function () {
      //alert('webGlObject initialized');
    }
  }
})(webGlObject || {})


// dropdown for reports


$.AdminLTE = {};

$.AdminLTE.options = {
  //Add slimscroll to navbar menus
  //This requires you to load the slimscroll plugin
  //in every page before app.js
  navbarMenuSlimscroll: true,
  navbarMenuSlimscrollWidth: "3px", //The width of the scroll bar
  navbarMenuHeight: "200px", //The height of the inner menu
  //General animation speed for JS animated elements such as box collapse/expand and
  //sidebar treeview slide up/down. This options accepts an integer as milliseconds,
  //'fast', 'normal', or 'slow'
  animationSpeed: 500,
  //Sidebar push menu toggle button selector
  sidebarToggleSelector: "[data-toggle='offcanvas']",
  //Activate sidebar push menu
  sidebarPushMenu: true,
  //Activate sidebar slimscroll if the fixed layout is set (requires SlimScroll Plugin)
  sidebarSlimScroll: true,
  sidebarExpandOnHover: false,
  //BoxRefresh Plugin
  enableBoxRefresh: true,
  //Bootstrap.js tooltip
  enableBSToppltip: true,
  BSTooltipSelector: "[data-toggle='tooltip']",
  enableFastclick: false,
  //Control Sidebar Tree views
  enableControlTreeView: true,
  //Control Sidebar Options
  enableControlSidebar: true,
  controlSidebarOptions: {
    //Which button should trigger the open/close event
    toggleBtnSelector: "[data-toggle='control-sidebar']",
    //The sidebar selector
    selector: ".control-sidebar",
    //Enable slide over content
    slide: true
  },
  //Box Widget Plugin. Enable this plugin
  //to allow boxes to be collapsed and/or removed
  enableBoxWidget: true,
  //Box Widget plugin options
  boxWidgetOptions: {
    boxWidgetIcons: {
      //Collapse icon
      collapse: 'fa-minus',
      //Open icon
      open: 'fa-plus',
      //Remove icon
      remove: 'fa-times'
    },
    boxWidgetSelectors: {
      //Remove button selector
      remove: '[data-widget="remove"]',
      //Collapse button selector
      collapse: '[data-widget="collapse"]'
    }
  },
  //Direct Chat plugin options
  directChat: {
    //Enable direct chat by default
    enable: true,
    //The button to open and close the chat contacts pane
    contactToggleSelector: '[data-widget="chat-pane-toggle"]'
  },
  //Define the set of colors to use globally around the website
  colors: {
    lightBlue: "#3c8dbc",
    red: "#f56954",
    green: "#00a65a",
    aqua: "#00c0ef",
    yellow: "#f39c12",
    blue: "#0073b7",
    navy: "#001F3F",
    teal: "#39CCCC",
    olive: "#3D9970",
    lime: "#01FF70",
    orange: "#FF851B",
    fuchsia: "#F012BE",
    purple: "#8E24AA",
    maroon: "#D81B60",
    black: "#222222",
    gray: "#d2d6de"
  },
  //The standard screen sizes that bootstrap uses.
  //If you change these in the variables.less file, change
  //them here too.
  screenSizes: {
    xs: 480,
    sm: 768,
    md: 992,
    lg: 1200
  }
};
$(function () {
  "use strict";

  //Fix for IE page transitions
  $("body").removeClass("hold-transition");

  //Extend options if external options exist
  if (typeof AdminLTEOptions !== "undefined") {
    $.extend(true,
      $.AdminLTE.options,
      AdminLTEOptions);
  }

  //Easy access to options
  var o = $.AdminLTE.options;

  //Set up the object
  _init();

  //Activate the layout maker
  $.AdminLTE.layout.activate();

  //Enable sidebar tree view controls
  if (o.enableControlTreeView) {
    $.AdminLTE.tree('.reports-sidebar');
  }

  //Enable control sidebar
  if (o.enableControlSidebar) {
    $.AdminLTE.controlSidebar.activate();
  }

  //Add slimscroll to navbar dropdown
  if (o.navbarMenuSlimscroll && typeof $.fn.slimscroll != 'undefined') {
    $(".navbar .menu").slimscroll({
      height: o.navbarMenuHeight,
      alwaysVisible: false,
      size: o.navbarMenuSlimscrollWidth
    }).css("width", "100%");
  }

  //Activate sidebar push menu
  if (o.sidebarPushMenu) {
    $.AdminLTE.pushMenu.activate(o.sidebarToggleSelector);
  }

  //Activate Bootstrap tooltip
  if (o.enableBSToppltip) {
    $('body').tooltip({
      selector: o.BSTooltipSelector,
      container: 'body'
    });
  }

  //Activate box widget
  if (o.enableBoxWidget) {
    $.AdminLTE.boxWidget.activate();
  }

  //Activate fast click
  if (o.enableFastclick && typeof FastClick != 'undefined') {
    FastClick.attach(document.body);
  }

  //Activate direct chat widget
  if (o.directChat.enable) {
    $(document).on('click', o.directChat.contactToggleSelector, function () {
      var box = $(this).parents('.direct-chat').first();
      box.toggleClass('direct-chat-contacts-open');
    });
  }
  $('.btn-group[data-toggle="btn-toggle"]').each(function () {
    var group = $(this);
    $(this).find(".btn").on('click', function (e) {
      group.find(".btn.active").removeClass("active");
      $(this).addClass("active");
      e.preventDefault();
    });

  });
});
function _init() {
  'use strict';
  $.AdminLTE.layout = {
    activate: function () {
      var _this = this;
      _this.fix();
      _this.fixSidebar();
      $('body, html, .wrapper').css('height', 'auto');
      $(window, ".wrapper").resize(function () {
        _this.fix();
        _this.fixSidebar();
      });
    },
    fix: function () {
      // Remove overflow from .wrapper if layout-boxed exists
      $(".layout-boxed > .wrapper").css('overflow', 'hidden');
      //Get window height and the wrapper height
      var footer_height = $('.main-footer').outerHeight() || 0;
      var neg = $('.main-header').outerHeight() + footer_height;
      var window_height = $(window).height();
      var sidebar_height = $(".sidebar").height() || 0;
      //Set the min-height of the content and sidebar based on the
      //the height of the document.
      if ($("body").hasClass("fixed")) {
        $(".content-wrapper, .right-side").css('min-height', window_height - footer_height);
      } else {
        var postSetWidth;
        if (window_height >= sidebar_height) {
          $(".content-wrapper, .right-side").css('min-height', window_height - neg);
          postSetWidth = window_height - neg;
        } else {
          $(".content-wrapper, .right-side").css('min-height', sidebar_height);
          postSetWidth = sidebar_height;
        }

        //Fix for the control sidebar height
        var controlSidebar = $($.AdminLTE.options.controlSidebarOptions.selector);
        if (typeof controlSidebar !== "undefined") {
          if (controlSidebar.height() > postSetWidth)
            $(".content-wrapper, .right-side").css('min-height', controlSidebar.height());
        }

      }
    },
    fixSidebar: function () {
      //Make sure the body tag has the .fixed class
      if (!$("body").hasClass("fixed")) {
        if (typeof $.fn.slimScroll != 'undefined') {
          $(".sidebar").slimScroll({ destroy: true }).height("auto");
        }
        return;
      } else if (typeof $.fn.slimScroll == 'undefined' && window.console) {
        window.console.error("Error: the fixed layout requires the slimscroll plugin!");
      }
      //Enable slimscroll for fixed layout
      if ($.AdminLTE.options.sidebarSlimScroll) {
        if (typeof $.fn.slimScroll != 'undefined') {
          //Destroy if it exists
          $(".sidebar").slimScroll({ destroy: true }).height("auto");
          //Add slimscroll
          $(".sidebar").slimScroll({
            height: ($(window).height() - $(".main-header").height()) + "px",
            color: "rgba(0,0,0,0.2)",
            size: "3px"
          });
        }
      }
    }
  };

  /* PushMenu()
   * ==========
   * Adds the push menu functionality to the sidebar.
   *
   * @type Function
   * @usage: $.AdminLTE.pushMenu("[data-toggle='offcanvas']")
   */
  $.AdminLTE.pushMenu = {
    activate: function (toggleBtn) {
      //Get the screen sizes
      var screenSizes = $.AdminLTE.options.screenSizes;

      //Enable sidebar toggle
      $(document).on('click', toggleBtn, function (e) {
        e.preventDefault();

        //Enable sidebar push menu
        if ($(window).width() > (screenSizes.sm - 1)) {
          if ($("body").hasClass('sidebar-collapse')) {
            $("body").removeClass('sidebar-collapse').trigger('expanded.pushMenu');
          } else {
            $("body").addClass('sidebar-collapse').trigger('collapsed.pushMenu');
          }
        }
        //Handle sidebar push menu for small screens
        else {
          if ($("body").hasClass('sidebar-open')) {
            $("body").removeClass('sidebar-open').removeClass('sidebar-collapse').trigger('collapsed.pushMenu');
          } else {
            $("body").addClass('sidebar-open').trigger('expanded.pushMenu');
          }
        }
      });

      $(".content-wrapper").click(function () {
        //Enable hide menu when clicking on the content-wrapper on small screens
        if ($(window).width() <= (screenSizes.sm - 1) && $("body").hasClass("sidebar-open")) {
          $("body").removeClass('sidebar-open');
        }
      });

      //Enable expand on hover for sidebar mini
      if ($.AdminLTE.options.sidebarExpandOnHover
        || ($('body').hasClass('fixed')
          && $('body').hasClass('sidebar-mini'))) {
        this.expandOnHover();
      }
    },
    expandOnHover: function () {
      var _this = this;
      var screenWidth = $.AdminLTE.options.screenSizes.sm - 1;
      //Expand sidebar on hover
      $('.main-sidebar').hover(function () {
        if ($('body').hasClass('sidebar-mini')
          && $("body").hasClass('sidebar-collapse')
          && $(window).width() > screenWidth) {
          _this.expand();
        }
      }, function () {
        if ($('body').hasClass('sidebar-mini')
          && $('body').hasClass('sidebar-expanded-on-hover')
          && $(window).width() > screenWidth) {
          _this.collapse();
        }
      });
    },
    expand: function () {
      $("body").removeClass('sidebar-collapse').addClass('sidebar-expanded-on-hover');
    },
    collapse: function () {
      if ($('body').hasClass('sidebar-expanded-on-hover')) {
        $('body').removeClass('sidebar-expanded-on-hover').addClass('sidebar-collapse');
      }
    }
  };
  $.AdminLTE.tree = function (menu) {
    var _this = this;
    var animationSpeed = $.AdminLTE.options.animationSpeed;
    $(document).off('click', menu + ' li a')
      .on('click', menu + ' li a', function (e) {
        //Get the clicked link and the next element
        var $this = $(this);
        var checkElement = $this.next();

        //Check if the next element is a menu and is visible
        if ((checkElement.is('.reports-treeview-menu')) && (checkElement.is(':visible')) && (!$('body').hasClass('sidebar-collapse'))) {
          //Close the menu
          checkElement.slideUp(animationSpeed, function () {
            checkElement.removeClass('menu-open');
            //Fix the layout in case the sidebar stretches over the height of the window
            //_this.layout.fix();
          });
          checkElement.parent("li").removeClass("active");
        }
        //If the menu is not visible
        else if ((checkElement.is('.reports-treeview-menu')) && (!checkElement.is(':visible'))) {
          //Get the parent menu
          var parent = $this.parents('ul').first();
          //Close all open menus within the parent
          var ul = parent.find('ul:visible').slideUp(animationSpeed);
          //Remove the menu-open class from the parent
          ul.removeClass('menu-open');
          //Get the parent li
          var parent_li = $this.parent("li");

          //Open the target menu and add the menu-open class
          checkElement.slideDown(animationSpeed, function () {
            //Add the class active to the parent li
            checkElement.addClass('menu-open');
            parent.find('li.active').removeClass('active');
            parent_li.addClass('active');
            //Fix the layout in case the sidebar stretches over the height of the window
            _this.layout.fix();
          });
        }
        //if this isn't a link, prevent the page from being redirected
        if (checkElement.is('.reports-treeview-menu')) {
          e.preventDefault();
        }
      });
  };
  $.AdminLTE.controlSidebar = {
    //instantiate the object
    activate: function () {
      //Get the object
      var _this = this;
      //Update options
      var o = $.AdminLTE.options.controlSidebarOptions;
      //Get the sidebar
      var sidebar = $(o.selector);
      //The toggle button
      var btn = $(o.toggleBtnSelector);

      //Listen to the click event
      btn.on('click', function (e) {
        e.preventDefault();
        //If the sidebar is not open
        if (!sidebar.hasClass('control-sidebar-open')
          && !$('body').hasClass('control-sidebar-open')) {
          //Open the sidebar
          _this.open(sidebar, o.slide);
        } else {
          _this.close(sidebar, o.slide);
        }
      });

      //If the body has a boxed layout, fix the sidebar bg position
      var bg = $(".control-sidebar-bg");
      _this._fix(bg);

      //If the body has a fixed layout, make the control sidebar fixed
      if ($('body').hasClass('fixed')) {
        _this._fixForFixed(sidebar);
      } else {
        //If the content height is less than the sidebar's height, force max height
        if ($('.content-wrapper, .right-side').height() < sidebar.height()) {
          _this._fixForContent(sidebar);
        }
      }
    },
    //Open the control sidebar
    open: function (sidebar, slide) {
      //Slide over content
      if (slide) {
        sidebar.addClass('control-sidebar-open');
      } else {
        //Push the content by adding the open class to the body instead
        //of the sidebar itself
        $('body').addClass('control-sidebar-open');
      }
    },
    //Close the control sidebar
    close: function (sidebar, slide) {
      if (slide) {
        sidebar.removeClass('control-sidebar-open');
      } else {
        $('body').removeClass('control-sidebar-open');
      }
    },
    _fix: function (sidebar) {
      var _this = this;
      if ($("body").hasClass('layout-boxed')) {
        sidebar.css('position', 'absolute');
        sidebar.height($(".wrapper").height());
        if (_this.hasBindedResize) {
          return;
        }
        $(window).resize(function () {
          _this._fix(sidebar);
        });
        _this.hasBindedResize = true;
      } else {
        sidebar.css({
          'position': 'fixed',
          'height': 'auto'
        });
      }
    },
    _fixForFixed: function (sidebar) {
      sidebar.css({
        'position': 'fixed',
        'max-height': '100%',
        'overflow': 'auto',
        'padding-bottom': '50px'
      });
    },
    _fixForContent: function (sidebar) {
      $(".content-wrapper, .right-side").css('min-height', sidebar.height());
    }
  };

  $.AdminLTE.boxWidget = {
    selectors: $.AdminLTE.options.boxWidgetOptions.boxWidgetSelectors,
    icons: $.AdminLTE.options.boxWidgetOptions.boxWidgetIcons,
    animationSpeed: $.AdminLTE.options.animationSpeed,
    activate: function (_box) {
      var _this = this;
      if (!_box) {
        _box = document; // activate all boxes per default
      }
      //Listen for collapse event triggers
      $(_box).on('click', _this.selectors.collapse, function (e) {
        e.preventDefault();
        _this.collapse($(this));
      });

      //Listen for remove event triggers
      $(_box).on('click', _this.selectors.remove, function (e) {
        e.preventDefault();
        _this.remove($(this));
      });
    },
    collapse: function (element) {
      var _this = this;
      //Find the box parent
      var box = element.parents(".box").first();
      //Find the body and the footer
      var box_content = box.find("> .box-body, > .box-footer, > form  >.box-body, > form > .box-footer");
      if (!box.hasClass("collapsed-box")) {
        //Convert minus into plus
        element.children(":first")
          .removeClass(_this.icons.collapse)
          .addClass(_this.icons.open);
        //Hide the content
        box_content.slideUp(_this.animationSpeed, function () {
          box.addClass("collapsed-box");
        });
      } else {
        //Convert plus into minus
        element.children(":first")
          .removeClass(_this.icons.open)
          .addClass(_this.icons.collapse);
        //Show the content
        box_content.slideDown(_this.animationSpeed, function () {
          box.removeClass("collapsed-box");
        });
      }
    },
    remove: function (element) {
      //Find the box parent
      var box = element.parents(".box").first();
      box.slideUp(this.animationSpeed);
    }
  };
}


//calculate points/score old file name mainjs.js and mainjs1.js

$(document).ready(function () {
  var changeTooltipPosition = function (event) {
    var tooltipX = event.pageX - 8;
    var tooltipY = event.pageY + 8;
    $('div.tooltip').css({ top: tooltipY, left: tooltipX });
  };

  var showTooltip = function (event) {
    $('div.tooltip').remove();
    $('<div class="tooltip">1-4 Minimal Depression <br/> 5-9 Mild Depression <br/> 10-14 Moderate Depression <br/> 15-19 Moderately severe Depression <br/> 20-27 Severe Depression</div>')
      .appendTo('body');
    changeTooltipPosition(event);
  };

  var hideTooltip = function () {
    $('div.tooltip').remove();
  };

  $("label#hint").bind({
    mousemove: changeTooltipPosition,
    mouseenter: showTooltip,
    mouseleave: hideTooltip
  });

  var isName = "";
  $('#ra1 input[type=radio]').mouseup(function () {
    isName = $(this).attr('name');
    if ($('input[name=' + isName + ']:checked').val() == 1) {
      $("input[id*='ftotalra1']").val(parseInt($("input[id*='ftotalra1']").val()) - parseInt($('input[name=' + isName + ']:checked').val()));
    }
    if ($('input[name=' + isName + ']:checked').val() == 2) {
      $("input[id*='ftotalra1']").val(parseInt($("input[id*='ftotalra1']").val()) - parseInt($('input[name=' + isName + ']:checked').val()));
    }
    if ($('input[name=' + isName + ']:checked').val() == 3) {
      $("input[id*='ftotalra1']").val(parseInt($("input[id*='ftotalra1']").val()) - parseInt($('input[name=' + isName + ']:checked').val()));
    }
  }).change(function () {
    if ($('input[name=' + isName + ']:checked').val() == 1) {
      $("input[id*='ftotalra1']").val(parseInt($("input[id*='ftotalra1']").val()) + parseInt($('input[name=' + isName + ']:checked').val()));
    }
    if ($('input[name=' + isName + ']:checked').val() == 2) {
      $("input[id*='ftotalra1']").val(parseInt($("input[id*='ftotalra1']").val()) + parseInt($('input[name=' + isName + ']:checked').val()));
    }
    if ($('input[name=' + isName + ']:checked').val() == 3) {
      $("input[id*='ftotalra1']").val(parseInt($("input[id*='ftotalra1']").val()) + parseInt($('input[name=' + isName + ']:checked').val()));
    }
  });
  var changeTooltipPosition = function (event) {
    var tooltipX = event.pageX - 8;
    var tooltipY = event.pageY + 8;
    $('div.tooltip').css({ top: tooltipY, left: tooltipX });
  };

  var showTooltip = function (event) {
    $('div.tooltip').remove();
    $('<div class="tooltip">As core > 5 points is suggestive of depression <br/> As core &#8805; 10 points is almost always indicatice of depression<br/> As core >5 points shuld warrant a follow-up comprehensive assessment</div>')
      .appendTo('body');
    changeTooltipPosition(event);
  };

  var hideTooltip = function () {
    $('div.tooltip').remove();
  };

  $("label#hintGeriatric").bind({
    mousemove: changeTooltipPosition,
    mouseenter: showTooltip,
    mouseleave: hideTooltip
  });

  $('#ra input:radio').click(function () {
    $("input[id*='txt_isFinalTotal']").val(0);
    $('#ra :radio:checked').each(function () {
      if ($(this).is(":checked") && $(this).attr('value') == 1) {
        $("input[id*='txt_isFinalTotal']").val(parseInt($("input[id*='txt_isFinalTotal']").val()) + parseInt(1));
      }
    });
  });
  $(".extquest").hide();
});
function clearAllRadio() {
  $('#ra1 input[type=radio]').removeAttr('checked');
  $("input[id*='ftotalra1']").val(0);
}
function generalRadioClick(value) {
  $("input[id*='ftotalra1']").val(0);
  $('#ra1 :radio:checked').each(function () {
    debugger;
    var isName = $(this).attr('name');
    if ($(this).is(":checked")) {
      $("input[id*='ftotalra1']").val(parseInt($("input[id*='ftotalra1']").val()) + parseInt($('input[name=' + isName + ']:checked').val()));
    }
  });
}

function ACPlanningRadioClick(value) {
  $("input[id*='txt_raACPlanning']").val(0);
  $('#raACPlanning :radio:checked').each(function () {
    debugger;
    var isName = $(this).attr('name');
    if ($(this).is(":checked")) {
      $("input[id*='txt_raACPlanning']").val(parseInt($("input[id*='txt_raACPlanning']").val()) + parseInt($('input[name=' + isName + ']:checked').val()));
    }
  });
}
function ACPClearAll() {
  $('#tblFunctionalABSC input[type=radio]').removeAttr('checked');
  $(".txtboxtotalABS").val(0);
  $("#txt_FAS_Totalc").val(0);
  $("#tblFunctionalABSC tr > td:nth-child(4) input:text").val('');
}
function CognitiveScrClearAll() {
  $('#tbl_cog_screening input[type=radio]').removeAttr('checked');
  $(".txtboxtotal").val(0);
  $("#txt_finalcognitivescreening").val(0);
  $("#tbl_cog_screening tr > td:nth-child(4) input:text").val('');
}

//mainjs1.js


function clearAll() {
  $('#ra input[type=radio]').removeAttr('checked');
  $("input[id*='txt_isFinalTotal']").val(0);
  $("#ra input[type='text']").val('');
}

function generalRadioClickGDS(value) {
  $("input[id*='txt_isFinalTotal']").val(0);
  $('#ra :radio:checked').each(function () {
    if ($(this).is(":checked") && $(this).attr('value') == 1) {
      $("input[id*='txt_isFinalTotal']").val(parseInt($("input[id*='txt_isFinalTotal']").val()) + parseInt(1));
    }
  });
}


function CogScreeningRadioClick(value) {
  //$("input[id*='txt_raACPlanning']").val(0);
  $('#tbl_cog_screening :radio:checked').each(function () {

    var isName = $(this).attr('name');
    if ($(this).is(":checked")) {
      $('input[id=' + $(this).parent().parent().parent().find('input[type="text"]').attr("id") + ']').val(parseInt($('input[name=' + isName + ']:checked').val()));
      //$("input[id*='txt_score_quest1']").val(parseInt($('input[name=' + isName + ']:checked').val()));
    }
  });

  var sum = 0;
  var column2 = $('#tbl_cog_screening').find('.txtboxtotal')
  $.each(column2, function (number) {
    sum += parseInt($(this).val());
  });
  $("input[id*='txt_finalcognitivescreening']").val(sum);
}
function FunctionalABSCRadioClick(value) {
  //$("input[id*='txt_raACPlanning']").val(0);
  $('#tblFunctionalABSC :radio:checked').each(function () {

    var isName = $(this).attr('name');
    if ($(this).is(":checked")) {
      $('input[id=' + $(this).parent().parent().parent().find('input[type="text"]').attr("id") + ']').val(parseInt($('input[name=' + isName + ']:checked').val()));
      //$("input[id*='txt_score_quest1']").val(parseInt($('input[name=' + isName + ']:checked').val()));
    }
  });

  var sum = 0;
  var column2 = $('#tblFunctionalABSC').find('.txtboxtotalABS')
  $.each(column2, function (number) {
    sum += parseInt($(this).val());
  });
  $("input[id*='txt_FAS_Totalc']").val(sum);
}
//function ACPClearAll() {
//    $('#tblFunctionalABSC input[type=radio]').removeAttr('checked');
//    $(".txtboxtotalABS").val(0);
//    $("#txt_FAS_Totalc").val(0);
//	$("#tblFunctionalABSC tr > td:nth-child(4).input:text").val('');
//}
//function CognitiveScrClearAll() {
//    $('#tbl_cog_screening input[type=radio]').removeAttr('checked');
//    $(".txtboxtotal").val(0);
//   $("#txt_finalcognitivescreening").val(0);
//	$("#tbl_cog_screening tr > td:nth-child(4)").val('');
//}


function callload(value) {
  var ctrlID = $(value).attr('id');

  if ($(value).attr('class') != "hasDatepicker") {
    $('input[id=' + ctrlID + ']').removeAttr('class');
    $('input[id=' + ctrlID + ']').datepicker();
    $('input[id=' + ctrlID + ']').focus();
  }
}

function generalasthmacontroltest(value) {
  var isName = $(value).attr('name');
  var isIDValue = $(value).attr('id');
  if (isName != "") {
    $(value).parents('tr').children('td').each(function () {
      $('input[name=' + isName + ']').removeAttr('checked');
    });
    $('input[id=' + isIDValue + ']').prop("checked", true);
    $('input[id=' + isIDValue + ']').attr("checked", "checked");
    var rowtotalan = $(value).parents('tr').children('td:eq(5)').children().attr('id');
    $('input[id=' + rowtotalan + ']').removeAttr('value');
    $('input[id=' + rowtotalan + ']').val('');
    $('input[id=' + rowtotalan + ']').attr('value', parseInt($('input[name=' + isName + ']:checked').val()));
    $('input[id=' + rowtotalan + ']').val(parseInt($('input[name=' + isName + ']:checked').val()));
  }
  $("input[id*='ACTTotal']").removeAttr('value');
  $("input[id*='ACTTotal']").val(0);
  $('#actest tr:odd').not(':first').not(':last').each(function () {
    $("input[id*='ACTTotal']").attr('value', parseInt($("input[id*='ACTTotal']").val()) + parseInt($('td:eq(5)', this).children().val()));
    $("input[id*='ACTTotal']").val(parseInt($("input[id*='ACTTotal']").val()) + parseInt($('td:eq(5)', this).children().val()));
  });
}
function clearasthmacontroltest() {
  $("input[id*='ACTTotal']").val(0);
  $('#actest input:radio').removeAttr('checked');
  $('#actest tr:odd').not(':first').not(':last').each(function () {
    $('td:eq(5)', this).children().removeAttr('value');
    $('td:eq(5)', this).children().attr('value', 0);
    $('td:eq(5)', this).children().val(0);
  });
}

function generalAddCHACT(value) {
  var isName = $(value).attr('name');
  var idValue = $(value).attr('id');
  if (isName != "") {

    $(value).parents('tr').children('td').each(function () {
      $('input[name=' + isName + ']').removeAttr('checked');
    });
    $('input[id=' + idValue + ']').prop("checked", true);
    $('input[id=' + idValue + ']').attr("checked", "checked");
    var rowtotalan2 = $(value).parents('tr').children('td:eq(6)').children().attr('id');
    $('input[id=' + rowtotalan2 + ']').removeAttr('value');
    $('input[id=' + rowtotalan2 + ']').val('');
    $('input[id=' + rowtotalan2 + ']').attr('value', parseInt($('input[name=' + isName + ']:checked').val()));
    $('input[id=' + rowtotalan2 + ']').val(parseInt($('input[name=' + isName + ']:checked').val()));
  }
  var ist = 0;
  var ist1 = 0;
  $('#asttable tr:odd').not(':first').each(function () {
    ist = parseInt(ist) + parseInt($('td:eq(6)', this).children().val());
  });
  $('#asttable2 tr:odd').not(':last').each(function () {
    ist1 = parseInt(ist1) + parseInt($('td:eq(6)', this).children().val());
  });
  $("input[id*='finalTotal']").removeAttr('value');
  $("input[id*='finalTotal']").val(0);
  $("input[id*='finalTotal']").attr('value', parseInt(ist) + parseInt(ist1));
  $("input[id*='finalTotal']").val(parseInt(ist) + parseInt(ist1));

}
function clearCHACTest() {
  $("input[id*='finalTotal']").val(0);
  $('#asttable input:radio').removeAttr('checked');
  $('#asttable2 input:radio').removeAttr('checked');
  $('#asttable tr:odd').not(':first').each(function () {
    $('td:eq(6)', this).children().removeAttr('value');
    $('td:eq(6)', this).children().attr('value', 0);
    $('td:eq(6)', this).children().val(0);
  });
  $('#asttable2 tr:odd').not(':last').each(function () {
    $('td:eq(6)', this).children().removeAttr('value');
    $('td:eq(6)', this).children().attr('value', 0);
    $('td:eq(6)', this).children().val(0);
  });
}

//PRE NATAL js for PHQ-9 and GAD-7
function calculatePHQ9Score(value) {
  $("input[id*='txt_phq9_total']").val(0);
  $('#tblphq9 :radio:checked').each(function () {
    if ($(this).is(":checked")) {
      $("input[id*='txt_phq9_total']").val(parseInt($("input[id*='txt_phq9_total']").val()) + parseInt($(this).attr('value')));
    }
  });
  if ($("input[id*='txt_phq9_total']").val() >= 1 && $("input[id*='txt_phq9_total']").val() <= 4) {
    $("label[id*='resultScorePHQ9']").html('Minimal Depression')
  }
  if ($("input[id*='txt_phq9_total']").val() >= 5 && $("input[id*='txt_phq9_total']").val() <= 9) {
    $("label[id*='resultScorePHQ9']").html('Mild Depression')
  }
  if ($("input[id*='txt_phq9_total']").val() >= 10 && $("input[id*='txt_phq9_total']").val() <= 14) {
    $("label[id*='resultScorePHQ9']").html('Moderate Depression')
  }
  if ($("input[id*='txt_phq9_total']").val() >= 15 && $("input[id*='txt_phq9_total']").val() <= 19) {
    $("label[id*='resultScorePHQ9']").html('Moderately severe Depression')
  }
  if ($("input[id*='txt_phq9_total']").val() >= 20 && $("input[id*='txt_phq9_total']").val() <= 27) {
    $("label[id*='resultScorePHQ9']").html('Severe Depression')
  }
  if ($("input[id*='txt_phq9_total']").val() == 0) {
    $("label[id*='resultScorePHQ9']").html('')
  }

}
function clearAllPHQ9Values() {
  $('#tblphq9 input[type=radio]').prop("checked", false);    
  $("input[id*='txt_phq9_total']").val(0);
  $("label[id*='resultScorePHQ9']").html('');
  $('#tblphq9Difficulty input[type=radio]').prop("checked", false);  
}


function calculateGAD7Score(value) {
  $("input[id*='txt_gad7_total']").val(0);
  $('#tblgad7 :radio:checked').each(function () {
    if ($(this).is(":checked")) {
      $("input[id*='txt_gad7_total']").val(parseInt($("input[id*='txt_gad7_total']").val()) + parseInt($(this).attr('value')));
    }
  });

}
function clearAllGAD7Values() {
  $('#tblgad7 input[type=radio]').prop("checked", false);  
  $("input[id*='txt_gad7_total']").val(0);  
  $('#tblgad7Difficulty input[type=radio]').prop("checked", false);  
}

//COW form
function clearAllClinicalOpt() {
  $('#tblClinicalOptWithdrawal input[type=radio]').prop('checked', false);
  $('#tblClinicalOptWithdrawal input[type=text]').val(0);
  //$(".txtboxtotal").val(0);
  //$("#finalTotal").val(0);
}


function clinicalOpiateRadioClick(value) {
  //$("input[id*='txt_raACPlanning']").val(0);
  $('#tblClinicalOptWithdrawal :radio:checked').each(function () {

    var isName = $(this).attr('name');
    if ($(this).is(":checked")) {
      $('input[id=' + $(this).parent().parent().parent().find('input[type="text"]').attr("id") + ']').val(parseInt($('input[name=' + isName + ']:checked').val()));
      //$("input[id*='txt_score_quest1']").val(parseInt($('input[name=' + isName + ']:checked').val()));
    }
  });

  var sum = 0;
  var column2 = $('#tblClinicalOptWithdrawal').find('.txtboxtotal')
  $.each(column2, function (number) {
    sum += parseInt($(this).val());
  });
  $("input[id*='finalTotal']").val(sum);
}
//drugs
function genDrugAbuseCalculationAdults(value) {
  $("input[id*='txt_adult_toatl']").val(0);
  $('#adultsdrugs :radio:checked').each(function () {
if ($(this).is(":checked")) {
  if(parseInt($(this).attr('value')) != '3')
    $("input[id*='txt_adult_toatl']").val(parseInt($("input[id*='txt_adult_toatl']").val()) + parseInt($(this).attr('value')));
    $("span[id*='hdnrslt']").html("~~"+$("input[id*='txt_adult_toatl']").val()+"~~");
}
  });
  if ($("input[id*='txt_adult_toatl']").val() == 0) {
      $("label[id*='fnlresult']").html('')
  }

  if ($("input[id*='txt_adult_toatl']").val() >= 1 && $("input[id*='txt_adult_toatl']").val() <= 2) {
    $("label[id*='fnlresult']").html('The patient appears to meet ASAM Criteria Level I (low) and would benefit from brief, outpatient counseling.')
}
if ($("input[id*='txt_adult_toatl']").val() >= 3 && $("input[id*='txt_adult_toatl']").val() <= 5) {
    $("label[id*='fnlresult']").html('The patient appears to meet ASAM Criteria Level I or II (intermediate), to be determined based on further assessment; and is a candidate for intensive outpatient therapy or partial hospitalization.')
}
if ($("input[id*='txt_adult_toatl']").val() >= 6 && $("input[id*='txt_adult_toatl']").val() <= 8) {
    $("label[id*='fnlresult']").html('The patient appears to meet ASAM Criteria Level II or III (substantial), to be determined based on further assessment; and appears to be a candidate for intensive, clinically-managed residential counseling/therapy (e.g., halfway house, Community-Based Residential Facility).')
}
if ($("input[id*='txt_adult_toatl']").val() >= 9 && $("input[id*='txt_adult_toatl']").val() <= 10) {
    $("label[id*='fnlresult']").html('The patient appears to meet ASAM criteria III or IV (severe), to be determined based on further assessment; and appears to be a candidate for medically-monitored intensive inpatient treatment, such as in a licensed detoxification facility or specialty hospital.')
}
if ($("input[id*='txt_adult_toatl']").val() == 0) {
    $("label[id*='fnlresult']").html('The patient does not exhibit any symptoms of substance abuse at this time.');
}
}
function clearDrugAbuseAdults() {
//$('#adultsdrugs input:radio').removeAttr('checked');
$("#adultsdrugs input:radio").prop("checked", false);
$("input[id*='txt_adult_toatl']").val(0);
$("label[id*='fnlresult']").html('');
}
//RSUD start
function genRSUDone(value) {
  $("#totalone").text($("#rsud tbody tr td:nth-child(3) :checkbox:checked").length);
}
function genRSUDtwo(value) {
  $("#totaltwo").text($("#rsud tbody tr td:nth-child(4) :checkbox:checked").length);
}
function genRSUDthree(value) {
  $("#totalthree").text($("#rsud tbody tr td:nth-child(5) :checkbox:checked").length);
}
//RSUD end
//child
function gendastchildren(value, from) {
  debugger;
  $("input[id*='txt_child_toatl']").val(0);
  $('#childdrugs :radio:checked').each(function () {
  if ($(this).is(":checked")) {
    $("input[id*='txt_child_toatl']").val(parseInt($("input[id*='txt_child_toatl']").val()) + parseInt($(this).attr('value')));
    $("span[id*='hdnrslt']").html("~~"+$("input[id*='txt_child_toatl']").val()+"~~");
  }
  });
  if ($("input[id*='txt_child_toatl']").val() == 0) {
      $("label[id*='resultScore']").html('')
  }

//  if(from == "noshow"){
//    $(".extquest").show();
  //}else if(from == "show" && $("input[id*='txt_child_toatl']").val() < 1){
    //$(".extquest").hide();
  //}
  if ($("input[id*='txt_child_toatl']").val() == 1) {
    $("label[id*='fnlresult']").html('The patient does not exhibit any problem related to alcohol or other drug abuse. No clinical action is required at this time.')
  }
  if ($("input[id*='txt_child_toatl']").val() >= 2 && $("input[id*='txt_child_toatl']").val() <= 6) {
      $("label[id*='fnlresult']").html('The patient appears to exhibit a significant problem related to alcohol or other drug abuse. Referral for further assessment is required.')
  }
  if ($("input[id*='txt_child_toatl']").val() == 0) {
      $("label[id*='fnlresult']").html('The patient does not exhibit any problem related to alcohol or other drug abuse. No clinical action is required at this time.');
  }

}
function cleargendastchildren() {
//$('#childdrugs input:radio').removeAttr('checked');
$("#childdrugs input:radio").prop("checked", false);
$("input[id*='txt_child_toatl']").val(0);
}



function showhideDastchildren(val){
  debugger;
  var showRhide = "";
  var showRhideIDs = "";
  var radioBtns = $('#childdrugs .shde :checked');
  if(radioBtns.length>0){
    for(var i = 0; i< radioBtns.length; i++){
      showRhideIDs += radioBtns[i].id+",";
    }
    var fvalue = showRhideIDs.split(",");
    if(fvalue.length>0){
      if(fvalue[0]=="rdo_Drink_any_alcohol_02" && fvalue[1]=="rdo_marijuana_hashish_02" && fvalue[2]=="rdo_gethigh_02"){
        $(".extquest").hide();
      }else{
        $(".extquest").show();
      }
    }
  }

    





//   var showRhide = "";
//   var showRhideIDs = "";
// var radioBtns = $('#childdrugs .shde :checked');
// if(radioBtns.length>0){
//   for(var i = 0; i< radioBtns.length; i++){
//     //if(radioBtns[i].id == "rdo_Drink_any_alcohol_02" || radioBtns[i].id == "rdo_marijuana_hashish_02" || radioBtns[i].id == "rdo_gethigh_02"){
//     //  showRhideIDs += radioBtns[i].id;
//     //}
//     showRhideIDs += radioBtns[i].id+",";
//   }

//   var fvalue = showRhideIDs.split(",");
//   if(fvalue.length>0){
//     if(fvalue[0]=="rdo_Drink_any_alcohol_02" && fvalue[2]=="rdo_marijuana_hashish_02" && fvalue[2]=="rdo_gethigh_02"){
//       $(".extquest").hide();
//     }else{
//       $(".extquest").show();
//     }
//   }

  // if(showRhide == "hide"){
  //   $(".extquest").hide();
  // }else{
  //   $(".extquest").show();
  // }
}








  // debugger;
  // var tableVals = "";
  // var checkboxes = document.querySelectorAll('#childdrugs .shde input[type="radio"]');
  // checkboxes.forEach(function(checkbox) {
  //   var txs = "";
  // //  $('#childdrugs .shde :radio:checked').each(function () {
  // //    txs += $(this).attr('id')+",";
  // //  });
  // checkbox.addEventListener(':checked', function(e) {
  //   tableVals += e.target.id

  // }, { once: true })

  // });
  // var fResult = tableVals.split(",");
  // var showRhide = "";
  // for(var i = 0; i < fResult.length; i++){
  //   if(fResult[i]!=""){
  //     if(fResult[i] == "rdo_Drink_any_alcohol_02" && fResult[i] == "rdo_marijuana_hashish_02" && fResult[i] == "rdo_gethigh_02"){
  //       showRhide = "hide";
  //     }else{
  //       showRhide = "show";
  //     }
  //   }
  // }
  // if(showRhide == "hide"){
  //   $(".extquest").hide();
  // }else{
  //   $(".extquest").show();
  // }
