$.blockUI.defaults.message = '<img src="images/busy.gif" />';
//$.blockUI.defaults.fadeIn = 700;
//$.blockUI.defaults.fadeOut = 700;
$.blockUI.defaults.centerY = true;
$.blockUI.defaults.centerX = true;
$.blockUI.defaults.css.width = '40px';
$.blockUI.defaults.css.border = '1px solid #cbcdcc';
$.blockUI.defaults.overlayCSS.backgroundColor = 'c9cdd8';

//$.blockUI.defaults.css.backgroundColor = 'eeeff4';
$.maxlength.setDefaults({ showFeedback: true });

var TABLETOOLS_PDF = { 'sExtends': 'pdf', 'sPdfOrientation': 'landscape', 'sTitle': 'MPTL Anomaly Database', 'mColumns': 'visible' };
var TABLETOOLS_CSV = { 'sExtends': 'csv', 'mColumns': 'visible' };
var TABLETOOLS_COPY = { 'sExtends': 'copy', 'mColumns': 'visible' };

//Global variables
var ses_timeout = '';
var timeOnPageLoad = '';
var page_title = '';
var u_id = -1;

var an_dt_row = 0;
var ref_dt_row = 0;
var lkp_grp_dt_row = 0;

var m_pane_mdl;
var e_pane_mdl;
var m_pane_tls;
var m_pane_mdl_state;
var e_pane_mdl_state;
var m_pane_tls_state;

//Selection variables
var prev_asset_loc = '';
var curr_asset_loc = '';
var curr_module = 'an';
var an_dlg_open = false;
var curr_rpt = 'anomaly_list';
var asInitVals = new Array();

var ses_timeout = 20;
var recache_timeout = 5;
var idle_time = 0;
// Automatically cancel unfinished ajax requests 
// when the user navigates elsewhere.
var xhrPool = [];
function Abort() { $.each(xhrPool, function (idx, jqXHR) { jqXHR.abort(); }); }
$(document).ajaxSend(function (e, jqXHR, options) { xhrPool.push(jqXHR); });
$(document).ajaxComplete(function (e, jqXHR, options) { xhrPool = $.grep(xhrPool, function (x) { return x != jqXHR }); });

//var ses_timeout_warning = '<%= System.Configuration.ConfigurationManager.AppSettings["SessionWarning"].ToString()%>';
//var ses_timeout = "<%= Session.Timeout %>";
//Session Warning
function SessionWarning() {
    if (allow_session) {
        //minutes left for expiry
        var minutesForExpiry = (parseInt(ses_timeout) -
            parseInt(ses_timeout_warning));
        var message = "Your session will expire in another " + minutesForExpiry +
        " mins! Please Save the data before the session expires";
        var currentTime = new Date();
        //time for expiry
        var timeForExpiry = timeOnPageLoad.setMinutes(timeOnPageLoad.getMinutes()
            + parseInt(ses_timeout));

        //Current time is greater than the expiry time
        if (Date.parse(currentTime) > timeForExpiry) {
            alert("Session expired. You will be redirected to welcome page");
            //window.location.reload();
        }
    }
}
//Session timeout
function RedirectToWelcomePage() {
    $.msgBox({
        title: "Session Expired",
        content: "Your login session has expired. Do you want to login again?",
        type: "confirm",
        buttons: [{ value: "Yes" }, { value: "No" }],
        success: function (result) {
            if (result == "Yes") {
                LogoutUser('relogin');
            } else {
                LogoutUser('session_expired');
            }
        }
    });
}
function InitSessionTimeouts() {
    if (ses_timeout == '') {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'requesthandler.ashx?id=init_session'
        }).done(function (r) {
            ses_timeout = r['timeout'];

            recache_timeout = r['recache'];
            InitIdleTime();

            timeOnPageLoad = new Date();
            //For warning
            //setTimeout('SessionWarning()', parseInt(ses_timeout_warning) * 60 * 1000);
            //To redirect to the welcome page
            setTimeout('RedirectToWelcomePage()', ses_timeout * 60 * 1000);
        });
    }
}
function InitPageTitle() {
    //if (page_title == '') ||  {
    $.ajax({
        type: 'GET',
        async: false,
        url: 'requesthandler.ashx?id=page_title&pass=true'
    }).done(function (r) {
        page_title = r['r'];
        document.title = page_title;
    });
    //  }
}

function DestroyPage() {
    $.ajax({
        cache: false,
        dataType: 'json',
        url: 'requesthandler.ashx',
        data: { id: 'destroy' },
        success: function (r) {
            AuthenticateSingleLogin(r);
            alert('Page destroyed');
        }
    });
}
function ShowLogoutPage() {
    $('body').children('table').hide();
    $('body').children('div').hide();
}
/* ~Tree functionalities start~  */
function LoadTree() {
    $('#treeview').html('');
    $('#tree_pane').show();
    $('#asset_info').show();
    ResizeTree();

    InitAssetInfoCounts();
    $('#tree_pane').block();
    InitChildNodes('-1');
}
function InitChildNodes(par_id) {
    $('#tree_pane').block();

    $.ajax({
        dataType: 'json',
        url: 'requesthandler.ashx', data: { id: 'tree', par_id: par_id },
        success: function (r) { AuthenticateSingleLogin(r); DispChildNodes(r, par_id); }
    });
}
function DispChildNodes(r, par_id) {
    var str = '';
    for (var i = 0; i < r.length; i++) {
        var id = r[i][0];
        var loc = r[i][1];
        var code = r[i][2];
        var desc = r[i][3];
        var color = r[i][4];
        var child_count = r[i][5];
        var has_child = (child_count > 0);
        //alert(id + ' ' + desc + ' ' + has_child);
        //str +=
        //'<li>' +
        //    '<div id="tree_ptr_' + id + '"' + (has_child ? ' onclick="ExpandCollapse(' + id + ');" ' : '') +
        //        'class="' + (has_child ? 'folder-collapse ptr' : 'folder-none') + '"></div>' +
        //        '<div class="sta' + color + '"></div>' +
        //        '<div title="ID: ' + id + ' Description: ' + desc + '" id="tree_' + id + '" loc="' + loc + '" class="nodedesc"' + 
        //    '" onmouseover="$(this).addClass(\'ui-state-hover\');" onmouseout="$(this).removeClass(\'ui-state-hover\');" ' + 
        //    'onclick="SelectNode(' + id + ');">'  + desc + '</div>' +
        //    '</li>';
        str +=
        '<li>' +
            '<div' + (has_child ? ' onclick="ExpandCollapse(' + id + ');" ' : ' ') +
                'class="tree_ptr_' + id + ' ' + (has_child ? 'folder-collapse ptr' : 'folder-none ptr') + '"></div>' +
                '<div class="sta' + color + '"></div>' +
                '<div title="ID: ' + id + ' Description: ' + desc + '" loc="' + loc + '" class="tree_' + id + ' nodedesc"' +
            '" onmouseover="$(this).addClass(\'ui-state-hover\');" onmouseout="$(this).removeClass(\'ui-state-hover\');" ' +
            'onclick="SelectNode(' + id + ');">' + desc + '</div>' +
            '</li>';

    }
    str = '<ul class="tree">' + str + '</ul>';

    if (par_id != -1) {
        //$(str).insertAfter($('#tree_' + par_id + ''));
        $(str).insertAfter($('.tree_' + par_id + ''));
    }
    else {
        $(str).appendTo('#treeview'); // If root..

        ExpandCollapse(id);
        SelectNode(id);
    }

    $('#tree_pane').unblock();
}
function ExpandCollapse(node_id) {
    //var $node_ptr = $('#tree_ptr_' + node_id);
    var $node_ptr = $('.tree_ptr_' + node_id);
    var expand = ($node_ptr.is('.folder-collapse'));
    //var expand = ($node_ptr.hasClass('folder-collapse'));

    if (expand) {
        if ($node_ptr.parent('li').children('ul').length == 0) InitChildNodes(node_id);
        else $node_ptr.parent('li').children('ul').show();

        $node_ptr.removeClass('folder-collapse').addClass('folder-expand');
    } else { // Of collapse
        $node_ptr.removeClass('folder-expand').addClass('folder-collapse');
        $node_ptr.parent('li').children('ul').hide();
    }
}

function SelectNode(node_id, force) {
    if (an_dlg_open) {
        $('#i_sel_asset_id').val(node_id);
        $('#i_sel_asset_desc').val($('#tree_sel .tree_' + node_id).html().toUpperCase())
        $('#tree_sel').removeClass('ui-state-highlight');
        $('#tree_sel .ui-state-highlight').removeClass('ui-state-highlight');
        $('#tree_sel .tree_' + node_id).addClass('ui-state-highlight');
    } else {
        var prv_node = window['sel_node_id'];
        var new_selection = (node_id != prv_node);
        //if (new_selection && $('#tree_' + prv_node)) { //Remove highlight;
        //  if (new_selection && $('#treeview .tree_' + prv_node)) { //Remove highlight;
        //$('#tree_' + prv_node).removeClass('ui-state-highlight');
        $('#treeview .ui-state-highlight').removeClass('ui-state-highlight');

        // }
        if (new_selection || force) {
            window['sel_node_id'] = node_id;
            //$('#tree_' + node_id).addClass('ui-state-highlight');
            $('.tree_' + node_id).addClass('ui-state-highlight');

            //window['curr_asset_loc'] = $('#tree_' + node_id).attr('loc');
            window['curr_asset_loc'] = $('.tree_' + node_id).attr('loc');
            //$('#asset_desc').html($('#tree_' + window['sel_node_id']).html().toUpperCase());
            $('#asset_desc').html($('#treeview .tree_' + window['sel_node_id']).html().toUpperCase());

            if (window['curr_module'] == 'an') InitAn(null);
            else if (window['curr_module'] == 'ref') InitRef();
            else if (window['curr_module'] == 'rpt') InitReport(window['curr_rpt']);
        }
    }
}
function RefreshTree(asset_id, color) {
    ShowNoty('Refreshing tree color', 'info');
    $.ajax({
        dataType: 'json',
        url: 'requesthandler.ashx',
        data: { id: 'refresh_tree', asset_id: asset_id, color: color },
        success: function (r) { AuthenticateSingleLogin(r); RefreshChildNodes(r); }
    });
}
function RefreshChildNodes(r) {
    for (var i = 0; i < r.length; i++) {
        var id = r[i][0];
        var color = r[i][1];
        $('.tree_' + id).prev('div').removeClass().addClass('sta' + color);
    }
}
/*
    ~Tree functions end~
*/
function InitAssetInfoCounts() {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'requesthandler.ashx?id=asset_i_cnt'
    }).done(function (r) {
        $('#red_cnt').html(r['red'] + ' Red Assets');
        $('#ora_cnt').html(r['ora'] + ' Orange Assets');
        $('#grn_cnt').html(r['grn'] + ' Green Assets');
        $('#asset_ref_cnt').html(r['grn'] + ' Reference Files');
    });
}
function InitAnInfoCounts() {
    if (window['curr_an_dt_key_id'] > 0) {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'requesthandler.ashx?id=an_i_cnt&an_id=' + window['curr_an_dt_key_id']
        }).done(function (r) {
            $('#ref_cnt').html(r['ref'] + ' Reference Files');
            $('#ft_cnt').html(r['ft'] + ' Failure Threats');
            $('#act_cnt').html(r['act'] + ' Action Items');
        });
    } else {
        $('#ref_cnt').html('0 Reference Files');
        $('#ft_cnt').html('0 Failure Threats');
        $('#act_cnt').html('0 Action Items');
    }
}

function UpdateUser(elm_1, elm_2, elm_3) {
    $('#' + elm_1).val(window['u_id']);
    $('#' + elm_2).html($('#u_name').html());
    InitSvrDate(elm_3);
}
var DELAY = 700, clicks = 0, timer = null;
function InitDTClickCallBacks(dt_name, rclick, dblclick) {
    $('#' + dt_name + '_elm tbody').delegate('tr', 'mousedown', function (e) {
        var row_selected = $('#' + dt_name + '_elm').dataTable().fnGetData(e.target.parentNode);
        if (row_selected != null) {
            $($('#' + dt_name + '_elm').dataTable().fnSettings().aoData).each(function () {
                $(this.nTr).removeClass('ui-state-highlight');
            });

            $(e.target).parent().addClass('ui-state-highlight');

            window[dt_name + '_row'] = this.sectionRowIndex;
            window['curr_' + dt_name + '_key_id'] = row_selected[0];

            if (dt_name == 'an_dt') SelectAn(row_selected[0]);
            else if (dt_name == 'ref_dt') SelectRef(row_selected[0]);
            else if (dt_name == 'an_ref_dt') {
                var full_path = row_selected[4] + row_selected[3];
                FileImgSrc('an_ref_file', 'an_ref_file_big', full_path);
            }

            if (rclick) {
                var col_idx = $(e.target).parent().context.cellIndex;
                var col_title = $('#' + dt_name + '_elm').dataTable().fnSettings().aoColumns[col_idx + 1].sTitle;

                if (e.which == 3) {
                    $.contextMenu({
                        selector: '#' + dt_name + '_elm',
                        build: function ($trigger, e) {
                            return {
                                callback: function (key, options) {
                                    switch (key) {
                                        case 'filter':
                                            FilterDT(dt_name, null, $(e.target).parent().context.cellIndex, $(e.target).parent().context.innerHTML);
                                            ToggleFilter(dt_name, true);
                                            break;
                                        case 'clear filter':
                                            ToggleFilter(dt_name, null, true);
                                            break;
                                        case 'add':
                                            AddAn();
                                            break;
                                        case 'edit':
                                            EditAn();
                                            break;
                                        case 'delete':
                                            DelAn();
                                            break;
                                    }
                                    if (key == 'filter') {
                                    } else if (key == 'clear_filter') {
                                        ToggleFilter(dt_name, null, true);
                                    }
                                },
                                items: {
                                    'filter': { name: 'Filter By ' + $(e.target).parent().context.innerHTML },
                                    'clear_filter': { name: 'Clear Filter' },
                                    'sep1': '---------',
                                    'add': { name: 'Add', disabled: (window['u_id'] == -1 ? true : false) },
                                    'edit': { name: 'Edit', disabled: (window['u_id'] == -1 ? true : false) },
                                    'delete': { name: 'Delete', disabled: (window['u_id'] == -1 ? true : false) },
                                    'sep2': '---------',
                                    'copy': { name: 'Copy' },
                                    'sep3': '---------',
                                    'quit': { name: 'Quit' }
                                }
                            };
                        }
                    });
                }
            }
        }
    }).delegate('tr', 'click', function (e) {
        if (dblclick) {
            clicks++;  //count clicks
            if (clicks === 1) {
                timer = setTimeout(function () { //perform single-click action    
                    clicks = 0;             //after action performed, reset counter
                }, DELAY);
            } else {
                clearTimeout(timer);    //prevent single-click action
                //perform double-click action
                clicks = 0;             //after action performed, reset counter
            }
        }
    }).delegate('tr', 'dblclick', function (e) {
        if (dblclick) {
            if (window['u_id'] != -1) {
                if (dt_name == 'an_dt') EditAn();
                else if (dt_name == 'ref_dt') EditRef();
                e.preventDefault();  //cancel system double-click event
            }
        }
    });
}
function SelectDTFirstRow(dt_name, json, select_last) {
    if (json.aaData.length > 0) {
        if ($('#' + dt_name + '_elm').dataTable().fnGetData(0) != null) {
            var idx = 0;
            if (select_last) idx = json.aaData.length - 1;
            window[dt_name + '_row'] = idx;

            $('#' + dt_name + '_elm tbody tr:eq(' + idx + ')').addClass('ui-state-highlight'); // Select top row if any.
            var id = json.aaData[idx][0];

            window['curr_' + dt_name + '_key_id'] = id;

            if (dt_name == 'an_dt') SelectAn(id);
            else if (dt_name == 'ref_dt') SelectRef(id);
            else if (dt_name == 'an_ref_dt') {
                var r = $('#' + dt_name + '_elm').dataTable().fnGetData(idx);
                var full_path = r[4] + r[3];
                FileImgSrc('an_ref_file', 'an_ref_file_big', full_path);

                if (select_last) { //Scroll down
                    var scroller = $('#' + dt_name + '_elm').dataTable().fnSettings().nTable.parentNode;
                    $(scroller).scrollTo($('#' + dt_name + '_elm').innerHeight());
                }
            }
        }
    } else {
        //   $.msgBox({ title: "No Records", content: "There are no records found." });

        window['curr_' + dt_name + '_key_id'] = -1;

        if (dt_name == 'an_dt') SelectAn(-1);
        else if (dt_name == 'ref_dt') SelectRef(-1);
        else if (dt_name == 'an_ref_dt') FileImgSrc('an_ref_file', 'an_ref_file_big', null, true);
    }
}
function InitDTVars(dt_name) {
    window['curr_' + dt_name + '_key_id'] = -1;
    window['prev_' + dt_name + '_display_start'] = -1;
    window['prev_' + dt_name + '_display_length'] = -1;
    window['prev_' + dt_name + '_sort_col'] = -1;
    window['prev_' + dt_name + '_sort_dir'] = -1;
    window['beg_' + dt_name + '_row'] = '';
    window['last_' + dt_name + '_row'] = '';
}
function SetDTVarsSvrData(dt_name, json) {
    window['prev_' + dt_name + '_display_start'] = json.iPreviousDisplayStart;
    window['prev_' + dt_name + '_display_length'] = json.iPreviousDisplayLength;
    window['prev_' + dt_name + '_sort_col'] = json.iPreviousSortCol;
    window['prev_' + dt_name + '_sort_dir'] = json.iPreviousSortDir;

    ResizeDataTable();
}
function SetDTVarsSvrParams(dt_name, aoData) {
    aoData.push({ 'name': 'prev_display_start', 'value': window['prev_' + dt_name + '_display_start'] });
    aoData.push({ 'name': 'prev_display_length', 'value': window['prev_' + dt_name + '_display_length'] });
    aoData.push({ 'name': 'prev_sort_col', 'value': window['prev_' + dt_name + '_sort_col'] });
    aoData.push({ 'name': 'prev_sort_dir', 'value': window['prev_' + dt_name + '_sort_dir'] });
    aoData.push({ 'name': 'beg_row', 'value': window['beg_' + dt_name + '_row'] });
    aoData.push({ 'name': 'last_row', 'value': window['last_' + dt_name + '_row'] });
}
function SetDTVarsFootCallback(dt_name, aData) {
    window['beg_' + dt_name + '_row'] = '';
    window['last_' + dt_name + '_row'] = '';
    for (var i = 0; i < aData[0].length; i++) {
        window['beg_' + dt_name + '_row'] += aData[0][i] + '@';
        window['last_' + dt_name + '_row'] += aData[aData.length - 1][i] + '@';
    }
}
function ClearDtlTDs(elm_id) {
    $('#' + elm_id + ' table.tab-page tr td.value').each(function () {
        if ($(this).children('div .td-memo').length > 0) {
            $(this).children('div .td-memo:first').html('');
        } else {
            $(this).html('');
        }
    });
}
function MainTabSelected(edit_mode) {
    //Determine currently selected tab to display details data.
    var tab_selected;
    if (edit_mode) tab_selected = $('#e_tabs').tabs('option', 'active');
    else tab_selected = $('#an_dtl_container').tabs('option', 'active');

    var proc_id;
    switch (tab_selected) {
        case 0: proc_id = 'dtl'; break;
        case 1: proc_id = 'ass'; break;
        case 2: proc_id = 'avail'; break;
        case 3: proc_id = 'rec'; break;
        case 4: proc_id = 'rsk'; break;
        case 5: proc_id = 'ref'; break;
        case 6: proc_id = 'ft'; break;
        case 7: proc_id = 'act'; break;
        default: proc_id = 'dtl'; break;
    }
    return proc_id;
}
function SetNoImg(elm_id, elm_id_2) {
    $('#' + elm_id).css('border-width', '1px');
    $('#' + elm_id).attr('resize', true);
    ResizeAttachImg();
    $('#' + elm_id).attr('src', 'images/no_file.png');
    $('#' + elm_id_2).attr('href', 'images/no_file.png');
}
function FileImgSrc(elm_id, elm_id_2, full_path, no_img) {
    $('#' + elm_id_2).closest('td').block();

    $('#' + elm_id).attr('src', '');
    $('#' + elm_id).width(0);
    $('#' + elm_id).height(0);

    $('#' + elm_id).load(function () { $('#' + elm_id_2).closest('td').unblock(); });

    if (no_img) {
        SetNoImg(elm_id, elm_id_2);
        //$('#' + elm_id_2).closest('td').unblock();
        return;
    }
    if (FileType(full_path) == 'img') {
        $('#' + elm_id_2).error(function () { $(this).attr('href', 'images/no_file.png'); });
        $('#' + elm_id_2).removeClass('preview').addClass('preview');

        $('#' + elm_id).css('border-width', '1px');
        $('#' + elm_id).attr('resize', true);
        ResizeAttachImg();

        var filename_idx = full_path.lastIndexOf("/") + 1;
        var path = full_path.substr(0, filename_idx);
        var filename = full_path.substr(filename_idx);
        //$('#' + elm_id).attr('src', 'requesthandler.ashx?id=img_src&fname=' + encodeURIComponent(full_path));
        $('#' + elm_id).attr('src', encodeURIComponent(full_path));
        $('#' + elm_id_2).attr('href', full_path);
        $('#' + elm_id_2).addClass('preview');
        $('#' + elm_id_2).attr('title', filename);
    } else {
        //$(this).error(function () { SetNoImg(elm_id, elm_id_2); })
        $('#' + elm_id_2).removeClass('preview');
        $('#' + elm_id).css('border-width', '0px');
        $('#' + elm_id).attr('resize', false);
        ResizeAttachImg();
        $('#' + elm_id).attr('src', 'images/doc.png');
        $('#' + elm_id).width('20');
        $('#' + elm_id).height('20');
        $('#' + elm_id_2).attr('href', full_path);
    }
}
function ResizeDtlDataTables() {

    var tab_idx = $('#an_dtl_container').tabs("option", "active");
    var tab = $("#an_dtl_container > div").eq(tab_idx);

    if (tab_idx > 4) {
        $('#' + window['curr_module'] + '_dtl_container').height(
            $('#e_inner_s_pane').height() - $('#e_inner_s_pane div:nth-child(1)').outerHeight() - 8);

        tab.height($('#' + window['curr_module'] + '_dtl_container').height() - $('#' + window['curr_module'] + '_dtl_container ul:nth-child(1)').outerHeight() - 8);

        var tbl_hdr_hei =
            $('#' + tab.attr('id') + ' .ui-widget-header:first').innerHeight() +
            $('#' + tab.attr('id') + ' .dataTable thead:first').innerHeight();
        var tbl_foo_hei = 105;

        $('#' + tab.attr('id') + ' .dataTables_scrollBody').height($('#e_inner_s_pane').height() - tbl_hdr_hei - tbl_foo_hei);
    }
}

function ResizeDtlTabs() {
    var tab_idx = $('#' + window['curr_module'] + '_dtl_container').tabs("option", "active");
    if (tab_idx >= 0 && tab_idx <= 5) {
        var tab = $('#' + window['curr_module'] + '_dtl_container > div:eq(' + tab_idx + ')');
        var tab_table = $('#' + tab.attr('id') + ' table.tab-page:eq(0)');

        $('#' + window['curr_module'] + '_dtl_container').height(
            $('#e_inner_s_pane').height() - $('#e_inner_s_pane div:nth-child(1)').outerHeight() - 8);

        tab.height($('#' + window['curr_module'] + '_dtl_container').height() - $('#' + window['curr_module'] + '_dtl_container ul:nth-child(1)').outerHeight() - 8);
        tab_table.height(tab.height() - 10);

        if (window['curr_module'] == 'an') {
            if (tab_idx == 4) {
                var ch_tab_idx = $('#tabs_rsk').tabs("option", "active");
                ch_tab = $('#tabs_rsk > div:eq(' + ch_tab_idx + ')');
                ch_tab_id = ch_tab.attr('id');

                var rsk_container_hei = $('#an_rsk_tab').height();
                $('#tabs_rsk').height($('#an_rsk_tab').height() - 4);
                ch_tab.height(tab.height() - 30);
                ch_tab.children('table.edit').width(ch_tab.width() - 17);

                $('#tabs_rsk .edit').each(function () {
                    var row_cnt = $(this).find('tr').length;
                    $(this).find('td').each(function () {
                        $(this).height((rsk_container_hei / row_cnt) - 6);
                    });
                });
            } else if (tab_idx == 5) {
                ResizeAttachImg();
            }

        } else {
            ResizeAttachImg();
        }
        $('#' + window['curr_module'] + '_dtl_container .td-memo').each(function () {
            //if ($(this).attr('id') != 'ram_comment') {
            $(this).width(0);
            $(this).width($(this).parent('td').width());
            $(this).height(0);
            $(this).height($(this).parent('td').height() + 4);
            // }
        });
    }
}
function ResizeAttachImg(an_to_ref) {
    if (window['curr_module'] == 'an') {
        if ($('#an_ref_file').attr('resize') == 'true' || $('#an_ref_file').attr('resize') == undefined) {
            $('#an_ref_file').width(0);
            $('#an_ref_file').height(0);
            $('#an_ref_file').width($('#an_ref_file').closest('td').innerWidth());
            $('#an_ref_file').height($('#an_ref_tab').height() - 30);
        }
    } else if (window['curr_module'] == 'ref') {
        if ($('#ref_file').attr('resize') == 'true' || $('#ref_file').attr('resize') == undefined) {
            $('#ref_file').width(0);
            $('#ref_file').height(0);
            $('#ref_file').height($('#ref_dtl_tab').height() - 4);
            $('#ref_file').width($('#ref_file').closest('td').innerWidth());
        }
    }

}
function FileType(file) {
    var extension = file.substr((file.lastIndexOf('.') + 1));

    switch (extension.toUpperCase()) {
        case 'JPG':
        case 'JPE':
        case 'BMP':
        case 'PNG':
        case 'GIF':
            return 'img';  // There's was a typo in the example where
            break;                         // the alert ended with pdf instead of gif.
        case 'OGG':
        case 'OGV':
        case 'AVI':
        case 'MPEG':
        case 'MPG':
        case 'MOV':
        case 'WMV':
        case 'FLV':
        case 'MP4':
            return 'vid';
            break;  
        case 'DWG':
            return 'dwg';
            break;  
        default:
            return 'doc';
    }
};
function IsDataTable(nTable) {
    var settings = $.fn.dataTableSettings;
    for (var i = 0, iLen = settings.length; i < iLen; i++) {
        if (settings[i].nTable == nTable) {
            return true;
        }
    }
    return false;
}
function InitSvrDate(elm_id, elm_id_2) {
    $.ajax({
        dataType: 'json',
        url: 'requesthandler.ashx', data: { id: 'svr_date' },
        success: function (r) {
            AuthenticateSingleLogin(r);
            $('#' + elm_id).html($.datepicker.formatDate('dd-M-yy', new Date(r['curr_date'])));

            if (elm_id_2) $('#' + elm_id_2).html($.datepicker.formatDate('dd-M-yy', new Date(r['curr_date']))) // + ' ' + 
            //$.datepicker.formatTime('HH:mm:ss', $.datepicker.parseTime('H:mm:ss T', r['curr_date'].substring(10))));
        }
    });
}

function InitLookups(p, elm_id, def_val, elm_id_2, def_val_2, sync) {
    $.ajax({
        async: false,
        dataType: 'json',
        url: 'requesthandler.ashx?id=lkp_2' + p + '',
        success: function (r) {
            AuthenticateSingleLogin(r);
            var str = ''; //Default null option.
            for (var i = 0; i < r.length; i++)
                str += '<option value="' + r[i][0] + '">' + r[i][1].toUpperCase() + '</option>';

            $('#' + elm_id).html(str);
            sortDropDownListByText(elm_id); //Sort
            if (def_val) {
                if (def_val == -1) $('#' + elm_id).prop('selectedIndex', def_val);
                else $('#' + elm_id).val(def_val);
            }

            if (elm_id_2) {
                $('#' + elm_id_2).append(str);
                sortDropDownListByText(elm_id_2); //Sort
                if (def_val_2) $('#' + elm_id_2).val(def_val_2);
            }
        }
    });
}
function InitLookupsTA(elm_id) {
    $.ajax({
        async: false,
        dataType: 'json',
        url: 'requesthandler.ashx?id=ta_lkp',
        success: function (r) {
            AuthenticateSingleLogin(r);
            var str = ''; //Default null option.
            for (var i = 0; i < r.length; i++)
                str += '<option value="' + r[i][0] + '">' + r[i][1].toUpperCase() + '</option>';

            $('#' + elm_id).html(str);
            sortDropDownListByText(elm_id); //Sort
     

          
        }
    });
}

function InitLookupsDeviation(elm_id) {
    $.ajax({
        async: false,
        dataType: 'json',
        url: 'requesthandler.ashx?id=deviation_lkp',
        success: function (r) {
            AuthenticateSingleLogin(r);
            var str = ''; //Default null option.
            for (var i = 0; i < r.length; i++)
                str += '<option value="' + r[i][0] + '">' + r[i][1].toUpperCase() + '</option>';

            $('#' + elm_id).html(str);
            sortDropDownListByText(elm_id); //Sort
     

          
        }
    });
}



function InitSysLookups(elm_id, grp_id, elm_id_2, def_val, sync, show_all) {
    //$('#' + elm_id).empty();
    //if (elm_id_2) $('#' + elm_id_2).empty();

    //  if ($('#' + elm_id + ' option').length == 0) {
    $.ajax({
        async: false,
        dataType: 'json',
        url: 'requesthandler.ashx?', data: { id: 'lkp', grp_id: grp_id },
        success: function (r) {
            AuthenticateSingleLogin(r);
            var str = ''; //Default null option.
            if (show_all) str += '<option value="-1">ALL</option>';

            for (var i = 0; i < r.length; i++)
                str += '<option value="' + r[i][0] + '">' + r[i][1].toUpperCase() + '</option>';
            $('#' + elm_id).append(str);
            sortDropDownListByText(elm_id); //Sort
            if (def_val) $('#' + elm_id).prop('selectedIndex', def_val);

            if (elm_id_2) {
                $('#' + elm_id_2).append(str);
                sortDropDownListByText(elm_id_2); //Sort

                if (def_val) $('#' + elm_id_2)[0].selectedIndex = def_val;
            }
        }
    });
    //    }
}


function sortDropDownListByText(selectId) {
    var sel = $('#' + selectId)
    var arrOptions = [];
    var i = 0;
    sel.find("option").each(function () {
        arrOptions[i] = [];
        arrOptions[i][0] = jQuery(this).text();
        arrOptions[i][1] = jQuery(this);
        i += 1;
    });
    arrOptions.sort();
    for (var i = 0; i < arrOptions.length; i++) {
        sel.append(arrOptions[i][1]);
    }
};

function InitRef(no_cache) {
    window['curr_module'] = 'ref';

    if (!$('#m_pane_mdl').is(":visible")) {
        $('#m_pane_tls').hide();
        $('#m_pane_mdl').show();
    }
    if (!$('#ref_dt_elm_container').is(":visible")) {
        $('#e_inner_c_pane').block();

        $('#an_dt_elm_container').hide();
        $('#an_dtl_container').hide();
        $('#rpt_container').hide();

        if (window['e_pane_mdl_state'].south.isClosed) window['e_pane_mdl'].show('south');

        $('#ref_dtl_container').show();
        $('#ref_dt_elm_container').show();

        $('#e_inner_c_pane').unblock();
    }
    InitDTVars('ref_dt');

    if (IsDataTable($('#ref_dt_elm')[0])) {
        InitDTVars('ref_dt');

        $('#ref_dt_elm').dataTable().fnSettings().sAjaxSource = 'requesthandler.ashx?id=ref_list&asset_loc=' +
            window['curr_asset_loc'] + '&no_cache=' + no_cache;
        $('#ref_dt_elm').dataTable().fnDraw();
    } else { //Init reference table
        var btns;
        if (window['u_id'] == -1) btns = [TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF, 'filter_ref'];
        else btns = ['add_ref', 'edit_ref', 'del_ref', 'lnk_ref', TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF, 'filter_ref'];

        $('#ref_dt_elm').dataTable({
            'sDom': '<"H"TClr>t<"F"ip>',
            "bStateSave": true,
            'bServerSide': true,
            'bJQueryUI': true,
            'bProcessing': true,
            'oLanguage': { 'sProcessing': '<img src="images/busy.gif" />' },
            'sScrollX': '100%',
            'bScrollCollapse': false,
            'iDisplayLength': 100,
            'bAutoWidth': false,
            'oColVis': {
                'buttonText': 'Columns',
                'bRestore': true,
                'sAlign': 'left',
                'aiExclude': [0],
                'fnStateChange': function (iColumn, bVisible) { ResizeDataTable(); }
            },
            'oTableTools': {
                'aButtons': btns,
                'sSwfPath': 'scripts/copy_csv_xls_pdf.swf'
            },
            'aaSorting': [[0, 'desc']],
            'sAjaxSource': 'requesthandler.ashx?id=ref_list&asset_loc=' + window['curr_asset_loc'] + '&no_cache=' + no_cache,
            'aoColumns': [
                    { 'sName': 'iref_id', 'bVisible': false },
                    { 'sName': 'sasset_desc' },
                    { 'sName': 'sfilename' },
                    { 'sName': 'stype_desc', 'sClass': 'center', 'sWidth': '100px' },
                    { 'sName': 'dupload_date', 'sClass': 'center', 'sWidth': '120px' },
                    { 'sName': 'spath_desc' },
                    { 'sName': 'spath_full', 'bVisible': false },
                    { 'sName': 'sgroup_desc', 'sClass': 'center', 'sWidth': '150px' }
            ],
            'fnServerData': function (sSource, aoData, fnCallback) {
                $.getJSON(sSource, aoData, function (json) {
                    fnCallback(json);
                    SetDTVarsSvrData('ref_dt', json);
                    SelectDTFirstRow('ref_dt', json);
                });
            },
            'fnServerParams': function (aoData) {
                window['prev_asset_loc'] = window['curr_asset_loc'];
                SetDTVarsSvrParams('ref_dt', aoData);
            },
            'fnFooterCallback': function (nFoot, aData, iStart, iEnd, aiDisplay) {
                if (aData.length > 0) {
                    SetDTVarsFootCallback('ref_dt', aData);
                } else {
                    InitDTVars('ref_dt');
                    ClearDtlTDs('ref_dtl_tab');
                }
                // document.title = page_title;
            },
            'fnInitComplete': function () { InitDTClickCallBacks('ref_dt', true, true); },
            'fnDrawCallback': function (oSettings) { DtFiltered('ref_dt', oSettings); }
        });

        //Indicate select elem in filters.
        $('#ref_dt_elm_container tfoot td:eq(2)').attr('lkp_id', 6);
        $('#ref_dt_elm_container tfoot td:eq(4)').attr('lkp_id', 7);
        $('#ref_dt_elm_container tfoot td:eq(5)').attr('lkp_id', 9);
    }
}
function CurrURLParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function IsDTFiltered(dt_name) {
    var oSettings = $(dt_name).dataTable().fnSettings();
    for (iCol = 0; iCol < oSettings.aoPreSearchCols.length; iCol++) {
        if (oSettings.aoPreSearchCols[iCol].sSearch != '') return true;
    }

    return false;
}
function InitAn(reset_row_idx, no_cache) {
    window['curr_module'] = 'an';

    if (reset_row_idx) window['an_dt_row'] = 0;

    if (!$('#m_pane_mdl').is(":visible")) {
        $('#m_pane_tls').show();
        $('#m_pane_mdl').show();
    }
    if (!$('#an_dt_elm_container').is(":visible")) {
        $('#e_inner_c_pane').block();

        $('#ref_dt_elm_container').hide();
        $('#ref_dtl_container').hide();
        $('#rpt_container').hide();

        if (window['e_pane_mdl_state'].south.isClosed) window['e_pane_mdl'].show('south');

        $('#an_dt_elm_container').show();
        $('#an_dtl_container').show();

        $('#e_inner_c_pane').unblock();
    }

    InitDTVars('an_dt');
    window['e_pane_mdl'].show('south');
    if (IsDataTable($('#an_dt_elm')[0])) {
        $('#an_dt_elm').dataTable().fnSettings().sAjaxSource = 'requesthandler.ashx?id=an_list&asset_loc=' + window['curr_asset_loc'] +
            '&open_anom=' + (IsDTFiltered('#an_dt_elm') ? '1' : '0');

        $('#an_dt_elm').dataTable().fnDraw();
    } else {

        //Init anomaly table.
        if (window['u_id'] == -1) btns = ['print_single', 'print_all', TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF, 'filter'];
        else btns = ['add', 'edit', 'del', 'print_single', 'print_all', TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF, 'filter'];
        var an_id_param = CurrURLParam('an_id');

        var ajax_src =
        (an_id_param == ''
        ? 'requesthandler.ashx?id=an_list&asset_loc=' + window['curr_asset_loc'] + '&open_anom=0' + '&no_cache=' + no_cache
        : 'requesthandler.ashx?id=an_list_param&an_id=' + encodeURIComponent(an_id_param));
        //'l' - Length changing
        //'f' - Filtering input
        //'t' - The table!
        //'i' - Information
        //'p' - Pagination
        //'r' - pRocessing
        //The following constants are allowed:
        //'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')
        //'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')
        //The following syntax is expected:
        //'<' and '>' - div elements
        //'<"class" and '>' - div with a class
        //'<"#id" and '>' - div with an ID
        //Examples:
        //'<"wrapper"flipt>'
        //'ip>'
        $('#an_dt_elm').dataTable({
            'sDom': '<"H"TClr>t<"F"ip>',
            "bStateSave": true,
            'bServerSide': true,
            'bJQueryUI': true,
            'bProcessing': true,
            'oLanguage': { 'sProcessing': '<img src="images/busy.gif" />' },
            //sPaginationType: 'full_numbers',
            //sScrollY: '200px',
            'sScrollX': '100%',
            //sScrollXInner: '100%',
            'bScrollCollapse': true,
            'iDisplayLength': 100,
            'bAutoWidth': false,
            'oColVis': {
                'buttonText': 'Columns',
                'bRestore': true,
                'sAlign': 'left',
                'aiExclude': [0],
                'fnStateChange': function (iColumn, bVisible) { ResizeDataTable(); }
            },
            'oTableTools': {
                'aButtons': btns,
                'sSwfPath': 'scripts/copy_csv_xls_pdf.swf'
            },
            //'aaSorting': [[2, 'desc']],
            'aaSorting': [[0, 'desc'], [2, 'desc']],
            'sAjaxSource': ajax_src,
            'aoColumns': [
                { 'sName': 'iid', 'bVisible': false },
                { 'sName': 'sasset_desc' },
                { 'sName': 'sref_no', 'sClass': 'center', 'sWidth': '50px' },
                { 'sName': 'sequip_no', 'sWidth': '120px' },
                { 'sName': 'srev_no', 'sClass': 'center', 'sWidth': '50px' },
                { 'sName': 'draised_date', 'sClass': 'center', 'sWidth': '80px' },
                { 'sName': 'dident_date', 'sClass': 'center', 'sWidth': '80px' },
                { 'sName': 'stype_desc' },
                { 'sName': 'sstatus_desc', 'sClass': 'center', 'sWidth': '50px' },
                { 'sName': 'sorig_act_code', 'sClass': 'center', 'sWidth': '50px' },
                { 'sName': 'scurr_act_code', 'sClass': 'center', 'sWidth': '50px' }
            ],
            'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                $.getJSON(sSource, aoData, function (json) {
                    /* Do whatever additional processing you want on the callback, then tell DataTables */
                    fnCallback(json);
                    SetDTVarsSvrData('an_dt', json);
                    SelectDTFirstRow('an_dt', json);
                });
            },
            'fnServerParams': function (aoData) {
                window['prev_asset_loc'] = window['curr_asset_loc'];

                SetDTVarsSvrParams('an_dt', aoData);
            },
            'fnDrawCallback': function (oSettings) {
                var col_no_1 = DTGetColumnNumber($('#an_dt_elm').dataTable(), 'sorig_act_code', true);
                col_no_1;
                var col_no_2 = DTGetColumnNumber($('#an_dt_elm').dataTable(), 'scurr_act_code', true);
                col_no_2;

                for (var i = 0, iLen = oSettings.aoData.length; i < iLen; i++) {
                    var color;
                    if (col_no_1 != -1) {
                        color = oSettings.aoData[i].nTr.cells[col_no_1].innerHTML.toLowerCase();;
                        oSettings.aoData[i].nTr.cells[col_no_1].background = null;
                        oSettings.aoData[i].nTr.cells[col_no_1].bgColor = color;
                    }
                    if (col_no_2 != -1) {
                        color = oSettings.aoData[i].nTr.cells[col_no_2].innerHTML.toLowerCase();;
                        oSettings.aoData[i].nTr.cells[col_no_2].background = null;
                        oSettings.aoData[i].nTr.cells[col_no_2].bgColor = color;
                    }
                }
                DtFiltered('an_dt', oSettings);
            },
            'fnFooterCallback': function (nFoot, aData, iStart, iEnd, aiDisplay) {
                if (aData.length > 0) {
                    SetDTVarsFootCallback('an_dt', aData);
                } else {
                    InitDTVars('an_dt');
                    ClearDtlTDs('an_dtl_tab');
                    ClearDtlTDs('an_ass_tab');
                    ClearDtlTDs('an_avail_tab');
                    ClearDtlTDs('an_rec_tab');
                    ClearDtlTDs('an_rsk_tab');
                }
            },
            'fnInitComplete': function () { InitDTClickCallBacks('an_dt', true, true); },
            'fnRowCallback': function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { }
        });

        //Indicate select elem in filters.
        $('#an_dt_elm_container tfoot td:eq(7)').attr('lkp_id', 3);
        $('#an_dt_elm_container tfoot td:eq(8)').attr('lkp_id', 2);
        $('#an_dt_elm_container tfoot td:eq(9)').attr('lkp_id', 2);
    }

    setInterval(
        function () {
            //$('#an_dt_elm').dataTable().fnDraw();
            //$('#an_dt_elm').dataTable().fnStandingRedraw();
        }, 30000);
}

function DispAnLnkTable(an_id, proc_id, edit_mode, no_cache) {
    var tbl_elm;
    if (edit_mode) tbl_elm = '#e_an_' + proc_id + '_dt_elm';
    else tbl_elm = '#an_' + proc_id + '_dt_elm';

    if (IsDataTable($(tbl_elm)[0])) {
        InitDTVars('an_' + proc_id);

        $(tbl_elm).dataTable().fnSettings().sAjaxSource = 'requesthandler.ashx?id=an_' + proc_id + '_list&an_id=' + an_id + '&no_cache=' + no_cache;
        $(tbl_elm).dataTable().fnDraw();
    } else {//Init anomaly link tables
        var btns;
        if (window['u_id'] == -1) {
            btns = [TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF];
        } else {
            btns = ['add_an_' + proc_id, 'del_an_' + proc_id, TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF];
            if (proc_id == 'act') btns = ['add_an_' + proc_id, 'edit_an_act', 'del_an_' + proc_id, TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF];
            else btns = ['add_an_' + proc_id, 'del_an_' + proc_id, TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF];
        }

        var hide_cols;
        if (proc_id == 'ref') hide_cols = [0, 4];
        else hide_cols = [0];

        InitDTVars('an_' + proc_id + '_dt');

        $(tbl_elm).dataTable({
            'sDom': '<"H"TClr>t<"F"ip>',
            "bStateSave": true,
            'bServerSide': true,
            'bJQueryUI': true,
            'bProcessing': true,
            'oLanguage': { 'sProcessing': '<img src="images/busy.gif" />' },
            'sScrollX': '100%',
            'bScrollCollapse': false,
            'iDisplayLength': 100,
            'bAutoWidth': false,
            'oColVis': {
                'buttonText': 'Columns',
                'bRestore': true,
                'sAlign': 'left',
                'aiExclude': [0],
                'fnStateChange': function (iColumn, bVisible) { ResizeDtlDataTables(); }
            },
            'aaSorting': [[0, 'desc']],
            'sAjaxSource': 'requesthandler.ashx?id=an_' + proc_id + '_list&an_id=' + an_id + '&no_cache=' + no_cache,
            'oTableTools': { 'aButtons': btns, 'sSwfPath': 'scripts/copy_csv_xls_pdf.swf' },
            'aoColumnDefs': [{ 'bVisible': false, 'aTargets': hide_cols }],
            'fnServerData': function (sSource, aoData, fnCallback) {
                $.getJSON(sSource, aoData, function (json) {
                    fnCallback(json);
                    ResizeDtlDataTables();
                    SetDTVarsSvrData('an_' + proc_id + '_dt', json);
                    SelectDTFirstRow('an_' + proc_id + '_dt', json, true);
                });
            },
            'fnServerParams': function (aoData) { SetDTVarsSvrParams('an_' + proc_id + '_dt', aoData); },
            'fnInitComplete': function () { InitDTClickCallBacks('an_' + proc_id + '_dt'); },
            'fnFooterCallback': function (nFoot, aData, iStart, iEnd, aiDisplay) {
                if (aData.length > 0) {
                    SetDTVarsFootCallback('an_' + proc_id + '_dt', aData);
                } else {
                    InitDTVars('an_' + proc_id + '_dt');
                }
            }
        });
    }
}

function SelectRef(ref_id, no_cache) {
    window['curr_ref_dt_key_id'] = ref_id;
    if ($('#an_info').is(':visible')) $('#an_info').hide();

    InitRefHdr(false, no_cache);
}
function InitRefHdr(edit_mode, no_cache) {
    if (window['curr_ref_dt_key_id'] != -1) {
        $('#ref_dtl_tab').block();
        $.ajax({
            dataType: 'json',
            url: 'requesthandler.ashx', data: { id: 'ref_hdr', ref_id: window['curr_ref_dt_key_id'], no_cache: no_cache },
            success: function (r) { AuthenticateSingleLogin(r); DispRefDtl(r, edit_mode); }
        });
    } else {
        FileImgSrc('ref_file', 'ref_file_big', null, true);
    }
}
function DispRefDtl(r, edit_mode) {
    if (edit_mode) $('#e_ref_desc').val(r[0][0]);
    else $('#ref_desc').html(r[0][0]);
    if (edit_mode) $('#e_ref_type').val(r[0][1]);
    else $('#ref_type').html(r[0][2]);
    if (edit_mode) $('#e_ref_upload_date').html(r[0][3] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][3])));
    else $('#ref_upload_date').html(r[0][3] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][3])));
    if (edit_mode) { $('#e_ref_upload_by').val(r[0][4]); $('#e_ref_upload_by_name').html(r[0][5]); }
    else $('#ref_upload_by').html(r[0][5]);
    if (edit_mode) $('#e_ref_ref_no').val(r[0][6]);
    else $('#ref_ref_no').html(r[0][6]);
    if (edit_mode) $('#e_ref_filename_container').html(r[0][7]);
    else $('#ref_filename').html(r[0][7]);
    if (edit_mode) $('#e_ref_path').val(r[0][8]);
    else $('#ref_path').html(r[0][9]);
    if (edit_mode) $('#e_ref_upd_date').html(r[0][10] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][10])));
    else $('#ref_upd_date').html(r[0][10] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][10])));
    if (edit_mode) { $('#e_ref_upd_by').val(r[0][11]); $('#e_ref_upd_by_name').html(r[0][12]); }
    else $('#ref_upd_by').html(r[0][12]);
    if (edit_mode) $('#e_ref_notes').val(r[0][13]);
    else $('#ref_notes').html(r[0][13]);
    if (edit_mode) { $('#e_ref_asset_id').val(r[0][14]); $('#e_ref_asset_id_desc').html(r[0][15]); }
    if (edit_mode) $('#e_ref_group').val(r[0][16]);
    else $('#ref_group').html(r[0][17]);

    if (!edit_mode) {
        var img_url = r[0][18] + r[0][7];
        FileImgSrc('ref_file', 'ref_file_big', img_url);
    } else {
        $('textarea .hasMaxLength').keyup();
    }

    $('#ref_dtl_tab').unblock();
}
function AddRef() {
    LoadRefDlg(true);
}
function EditRef() {
    if (window['curr_ref_dt_key_id'] == -1)
        $.msgBox({ title: "Record Delete", content: "There are no record to delete." });
    else
        LoadRefDlg();
}
function DelRef() {
    if (window['curr_ref_dt_key_id'] == -1)
        $.msgBox({ title: "Record Delete", content: "There are no record to delete." });
    else
        $.msgBox({
            title: "Record Delete",
            content: "Are you sure you want to delete the selected record?",
            type: "confirm",
            buttons: [{ value: "Yes" }, { value: "No" }, { value: "Cancel" }],
            success: function (result) {
                if (result == "Yes") {
                    $.ajax({
                        type: 'POST',
                        url: 'requesthandler.ashx?id=del_ref&ref_id=' + window['curr_ref_dt_key_id']
                    }).done(function (r) {
                        ShowNoty('Record has been successfully updated.', 'info');
                        SelectNode(window['sel_node_id'], true);
                    });
                }
            }
        });
}
function SelectAn(an_id, no_cache) {
    window['curr_an_dt_key_id'] = an_id;

    $('#an_dtl_container .tab-page').each(function () { $(this).attr('loaded', 'false'); });
    if (!$('#an_info').is(':visible')) $('#an_info').show();

    InitAnInfoCounts();
    InitAnDtls(MainTabSelected(false), false, no_cache);
}
function InitAnDtls(proc_id, edit_mode, no_cache) {
    if (proc_id == 'ref' || proc_id == 'ft' || proc_id == 'act') { //Allow datatable to process retrieval of data for reference list..
        DispAnLnkTable(window['curr_an_dt_key_id'], proc_id, edit_mode, no_cache);
    } else {
        if (window['curr_an_dt_key_id'] != -1) {
            $('#an_' + proc_id + '_tab').block();
            if (proc_id == 'rsk') $('#tabs_rsk').tabs({ activate: function (event, ui) { ResizeDtlTabs(); } });
            $.ajax({
                dataType: 'json',
                url: 'requesthandler.ashx', data: { id: 'an_' + proc_id, an_id: window['curr_an_dt_key_id'], no_cache: no_cache },
                success: function (r) { AuthenticateSingleLogin(r); DispAnDtls(r, proc_id, edit_mode); }
            });
        }
    }
}
function SelectRsk(elm) {
    var un_select = false;
    if (elm.html() != '') un_select = true;
    $('#' + elm.closest('div').attr('id') + ' .rsk-val').html('');

    var x = elm.attr('id').substring(2, 3).toLowerCase();

    if (!un_select) {
        elm.html('<div class="selected"></div>');
        $('#e_' + x + '_severity').val(elm.attr('id').substring(4));
        $('#e_' + x + '_likelihood').val(elm.attr('id').substring(4, 3));
    } else {
        $('#e_' + x + '_severity').val('');
        $('#e_' + x + '_likelihood').val('');

    }
    //var un_select = false;
    //if (elm.css('background-image') != 'none') un_select = true;
    //$('#' + elm.closest('div').attr('id') + ' .rsk-val').css('background-image', 'none');

    //var x = elm.attr('id').substring(2, 3).toLowerCase();

    //if (!un_select) {
    //    elm.css('background-image', 'url(images/selected.png)');
    //    $('#e_' + x + '_severity').val(elm.attr('id').substring(4));
    //    $('#e_' + x + '_likelihood').val(elm.attr('id').substring(4, 3));
    //} else {
    //    $('#e_' + x + '_severity').val('');
    //    $('#e_' + x + '_likelihood').val('');

    //}


}

//Neo 20190624 Replace Action By date with Immediate Action
function repActionWithImmediateAct(status, currActionColor, fldname,nEdit) {
    var nAttrib = 0;
    var nAttribGreen = 0;
    if (currActionColor == '10651') {
        if (status == '9100') {
            nAttrib = 1;
        }
        else {
            nAttrib = 0;
        }
    }
    if (currActionColor == '10653') {
        if (status == '9100') {
            nAttribGreen = 1;
        }
        else {
            nAttribGreen = 0;
        }
    }

    if (nAttrib == 1) {
        if (nEdit == true) {
            $('#' + fldname).val('Immediate Action');
        }
        else {
            $('#' + fldname).text('Immediate Action');
        }
        $('#' + fldname).css("background-color", "red");
        $('#e_deviation').removeAttr('disabled', 'disabled');//20190725
    }
    else if (nAttribGreen == 1) {
        if (nEdit == true) {
            $('#' + fldname).val('');
        }
        else {
            $('#' + fldname).text('');
        }
        $('#e_deviation').attr('disabled', 'disabled');//20190725
        $('#' + fldname).css('background-color', '#eeeff4');
    }
    else {
        $('#e_deviation').attr('disabled', 'disabled');//20190725
        $('#' + fldname).css('background-color', '#eeeff4');
    }
}


function DispAnDtls(r, proc_id, edit_mode) {
    if (!edit_mode) {
        switch (proc_id) {
            case 'dtl': //Details tab.
                $('#title').html(r[0][0]);
                $('#maint_reqd').html((r[0][1] == 'False' ? '' : '✔'));
                $('#an_desc').html(r[0][2]);
                $('#wo_ref').html(r[0][3]);
                $('#wo_status').html(r[0][4]);
                $('#equip_failure').html((r[0][5] == 'False' ? '' : '✔'));
                $('#action_date').html(r[0][6] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][6])));
                $('#action_party_name').html(r[0][7]);
                $('#equip_no').html(r[0][8]);
                $('#ident_date').html(r[0][9] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][9])));
                $('#an_asset_id').val(r[0][10]);
                repActionWithImmediateAct(r[0][11], r[0][12], 'action_date',false);
                break;
            case 'ass':
                $('#ass').html(r[0][0]);
                $('#raised_by_name').html(r[0][1]);
                $('#raised_date').html(r[0][2] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][2])));
                $('#ass_by_name').html(r[0][3]);
                $('#ass_date').html(r[0][4] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][4])));
                $('#an_asset_id').val(r[0][5]);

                break;
            case 'avail':
                $('#avail_comment').html(r[0][0]);
                $('#upd_by_name').html(r[0][1]);
                $('#upd_date').html(r[0][2] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][2])));
                $('#an_asset_id').val(r[0][3]);

                break;
            case 'rsk':
                $('#an_rsk_tab .rsk-val').html('');
                $('#ram_comment').html(r[0][0]);
                //Asset
                var a_sev = r[0][1];
                var a_like = r[0][2];
                var a_elm_id = a_like + a_sev;
                $('#A' + a_elm_id).html('<div class="selected"></div>');
                //Environment
                var e_sev = r[0][3];
                var e_like = r[0][4];
                var e_elm_id = e_like + e_sev;
                $('#E' + e_elm_id).html('<div class="selected"></div>');
                //Public Effect
                var p_sev = r[0][5];
                var p_like = r[0][6];
                var p_elm_id = p_like + p_sev;
                $('#P' + p_elm_id).html('<div class="selected"></div>');
                //Health
                var h_sev = r[0][7];
                var h_like = r[0][8];
                var h_elm_id = h_like + h_sev;
                $('#H' + h_elm_id).html('<div class="selected"></div>');
                $('#an_asset_id').val(r[0][9]);

                break;
            case 'rec':
                $('#rcmd').html(r[0][0]);
                $('#ta_approved').html((r[0][1] == 'False' ? '' : '✔'));
                $('#ta_name').html(r[0][2]);
                $('#ta_approved_date').html(r[0][3] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][3])));
                $('#TAComments').html(r[0][4]);
                $('#an_asset_id').val(r[0][5]);


                break;
            case 'ref': break; // Do nothing
            case 'ft': break;
            case 'act': break;
        }
        ResizeDtlTabs();
        $('#an_' + proc_id + '_tab').attr('loaded', 'true');
        $('#an_' + proc_id + '_tab').unblock();
    }
    else {
        $('#e_asset_id').val(r[0][0]);
        $('#e_asset_id_desc').html(r[0][1]);
        $('#e_rev_no').html(r[0][2]);
        $('#e_orig_act').val(r[0][3]);
        $('#e_curr_act').val(r[0][4]);
        $('#e_type').val(r[0][5]);
        $('#e_status').val(r[0][6]);
        $('#e_ref_no').html(r[0][7]);

        $('#e_title').val(r[0][8]);
        $('#e_maint_reqd').prop('checked', ToBoolean(r[0][9]));
        $('#e_desc').val(r[0][10]);
        $('#e_wo_ref').val(r[0][11]);
        $('#e_wo_status').val(r[0][12]);
        $('#e_equip_failure').prop('checked', ToBoolean(r[0][13]));
        $('#e_action_date').val(r[0][14] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][14])));
        $('#e_action_party').val(r[0][15]);
        $('#e_equip_no').val(r[0][16]);
        $('#e_ident_date').val(r[0][17] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][17])));

        $('#e_ass').val(r[0][18]);
        $('#e_raised_by').val(r[0][19]);
        $('#e_raised_by_name').html(r[0][20]);
        $('#e_raised_by_name_hdr').html(r[0][20])
        $('#e_raised_date').html(r[0][21] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][21])));
        $('#e_raised_date_hdr').html($('#e_raised_date').html());
        $('#e_ass_by').val(r[0][22]); $('#e_assessed').val(-1);
        $('#e_ass_by_name').html(r[0][23]);
        $('#e_ass_date').html(r[0][24] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][24])));

        $('#e_avail_comment').html(r[0][25]);
        $('#e_upd_by').val(r[0][26]);
        $('#e_upd_by_name').html(r[0][27]);
        $('#e_upd_date').html(r[0][28] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][28])));

        $('#e_rsk_tab .rsk-val').html('');
        $('#e_ram_comment').html(r[0][29]);
        var a_sev = r[0][30];
        var a_like = r[0][31];
        var e_sev = r[0][32];
        var e_like = r[0][33];
        var p_sev = r[0][34];
        var p_like = r[0][35];
        var h_sev = r[0][36];
        var h_like = r[0][37];
        //Asset
        var a_elm_id = a_like + a_sev;
        $('#e_A' + a_elm_id).html('<div class="selected"></div>');
        $('#e_a_severity').val(a_sev);
        $('#e_a_likelihood').val(a_like);
        //Environment
        var e_elm_id = e_like + e_sev;
        $('#e_E' + e_elm_id).html('<div class="selected"></div>');
        $('#e_e_severity').val(e_sev);
        $('#e_e_likelihood').val(e_like);
        //Public Effect
        var p_elm_id = p_like + p_sev;
        $('#e_P' + p_elm_id).html('<div class="selected"></div>');
        $('#e_p_severity').val(p_sev);
        $('#e_p_likelihood').val(p_like);
        //Health
        var h_elm_id = h_like + h_sev;
        $('#e_H' + h_elm_id).html('<div class="selected"></div>');
        $('#e_h_severity').val(h_sev);
        $('#e_h_likelihood').val(h_like);

        $('#e_rcmd').val(r[0][38]);
        $('#e_ta_approved').prop('checked', ToBoolean(r[0][39]));
        $('#e_ta_name').val(r[0][40]);
        $('#e_ta_approved_date').val(r[0][41] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][41])));
        $('#e_TAComments').val(r[0][42]);

        $('#e_deviation').val(r[0][43]);


        $('#an textarea.hasMaxLength').keyup();

        // Neo 20180402 disable TA approve if TA not the current user
        //('#u_name').html() get the name
        if (r[0][40] != window['u_id']) {
            $('#e_ta_approved').attr('disabled', 'disabled');
        }
        else {
            $('#e_ta_approved').removeAttr('disabled', 'disabled');
        }
        // Neo 20180402 disable TA approve if TA not the user end here

        repActionWithImmediateAct(r[0][6], r[0][4], 'e_action_date',true);

        $('#an').unblock();
    }
}
function LogoutUser(logout_status) {
    $.ajax({
        async: false,
        dataType: 'json',
        url: 'requesthandler.ashx', data: { id: 'logout_user', pass: true, no_cache: true },
        success: function (r) {
            if (logout_status == 'relogin') {
                window.location.reload();
            }
            else if (logout_status == 'session_expired') {
                ShowLogoutPage();
                $.msgBox({ title: "Session Expired", content: "Click OK if you want to relogin." });
            }
            else if (logout_status == 'logout') {
                ShowLogoutPage();
                $.msgBox({ title: "User Logout", content: "User has been logout." });
            }
            else if (logout_status == 'close') {
                Abort();
                ShowLogoutPage();
            }
        }
    });
}
function AuthenticateSingleLogin(r, onload) {
    if (r['single_login'] == 'False') {
        //Abort();
        $.msgBox({
            title: 'Multiple Login',
            content: 'Your account is currently logged in on another computer. Do you want to force login?',
            type: 'alert',
            buttons: [{ value: 'Yes' }, { value: 'No' }],
            success: function (result) {
                if (result == 'Yes') { LogoutUser('relogin'); }
                else { ShowLogoutPage(); }
            }
        });
    } else {
        if (onload) {
            window['u_id'] = r['u_id'];
            window['u_rights'] = r['u_rights'];
            //window['u_rights'] = 'admin';
            $('#u_name').html(r['u_name'].toUpperCase());
            LogUser();
        }
    }
}
function DispCurrUser(onload) {
    $.ajax({
        dataType: 'json',
        async: false,
        url: 'requesthandler.ashx?id=curr_user&no_cache=true',
        success: function (r) {
            AuthenticateSingleLogin(r, onload);
        }
    });
}

function LogUser() {
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'requesthandler.ashx?id=log_user&pass=true',
        success: function (r) {
            if (r['success']) {
                InitControls();
                LoadTree();
            }
        }
    });
}
function LoadAnDlgNew() {
    $('#e_asset_id').val(window['sel_node_id']);
    //$('#e_asset_id_desc').html($('#tree_' + window['sel_node_id']).html());
    $('#e_asset_id_desc').html($('.tree_' + window['sel_node_id']).html());
    $('#e_raised_by').val(window['u_id']);
    $('#e_raised_by_name').html($('#u_name').html());
    $('#e_raised_by_name_hdr').html($('#u_name').html());
    $('#e_rev_no').html('0');
    $('#e_ref_no').html('...');

    $('#e_orig_act')[0].selectedIndex = 1;
    $('#e_curr_act')[0].selectedIndex = 1;
    $('#e_status')[0].selectedIndex = 4;

    InitSvrDate('e_raised_date', 'e_raised_date_hdr');
}
function LoadAnDlgEdit() {
    InitAnAll();
}

function LockRow(tbl, row_id) {
    $.ajax({ // Delete an to act lnks.
        type: 'POST',
        url: 'requesthandler.ashx?id=lock_row&tbl=' + tbl + '&row_id=' + row_id
    }).done(function (r) {
        ShowNoty('The selected record is now locked.', 'info');
    });
}
function UnLockRow(tbl, row_id) {
    $.ajax({ // Delete an to act lnks.
        type: 'POST',
        url: 'requesthandler.ashx?id=unlock_row'
    }).done(function (r) {
        ShowNoty('The selected record is now unlocked.', 'info');
    });
}

function nEmailTA() {

    $.ajax({
        type: "POST",
        url: "/echo/json/",
        cache: false,
        contentType: "application/json; charset=utf-8",
        data: "{ 'body': 'Hi Neo'," + "'from': 'neopuavin@sogatech.net'," + "'subject: 'email from Me'" + "}",
        dataType: "json",
        complete: function (transport) {
            alert(transport.status);
            if (transport.status == 200) {
                alert("Success");
            }
            else {
                alert("Please try again later");
            }
        }
    });

}
function LoadAnDlg(new_rec) {
    if (!new_rec) LockRow('anomalies', window['curr_an_dt_key_id']);

    $('#an').dialog({
        modal: true,
        resizable: false,
        height: 450,
        width: 950,
        buttons: {
            'Undo': {
                title: 'Click to undo changes.', text: 'Undo', icons: { primary: 'ui-icon-arrowreturnthick-1-e' },
                click: function () {
                    ClearAnDlg(); //Clear controls. 
                    if (new_rec) LoadAnDlgNew();
                    else LoadAnDlgEdit();
                }
            },
            'Save': {
                title: 'Click to update record.', text: 'Save', icons: { primary: 'ui-icon-disk' },
                click: function () {
                    if (ProceedUpd('an')) {
                        UpdAn(new_rec);
                    }
                }
            },
            'Back': {
                title: 'Click to cancel update.', text: 'Back', icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
                click: function () { $(this).dialog('close'); }
            }
        },
        close: function (event, ui) {
            an_dlg_open = false;
            if (!new_rec) UnLockRow();
            $(this).unblock();
        },
        create: function () { InitAnDlg(); }, //Put focus, blur, hover effects..
        open: function () {
            ClearAnDlg(); //Clear controls. 
            if (new_rec) LoadAnDlgNew();
            else LoadAnDlgEdit();
            an_dlg_open = true;
        }
    });
}
function DTGetColumnNumber(dt_elm, col_name, visible) {
    var aoColumns = dt_elm.fnSettings().aoColumns;
    var numcols = aoColumns.length;
    var visible_idx = -1;
    for (var i = 0; i < numcols; i++) {
        if (visible && aoColumns[i].bVisible) {
            visible_idx++;
            // check for sname, else use text with th
            if (aoColumns[i].sName == col_name || jQuery.trim(aoColumns[i].nTh.innerText).toLowerCase() == col_name)
                return visible_idx;
        } else {
            if (aoColumns[i].sName == col_name || jQuery.trim(aoColumns[i].nTh.innerText).toLowerCase() == col_name)
                return i;
        }
    }
    return -1;
}
function ToggleFilter(dt_name, force_show, force_hide) {
    if (($('#' + dt_name + '_elm_container tfoot:last td:last').html() != '' && !force_show) || force_hide) {
        $('#' + dt_name + '_elm_container tfoot:last tr:last td').each(function () {
            $(this).html('');
        });

        if (dt_name == 'an_dt') // Toggle default anomaly filter (open anomaly) if table filter has been removed.
            $('#an_dt_elm').dataTable().fnSettings().sAjaxSource = 'requesthandler.ashx?id=an_list&asset_loc=' + window['curr_asset_loc'] +
                '&open_anom=0';

        $('#' + dt_name + '_elm').dataTable().fnFilterClear();
    } else {
        var idx = 0;
        $('#' + dt_name + '_elm_container tfoot:last tr:last td').each(function () {
            var str;

            var col_idx = DTGetColumnNumber($('#' + dt_name + '_elm').dataTable(), $(this).attr('id').replace(dt_name + '_', ''));
            col_idx--; //remove pk from columns.
            var show_text = $(this).hasClass('text');
            var input_width = $(this).width() - 20;
            var elm_id = dt_name + '_filter_' + idx;
            if (show_text) { //Display input
                str = '<input type="text" id="' + elm_id + '" class="datatable-filter" style="float: left; width:' + input_width + 'px;" />';
                str += '<span class="icon ui-icon ui-icon-search" style="float: right;" onclick="FilterDT(\'' + dt_name + '\', \'' + elm_id + '\',' + col_idx + ')"></span>';
                $(this).html(str);

                var cells = [];
                var rows = $('#' + dt_name + '_elm').dataTable().fnGetNodes();
                for (var i = 0; i < rows.length; i++) {
                    var cell_val = $(rows[i]).find("td:eq(" + idx + ")").html();
                    if ($.inArray(cell_val, cells) == -1) cells.push(cell_val);
                }

                $('#' + elm_id).autocomplete({ source: cells });
            } else {
                str = '<select id="' + elm_id + '" class="datatable-filter" style="width:' + input_width + 'px; float: left;" /></select>';
                str += '<span class="icon ui-icon ui-icon-search" style="float: right;" onclick="FilterDT(\'' + dt_name + '\',\'' + elm_id + '\',' + col_idx + ')"></span>';
                $(this).html(str);

                var grp_id = $(this).attr('lkp_id');
                InitSysLookups(elm_id, grp_id, null, -1, true, true);
            }
            idx++;
        });
    }
    ResizeDataTable();
}
function DtFiltered(dt_name, oSettings) {
    for (i = 0; i < oSettings.aoPreSearchCols.length; i++) {
        if (oSettings.aoPreSearchCols[i].sSearch.length > 0) {
            var elm = $('#' + dt_name + '_elm_container .datatable-filter')[i + 1];

            if ($(elm).is("input")) elm.value = oSettings.aoPreSearchCols[i].sSearch;
            else $(elm).selected = oSettings.aoPreSearchCols[i].sSearch;
            //$('#an_dt_elm_foot input')[i - 1].value = ""; // oSettings.aoPreSearchCols[i].sSearch;
        }
    }

    //Resize input filter
    $('#' + dt_name + '_elm_container .datatable-filter').each(function () {
        var input_width = $(this).parent().width() - 18;
        $(this).width(input_width + 'px');
    });

}
function FilterDT(dt_name, elm_id, col_idx, elm_val) {
    var elm = $('#' + elm_id);
    var input_elm = elm.is('input');

    if (dt_name == 'an_dt') //Toggle default filter for anomaly
        $('#' + dt_name + '_elm').dataTable().fnSettings().sAjaxSource = 'requesthandler.ashx?id=an_list&asset_loc=' + window['curr_asset_loc'] +
            '&open_anom=1&no_cache=true';

    if (elm_val == null) {
        if (input_elm) $('#' + dt_name + '_elm').dataTable().fnFilter(elm.val(), col_idx + 1);
        else {
            if ($('#' + elm.attr('id') + ' :selected').text() == 'ALL')
                $('#' + dt_name + '_elm').dataTable().fnFilter('True', col_idx + 1);
            else
                $('#' + dt_name + '_elm').dataTable().fnFilter($('#' + elm.attr('id') + ' :selected').text(), col_idx + 1);
        }
    } else {
        $('#' + dt_name + '_elm').dataTable().fnFilter(elm_val, col_idx + 1);
        elm.val(elm_val);
    }

    if ($.trim(elm.val()) != '') elm.css('color', 'gray');
    else elm.css('color', 'black');
}
function FilterAn() {
    ToggleFilter('an_dt');
}
function FilterRef() {
    ToggleFilter('ref_dt');
}

function AddAn() {
    LoadAnDlg(true);
}
function DelAn() {
    if (window['curr_an_dt_key_id'] == -1)
        $.msgBox({ title: "Record Delete", content: "There are no record to delete." });
    else {
        $.msgBox({
            title: "Record Delete",
            content: "Are you sure you want to delete the selected record?",
            type: "confirm",
            buttons: [{ value: "Yes" }, { value: "No" }, { value: "Cancel" }],
            success: function (result) {
                if (result == "Yes") {
                    $.ajax({ // Delete an to act lnks.
                        type: 'POST',
                        url: 'requesthandler.ashx?id=del_rec&key=an_id&val=' + window['curr_an_dt_key_id'] +
                        '&tbl=anomaly_action_items&view=anomaly_action_items_view'
                    }).done(function (r) {
                        DispAnLnkTable(window['curr_an_dt_key_id'], 'ref', true);
                    });
                    $.ajax({ // Delete an to ft lnks.
                        type: 'POST',
                        url: 'requesthandler.ashx?id=del_rec&key=an_id&val=' + window['curr_an_dt_key_id'] +
                        '&tbl=lnk_anomaly_failure_threats&view=anomaly_failure_threats_view'
                    }).done(function (r) {
                        DispAnLnkTable(window['curr_an_dt_key_id'], 'ft', true);
                    });
                    $.ajax({ // Delete an to ref lnks.
                        type: 'POST',
                        url: 'requesthandler.ashx?id=del_rec&key=an_id&val=' + window['curr_an_dt_key_id'] +
                        '&tbl=lnk_anomaly_reference&view=anomaly_reference_view'
                    }).done(function (r) {
                        DispAnLnkTable(window['curr_an_dt_key_id'], 'ft', true);
                    });
                    $.ajax({
                        type: 'POST',
                        url: 'requesthandler.ashx?id=del_an&an_id=' + window['curr_an_dt_key_id']
                    }).done(function (r) {
                        RefreshTree($('#an_asset_id').val(), -1);
                        ShowNoty('Record has been successfully updated.', 'info');
                        SelectNode(window['sel_node_id'], true);
                    });
                }
            }
        });
    }
}
function EditAn() {
    if (window['curr_an_dt_key_id'] == -1) {
        $.msgBox({ title: "Record Update", content: "There are no record to update." });
    } else {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'requesthandler.ashx?id=row_locked&tbl=anomalies&row_id=' + window['curr_an_dt_key_id']
        }).done(function (r) {
            if (r['r'] == '-1') LoadAnDlg();
            else $.msgBox({ title: "Record Locked", content: "The selected record is currently locked by other users.", type: 'error' });

        });
    }
}
function InitAnAll() {
    $('#an').block();
    $.ajax({
        dataType: 'json',
        url: 'requesthandler.ashx',
        data: { id: 'an_edit', an_id: window['curr_an_dt_key_id'] },
        success: function (r) {
            AuthenticateSingleLogin(r); DispAnDtls(r, null, true);
        }
    });
}
function InitHiglightField(par_elm, child_elm) {
    $('#' + par_elm + ' ' + child_elm).each(function () {
        $(this).focus(function () { $(this).addClass('ui-state-highlight'); });
        $(this).blur(function () { $(this).removeClass('ui-state-highlight'); });
    });
}


function DispDeviationDtls(id) {
    $('#e_curr_act').val('10652');

    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'requesthandler.ashx?id=deviation_ValDate&dev_id=' + id
    }).done(function (r) {
        var f = new Date(r['r']);  
        $('#e_action_date').val(formatnDate(f));
        $('#e_action_date').css('background-color', '#eeeff4');
    });
    
}

function formatnDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    //return [year, month, day].join('-');
    return [day, month, year].join('-');
}

function InitAnDlg() {
    InitHiglightField('hdr tr td', ':input');
    InitHiglightField('e_tabs div table.edit tr td', ':input');

    //$('#e_ident_date').datetimepicker({ dateFormat: 'dd-M-yy', timeFormat: "hh:mm:ss" });
    $('#e_ident_date').datepicker({ dateFormat: 'dd-M-yy' });
    $('#e_action_date').datepicker({ dateFormat: 'dd-M-yy' });
    $('#e_ta_approved_date').datepicker({ dateFormat: 'dd-M-yy' });

    var p = '&tbl=active_users&ret_1=user_id&ret_2=user_name';
    InitLookups(p, 'e_action_party', true);

    InitLookupsDeviation('e_deviation');//20190712 Neo Deviation Drop Down
    //Enable, disable control if deviation not needed.
    
    ////
    InitLookupsTA('e_ta_name');
    /////
    InitSysLookups('e_type', 8, null, -1, true);
    InitSysLookups('e_status', 3, null, 3, true);
    InitSysLookups('e_orig_act', 2, 'e_curr_act', 1, true);

    $('#e_status').change(function () {
        if ($(this).val() == '9104') { $('#e_curr_act').val('10653'); }
        $("#e_curr_act").prop('disabled', ($(this).val() == '9104'));
    });

    //Neo 20190726
    $('#e_deviation').change(function () {
        if ($(this).val() != null || $(this).val() != '') {
            DispDeviationDtls($(this).val());
        }      
        
    });

    //20190624 Neo Added//e_curr_act//e_action_date', 'e_action_dateHeader
    $('#e_status').change(function () {
        
        if ($('#e_curr_act').val() == '10651' && $(this).val() == '9100') {
            $('#e_action_date').val('Immediate Action');
            $('#e_action_date').css("background-color", "red");
            $('#e_deviation').removeAttr('disabled', 'disabled');
        }
        //else if ($('#e_curr_act').val() == '10653' && $(this).val() == '9100') {

        //}
        else {
            $('#e_action_date').val('');
            $('#e_action_date').css('background-color', '#eeeff4');
            $('#e_deviation').attr('disabled', 'disabled');//20190725
        }
        
    });
    //
    $('#e_curr_act').change(function () {

        if ($(this).val() == '10651' || $(this).val() == '10653' && $('#e_status').val() == '9100') {
            $('#e_action_date').val('Immediate Action');
            $('#e_action_date').css("background-color", "red");
            $('#e_deviation').removeAttr('disabled', 'disabled');
        }
        else {
            $('#e_action_date').val('');
            $('#e_action_date').css('background-color', '#eeeff4');
            $('#e_deviation').attr('disabled', 'disabled');//20190725
        }
    });
    //20190624 Neo Added Ends HEre

    $('#e_tabs').tabs();

    //$('#e_tabs').tabs({
    //    activate: function (event, ui) {
    //        var tab = $('#' + ui.newPanel[0].id);
    //        if (tab.attr('loaded') == 'false' || tab.attr('loaded') == undefined)
    //            InitAnDtls(MainTabSelected(true), true);
    //    }
    //});

    $('#e_tabs_rsk').tabs();

    $('#e_title').maxlength({ max: 200 });
    $('#e_desc').maxlength({ max: 4000 });
    $('#e_ass').maxlength({ max: 4000 });
    $('#e_avail_comment').maxlength({ max: 4000 });
    $('#e_rcmd').maxlength({ max: 4000 });
    $('#e_ram_comment').maxlength({ max: 4000 });
}
function ChangeItem(elm_id, elm_id_1, elm_id_2) {
    if ($('#' + elm_id).val() == '9104') {
        $('#' + elm_id_1).val('10653');
        $('#' + elm_id_2).val('10653');
    }
}
function ClearAnDlg() {
    $('#e_a_severity').val('');
    $('#e_a_likelihood').val('');
    $('#e_e_severity').val('');
    $('#e_e_likelihood').val('');
    $('#e_p_severity').val('');
    $('#e_p_likelihood').val('');
    $('#e_h_severity').val('');
    $('#e_h_likelihood').val('');

    $('#an .rsk-val').css('background-image', 'none');
    $('#an .value').html('');
    $('#an tr td :input').val('');
    $('#an textarea').val('');
    $('#an').find(':checked').each(function () {
        $(this).removeAttr('checked');
    });
    $('#e_tabs .tab-page').each(function () { $(this).attr('loaded', 'false'); });
    $('#an select').prop('selectedIndex', -1);
    $("#e_curr_act").prop('disabled', false);
    $('#e_type').focus();
    $('#e_rsk_tab .rsk-val').html('');
    $('#e_tabs').tabs('option', 'active', 0);
    $('#e_tabs_rsk').tabs('option', 'active', 0);
}
function ClearElem(elm) {
    var type = elm[0].nodeName.toLowerCase();
    if (type == 'select') {
        elm.val('');
        elm[0].selectedIndex = -1;
    } else if (type == 'textarea') {
        elm.val('');
    } else if (type == 'input') {
        if (elm.is('input:checkbox') || elm.is('input:radio'))
            elm.prop('checked', false);
        else
            elm.val('');
    } else {
        alert('uknown type');
    }
}
function ToBoolean(val) {
    if (val.toLowerCase() == 'true') {
        return true;
    }

    return false;
}
function ProceedUpd(elm_id) {
    var valid = true;
    $('#' + elm_id + ' .reqd').each(function () {
        if ($('#' + $(this).attr('id')).val() == '' || $('#' + $(this).attr('id')).val() == null) {
            valid = false;
            //$.msgBox({ title: 'Invalid Record', content: 'Please make sure all required fields are complete before proceeding.' });// 20180402 Neo Replace code below need to Assign TA or else let the user know
            if ($('#' + $(this).attr('id')).selector == '#e_ta_name') {
                $.msgBox({ title: 'Mandatory Field', content: 'You need to assign and select a TA Name from "Recommendations" tab "TA Name" dropdown list.' });
            }
            else {
                $.msgBox({ title: 'Invalid Record', content: 'Please make sure all required fields are complete before proceeding.' });
            }
            //Neo Codes Ends here

            $(this).focus();
            return valid;
        }
    });

    //Neo 20190621 for Action by Date and Action Party // e_curr_act(10651-Red, 10652-Orange, 10653-Green, 10654-Gray)
    if ($('#e_curr_act').val() == '10652' && $('#e_status').val() == '9100') {
        if ($('#e_action_date').val() == '' || $('#e_action_date').val() == null || $('#e_action_party').val() == '' || $('#e_action_party').val() == null) {
            valid = false;
            $.msgBox({ title: 'Mandatory Field', content: 'Action by Date and Action Party is mandatory if the Anomaly Status is Open and Current class is Orange.' });
            $(this).focus();
            return valid;
        }
    }
    //Neo Code Ends Here

    return valid;
}
function UpdAn(new_rec) {
    $('#an').block();
    $.ajax({
        type: 'POST',
        url: 'requesthandler.ashx?id=upd_an',
        data: {
            an_id: (new_rec ? -1 : window['curr_an_dt_key_id']),
            asset_id: $('#e_asset_id').val(),
            type: $('#e_type').val(),
            orig_act: $('#e_orig_act').val(),
            curr_act: $('#e_curr_act').val(),
            status: $('#e_status').val(),
            rev_no: $('#e_rev_no').html(),
            title: $('#e_title').val(),
            ident_date: $('#e_ident_date').val(),
            desc: $('#e_desc').val(),
            equip_failure: $('#e_equip_failure').is(':checked'),
            action_date: $('#e_action_date').val(),
            action_party: $('#e_action_party').val(),
            equip_no: $('#e_equip_no').val(),
            maint_reqd: $('#e_maint_reqd').is(':checked'),
            wo_ref: $('#e_wo_ref').val(),
            wo_status: $('#e_wo_status').val(),
            ass: $('#e_ass').val(),
            raised_by: $('#e_raised_by').val(),
            raised_date: $('#e_raised_date').html(),
            assessed: $('#e_assessed').val(),
            ass_by: $('#e_ass_by').val(),
            ass_date: $('#e_ass_date').html(),
            upd_by: $('#e_upd_by').val(),
            upd_date: $('#e_upd_date').html(),
            rcmd: $('#e_rcmd').val(),
            ta_approved: $('#e_ta_approved').is(':checked'),
            ta_name: $('#e_ta_name').val(),
            ta_approved_date: $('#e_ta_approved_date').val(),
            ta_comments: $('#e_TAComments').val(),
            a_severity: $('#e_a_severity').val(),
            a_likelihood: $('#e_a_likelihood').val(),
            e_severity: $('#e_e_severity').val(),
            e_likelihood: $('#e_e_likelihood').val(),
            p_severity: $('#e_p_severity').val(),
            p_likelihood: $('#e_p_likelihood').val(),
            h_severity: $('#e_h_severity').val(),
            h_likelihood: $('#e_h_likelihood').val(),
            ram_comment: $('#e_ram_comment').val(),
            avail_comment: $('#e_avail_comment').val(),
            anom_dev_id: $('#e_deviation').val()
        }
    }).done(function (r) {
        $('#an').unblock();
        $('#an').dialog('close');

        window['curr_an_dt_key_id'] = r['r'];
        ShowNoty('Record has been successfully updated.', 'info');

        if (asset_changed_on_edit) window['sel_node_id'] = $('#e_asset_id').val();

        if (new_rec) {
            window['an_dt_row'] = 0;
            SelectNode(window['sel_node_id'], true);
        } else {
            if (asset_changed_on_edit)
                SelectNode(window['sel_node_id'], true);
            else {
                UpdAnList();
                SelectAn(r['r'], true);
            }
        }

        asset_changed_on_edit = false;

        RefreshTree($('#e_asset_id').val(), $('#e_curr_act').val());
        InitAssetInfoCounts();
    });
}
function UpdAnList() {
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(2)').html($('#e_equip_no').val());
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(3)').html(parseInt($('#e_rev_no').html()) + 1); //Increment rev no.
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(5)').html($('#e_ident_date').val());
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(6)').html($("#e_type :selected").text());
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(7)').html($("#e_status :selected").text());
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(8)').html($("#e_orig_act :selected").text());
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(8)').css('background-color', $("#e_orig_act :selected").text())
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(9)').html($("#e_curr_act :selected").text());
    $('#an_dt_elm tbody tr:eq(' + window['an_dt_row'] + ') td:eq(9)').css('background-color', $("#e_curr_act :selected").text())
}
function InitControls() {
    $('#main_hdr').show();
    $('#m_pane_mdl').show();

    if (window['u_rights'] === 'admin') $('#ref_mnu').show();//Show inly reference menu on admin only.
    else $('#ref_mnu').hide();

    ResizeLayout();

    TableTools.BUTTONS.add = {
        'sAction': 'text', 'sToolTip': 'Click to add anomaly', 'sButtonText': 'Add',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { AddAn(); },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.edit = {
        'sAction': 'text', 'sToolTip': 'Click to edit anomaly', 'sButtonText': 'Edit',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { EditAn(); },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.del = {
        'sAction': 'text', 'sToolTip': 'Click to delete anomaly', 'sButtonText': 'Delete',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { DelAn(); },
        'fnInit': null, 'fnComplete': null, 'sButtonClass': 'DTTT_button_margin-right'
    };
    TableTools.BUTTONS.filter = {
        'sAction': 'text', 'sToolTip': 'Click to toggle anomaly filter', 'sButtonText': 'Filter',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { FilterAn(); },
        'fnInit': null, 'fnComplete': null, 'sButtonClass': 'DTTT_button_margin'
    };
    TableTools.BUTTONS.print_single = {
        'sAction': 'text', 'sToolTip': 'Click to print selected record', 'sButtonText': 'Print',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) {
           // i.prop('src', 'requesthandler.ashx?id=rpt&rpt=' + rpt_name + '&f=' + filter + '&ext=excel');//
            //InitReportDlg('reports.aspx?rpt_name=anomaly_single&filter_an=' + window['curr_an_dt_key_id'] + '&ext=pdf');
            InitReportDlg('requesthandler.ashx?id=rpt&rpt=anomaly_single&f_an=' + window['curr_an_dt_key_id'] + '&ext=pdf');
        },
        'fnInit': null, 'fnComplete': null
    };

    TableTools.BUTTONS.print_all = {
        'sAction': 'text', 'sToolTip': 'Click to print all records', 'sButtonText': 'Print All',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) {
            //InitReportDlg('reports.aspx?rpt_name=anomaly_all&filter=' + encodeURI(window['curr_asset_loc']) + '&ext=pdf');
            InitReportDlg('requesthandler.ashx?id=rpt&rpt=anomaly_all&F=' + encodeURI(window['curr_asset_loc']) + '&ext=pdf');
        },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.add_ref = {
        'sAction': 'text', 'sToolTip': 'Click to add reference file', 'sButtonText': 'Add',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { AddRef(); },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.edit_ref = {
        'sAction': 'text', 'sToolTip': 'Click to edit reference file', 'sButtonText': 'Edit',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { EditRef(); },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.del_ref = {
        'sAction': 'text', 'sToolTip': 'Click to delete reference file', 'sButtonText': 'Delete',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { DelRef(); },
        'fnInit': null, 'fnComplete': null, 'sButtonClass': 'DTTT_button_margin-right'
    };
    TableTools.BUTTONS.filter_ref = {
        'sAction': 'text', 'sToolTip': 'Click to toggle reference files filter ', 'sButtonText': 'Filter',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { FilterRef(); },
        'fnInit': null, 'fnComplete': null, 'sButtonClass': 'DTTT_button_margin'
    };
    TableTools.BUTTONS.lnk_ref = {
        'sAction': 'text', 'sToolTip': 'Click to link reference file to anomaly', 'sButtonText': 'Link to Anomaly',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { AddRefAn(); },
        'fnInit': null, 'fnComplete': null, 'sButtonClass': 'DTTT_button_margin-right'
    };
    TableTools.BUTTONS.add_an_ref = {
        'sAction': 'text', 'sToolTip': 'Click to add reference file.', 'sButtonText': 'Add',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { AddAnRef(true); },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.del_an_ref = {
        'sAction': 'text', 'sToolTip': 'Click to delete reference file.', 'sButtonText': 'Delete',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { DelAnRef(); },
        'fnInit': null, 'fnComplete': null, 'sButtonClass': 'DTTT_button_margin-right'
    };
    TableTools.BUTTONS.add_an_ft = {
        'sAction': 'text', 'sToolTip': 'Click to add failure thread.', 'sButtonText': 'Add',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { AddAnFt(); },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.del_an_ft = {
        'sAction': 'text', 'sToolTip': 'Click to delete failure threat.', 'sButtonText': 'Delete',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { DelAnFt(); },
        'fnInit': null, 'fnComplete': null, 'sButtonClass': 'DTTT_button_margin-right'
    };
    TableTools.BUTTONS.add_an_act = {
        'sAction': 'text', 'sToolTip': 'Click to add action item.', 'sButtonText': 'Add',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { AddAnAct(); },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.edit_an_act = {
        'sAction': 'text', 'sToolTip': 'Click to edit action item.', 'sButtonText': 'Edit',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { EditAnAct(); },
        'fnInit': null, 'fnComplete': null
    };
    TableTools.BUTTONS.del_an_act = {
        'sAction': 'text', 'sToolTip': 'Click to delete action item.', 'sButtonText': 'Delete',
        'fnMouseover': null, 'fnMouseout': null, 'fnClick': function (nButton, oConfig) { DelAnAct(); },
        'fnInit': null, 'fnComplete': null, 'sButtonClass': 'DTTT_button_margin-right'
    };


    /* Main split containers start */
    window['m_pane_mdl'] =
        $('#m_pane_mdl').layout({
            west: { //Tree
                size: 230,
                spacing_closed: 8,
                maxSize: 500,
                minSize: 0,
                togglerLength_open: 0,
                togglerLength_closed: 0,
                onclose_end: function () { $('#tree_toggle').removeClass('ui-icon-pin-s').addClass('ui-icon-pin-w'); },
                onresize_end: function () { ResizeDtlTabs(); ResizeDtlDataTables(); }
            },
            center__paneSelector: '#e_pane_mdl',
            west__paneSelector: '#w_pane_mdl'
        });

    m_pane_mdl_state = window['m_pane_mdl'].state;

    window['e_pane_mdl'] =
        $('#e_pane_mdl').layout({
            togglerLength_open: 0,
            togglerLength_closed: 0,
            center__paneSelector: '#e_inner_c_pane',
            south__paneSelector: '#e_inner_s_pane',
            center: {
                onresize_end: function () { ResizeDataTable(); }
            },
            south: {
                size: 264,
                onresize_end: function () { ResizeDtlTabs(); ResizeDtlDataTables(); },
                onclose_end: function () { $('#dtl_toggle').removeClass('ui-icon-pin-s').addClass('ui-icon-pin-w'); }
                //onopen_end: function () { $('#dtl_toggle').removeClass('ui-icon-pin-w').addClass('ui-icon-pin-s'); }
            }
        });

    e_pane_mdl_state = window['e_pane_mdl'].state;

    /* Main split containers end */

    /* Tabs Start */
    $('#an_dtl_container').tabs({
        activate: function (event, ui) {
            if (window['curr_an_dt_key_id'] != -1) {
                var tab = $('#' + ui.newPanel[0].id);
                if (tab.attr('loaded') == 'false' || tab.attr('loaded') == undefined)
                    InitAnDtls(MainTabSelected(), false);
            }
            ResizeDtlTabs();
        }
    });
    $('#ref_dtl_container').tabs();
    /* Tabs End */
    $('#an_ref_file_big').fancybox({ openEffect: 'elastic', closeEffect: 'elastic' });
    $('#ref_file_big').fancybox({ openEffect: 'elastic', closeEffect: 'elastic', titleShow: true });

    $(".image-box").mouseover(function () { $(".expand-box").show(); }).mouseout(function () { $(".expand-box").hide(); });

    //Main Menu Drop Down
    $('.toggle-login').click(function () {
        $(this).next('#login-content').slideToggle();
        $(this).toggleClass('active');
    });
    $('.mainmenu').click(function () {
        var x = $(this).find('span').html();
        if (x == '▲') {
            if (window['curr_module'] == 'rpt') {
                // $('#i_reports').unblock();
                $('#i_reports').show();

                //if ($('#i_reports').attr('src') == 'about:blank') $('#i_reports').attr('src', $('#i_reports').attr('tag'));
            }
            $('.menu_toggle').html('▼');
            $('.mainmenu').css('color', '#fff;');
            $('.mainmenu').css('position', '');
            $('.submenu').hide();
            window['menu_down'] = false;
        }
        else {
            if (window['curr_module'] == 'rpt') {
                //$('#i_reports').block();
                //$('#i_reports').attr('tag', $('#i_reports').attr('src'));
                $('#i_reports').hide();
                //$('#i_reports').attr('src', 'about:blank');
            }
            $('.menu_toggle').html('▼');
            $('.mainmenu').css('color', '#fff;');
            $('.mainmenu').css('position', '');
            $('.submenu').hide();

            $(this).find('span').html('▲');
            $(this).css('color', '#555;');
            $(this).parent('div').children('.submenu').show();
            $('.mainmenu').css('position', 'absolute');
            window['menu_down'] = true;
        }
    });
    //Mouse click on sub menus
    $('.submenu').mouseup(function () { return false; });
    //Mouse click on my account link
    $('.mainmenu').mouseup(function () { return false; });


    //On Document Click
    $(document).mouseup(function () {
        if (window['menu_down'] == true) {
            $('.submenu').hide();
            $('.mainmenu').css('color', '#fff;');
            $('.mainmenu').find('span').html('▼');
            $('.mainmenu').css('position', '');

            if (window['curr_module'] == 'rpt') {
                $('#i_reports').show();
                //$('#i_reports').unblock(); $('#i_reports').attr('src', $('#i_reports').attr('tag'));
            }
            window['menu_down'] = false;
        }
    });

    ImagePreview();

    $(window).bind('resize', function () { ResizeLayout(); ResizeTree(); });
    $(window).bind('beforeunload', function () { LogoutUser('close'); });

    InitSessionTimeouts();
    //InitIdleTime();
}

function InitIdleTime() {
    //Increment the idle time counter every minute.
    //var idleInterval = setInterval("timerIncrement()", 60000); // 1 minute
    var idleInterval = setInterval(function () {
        idle_time = idle_time + 1;
        //if (idleTime > 19) { // 20 minutes
        if (idle_time > recache_timeout - 1) { // 5 seconds
            //  window.location.reload();
        }
    }, 1000); // 1 second

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        idle_time = 0;
    });
    $(this).keypress(function (e) {
        idle_time = 0;
    });
}

function ImagePreview() {
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

function InitRefDlg() {
    InitHiglightField('ref_hdr tr td', ':input');

    InitSysLookups('e_ref_type', 6, null, -1);

    $('#e_ref_desc').maxlength({ max: 150 });
    $('#e_ref_notes').maxlength({ max: 4000 });
    $('#e_ref_path').change(function () {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'requesthandler.ashx?id=row_val&tbl=sys_lookups&ret_col=lkp_memo_1&filter=lkp_id=' +
            $('#e_ref_path').val()
        }).done(function (r) {
            $('#e_ref_path_desc').val(r['r']);
        });
    });
}
function ClearRefDlg() {
    $('#ref .value').html('');
    $('#ref tr td :input').val('');
    $("#e_ref_filename").replaceWith($("#e_ref_filename").val('').clone(true));
    $('#e_ref_filename').focus();

    $('#e_ref_path')[0].selectedIndex = -1;
    $('#e_ref_group')[0].selectedIndex = -1;
    $('#e_ref_type')[0].selectedIndex = -1;
}
function LoadRefDlg(new_rec, an_to_ref) {
    $('#ref').dialog({
        modal: true,
        resizable: false,
        height: 330,
        width: 750,
        buttons: {
            'Undo': {
                title: 'Click to undo changes.', text: 'Undo', icons: { primary: 'ui-icon-arrowreturnthick-1-e' },
                click: function () {
                    if (new_rec) {
                        ClearRefDlg(); //Clear controls. 
                        LoadRefDlgNew();
                    }
                    else {
                        LoadRefDlgEdit();
                    }
                }
            },
            'Save': {
                title: 'Click to update record.', text: 'Save', icons: { primary: 'ui-icon-disk' },
                click: function () {
                    if (ProceedUpd('ref')) {
                        //if ($('#e_ref_filename').val()) {
                        //    var fname = $('#e_ref_filename').val().split('\\').pop();
                        //    if (fname.length > 150) {
                        //        $.msgBox({ title: "Invalid Filename", content: "Filename must not exceed 150 characters." });
                        //        return;
                        //    }
                        //}
                        UpdRefSub(new_rec, an_to_ref);
                    }
                }
            },
            'Back': {
                title: 'Click to cancel update.', text: 'Back', icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
                click: function () { $(this).dialog('close'); }
            }
        },
        create: function () {
            InitRefDlg();  //Put focus, blur, hover effects..
        },
        open: function () {
            ClearRefDlg(); //Clear controls. 

            if (new_rec) LoadRefDlgNew();
            else LoadRefDlgEdit();
        }
    });
}
function LoadRefDlgNew() {
    //disable group, type. autoassign
    $('#e_ref_path').append('<option selected="selected" value="-1">[Auto]</option>');
    $('#e_ref_group').append('<option selected="selected" value="-1">[Auto]</option>');

    $('#e_ref_asset_id').val(window['sel_node_id']);
    $('#e_ref_asset_id_desc').html($('.tree_' + window['sel_node_id']).html());
    $('#e_ref_filename_container').html(
    '<input class="reqd" type="file" id="e_ref_filename" name="e_ref_filename" class="ui-widget-content reqd" style="width: 300px;" />');
    $('#e_ref_filename_container').removeClass();
    $('#e_ref_upload_by_name').html($('#u_name').html());
    $('#e_ref_upload_by').val(window['u_id']);

    InitSvrDate('e_ref_upload_date');
}
function LoadRefDlgEdit() {
    InitSysLookups('e_ref_path', 7, null, -1);
    InitSysLookups('e_ref_group', 9, null, -1);

    $('#e_ref_filename_container').html('');
    $('#e_ref_filename_container').removeClass().addClass('ui-widget-content value');
    InitRefHdr(true)
}
function AddAnRef(an_to_ref) {
    if (window['curr_an_dt_key_id'] == -1) $.msgBox({ title: "Add Record", content: "No record selected." });
    else LoadRefDlg(true, an_to_ref);
}
function UpdAnRef(an_id, ref_id, an_to_ref, no_cache) {
    $.ajax({
        type: 'POST',
        url: 'requesthandler.ashx?id=add_an_ref&an_id=' + an_id + '&ref_id=' + ref_id + '&no_cache=' + no_cache
    }).done(function (r) {
        if (r['r'] == "1") {
            if (an_to_ref) { $('#ref').unblock(); $('#ref').dialog('close'); }
            else { $('#ref_an').unblock(); $('#ref_an').dialog('close'); }

            ShowNoty('Reference file has been successfully linked.', 'info');
            DispAnLnkTable(window['curr_an_dt_key_id'], 'ref');
        }
    });
}
function DelAnRef() {
    if (window['curr_an_ref_dt_key_id'] == -1)
        $.msgBox({ title: "Record Delete", content: "There are no record to delete." });
    else {
        $.msgBox({
            title: "Record Delete",
            content: "Are you sure you want to delete the selected record?",
            type: "confirm",
            buttons: [{ value: "Yes" }, { value: "No" }, { value: "Cancel" }],
            success: function (result) {
                if (result == "Yes") {
                    $.ajax({
                        type: 'POST',
                        url: 'requesthandler.ashx?id=del_an_ref&an_id=' + window['curr_an_dt_key_id'] + '&ref_id=' + window['curr_an_ref_dt_key_id']
                    }).done(function (r) {
                        DispAnLnkTable(window['curr_an_dt_key_id'], 'ref');
                        ShowNoty('Record has been successfully updated.', 'info');
                    });
                }
            }
        });
    }
}

function UpdRefSub(new_rec, an_to_ref) {
    $('#ref').block();
    var fname = $('#e_ref_filename_container').html();

    if (new_rec) {
        //Check if file already exists..
        fname = $('#e_ref_filename').val().split('\\').pop();
        $.ajax({
            type: 'GET',
            url: 'requesthandler.ashx?id=ref_chk&f=' + fname
        }).done(function (r) {
            var existing_ref_id = r['r'];
            if (existing_ref_id > 0) { //File exists
                if (an_to_ref) { // If file already exists check also link existence if in the process of adding anomaly link.
                    $.ajax({
                        type: 'GET',
                        url: 'requesthandler.ashx?' + 'id=an_ref_chk&an_id=' + window['curr_an_dt_key_id'] + '&ref_id=' + existing_ref_id
                    }).done(function (r) {
                        if (r['r'] > 0) { //Lnk exists.
                            $('#ref').unblock();
                            $.msgBox({
                                title: 'Record Exists',
                                content: 'The reference file you are trying to add is already linked to the selected anomaly.'
                            });
                            return;
                        } else { //If lnk does not exists check if you want to overwrite.
                            $.msgBox({
                                title: 'Record Exists',
                                content: 'The reference file you are trying to add already exists. ' +
                                'Do you want to overwrite existing file?',
                                type: 'confirm', buttons: [{ value: 'Yes' }, { value: 'No' }, { value: 'Cancel' }],
                                success: function (result) {
                                    if (result == 'Yes') { UplFileInit(existing_ref_id, an_to_ref, fname, true); }
                                    else if (result == 'No') { if (an_to_ref) UpdAnRef(window['curr_an_dt_key_id'], existing_ref_id, an_to_ref); }
                                    else if (result == 'Cancel') { $('#ref').unblock(); }
                                }
                            });
                        }
                    })
                } else {
                    //If filename exists ask if you want to overwrite filename
                    $.msgBox({
                        title: 'Record Exists',
                        content: 'The reference file you are trying to add already exists. ' +
                        'Do you want to overwrite existing file?',
                        type: 'confirm', buttons: [{ value: 'Yes' }, { value: 'No' }],
                        success: function (result) {
                            if (result == 'Yes') { UplFileInit(r['r'], an_to_ref, fname, true); }
                            else { $('#ref').unblock(); }
                        }
                    });
                }
            } else {
                UplFileInit(-1, an_to_ref, fname);
            }

        });
    } else {
        UpdRef(window['curr_ref_dt_key_id'], an_to_ref, fname);
    }
}

function UpdRef(ref_id, an_to_ref, fname, overwrite) {
    var group;
    var path;

    if (ref_id === -1) {
        switch (FileType(fname)) {
            case 'img':
                group = 9201;
                path = 9301;
                break;
            case 'vid':
                group = 9202;
                path = 9302;
                break;
            case 'drw':
                group = 9203;
                path = 9303;
                break;
            default:
                group = 9204;
                path = 9304;
                break;
        }
    } else {
        group = $('#e_ref_type').val();
        path = $('#e_ref_path').val();
    }
    $.ajax({
        type: 'POST',
        url: 'requesthandler.ashx?id=upd_ref',
        data: {
            ref_id: ref_id,
            desc: $('#e_ref_desc').val(),
            type: $('#e_ref_type').val(),
            upload_date: $('#e_ref_upload_date').html(),
            upload_by: $('#e_ref_upload_by').val(),
            group: group,
            ref_no: $('#e_ref_ref_no').val(),
            filename: fname,
            path: path,
            asset_id: $('#e_ref_asset_id').val(),
            notes: $('#e_ref_notes').val()
        }
    }).done(function (r) {
        if (an_to_ref) {
            window['curr_an_ref_dt_key_id'] = r['r'];
            UpdAnRef(window['curr_an_dt_key_id'], r['r'], an_to_ref);

            ShowNoty('Reference file has been successfully updated.', 'info');
        } else {
            $('#ref').unblock();
            $('#ref').dialog('close');

            window['curr_ref_dt_key_id'] = r['r'];

            if (ref_id == -1) {
                window['ref_dt_row'] = 0;
                SelectNode(window['sel_node_id'], true);
            } else {
                if (!overwrite) UpdRefList();
                SelectRef(r['r'], true);
            }

            ShowNoty('Reference file has been successfully updated.', 'info');
        }
    });
}

function UpdRefList() {
    var fname;
    if ($('#e_ref_filename').val()) fname = $('#e_ref_filename').val().split('\\').pop();
    else fname = $('#e_ref_filename_container').html();

    $('#ref_dt_elm tbody tr:eq(' + window['ref_dt_row'] + ') td:eq(1)').html(fname);
    $('#ref_dt_elm tbody tr:eq(' + window['ref_dt_row'] + ') td:eq(2)').html($("#e_ref_type :selected").text());
    $('#ref_dt_elm tbody tr:eq(' + window['ref_dt_row'] + ') td:eq(5)').html($("#e_ref_path :selected").text());
    $('#ref_dt_elm tbody tr:eq(' + window['ref_dt_row'] + ') td:eq(6)').html($("#e_ref_path_desc").val());
    $('#ref_dt_elm tbody tr:eq(' + window['ref_dt_row'] + ') td:eq(7)').html($("#e_ref_group :selected").text());
}

function UplFileInit(ref_id, an_to_ref, fname, overwrite) {
    var options = {
        //dataType: 'script',        // 'xml', 'script', or 'json' (expected server response type) 
        beforeSubmit: function (formData, jqForm, options) { },
        success: function (responseText, statusText, xhr, $form) {  // post-submit callback
            UpdRef(ref_id, an_to_ref, fname, overwrite);
            ShowNoty('Reference file has been successfully uploaded.', 'info');
        }
    };

    var path;

    if (ref_id === -1) {
        switch (FileType(fname)) {
            case 'img':
                path = 9301;
                break;
            case 'vid':
                path = 9302;
                break;
            case 'drw':
                path = 9303;
                break;
            default:
                path = 9304;
                break;
        }
    } else {
        path = $('#e_ref_path').val();
    }

    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'requesthandler.ashx?id=row_val&tbl=sys_lookups&ret_col=lkp_memo_1&filter=lkp_id=' + path
    }).done(function (r) {
        $('#e_ref_path_desc').val(r['r']);

        $('#fileUploadForm').attr('action', 'requesthandler.ashx?id=upl_file&path=' + $('#e_ref_path_desc').val());
        $('#fileUploadForm').ajaxSubmit(options);
    });

}
function AddRefAn() {
    LoadRefAnDlg();
}
function TblVal(elm_id, p, elm_id_2, elm_id_3, elm_id_4) {
    if ($('#' + elm_id + ' option').length == 0) {
        $.ajax({
            //cache: false,
            dataType: 'json',
            url: 'requesthandler.ashx', data: { id: 'tbl_val' + p },
            success: function (r) {
                AuthenticateSingleLogin(r);
                var str = ''; //Default null option.
                for (var i = 0; i < r['r'].length; i++) {
                    str += '<option value="' + r[i][0] + '">' + r[i][1].toUpperCase() + '</option>';
                }

                $('#' + elm_id).append(str);
                $('#' + elm_id)[0].selectedIndex = -1;

                if (elm_id_2) {
                    $('#' + elm_id_2).append(str);
                    $('#' + elm_id_2)[0].selectedIndex = -1;
                }
                if (elm_id_3) {
                    $('#' + elm_id_3).append(str);
                    $('#' + elm_id_3)[0].selectedIndex = -1;
                }
                if (elm_id_4) {
                    $('#' + elm_id_4).append(str);
                    $('#' + elm_id_4)[0].selectedIndex = -1;
                }
            }
        });
    }
}
function InitRefAnDlg() {
    //Add Icons
    InitHiglightField('ref_lnk_hdr tr td', ':input');

    var p = '&tbl=anomalies&ret_1=id&ret_2=ref_no';
    InitLookups(p, 'ref_an_ref_no', -1, null, null, false);

    $('#ref_an_ref_no').change(function () {
        var p = '&tbl=anomalies&ret=title&filter_col=id&filter_val=' + $(this).val();
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'requesthandler.ashx?id=tbl_val' + p
        }).done(function (r) {
            $('#ref_an_title').html(r['r']);
        });
    });
}
function LoadRefAnDlgNew() {
    $('#ref_an_filename').html($('#ref_filename').html());
    $('#ref_an_desc').html($('#ref_desc').html());
}
function LoadRefAnDlg() {
    $('#ref_an').dialog({
        modal: true, resizable: false, height: 350, width: 465, buttons: {
            'Save': {
                title: 'Click to update record.', text: 'Save',
                click: function () { if (ProceedUpd('ref_an')) UpdRefAnLnk(); }
            },
            'Back': {
                title: 'Click to cancel update.', text: 'Back',
                click: function () { $(this).dialog('close'); }
            }
        },
        create: function () { InitRefAnDlg(); }, //Put focus, blur, hover effects..
        open: function () { ClearRefAnDlg(); LoadRefAnDlgNew(); }
    });
}
function UpdRefAnLnk() {
    $.ajax({//Check also link existence if in the process of adding anomaly link.
        type: 'GET',
        url: 'requesthandler.ashx?' + 'id=an_ref_chk&an_id=' + $('#ref_an_ref_no').val() + '&ref_id=' + window['curr_ref_dt_key_id']
    }).done(function (r) {
        if (r['r'] > 0) { //Lnk exists.
            $('#ref_an').unblock();
            $.msgBox({
                title: 'Record Exists',
                content: 'The reference file you are trying to add is already linked to the selected anomaly.'
            });
        } else {
            UpdAnRef($('#ref_an_ref_no').val(), window['curr_ref_dt_key_id']);
        }
    });
}
function ClearRefAnDlg() {
    $('#ref_an_ref_no').prop('selectedIndex', -1);
    $('#ref_an_desc').html('');
}

//
// Anomaly Failure Threats Start
//
function InitAnFtDlg() {
    InitHiglightField('an_ft_hdr tr td', ':input');

    //Add Icons
    $('.ui-dialog-buttonpane').find('button:contains("Save")').button({ icons: { primary: 'ui-icon-disk' } });
    $('.ui-dialog-buttonpane').find('button:contains("Back")').button({ icons: { primary: 'ui-icon-arrowreturnthick-1-w' } });

    InitSysLookups('e_an_ft', 10, null, -1);

    $('#e_an_ft').change(function () {
        window['curr_an_ft_dt_key_id'] = $('#e_an_ft').val();
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'requesthandler.ashx?id=ft_type&ft_id=' + $('#e_an_ft').val()
        }).done(function (r) {
            $('#e_an_ft_type').html(r['r']);
        });
    });
}
function LoadAnFtDlg() {
    $('#an_ft').dialog({
        modal: true, resizable: false, height: 210, width: 465, buttons: {
            'Save': {
                title: 'Click to update record.', text: 'Save',
                click: function () { if (ProceedUpd('an_ft')) UpdAnFt(); }
            },
            'Back': {
                title: 'Click to cancel update.', text: 'Back',
                click: function () { $(this).dialog('close'); }
            }
        },
        create: function () { InitAnFtDlg() },
        open: function () { ClearAnFtDlg(); }
    });
}
function ClearAnFtDlg() {
    $('#an_ft_hdr tr td :input').each(function () { ClearElem($(this)); });
    $('#e_an_ft_type').html('');
}
function AddAnFt() {
    if (window['curr_an_dt_key_id'] == -1) $.msgBox({ title: "Add Record", content: "No record selected." });
    else LoadAnFtDlg();
}
function UpdAnFt() {
    $('#an_ft').block();
    $.ajax({
        type: 'GET',
        url: 'requesthandler.ashx?' + 'id=an_ft_chk&an_id=' + window['curr_an_dt_key_id'] + '&ft_id=' +
        window['curr_an_ft_dt_key_id']
    }).done(function (r) {
        if (r['r'] > 0) {
            $.msgBox({
                title: "Record Exists", content:
                "The failure threat you are trying to add is already linked to this anomaly."
            });
        } else {
            $.ajax({
                type: 'POST',
                url: 'requesthandler.ashx?' + 'id=add_an_ft&an_id=' +
                window['curr_an_dt_key_id'] + '&ft_id=' + window['curr_an_ft_dt_key_id']
            }).done(function (r) {
                window['curr_an_ft_dt_key_id'] = r['r'];
                $('#an_ft').unblock();
                $('#an_ft').dialog('close');
                ShowNoty('Failure threat file has been successfully updated.', 'info');
                DispAnLnkTable(window['curr_an_dt_key_id'], 'ft');
            });
        }
    });
}
function DelAnFt() {
    if (window['curr_an_ft_dt_key_id'] == -1)
        $.msgBox({ title: "Record Delete", content: "There are no record to delete." });
    else {
        $.msgBox({
            title: "Record Delete",
            content: "Are you sure you want to delete the selected record?",
            type: "confirm",
            buttons: [{ value: "Yes" }, { value: "No" }, { value: "Cancel" }],
            success: function (result) {
                if (result == "Yes") {
                    $.ajax({
                        type: 'POST',
                        url: 'requesthandler.ashx?id=del_an_ft&an_id=' + window['curr_an_dt_key_id'] + '&ft_id=' + window['curr_an_ft_dt_key_id']
                    }).done(function (r) {
                        DispAnLnkTable(window['curr_an_dt_key_id'], 'ft', true);
                        ShowNoty('Record has been successfully deleted.', 'info');
                    });
                }
            }
        });
    }
}
function ResizeAnFtDlg() {
    var container = $('#an_ft > div');
    container.height($('#an_ft').height() - 30);
    $('#an_ft_hdr').height(container.height());
    $('#an_ft_hdr textarea').each(function () {
        var hei = $(this).parent('td').height();
        $(this).height(hei - 10);
    });
}
//
//  Anomaly Actions Tab Start 
//
function InitAnActDlg() {
    InitHiglightField('an_act tr td', ':input');

    //Add Icons
    $('.ui-dialog-buttonpane').find('button:contains("Save")').button({ icons: { primary: 'ui-icon-disk' } });
    $('.ui-dialog-buttonpane').find('button:contains("Back")').button({ icons: { primary: 'ui-icon-arrowreturnthick-1-w' } });

    $('#e_act_due_date').datepicker({ dateFormat: 'dd-M-yy' });

    var p = '&tbl=active_users&ret_1=user_id&ret_2=user_name';
    InitLookups(p, 'e_act_party', window['u_id']);
    InitSysLookups('e_act_status', 4, null, 0);

    $('#e_act_desc').maxlength({ max: 255 });
}
function LoadAnActDlg(new_rec) {
    $('#an_act').dialog(
        {
            modal: true, resizable: false, height: 230, width: 750, buttons: {
                'Save': {
                    title: 'Click to update record.', id: 'upd_an_act', text: 'Save',
                    click: function () { if (ProceedUpd('an_act')) UpdAnAct(new_rec); }
                },
                'Back': {
                    title: 'Click to cancel update.', text: 'Back',
                    click: function () { $(this).dialog('close'); }
                }
            },
            create: function () { InitAnActDlg(); }, //Put focus, blur, hover effects..
            open: function () {
                ClearAnActDlg(); //Clear controls. 
                if (new_rec) LoadAnActDlgNew();
                else LoadAnActDlgEdit();
            }
        });
}
function ResizeAnActDlg() {
    var container = $('#an_act > div');
    container.height($('#an_act').height() - 30);
    $('#an_act_hdr').height(container.height());
    $('#an_act_hdr textarea').each(function () {
        var hei = $(this).parent('td').height();
        $(this).height(hei - 10);
    });
}
function LoadAnActDlgNew() {
    $('#e_act_party').val(window['u_id']);
    $('#e_act_status').prop('selectedIndex', 0);
}
function LoadAnActDlgEdit() {
    $('#an_act').block();
    $.ajax({
        //cache: false,
        dataType: 'json',
        url: 'requesthandler.ashx', data: { id: 'an_act', act_id: window['curr_an_act_dt_key_id'] },
        success: function (r) {
            AuthenticateSingleLogin(r);
            $('#e_act_desc').val(r[0][0]);
            $('#e_act_desc').keyup();
            $('#e_act_party').val(r[0][1]);
            $('#e_act_due_date').val((r[2] == '' ? '' : $.datepicker.formatDate('dd-M-yy', new Date(r[0][2]))));
            $('#e_act_status').val(r[0][3]);

            $('#an_act').unblock();
        }
    });
}
function ClearAnActDlg() {
    $('#an_act_hdr tr td :input').each(function () { ClearElem($(this)); });
    $('#e_act_desc').val('');
}
function UpdAnAct(new_rec) {
    $('#an_act').block();
    var p = 'id=upd_an_act' +
            '&act_id=' + (new_rec ? -1 : window['curr_an_act_dt_key_id']) +
            '&an_id=' + window['curr_an_dt_key_id'] +
            '&desc=' + $('#e_act_desc').val() +
            '&act_party=' + $('#e_act_party').val() +
            '&due_date=' + $('#e_act_due_date').val() +
            '&act_status=' + $('#e_act_status').val();
    $.ajax({
        type: 'POST',
        url: 'requesthandler.ashx?' + p
    }).done(function (r) {
        $('#an_act').unblock();
        $('#an_act').dialog('close');
        ShowNoty('Reference file has been successfully updated.', 'info');
        window['curr_an_act_dt_key_id'] = r['r'];
        DispAnLnkTable(window['curr_an_dt_key_id'], 'act');
    });
}
function AddAnAct() {
    if (window['curr_an_dt_key_id'] == -1) $.msgBox({ title: "Add Record", content: "No record selected." });
    else LoadAnActDlg(true);
}
function EditAnAct() {
    if (window['curr_an_dt_key_id'] == -1) $.msgBox({ title: "Record Edit", content: "No record selected." });
    else LoadAnActDlg();
}
function DelAnAct() {
    if (window['curr_an_act_dt_key_id'] == -1)
        $.msgBox({ title: "Record Delete", content: "There are no record to delete." });
    else {
        $.msgBox({
            title: "Record Delete",
            content: "Are you sure you want to delete the selected record?",
            type: "confirm",
            buttons: [{ value: "Yes" }, { value: "No" }, { value: "Cancel" }],
            success: function (result) {
                if (result == "Yes") {
                    $.ajax({
                        type: 'POST',
                        url: 'requesthandler.ashx?id=del_an_act&an_id=' + window['curr_an_dt_key_id'] + '&act_id=' + window['curr_an_act_dt_key_id']
                    }).done(function (r) {
                        DispAnLnkTable(window['curr_an_dt_key_id'], 'act', true);
                        ShowNoty('Record has been successfully deleted.', 'info');
                    });
                }
            }
        });
    }
}
//
//  Anomaly Actions Tab End
//


function TogglePane(caller, container, dir) {
    if ($('#' + caller).is('.ui-icon-pin-s')) {
        if (dir) window[container].toggle(dir);
        $('#' + caller).removeClass('ui-icon-pin-s').addClass('ui-icon-pin-w');
    }
    else {
        if (dir) window[container].open(dir);
        $('#' + caller).removeClass('ui-icon-pin-w').addClass('ui-icon-pin-s');
    }
}
function ShowNoty(msg, icon) {
    var layout = 'bottomRight';
    noty({
        layout: layout,
        theme: 'noty_theme_facebook',
        animateOpen: { height: 'toggle' },
        animateClose: { height: 'toggle' },
        easing: 'swing', // easing
        speed: 80, // opening & closing animation speed
        timeout: 1000, // delay for closing event. Set false for sticky notifications
        closeOnSelfClick: true, // close the noty on self click when set to true
        force: true, // adds notification to the beginning of queue when set to true
        template: '<div class="ui-widget-header">' +
        '<p><span class="ui-icon ui-icon-' + icon + '" style="float:left; margin:0 7px 0 0;"></span>' + msg + '</p>' +
        '</div>'
    });
}
function BoxHeight(elm) {
    var box = 0;
    box += GetInt($(elm).css("padding-top"));
    box += GetInt($(elm).css("padding-bottom"));
    box += GetInt($(elm).css("border-top-width"));
    box += GetInt($(elm).css("border-bottom-width"));
    box += GetInt($(elm).css("margin-top"));
    box += GetInt($(elm).css("margin-bottom"));

    return box;
}
function GetInt(string) {
    if (typeof string == "undefined" || string == "") return 0;

    var int_val = parseInt(string);

    if (!(int_val <= 0 || int_val > 0)) return 0;

    return int_val;
}
function ResizeDataTable() {
    //e_inner_s_pane
    var tbl_hdr_hei;
    var tbl_foo_hei;
    if ($('#m_pane_mdl').is(":visible")) {
        tbl_hdr_hei =
            $('#' + window['curr_module'] + '_dt_elm_container .ui-widget-header:first').innerHeight() +
            $('#' + window['curr_module'] + '_dt_elm_container .dataTable thead:first').innerHeight();
        tbl_foo_hei =
            $('#' + window['curr_module'] + '_dt_elm_container .dataTables_length:first').innerHeight() + 15 +
            ($('#' + window['curr_module'] + '_dt_elm_container tfoot:last td:last').html() != '' ? 20 : 0);

        $('#' + window['curr_module'] + '_dt_elm_container .dataTables_scrollBody').height($('#e_inner_c_pane').height() - tbl_hdr_hei - tbl_foo_hei);
    } else if ($('#m_pane_tls').is(":visible")) {
        tbl_hdr_hei =
            $('#lkp_grp_dt_elm_container .ui-widget-header:first').innerHeight() +
            $('#lkp_grp_dt_elm_container .dataTable thead:first').innerHeight();
        tbl_foo_hei =
            $('#lkp_grp_dt_elm_container .dataTables_length:first').innerHeight() + 28;

        $('#lkp_grp_dt_elm_container .dataTables_scrollBody').height($('#w_pane_tls').height() - tbl_hdr_hei - tbl_foo_hei);

        tbl_hdr_hei =
            $('#lkp_dt_elm_container .ui-widget-header:first').innerHeight() +
            $('#lkp_dt_elm_container .dataTable thead:first').innerHeight();
        tbl_foo_hei =
            $('#lkp_dt_elm_container .dataTables_length:first').innerHeight() + 28;

        $('#lkp_dt_elm_container .dataTables_scrollBody').height($('#w_pane_tls').height() - tbl_hdr_hei - tbl_foo_hei);
    }
}
function ResizeLayout(show_menu) {
    $('#menu_container').width($('body').width() - 542);
    if ($('#m_pane_mdl').is(":visible")) {
        $('#m_pane_mdl').height($(window).height() - $('#m_pane_mdl').offset().top);
        //$('#e_pane_mdl').height(200);
        ////if (show_menu) $('body').width($('#body').width() - 200);
        ////$('#e_pane_mdl').height($('#m_pane_mdl').innerHeight() - BoxHeight($('#e_pane_mdl')));
        //$('#w_pane_mdl').height($('#m_pane_mdl').innerHeight() - BoxHeight($('#w_pane_mdl')));
    } else if ($('#m_pane_tls').is(":visible")) {
        $('#m_pane_tls').height($(window).height() - $('#m_pane_tls').offset().top);
        //        $('#e_pane_tls').height($('#m_pane_tls').innerHeight() - BoxHeight($('#e_pane_tls')));
        //$('#w_pane_tls').height($('#m_pane_tls').innerHeight() - BoxHeight($('#w_pane_tls')) - 200);
        //$('#w_pane_tls').height(200);
    }
    //$('#e_inner_c_pane').height('100px');
    //e_pane_mdl


    if (window['curr_module'] == 'rpt') ResizeReport();
}

function ResizeReport() {
    if (window['curr_module'] == 'rpt') {
        $('#rpt_container').height($('#m_pane_mdl').innerHeight() - 30);
        $('#i_reports').height($('#rpt_container').innerHeight() - 16);
        $('#i_reports').width($('#m_pane_mdl').innerWidth() - 265);
    }

}
function ResizeTree() {
    $('#tree_pane').height($('#m_pane_mdl').height() - $('#asset_info').outerHeight() - 37);
    $('#treeview').css({ 'height': $('#tree_pane').height() - $('#treeview').prev('div').height() - 15 });
}
//Function to be called when an dialog has been resized.
function ResizeAnDlg() {
    var tab_idx = $('#e_tabs').tabs("option", "active");
    var tab = $('#e_tabs > div:eq(' + tab_idx + ')');
    var tab_id = tab.attr('id');
    tab.height($('#an').height() - 135);

    if (tab_idx < 4) {
        var tab_table = $('#' + tab.attr('id') + ' table.edit:eq(0)');
        tab_table.height(tab.height());

        var table_rows = tab_table.find('tr').size();
        $('#' + tab_id + ' input:text').each(function () {
            var hei = $(this).parent('td').height();
            //$(this).height((tab_table.height() / table_rows) - 7);
        });

        $('#' + tab_id + ' textarea').each(function () {
            var hei = $(this).parent('td').height();
            $(this).height(hei - 10);
        });
    } else {
        var ch_tab_idx = $('#e_tabs_rsk').tabs("option", "active");
        ch_tab = $('#e_tabs_rsk > div:eq(' + ch_tab_idx + ')');
        ch_tab_id = ch_tab.attr('id');

        ch_tab.height(tab.height() - 37);
        ch_tab.children('table.edit').width(ch_tab.width() - 15);

        if (ch_tab_idx < 4) {
            var rsk_container_hei = ch_tab.height();
            $('#e_tabs_rsk .edit').each(function () {
                var row_cnt = $(this).find('tr').length;
                $(this).find('td').each(function () {
                    $(this).height((rsk_container_hei / row_cnt));
                });
            });
        } else {
            $('#e_ram_comment').height(ch_tab.height() - 7);
            $('#e_ram_comment').width(ch_tab.width() - 7);
        }
        //$('#e_tabs_rsk > div > table:eq(0)').height(tab.height() - 100);
    }
}
function ResizeRefDlg() {
    var form = $('#ref > form');
    form.height($('#ref').height() - 30);

    var container = $('#ref > form > div');
    container.height(form.height());
    $('#ref_hdr').height(container.height());

    $('#ref textarea').each(function () {
        var hei = $(this).parent('td').height();
        $(this).height(hei - 10);
    });
}
function InitReportDlg(url) {
    $('#rpt').dialog({
        modal: true,
        height: 510,
        width: 950,
        open: function () {
            //  var myPDF = new PDFObject({ url: url }).embed("i_reports_dlg");
            var i = $('#i_reports_dlg');
         //   i.prop('src', 'requesthandler.ashx?id=rpt&rpt=anomaly_single&f=' + window['curr_an_dt_key_id'] + '&ext=pdf');
            //i.prop('src', 'requesthandler.ashx?id=rpt&rpt=anomaly_single&f_an=' + window['curr_an_dt_key_id'] + '&ext=pdf');

            i.prop('src', url);

            ResizeRptDlg();
        },
        resize: function (event, ui) { ResizeRptDlg(); }
    });
}
function ResizeRptDlg() {
    $('#i_reports_dlg').height($('#rpt').innerHeight() - 20);
    $('#i_reports_dlg').width($('#rpt').innerWidth() - 20);

}
function a() {
    //window.open(, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
}

function InitReport(rpt_name, xls) {
    window['curr_rpt'] = rpt_name;
    window['curr_module'] = 'rpt';
    var filter = window['curr_asset_loc'];

    var ext = (xls ? 'excel' : 'pdf');
    var i = $('#i_reports');
    var h = $('#h_reports');
    i.prop('src', 'requesthandler.ashx?id=rpt&rpt=' + rpt_name + '&f=' + filter + '&ext=' + ext );
    h.attr('href', 'requesthandler.ashx?id=rpt&rpt=' + rpt_name + '&f=' + filter + '&ext=EXCEL').attr('target', '_blank');;

   // var myPDF = new PDFObject({ url: 'reports.aspx?rpt_name=' + rpt_name + '&filter=' + filter + '&ext=pdf' }).embed('i_reports');
  //  $('#rpt_excel').attr('href', 'reports.aspx?rpt_name=' + rpt_name + '&filter=' + filter + '&ext=excel');
   // $('#rpt_word').attr('href', 'reports.aspx?rpt_name=' + rpt_name + '&filter=' + filter + '&ext=word');
   // $('#rpt_csv').attr('href', 'reports.aspx?rpt_name=' + rpt_name + '&filter=' + filter + '&ext=csv');
   // $('#rpt_xml').attr('href', 'reports.aspx?rpt_name=' + rpt_name + '&filter=' + filter + '&ext=xml');

    if (!$('#m_pane_mdl').is(":visible")) {
        $('#m_pane_tls').hide();
        $('#m_pane_mdl').show();
    }

    if (!$('#rpt_container').is(":visible")) {
        $('#ref_dt_elm_container').hide();
        $('#ref_dtl_container').hide();
        $('#rpt_container').show();

        if (!window['e_pane_mdl_state'].south.isClosed) window['e_pane_mdl'].hide('south');

        $('#e_inner_s_pane').height(0);

        $('#an_dt_elm_container').hide();
        $('#an_dtl_container').hide();
    }

    ResizeReport();
}
function HideReport() {
    $('#rpt_container').css('height', '200px');
}
function InitLkpMgt() {
    window['curr_module'] = 'lkp_grp';

    InitLkpGrp();
}
function InitLkpGrp() {
    $('#m_pane_mdl').hide();
    if (!$('#m_pane_tls').is(":visible")) {
        $('#m_pane_mdl').hide();
        $('#m_pane_tls').show();
    }
    //$('#m_pane_tls').show();

    ResizeDivs(true, false, false);

    window['m_pane_tls'] =
        $('#m_pane_tls').layout({
            west: { //Lookup group list 
                size: 430,
                spacing_closed: 8,
                maxSize: 500,
                minSize: 0,
                slideTrigger_open: 'mouseover',
                fxName: 'drop', fxSpeed: 'normal',
                togglerLength_open: 0,
                togglerLength_closed: 0,
                fxSettings: { easing: '' }, // nullify default easing
                onresize_end: function () { ResizeDivs(false, false, true) }
            },
            center__paneSelector: '#e_pane_tls',
            west__paneSelector: '#w_pane_tls'
        });

    InitLkpGrpList();
}
/*
$.extend($.fn.dataTable.defaults, {
    oLanguage: {
        "sProcessing": "Loading... please wait."
    }
});
*/
function InitLkpGrpList() {
    $('#lkp_grp_dt_elm_container').show();

    InitDTVars('lkp_grp_dt');
    if (IsDataTable($('#lkp_grp_dt_elm')[0])) {
        window['lkp_grp_dt'].fnSettings().sAjaxSource = 'requesthandler.ashx?id=lkp_grp_list';
        window['lkp_grp_dt'].fnDraw();
    } else {
        if (window['u_id'] == -1) btns = [TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF, 'filter'];
        else btns = ['add', 'edit', 'del', TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF, 'filter'];

        $("#an_dt_elm tbody").delegate("tr", "click", function (e) {
            $($('#an_dt_elm').dataTable().fnSettings().aoData).each(function () { $(this.nTr).removeClass('ui-state-highlight'); });
            $(e.target).parent().addClass('ui-state-highlight');

            window['an_dt_row'] = this.sectionRowIndex;
            var row_selected = $('#an_dt_elm').dataTable().fnGetData(e.target.parentNode);
            SelectAn(row_selected[0]);
        });

        window['lkp_grp_dt'] = $('#lkp_grp_dt_elm').dataTable({
            'sDom': '<"H"RTlr>t<"F"Cip>',
            'bServerSide': true,
            'sAjaxSource': 'requesthandler.ashx?id=lkp_grp_list',
            'aoColumns': [
                { "sName": "ilkp_id", "sClass": "center", "sWidth": "25px" },
                { "sName": "ilkp_grp_id", "sClass": "center", "sWidth": "25px" },
                { "sName": "slkp_desc_a", "sWidth": "200px" },
                { "sName": "slkp_desc_b", "sWidth": "200px" }
            ],
            'bJQueryUI': true,
            'bProcessing': true,
            'oLanguage': { 'sProcessing': '<img src="images/busy.gif" />' },
            'sScrollX': '100%',
            'bScrollCollapse': true,
            'bAutoWidth': false,
            'oTableTools': {
                'aButtons': btns,
                'sSwfPath': 'scripts/copy_csv_xls_pdf.swf'
            },
            'aaSorting': [[0, 'asc']],
            'fnServerData': function (sSource, aoData, fnCallback) {
                $.getJSON(sSource, aoData, function (json) {
                    fnCallback(json);
                    SetDTVarsSvrData('lkp_grp_dt', json);
                    if (json.aaData.length > 0) {
                        $('#lkp_lkp_grp_dt_elm tbody tr:eq(' + window['lkp_grp_dt_row'] + ')').addClass('row_selected ui-state-highlight'); // Select top row if any.
                        var lkp_grp_id = window['lkp_grp_dt'].fnGetData(window['lkp_grp_dt_row'])[0];
                        SelectLkpGrp(lkp_grp_id);
                    } else {
                        window['curr_lkp_grp_dt_key_id'] = -1;
                    }
                    ResizeDivs(false, false, true);
                });
            },
            'fnServerParams': function (aoData) {
                SetDTVarsSvrParams('lkp_grp_dt', aoData);
            },
            'fnDrawCallback': function (oSettings) {
                DtFiltered('lkp_grp_dt', oSettings);
            },
            'fnFooterCallback': function (nFoot, aData, iStart, iEnd, aiDisplay) {
                if (aData.length > 0) {
                    SetDTVarsFootCallback('lkp_grp_dt', aData);
                } else {
                    InitDTVars('lkp_grp_dt');
                }
            }
        });

        $("#lkp_grp_dt_elm tbody").delegate("tr", "click", function (e) {
            $(window['lkp_grp_dt'].fnSettings().aoData).each(function () { $(this.nTr).removeClass('ui-state-highlight'); });
            $(e.target).parent().addClass('ui-state-highlight');

            window['lkp_grp_dt_row'] = this.sectionRowIndex;
            var row_selected = window['lkp_grp_dt'].fnGetData(e.target.parentNode);
            SelectLkpGrp(row_selected[0]);
        });
    }
}
function SelectLkpGrp(lkp_grp_id) {
    window['curr_lkp_grp_dt_key_id'] = lkp_grp_id;
    InitLkpList(lkp_grp_id);
}
function InitLkpList(lkp_grp_id) {
    $('#lkp_dt_elm_container').show();

    InitDTVars('lkp_dt');
    if (IsDataTable($('#lkp_dt_elm')[0])) {
        window['lkp_dt'].fnSettings().sAjaxSource = 'requesthandler.ashx?id=lkp_list&lkp_grp_id=' + lkp_grp_id;
        window['lkp_dt'].fnDraw();
    } else {
        if (window['u_id'] == -1) btns = [TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF, 'filter'];
        else btns = ['add', 'edit', 'del', TABLETOOLS_COPY, TABLETOOLS_CSV, TABLETOOLS_PDF, 'filter'];
        window['lkp_dt'] = $('#lkp_dt_elm').dataTable({
            'sDom': '<"H"RTlr>t<"F"Cip>',
            'bServerSide': true,
            'sAjaxSource': 'requesthandler.ashx?id=lkp_list&lkp_grp_id=' + lkp_grp_id,
            'aoColumns': [
                { "sName": "ilkp_id", "sClass": "center", "sWidth": "25px" },
                { "sName": "slkp_desc_a", "sWidth": "200px" },
                { "sName": "slkp_desc_b", "sWidth": "200px" }
            ],
            'bJQueryUI': true,
            'bProcessing': true,
            'oLanguage': { 'sProcessing': '<img src="images/busy.gif" />' },
            'sScrollX': '100%',
            'bScrollCollapse': true,
            'bAutoWidth': false,
            'oTableTools': {
                'aButtons': btns,
                'sSwfPath': 'swf/copy_csv_xls_pdf.swf'
            },
            'fnServerData': function (sSource, aoData, fnCallback) {
                $.getJSON(sSource, aoData, function (json) {
                    fnCallback(json);
                    SetDTVarsSvrData('lkp_dt', json);

                    if (json.aaData.length > 0) {
                        //$('#lkp_lkp_grp_dt_elm tbody tr:eq(' + window['lkp_dt_row'] + ')').addClass('row_selected ui-state-highlight'); // Select top row if any.
                        //var lkp_grp_id = window['lkp_dt'].fnGetData(window['lkp_dt_row'])[0];
                        //SelectLkpGrp(lkp_grp_id);
                    } else {
                        window['curr_lkp_dt_key_id'] = -1;
                    }
                    ResizeDivs(false, false, true);
                });
            },
            'fnServerParams': function (aoData) {
                SetDTVarsSvrParams('lkp_dt', aoData);
            },
            'fnDrawCallback': function (oSettings) {
                for (var i = 0; i < oSettings.aoPreSearchCols.length; i++) {
                    if (oSettings.aoPreSearchCols[i].sSearch.length > 0) {
                        $('#lkp_dt_elm_foot input')[i - 1].value = oSettings.aoPreSearchCols[i].sSearch;
                    }
                }
            },
            'fnFooterCallback': function (nFoot, aData, iStart, iEnd, aiDisplay) {
                if (aData.length > 0) {
                    SetDTVarsFootCallback('lkp_dt', aData);
                } else {
                    InitDTVars('lkp_dt');
                }
            }
        });

        $("#lkp_dt_elm tbody").delegate("tr", "click", function (e) {
            $(window['lkp_dt'].fnSettings().aoData).each(function () { $(this.nTr).removeClass('ui-state-highlight'); });
            $(e.target).parent().addClass('ui-state-highlight');

            window['lkp_dt_row'] = this.sectionRowIndex;
            var row_selected = window['lkp_dt'].fnGetData(e.target.parentNode);
            SelectLkp(row_selected[0]);
        });
    }
}
function SelectLkp(lkp_id) {
    window['curr_lkp_dt_key_id'] = lkp_id;
}

(function ($) {
    /*
    * Function: fnGetColumnData
    * Purpose:  Return an array of table values from a particular column.
    * Returns:  array string: 1d data array
    * Inputs:   object:oSettings - dataTable settings object. This is always the last argument past to the function
    *           int:iColumn - the id of the column to extract the data from
    *           bool:bUnique - optional - if set to false duplicated values are not filtered out
    *           bool:bFiltered - optional - if set to false all the table data is used (not only the filtered)
    *           bool:bIgnoreEmpty - optional - if set to false empty values are not filtered from the result array
    * Author:   Benedikt Forchhammer <b.forchhammer /AT\ mind2.de>
    */
    $.fn.dataTableExt.oApi.fnGetColumnData = function (oSettings, iColumn, bUnique, bFiltered, bIgnoreEmpty) {
        // check that we have a column id
        if (typeof iColumn == "undefined") return new Array();

        // by default we only want unique data
        if (typeof bUnique == "undefined") bUnique = true;

        // by default we do want to only look at filtered data
        if (typeof bFiltered == "undefined") bFiltered = true;

        // by default we do not want to include empty values
        if (typeof bIgnoreEmpty == "undefined") bIgnoreEmpty = true;

        // list of rows which we're going to loop through
        var aiRows;

        // use only filtered rows
        if (bFiltered == true) aiRows = oSettings.aiDisplay;
            // use all rows
        else aiRows = oSettings.aiDisplayMaster; // all row numbers

        // set up data array   
        var asResultData = new Array();

        for (var i = 0, c = aiRows.length; i < c; i++) {
            iRow = aiRows[i];
            var aData = this.fnGetData(iRow);
            var sValue = aData[iColumn];

            // ignore empty values?
            if (bIgnoreEmpty == true && sValue.length == 0) continue;

                // ignore unique values?
            else if (bUnique == true && jQuery.inArray(sValue, asResultData) > -1) continue;

                // else push the value onto the result data array
            else asResultData.push(sValue);
            //asResultData.push(sValue);
        }

        return asResultData;
    }
}(jQuery));
function fnCreateSelect(aData) {
    var r = '<select><option value=""></option>', i, iLen = aData.length;
    for (i = 0; i < iLen; i++) {
        r += '<option value="' + aData[i] + '">' + aData[i] + '</option>';
    }
    return r + '</select>';
}

//Datatable API's
$.fn.dataTableExt.oApi.fnFilterClear = function (oSettings) {
    /* Remove global filter */
    oSettings.oPreviousSearch.sSearch = "";

    /* Remove the text of the global filter in the input boxes */
    if (typeof oSettings.aanFeatures.f != 'undefined') {
        var n = oSettings.aanFeatures.f;
        for (var i = 0, iLen = n.length ; i < iLen ; i++) {
            $('input', n[i]).val('');
        }
    }

    /* Remove the search text for the column filters - NOTE - if you have input boxes for these
     * filters, these will need to be reset
     */
    for (var i = 0, iLen = oSettings.aoPreSearchCols.length ; i < iLen ; i++) {
        oSettings.aoPreSearchCols[i].sSearch = "";
    }

    /* Redraw */
    oSettings.oApi._fnReDraw(oSettings);
};
$.fn.dataTableExt.oApi.fnDisplayStart = function (oSettings, iStart, bRedraw) {
    if (typeof bRedraw == 'undefined') {
        bRedraw = true;
    }

    oSettings._iDisplayStart = iStart;
    oSettings.oApi._fnCalculateEnd(oSettings);

    if (bRedraw) {
        oSettings.oApi._fnDraw(oSettings);
    }
};
$.fn.dataTableExt.oApi.fnStandingRedraw = function (oSettings) {
    if (oSettings.oFeatures.bServerSide === false) {
        var before = oSettings._iDisplayStart;

        oSettings.oApi._fnReDraw(oSettings);
        // iDisplayStart has been reset to zero - so lets change it back
        oSettings._iDisplayStart = before;
        oSettings.oApi._fnCalculateEnd(oSettings);
    }

    // draw the 'current' page
    oSettings.oApi._fnDraw(oSettings);
};

var asset_changed_on_edit = false;

function AssetSelectorLoad() {
    $('#tree_select_dlg').dialog({
       // position: { my: "left top", at: "left bottom", of: $('#b_select_asset') },
       // modal: true,
      //  resizable: false,
        height: 350,
        width: 400,
        buttons: {
            'Select': {
                title: 'Click to select asset.', text: 'Select', icons: { primary: 'ui-icon-disk' },
                click: function () {
                    $('#e_asset_id').val($('#i_sel_asset_id').val());
                    $('#e_asset_id_desc').html($('#i_sel_asset_desc').val());
                    asset_changed_on_edit = true;
                    $(this).dialog('close');
                }
            },
            'Back': {
                title: 'Click to cancel selection.', text: 'Back', icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
                click: function () { $(this).dialog('close'); }
            }
        },
        close: function (event, ui) {
            $('#tree_sel').html('');
            an_dlg_open = false;
            $(this).unblock();
        },
        //create: function () { InitAnDlg(); }, //Put focus, blur, hover effects..
        open: function () {
            $('#tree_sel').html($('#treeview').html());
            an_dlg_open = true;

        }
    });

}
function AssetSelectorLoad1() {

    $('#treeview_asset_selector').html('');
    $('#treeview_asset_selector').dialog({
        modal: true, resizable: false,
        width: 250,
        height: 500,
        buttons: {
            Yes: function () {  $(this).dialog("close"); },
            No: function () {  $(this).dialog("close"); }
        },
        close: function () {  },
        open: function () {
            $('#treeview_asset_selector').html();
            //InitChildNodes_AssetSelector(-1);
            
        }
    });
}
function InitChildNodes_AssetSelector(par_id) {
  //  $('#tree_pane').block();

    $.ajax({
        dataType: 'json',
        url: 'requesthandler.ashx', data: { id: 'tree', par_id: par_id },
        success: function (r) { DispChildNodes_AssetSelector(r, par_id); }
    });
}
function DispChildNodes_AssetSelector(r, par_id) {
    var str = '';
    for (var i = 0; i < r.length; i++) {
        var id = r[i][0];
        var loc = r[i][1];
        var code = r[i][2];
        var desc = r[i][3];
        var color = r[i][4];
        var child_count = r[i][5];
        var has_child = (child_count > 0);
        str +=
        '<li>' +
            '<div' + (has_child ? ' onclick="ExpandCollapse_AssetSelector(' + id + ');" ' : ' ') +
                'class="tree_ptr_' + id + ' ' + (has_child ? 'folder-collapse ptr' : 'folder-none ptr') + '"></div>' +
                '<div class="sta' + color + '"></div>' +
                '<div title="ID: ' + id + ' Description: ' + desc + '" loc="' + loc + '" class="tree_' + id + ' nodedesc"' +
            '" onmouseover="$(this).addClass(\'ui-state-hover\');" onmouseout="$(this).removeClass(\'ui-state-hover\');" ' +
            'onclick="SelectNode_AssetSelector(' + id + ',\'' + desc + '\');">' + desc + '</div>' +
            '</li>';

    }
    str = '<ul class="tree">' + str + '</ul>';

    if (par_id != -1) {
        $(str).insertAfter($('#treeview_asset_selector').find('.tree_' + par_id + ''));
    }
    else {
        $(str).appendTo('#treeview_asset_selector'); // If root..

        ExpandCollapse_AssetSelector(id);
       // SelectNode(id);
    }

   // $('#tree_pane').unblock();
}
function ExpandCollapse_AssetSelector(node_id) {
    var $node_ptr = $('#treeview_asset_selector').find('.tree_ptr_' + node_id);
    var expand = ($node_ptr.is('.folder-collapse'));
    //var expand = ($node_ptr.hasClass('folder-collapse'));

    if (expand) {
        if ($node_ptr.parent('li').children('ul').length == 0) InitChildNodes_AssetSelector(node_id);
        else $node_ptr.parent('li').children('ul').show();

        $node_ptr.removeClass('folder-collapse').addClass('folder-expand');
    } else { // Of collapse
        $node_ptr.removeClass('folder-expand').addClass('folder-collapse');
        $node_ptr.parent('li').children('ul').hide();
    }
}
function SelectNode_AssetSelector(node_id, desc) {
    $('#e_asset_id').val(node_id);
    $('#e_asset_id_desc').html(desc);
}
