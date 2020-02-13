<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="AnomDB._Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <%-- <meta http-equiv="content-type" content="text/html; charset=utf-8" />--%>
    <meta http-equiv="X-UA-Compatible" content="IE=100" />
    <title>Anomaly Database</title>
    <link rel="stylesheet" type="text/css" href="scripts/theme-min.css" />
</head>
<body class="body" style="font-family: Arial!important">
    <table id="main_hdr" cellpadding="0" cellspacing="0" style="display: none; height: 65px; width: 100%; background: url(images/logo_fill.png) repeat-x">
        <tr>
            <td style="background: url(images/logo_left.png) no-repeat left; width: 669px; height: 65px">&nbsp;</td>
            <td id="menu_container" style="text-align: right; vertical-align: middle">
                <span class="bold-caption-white" id="u_name" style="padding-right: 20px">No User Found</span>
                <div class="dropdown" style="width: 110px">
                    <a id="mod_menu_container" class="mainmenu toggle-login">MODULES<span class="menu_toggle">▼</span></a>
                    <div class="submenu">
                        <ul class="menuitems">
                            <li><a href="#" onclick="InitAn();$('#mod_menu_container').trigger('click')">Anomaly Module</a></li>
                            <li id="ref_mnu"><a href="#" onclick="InitRef();$('#mod_menu_container').trigger('click')">Reference Module</a></li>
                            <li><a href="#" onclick="LogoutUser('logout');$('#mod_menu_container').trigger('click')">Logout</a></li>
                            <li><a href="#" onclick="window['e_pane_mdl'].show('south')">About</a></li>
                        </ul>
                    </div>
                </div>
                <div class="dropdown" style="width: 110px">
                    <a id="rpt_menu_container" class="mainmenu toggle-login">REPORTS<span class="menu_toggle">▼</span></a>
                    <div class="submenu">
                        <ul class="menuitems">
                            <li><a href="#" onclick="InitReport('anomaly_list');$('#rpt_menu_container').trigger('click')">Anomalies Summary Report</a></li>
                            <li><a href="#" onclick="InitReport('active_red');$('#rpt_menu_container').trigger('click')">Active Red Anomalies Report</a></li>
                            <li><a href="#" onclick="InitReport('overdue_amber');$('#rpt_menu_container').trigger('click')">Overdue Orange Anomalies Report</a></li>
                            <li><a href="#" onclick="InitReport('overdue_action_items');$('#rpt_menu_container').trigger('click')">Overdue Action Items Report</a></li>
                            <li><a href="#" onclick="InitReport('anomaly_all');$('#rpt_menu_container').trigger('click')">Anomalies By Detail Report</a></li>
                            <li><a href="#" onclick="InitReport('anomaly_reg2', true);$('#rpt_menu_container').trigger('click')">Anomalies Registry Report</a></li>
                            <li><a href="#" onclick="InitReport('anomaly_status_pi');$('#rpt_menu_container').trigger('click')">Anomaly Status Report</a></li>
                            <li><a href="#" onclick="InitReport('anomaly_item_status_pi');$('#rpt_menu_container').trigger('click')">Action Item Status Report</a></li>
                        </ul>
                    </div>
                </div>
                <div class="dropdown" style="width: 100px; display: none">
                    <a class="mainmenu toggle-login">TOOLS<span class="menu_toggle">▼</span></a>
                    <div class="submenu">
                        <ul class="menuitems">
                            <li><a href="#" onclick="InitAn(true)">Lookup Management</a></li>
                            <li><a href="#" onclick="InitRef(true)">User Management</a></li>
                        </ul>
                    </div>
                </div>
            </td>
            <td style="width: 142px; height: 65px; text-align: right">
                <img alt="" src="images/logo_right.png" /></td>
        </tr>
    </table>
    <div id="m_pane_mdl" class="no-scroll display-none">
        <div id="e_pane_mdl" class="pane ui-layout-center no-scroll">
            <div id="e_inner_c_pane" class="pane ui-layout-center no-scroll">
                <div id="an_dt_elm_container" class="datatable-container">
                    <table id="an_dt_elm">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Asset</th>
                                <th>Ref#</th>
                                <th>Equip#</th>
                                <th>Rev#</th>
                                <th>Raised</th>
                                <th>Identified</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Orig</th>
                                <th>Curr</th>
                            </tr>
                        </thead>
                        <tfoot class="datatable-filter">
                            <tr>
                                <td class="text" id="an_dt_iid"></td>
                                <td class="text" id="an_dt_sasset_desc"></td>
                                <td class="text" id="an_dt_sref_no"></td>
                                <td class="text" id="an_dt_sequip_no"></td>
                                <td class="text" id="an_dt_srev_no"></td>
                                <td class="text" id="an_dt_draised_date"></td>
                                <td class="text" id="an_dt_dident_date"></td>
                                <td class="text" id="an_dt_stype_desc"></td>
                                <td class="select" id="an_dt_sstatus_desc"></td>
                                <td class="select" id="an_dt_sorig_act_code"></td>
                                <td class="select" id="an_dt_scurr_act_code"></td>
                            </tr>
                        </tfoot>
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div id="ref_dt_elm_container" class="datatable-container">
                    <table id="ref_dt_elm">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Asset</th>
                                <th>Filename</th>
                                <th>Type</th>
                                <th>Upl Date</th>
                                <th>Path</th>
                                <th>Path Full</th>
                                <th>Group</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                        <tfoot class="datatable-filter">
                            <tr>
                                <td class="text" id="ref_dt_iref_id"></td>
                                <td class="text" id="ref_dt_sasset_desc"></td>
                                <td class="text" id="ref_dt_sfilename"></td>
                                <td class="select" id="ref_dt_stype_desc"></td>
                                <td class="text" id="ref_dt_dupload_date"></td>
                                <td class="select" id="ref_dt_spath_desc"></td>
                                <td class="select" id="ref_dt_spath_full"></td>
                                <td class="select" id="ref_dt_sgroup_desc"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div id="rpt_container" class="datatable-container">
                    <div><a id="h_reports" href="#"\>DOWNLOAD AS EXCEL</a></div>
                    <iframe id="i_reports" style="width: 100%;"></iframe>
                    <%--<div id="i_reports" class="busy-bg">PDF File</div>--%>
                </div>
            </div>
            <div id="e_inner_s_pane" class="pane ui-layout-south">
                <div class="ui-widget-header header">
                    <table cellpadding="0" cellspacing="0" style="font-weight: normal; width: 100%">
                        <tr>
                            <td style="width: 20px"><span class="ui-icon ui-icon-info header-icon-left"></span></td>
                            <td id="asset_desc" class="header-caption">Asset Description</td>
                            <td style="width: 410px">
                                <table id="an_info" cellpadding="0" cellspacing="0" style="width: auto">
                                    <tr>
                                        <td id="ref_cnt" style="width: 130px" class="left-highlight pointer" onmouseover="$(this).addClass('ui-state-highlight')" onmouseout="$(this).removeClass('ui-state-highlight')" onclick="$('#an_dtl_container').tabs('option','active',5)">(0) Ref File Item(s)</td>
                                        <td id="ft_cnt" style="display: none; width: 145px" class="left-highlight pointer" onmouseover="$(this).addClass('ui-state-highlight')" onmouseout="$(this).removeClass('ui-state-highlight')" onclick="$('#an_dtl_container').tabs('option','active',6)">(0) Failure Threat Item(s)</td>
                                        <td id="act_cnt" style="width: 135px" class="left-highlight pointer" onmouseover="$(this).addClass('ui-state-highlight')" onmouseout="$(this).removeClass('ui-state-highlight')" onclick="$('#an_dtl_container').tabs('option','active',7)">(0) Actions Item(s)</td>
                                        <td class="left-highlight">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                            <td style="width: 20px"><span id="dtl_toggle" title="Click to Hide Panel" class="ui-icon ui-icon-pin-s header-icon-right pointer" onclick="TogglePane('dtl_toggle','e_pane_mdl','south')"></span></td>
                        </tr>
                    </table>
                </div>
                <div id="an_dtl_container" style="overflow: hidden">
                    <input type="hidden" value="-1" id="an_asset_id" />
                    <ul class="tab-header">
                        <li><a title="Click to view details tab." href="#an_dtl_tab">Details</a></li>
                        <li><a title="Click to view assessment tab." href="#an_ass_tab">Assessment</a></li>
                        <li><a title="Click to view availability tab." href="#an_avail_tab">Availability</a></li>
                        <li><a title="Click to view recommendations tab." href="#an_rec_tab">Recommendations</a></li>
                        <li><a title="Click to view risk ranking tab." href="#an_rsk_tab">Risk Assessment</a></li>
                        <li><a title="Click to view reference file tab." href="#an_ref_tab">Referencs Files</a></li>
                        <li style="display: none;"><a title="Click to view failure threats tab." href="#an_ft_tab">Failure Threats</a></li>
                        <li><a title="Click to view actions tab." href="#an_act_tab">Action List</a></li>
                    </ul>
                    <div id="an_dtl_tab" class="tab-page">
                        <table cellpadding="0" cellspacing="1" class="tab-page">
                            <tr>
                                <td>Title:</td>
                                <td style="width: 140px">Maintenance Required:</td>
                                <td class="value" style="width: 20px!important" id="maint_reqd">&nbsp;</td>
                                <td style="width: 140px!important">&nbsp;</td>
                            </tr>
                            <tr>
                                <td rowspan="2" class="value">
                                    <div class="td-memo" id="title">&nbsp;</div>
                                </td>
                                <td>Workorder Ref:</td>
                                <td colspan="2" class="value" id="wo_ref">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Workorder Status:</td>
                                <td colspan="2" class="value" id="wo_status">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Description:</td>
                                <td>Equipment Failure:</td>
                                <td class="value" style="width: 20px" id="equip_failure">&nbsp;</td>
                            </tr>
                            <tr>
                                <td class="value" rowspan="4">
                                    <div class="td-memo" id="an_desc">&nbsp;</div>
                                </td>
                                <td id="action_dateHeader">Action Date:</td>
                                <td colspan="2" class="value" id="action_date">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Action Party:</td>
                                <td colspan="2" class="value" id="action_party_name">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Equipment No:</td>
                                <td colspan="2" class="value" id="equip_no">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Identified Date:</td>
                                <td colspan="2" class="value" id="ident_date">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="3">&nbsp;</td>
                            </tr>
                        </table>
                    </div>
                    <div id="an_ass_tab" class="tab-page">
                        <table cellpadding="0" cellspacing="1" class="tab-page">
                            <tr>
                                <td colspan="3">Assessment Details:</td>
                            </tr>
                            <tr>
                                <td rowspan="8" class="value">
                                    <div class="td-memo" id="ass">&nbsp;</div>
                                </td>
                                <td style="width: 140px">Raised By:</td>
                                <td style="width: 160px" class="value" id="raised_by_name">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Raised Date:</td>
                                <td class="value" id="raised_date">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Assessed By:</td>
                                <td class="value" id="ass_by_name">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Assessed Date:</td>
                                <td class="value" id="ass_date">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                        </table>
                    </div>
                    <div id="an_avail_tab" class="tab-page">
                        <table cellpadding="0" cellspacing="1" class="tab-page">
                            <tr>
                                <td colspan="3">Availability Details:</td>
                            </tr>
                            <tr>
                                <td rowspan="8" class="value">
                                    <div class="td-memo" id="avail_comment">&nbsp;</div>
                                </td>
                                <td style="width: 140px">Updated By:</td>
                                <td style="width: 160px" class="value" id="upd_by_name">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Updated Date:</td>
                                <td class="value" id="upd_date">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                        </table>
                    </div>
                    <div id="an_rec_tab" class="tab-page">
                        <table cellpadding="0" cellspacing="1" class="tab-page">
                            <tr>
                                <td colspan="4">Recommendations Details:</td>
                            </tr>
                            <tr>
                                <td rowspan="8" class="value">
                                    <div class="td-memo" id="rcmd" style="width:500px!important;">&nbsp;</div>
                                </td>
                                
                                <td style="width: 80px">TA Approved:</td>
                                <td style="width: 30px" class="value" id="ta_approved"></td>
                                <td style="text-align:center; width: 120px">TA Approved Date:</td>
                                <td class="value" id="ta_approved_date" style="width:320px!important;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>TA Name:</td>
                                <td colspan="3" class="value" id="ta_name">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="4">TA Comments:</td>
                            </tr>
                            <tr>
                               <td colspan="4" rowspan="8" class="value" style="width:250px!important;">
                                    <div class="td-memo" id="TAComments">&nbsp;</div>
                                </td> 
                            </tr>
                            
                            <tr>
                                <td colspan="3">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="3">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="3">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="3">&nbsp;</td>
                            </tr>
                        </table>
                    </div>
                    <div id="an_rsk_tab" class="tab-page" style="overflow: hidden">
                        <div id="tabs_rsk">
                            <ul class="tab-header" style="line-height: 9px; font-size: 10px">
                                <li><a href="#rsk_a">Asset</a></li>
                                <li><a href="#rsk_e">Environment</a></li>
                                <li><a href="#rsk_p">Public Effect</a></li>
                                <li><a href="#rsk_h">Health and Safety</a></li>
                                <li><a href="#rsk_comments">Comments</a></li>
                            </ul>
                            <div id="rsk_a" style="padding: 0; overflow: auto">
                                <table cellpadding="0" cellspacing="1" class="edit center">
                                    <tr>
                                        <td style="width: 290px" class="no-padding shade bold">Consequence / Probability</td>
                                        <td class="shade no-padding small">(A)
                                            <br />
                                            Occured once in 10 years or<br />
                                            longer in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(B)
                                            <br />
                                            Occured once in 5 to
                                            <br />
                                            10 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(C)
                                            <br />
                                            Occured once in 3 to
                                            <br />
                                            5 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(D)
                                            <br />
                                            Occured once in 1 to
                                            <br />
                                            3 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(E)
                                            <br />
                                            Occured several times
                                            <br />
                                            per year in E&amp;P industry
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(0)
                                            <br />
                                            Negligible loss of product
                                            <br />
                                            No equipment damage
                                        </td>
                                        <td class="green rsk-val" id="AA5">&nbsp;</td>
                                        <td class="green rsk-val" id="AB5">&nbsp;</td>
                                        <td class="green rsk-val" id="AC5">&nbsp;</td>
                                        <td class="green rsk-val" id="AD5">&nbsp;</td>
                                        <td class="green rsk-val" id="AE5">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(1)
                                            <br />
                                            Short duration down time equipment damage requiring
                                            <br />
                                            minor repair (could cost up to 1000,000 (USD)
                                        </td>
                                        <td class="green rsk-val" id="AA4">&nbsp;</td>
                                        <td class="green rsk-val" id="AB4">&nbsp;</td>
                                        <td class="green rsk-val" id="AC4">&nbsp;</td>
                                        <td class="orange rsk-val" id="AD4">&nbsp;</td>
                                        <td class="orange rsk-val" id="AE4">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(2)
                                            <br />
                                            Moderate down time, equipment damage requiring
                                            <br />
                                            extensive repair (could cost 100,000-500,000 USD)
                                        </td>
                                        <td class="green rsk-val" id="AA3">&nbsp;</td>
                                        <td class="orange rsk-val" id="AB3">&nbsp;</td>
                                        <td class="orange rsk-val" id="AC3">&nbsp;</td>
                                        <td class="red rsk-val" id="AD3">&nbsp;</td>
                                        <td class="red rsk-val" id="AE3">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(3)
                                            <br />
                                            Significant down time, gas release, fire, major
                                            <br />
                                            damage to equipment (cost could exceed 500,000 USD)
                                        </td>
                                        <td class="green rsk-val" id="AA2">&nbsp;</td>
                                        <td class="orange rsk-val" id="AB2">&nbsp;</td>
                                        <td class="red rsk-val" id="AC2">&nbsp;</td>
                                        <td class="red rsk-val" id="AD2">&nbsp;</td>
                                        <td class="red rsk-val" id="AE2">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(4)
                                            <br />
                                            Long term down time, explosion, equipment
                                            <br />
                                            permanently damaged (cost could exceed 1,000,000 USD)
                                        </td>
                                        <td class="green rsk-val" id="AA1">&nbsp;</td>
                                        <td class="orange rsk-val" id="AB1">&nbsp;</td>
                                        <td class="red rsk-val" id="AC1">&nbsp;</td>
                                        <td class="red rsk-val" id="AD1">&nbsp;</td>
                                        <td class="red rsk-val" id="AE1">&nbsp;</td>
                                    </tr>
                                </table>
                            </div>
                            <div id="rsk_e" style="padding: 0; overflow: auto">
                                <table cellpadding="0" cellspacing="1" class="edit center">
                                    <tr>
                                        <td style="width: 290px" class="no-padding shade bold">Consequence / Probability</td>
                                        <td class="shade no-padding small">(A)
                                            <br />
                                            Occured once in 10 years or<br />
                                            longer in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(B)
                                            <br />
                                            Occured once in 5 to
                                            <br />
                                            10 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(C)
                                            <br />
                                            Occured once in 3 to
                                            <br />
                                            5 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(D)
                                            <br />
                                            Occured once in 1 to
                                            <br />
                                            3 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(E)
                                            <br />
                                            Occured several times
                                            <br />
                                            per year in E&amp;P industry
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(0)
                                            <br />
                                            Negligible loss of containment. Pollution is background
                                            <br />
                                            environment condition requiring No Reponse
                                        </td>
                                        <td class="green rsk-val" id="EA5">&nbsp;</td>
                                        <td class="green rsk-val" id="EB5">&nbsp;</td>
                                        <td class="green rsk-val" id="EC5">&nbsp;</td>
                                        <td class="green rsk-val" id="ED5">&nbsp;</td>
                                        <td class="green rsk-val" id="EE5">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(1)
                                            <br />
                                            Slight loss of containment Trace oilspill less than 1bbL,
                                            <br />
                                            Localised pollution requiring Minor response
                                        </td>
                                        <td class="green rsk-val" id="EA4">&nbsp;</td>
                                        <td class="green rsk-val" id="EB4">&nbsp;</td>
                                        <td class="green rsk-val" id="EC4">&nbsp;</td>
                                        <td class="orange rsk-val" id="ED4">&nbsp;</td>
                                        <td class="orange rsk-val" id="EE4">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(2)
                                            <br />
                                            Minor oil spill less than 150 bbls, Pollution effect surrounding area,
                                            <br />
                                            requiring limited short duration response, within company capability
                                        </td>
                                        <td class="green rsk-val" id="EA3">&nbsp;</td>
                                        <td class="orange rsk-val" id="EB3">&nbsp;</td>
                                        <td class="orange rsk-val" id="EC3">&nbsp;</td>
                                        <td class="red rsk-val" id="ED3">&nbsp;</td>
                                        <td class="red rsk-val" id="EE3">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(3)
                                            <br />
                                            Intermediate oil spill 150>7,500 bbls, Pollution effect surrounding area,
                                            <br />
                                            requiring significant response required and assistant from external
                                        </td>
                                        <td class="green rsk-val" id="EA2">&nbsp;</td>
                                        <td class="orange rsk-val" id="EB2">&nbsp;</td>
                                        <td class="red rsk-val" id="EC2">&nbsp;</td>
                                        <td class="red rsk-val" id="ED2">&nbsp;</td>
                                        <td class="red rsk-val" id="EE2">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(4)
                                            <br />
                                            Major oil spill greater than 7,500 bbls, Pollution effect regional are, requiring
                                            <br />
                                            extended duration, full scale response and National scale assistant
                                        </td>
                                        <td class="green rsk-val" id="EA1">&nbsp;</td>
                                        <td class="orange rsk-val" id="EB1">&nbsp;</td>
                                        <td class="red rsk-val" id="EC1">&nbsp;</td>
                                        <td class="red rsk-val" id="ED1">&nbsp;</td>
                                        <td class="red rsk-val" id="EE1">&nbsp;</td>
                                    </tr>
                                </table>
                            </div>
                            <div id="rsk_p" style="padding: 0; overflow: auto">
                                <table cellpadding="0" cellspacing="1" class="edit center">
                                    <tr>
                                        <td style="width: 290px" class="no-padding shade bold">Consequence / Probability</td>
                                        <td class="shade no-padding small">(A)
                                            <br />
                                            Occured once in 10 years or<br />
                                            longer in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(B)
                                            <br />
                                            Occured once in 5 to
                                            <br />
                                            10 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(C)
                                            <br />
                                            Occured once in 3 to
                                            <br />
                                            5 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(D)
                                            <br />
                                            Occured once in 1 to
                                            <br />
                                            3 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(E)
                                            <br />
                                            Occured several times
                                            <br />
                                            per year in E&amp;P industry
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(0)<br />
                                            No public
                                            <br />
                                            disruption
                                        </td>
                                        <td class="green rsk-val" id="PA5">&nbsp;</td>
                                        <td class="green rsk-val" id="PB5">&nbsp;</td>
                                        <td class="green rsk-val" id="PC5">&nbsp;</td>
                                        <td class="green rsk-val" id="PD5">&nbsp;</td>
                                        <td class="green rsk-val" id="PE5">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(1)<br />
                                            Minimal public disruption
                                            <br />
                                            (on location)
                                        </td>
                                        <td class="green rsk-val" id="PA4">&nbsp;</td>
                                        <td class="green rsk-val" id="PB4">&nbsp;</td>
                                        <td class="green rsk-val" id="PC4">&nbsp;</td>
                                        <td class="orange rsk-val" id="PD4">&nbsp;</td>
                                        <td class="orange rsk-val" id="PE4">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(2)
                                            <br />
                                            Disruption to local community
                                            <br />
                                            (up to Province)
                                        </td>
                                        <td class="green rsk-val" id="PA3">&nbsp;</td>
                                        <td class="orange rsk-val" id="PB3">&nbsp;</td>
                                        <td class="orange rsk-val" id="PC3">&nbsp;</td>
                                        <td class="red rsk-val" id="PD3">&nbsp;</td>
                                        <td class="red rsk-val" id="PE3">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(3)
                                            <br />
                                            Disruption to large community
                                            <br />
                                            (Regional or National interest)
                                        </td>
                                        <td class="green rsk-val" id="PA2">&nbsp;</td>
                                        <td class="orange rsk-val" id="PB2">&nbsp;</td>
                                        <td class="red rsk-val" id="PC2">&nbsp;</td>
                                        <td class="red rsk-val" id="PD2">&nbsp;</td>
                                        <td class="red rsk-val" id="PE2">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(4)
                                            <br />
                                            Disruption to extended community
                                            <br />
                                            (International interest)
                                        </td>
                                        <td class="green rsk-val" id="PA1">&nbsp;</td>
                                        <td class="orange rsk-val" id="PB1">&nbsp;</td>
                                        <td class="red rsk-val" id="PC1">&nbsp;</td>
                                        <td class="red rsk-val" id="PD1">&nbsp;</td>
                                        <td class="red rsk-val" id="PE1">&nbsp;</td>
                                    </tr>
                                </table>
                            </div>
                            <div id="rsk_h" style="padding: 0; overflow: auto">
                                <table cellpadding="0" cellspacing="1" class="edit center">
                                    <tr>
                                        <td style="width: 290px" class="no-padding shade bold">Consequence / Probability</td>
                                        <td class="shade no-padding small">(A)
                                            <br />
                                            Occured once in 10 years or<br />
                                            longer in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(B)
                                            <br />
                                            Occured once in 5 to
                                            <br />
                                            10 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(C)
                                            <br />
                                            Occured once in 3 to
                                            <br />
                                            5 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(D)
                                            <br />
                                            Occured once in 1 to
                                            <br />
                                            3 years in E&amp;P industry
                                        </td>
                                        <td class="shade no-padding small">(E)
                                            <br />
                                            Occured several times
                                            <br />
                                            per year in E&amp;P industry
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(0)<br />
                                            Negligible injury or
                                            <br />
                                            health implications
                                        </td>
                                        <td class="green rsk-val" id="HA5">&nbsp;</td>
                                        <td class="green rsk-val" id="HB5">&nbsp;</td>
                                        <td class="green rsk-val" id="HC5">&nbsp;</td>
                                        <td class="green rsk-val" id="HD5">&nbsp;</td>
                                        <td class="green rsk-val" id="HE5">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(1)<br />
                                            Minor injury / First Aid /
                                            <br />
                                            MTC/ RWC
                                        </td>
                                        <td class="green rsk-val" id="HA4">&nbsp;</td>
                                        <td class="green rsk-val" id="HB4">&nbsp;</td>
                                        <td class="green rsk-val" id="HC4">&nbsp;</td>
                                        <td class="orange rsk-val" id="HD4">&nbsp;</td>
                                        <td class="orange rsk-val" id="HE4">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(2)
                                            <br />
                                            Serious injury or ill health /
                                            <br />
                                            DAFWC
                                        </td>
                                        <td class="green rsk-val" id="HA3">&nbsp;</td>
                                        <td class="orange rsk-val" id="HB3">&nbsp;</td>
                                        <td class="orange rsk-val" id="HC3">&nbsp;</td>
                                        <td class="red rsk-val" id="HD3">&nbsp;</td>
                                        <td class="red rsk-val" id="HE3">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(3)
                                            <br />
                                            Single fatality / multiple DAFWC or
                                            <br />
                                            dangerous infectious diseases
                                        </td>
                                        <td class="green rsk-val" id="HA2">&nbsp;</td>
                                        <td class="orange rsk-val" id="HB2">&nbsp;</td>
                                        <td class="red rsk-val" id="HC2">&nbsp;</td>
                                        <td class="red rsk-val" id="HD2">&nbsp;</td>
                                        <td class="red rsk-val" id="HE2">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td class="no-padding shade small">(4)
                                            <br />
                                            Multiple fatalities or long term
                                            <br />
                                            chronic/terminal illness
                                        </td>
                                        <td class="green rsk-val" id="HA1">&nbsp;</td>
                                        <td class="orange rsk-val" id="HB1">&nbsp;</td>
                                        <td class="red rsk-val" id="HC1">&nbsp;</td>
                                        <td class="red rsk-val" id="HD1">&nbsp;</td>
                                        <td class="red rsk-val" id="HE1">&nbsp;</td>
                                    </tr>
                                </table>
                            </div>
                            <div id="rsk_comments" style="padding: 0">
                                <table cellpadding="0" cellspacing="1" class="tab-page" id="reinhard">
                                    <tr>
                                        <td class="value">
                                            <div class="td-memo" id="ram_comment">&nbsp;</div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div id="an_ref_tab" class="tab-page" style="overflow: hidden">
                        <table cellpadding="0" cellspacing="0" style="width: 100%">
                            <tr>
                                <td>
                                    <table id="an_ref_dt_elm">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Type</th>
                                                <th>Description</th>
                                                <th>Filename</th>
                                                <th>Path</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td style="width: 180px; text-align: center; vertical-align: middle; padding-left: 3px">
                                    <a id="an_ref_file_big" class="preview" href="" target="_blank">
                                        <img id="an_ref_file" alt="" src="images/no_file.png" style="border: 1px solid #c9cdd8; width: 180px; height: 36px; padding: 0; margin: 0" />
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div id="an_ft_tab" class="tab-page">
                        <table id="an_ft_dt_elm">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Code</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="an_act_tab" class="tab-page">
                        <table id="an_act_dt_elm">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Action Description</th>
                                    <th>Action Party</th>
                                    <th>Due Date</th>
                                    <th>Action Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="ref_dtl_container" style="overflow: hidden">
                    <ul class="tab-header">
                        <li><a title="Click to view details tab." href="#ref_dtl_tab">Details</a></li>
                    </ul>
                    <div id="ref_dtl_tab" class="tab-page">
                        <table cellpadding="0" cellspacing="1" class="tab-page">
                            <tr>
                                <td rowspan="2" style="width: 75px">Filename:</td>
                                <td rowspan="2" class="value">
                                    <div class="td-memo" id="ref_filename">&nbsp;</div>
                                </td>
                                <td style="width: 90px">Type:</td>
                                <td style="width: 170px" class="value" id="ref_type">&nbsp;</td>
                                <td rowspan="9" style="width: 180px; text-align: center; vertical-align: middle; padding-left: 3px">
                                    <a id="ref_file_big" class="preview" href="" target="_blank">
                                        <img id="ref_file" alt="" src="images/no_file.png" style="border: 1px solid #c9cdd8; width: 180px; height: 175px; padding: 0; margin: 0" />
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td>Upload Date:</td>
                                <td class="value" id="ref_upload_date">&nbsp;</td>
                            </tr>
                            <tr>
                                <td rowspan="3">Description:</td>
                                <td class="value" rowspan="3">
                                    <div class="td-memo" id="ref_desc">&nbsp;</div>
                                </td>
                                <td>Upload By:</td>
                                <td class="value" id="ref_upload_by">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Update By:</td>
                                <td class="value" id="ref_upd_by">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Update Date:</td>
                                <td class="value" id="ref_upd_date">&nbsp;</td>
                            </tr>
                            <tr>
                                <td rowspan="2">Notes:</td>
                                <td class="value" rowspan="2">
                                    <div class="td-memo" id="ref_notes">&nbsp;</div>
                                </td>
                                <td>Reference No:</td>
                                <td class="value" id="ref_ref_no">&nbsp;</td>
                            </tr>
                            <tr>
                                <td>Group:</td>
                                <td class="value" id="ref_group">&nbsp;</td>
                            </tr>
                            <tr>
                                <td rowspan="2">Path:</td>
                                <td class="value" rowspan="2">
                                    <div class="td-memo" id="ref_path">&nbsp;</div>
                                </td>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="2">&nbsp;</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div id="w_pane_mdl" class="pane ui-layout-west">
            <div id="tree_pane" class="ui-widget-content display-none" style="padding: 5px">
                <div style="line-height: 31px" class="ui-widget-header header">
                    <span id="tree_toggle" title="Click to Hide Panel" class="ui-icon ui-icon-pin-s header-icon-right pointer" onclick="TogglePane('tree_toggle','m_pane_mdl','west')"></span>
                    <span style="font-variant: small-caps; background: url(images/tree.png) no-repeat left; padding-left: 25px; height: 30px">ASSET TREE</span>
                </div>
                <div id="treeview" class="ui-widget-content" style="overflow: auto; padding: 5px"></div>
            </div>
            <div id="asset_info" class="shade display-none" style="margin: 5px 0 5px 0; font-variant: small-caps">
                <div style="background: url(../images/images.png) -16px -32px no-repeat; width: 18px; height: 20px; float: right"></div>
                <table class="tab" style="margin: 6px">
                    <tr>
                        <td class="sta10653">&nbsp;</td>
                        <td id="grn_cnt" style="text-align: right">&nbsp;</td>
                    </tr>
                    <tr>
                        <td class="sta10652">&nbsp;</td>
                        <td id="ora_cnt" style="text-align: right">&nbsp;</td>
                    </tr>
                    <tr>
                        <td class="sta10651">&nbsp;</td>
                        <td id="red_cnt" style="text-align: right">&nbsp;</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td id="asset_ref_cnt" style="text-align: right">&nbsp;</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    <div id="m_pane_tls" class="no-scroll" style="display: none">
        <div id="e_pane_tls" class="pane ui-layout-center no-scroll">
            <div id="lkp_dt_elm_container" class="pane datatable-container no-scroll" style="padding: 5px">
                <table id="lkp_dt_elm">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Code</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tfoot class="datatable-filter">
                        <tr>
                            <td class="text"></td>
                            <td class="text"></td>
                            <td class="text"></td>
                        </tr>
                    </tfoot>
                    <tbody>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div id="w_pane_tls" class="pane ui-layout-west no-scroll" style="border: 2px solid red!important">
            <div id="lkp_grp_dt_elm_container" class="pane datatable-container no-scroll" style="padding: 5px">
                <table id="lkp_grp_dt_elm">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Grp Id</th>
                            <th>Code</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tfoot class="datatable-filter">
                        <tr>
                            <td class="text"></td>
                            <td class="text"></td>
                            <td class="text"></td>
                            <td class="text"></td>
                        </tr>
                    </tfoot>
                    <tbody>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div id="ses_expired" style="display: none">
        <table cellpadding="0" cellspacing="0" style="height: 65px; width: 100%; background-image: url(images/logo_fill.png)!important; background-repeat: repeat-x!important; padding: 0">
            <tr>
                <td style="background: url(images/logo_left.png) no-repeat left; width: 391px"></td>
                <td style="width: 400px"></td>
                <td style="background: url(images/logo_right.png) no-repeat right; width: 140px">&nbsp;</td>
            </tr>
        </table>
        <p style="font-size: 30px; font-style: italic">
            Session Expired
        </p>
        <a href="#">Click here to login again.</a>
    </div>
    <div id="an" title="Update Anomaly" class="ui-widget-content dlg">
        <div style="border: 0; padding: 0; margin: 0">
            <table id="hdr" cellpadding="0" cellspacing="1" class="edit">
                <tr>
                    <td style="width: 60px">Asset:<input type="hidden" id="e_asset_id" /></td>
                    <td class="value" id="e_asset_id_desc">&nbsp;</td>
                    <td>
                        <button class="s d-icons ui-button-icon-primary ui-icon ui-icon-search" onclick="AssetSelectorLoad();"></button>
                    </td>
                    <td style="width: 80px">Revision No:</td>
                    <td style="width: 80px" class="value center" id="e_rev_no">&nbsp;</td>
                    <td style="width: 130px">Original Action Class:<div class="req-ico"></div>
                    </td>
                    <td style="width: 100px; padding-right: 10px!important">
                        <select class="reqd" id="e_orig_act"></select></td>
                </tr>
                <tr>
                    <td>Type:<div class="req-ico"></div>
                    </td>
                    <td style="padding-right: 10px!important">
                        <select class="reqd" id="e_type"></select></td>
                    <td></td>
                    <td>Anomaly No:</td>
                    <td id="e_ref_no" class="value center">&nbsp;</td>
                    <td>Current Action Class:<div class="req-ico"></div>
                    </td>
                    <td style="padding-right: 10px!important">
                        <select class="reqd" id="e_curr_act"></select></td>
                </tr>
                <tr>
                    <td>Raised By:</td>
                    <td id="e_raised_by_name_hdr" class="value">&nbsp;</td>
                    <td></td>
                    <td>Raised Date:</td>
                    <td class="value center" id="e_raised_date_hdr">&nbsp;</td>
                    <td>Action Status:<div class="req-ico"></div>
                    </td>
                    <td style="padding-right: 10px!important">
                        <select class="reqd" id="e_status"></select></td>
                </tr>
            </table>
            <div id="e_tabs" style="display: block; overflow: hidden; margin-top: 3px">
                <ul id="e_tab_names" class="tab-header">
                    <li><a href="#e_dtl_tab">Details</a></li>
                    <li><a href="#e_ass_tab">Assessment</a></li>
                    <li><a href="#e_avail_tab">Availability</a></li>
                    <li><a href="#e_rec_tab">Recommendations</a></li>
                    <li><a href="#e_rsk_tab">Risk Assesment</a></li>
                </ul>
                <div id="e_dtl_tab" class="tab-page">
                    <table cellpadding="0" cellspacing="1" class="edit">
                        <tr>
                            <td style="width: 450px">Title:<div class="req-ico"></div>
                            </td>
                            <td style="width: 130px">Maintenance Required:</td>
                            <td>
                                <input type="checkbox" id="e_maint_reqd" /></td>
                        </tr>
                        <tr>
                            <td rowspan="2" style="padding-right: 10px!important">
                                <textarea cols="10" rows="2" id="e_title" class="reqd"></textarea></td>
                            <td>Work order Ref:</td>
                            <td style="padding-right: 10px!important">
                                <input type="text" id="e_wo_ref" /></td>
                        </tr>
                        <tr>
                            <td>Work order Status:</td>
                            <td style="padding-right: 10px!important">
                                <input type="text" id="e_wo_status" /></td>
                        </tr>
                        <tr>
                            <td>Description:<div class="req-ico"></div>
                            </td>
                            <td>Equipment Failure:</td>
                            <td>
                                <input type="checkbox" id="e_equip_failure" />                              
                            </td>
                        </tr>
                        <tr>
                            <td rowspan="6" style="padding-right: 10px!important">
                                <table cellpadding="0" cellspacing="1" class="edit">
                                    <tr>
                                        <td><textarea cols="10" rows="3" id="e_desc" class="reqd"></textarea></td>
                                    </tr>
                                    <tr>
                                        <td>Deviation:</td>
                                    </tr>
                                    <tr>
                                        <td><select id="e_deviation" disabled="disabled"/></td>
                                    </tr>
                                </table>
                                
                            </td>
                            


                            <td id="e_action_dateHeader">Action Date:</td>
                            <td style="padding-right: 10px!important">
                                <input type="text" id="e_action_date" readonly="readonly" /></td>
                        </tr>
                        <tr>
                            <td>Action Party:</td>
                            <td style="padding-right: 10px!important">
                                <select id="e_action_party" /></td>
                        </tr>
                        <tr>
                            <td>Equipment No:</td>
                            <td style="padding-right: 10px!important">
                                <input type="text" id="e_equip_no" /></td>
                        </tr>
                        <tr>
                            <td>Identified Date:</td>
                            <td style="padding-right: 10px!important">
                                <div class="req-ico"></div>
                                <input type="text" id="e_ident_date" class="reqd" readonly="readonly" /></td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                    </table>
                </div>
                <div id="e_ass_tab" class="tab-page">
                    <table cellpadding="0" cellspacing="1" class="edit">
                        <tr>
                            <td colspan="3">Assessment Details:</td>
                        </tr>
                        <tr>
                            <td rowspan="10" style="padding-right: 10px!important">
                                <input type="hidden" id="e_assessed" value="-1" /><textarea cols="1" rows="11" id="e_ass" onkeypress="$('#e_assessed').val(1)"></textarea></td>
                            <td style="width: 150px">Raised By:<input type="hidden" id="e_raised_by" value="-1" /></td>
                            <td style="width: 200px" id="e_raised_by_name" class="value">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>Raised Date:</td>
                            <td class="value" id="e_raised_date">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>Assessed By:<input type="hidden" id="e_ass_by" value="-1" /></td>
                            <td id="e_ass_by_name" class="value">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>Assessed Date:</td>
                            <td id="e_ass_date" class="value">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                    </table>
                </div>
                <div id="e_avail_tab" class="tab-page">
                    <table cellpadding="0" cellspacing="1" class="edit">
                        <tr>
                            <td colspan="3">Availability Details:</td>
                        </tr>
                        <tr>
                            <td rowspan="10" style="padding-right: 10px!important">
                                <textarea cols="1" rows="11" id="e_avail_comment" onkeypress="UpdateUser('e_upd_by','e_upd_by_name','e_upd_date')"></textarea></td>
                            <td style="width: 150px">Updated By:<input type="hidden" id="e_upd_by" value="-1" /></td>
                            <td style="width: 200px" id="e_upd_by_name" class="value">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>Updated Date:</td>
                            <td class="value" id="e_upd_date">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                    </table>
                </div>
                <div id="e_rec_tab" class="tab-page">
                    <table cellpadding="0" cellspacing="1" class="edit">
                        <tr>
                            <td colspan="4">Recommendations Details:</td>
                        </tr>
                        <tr>
                            <td rowspan="10" style="padding-right: 10px!important; width:455px!important;">
                                <textarea cols="1" rows="11" id="e_rcmd"></textarea>
                            </td>
                           
                            <td style="width: 80px">TA Approved:</td>
                            <td style="width: 50px"><input type="checkbox" id="e_ta_approved" /></td>
                            <td>TA Approved Date:</td>
                            <td colspan="2"><input type="text" id="e_ta_approved_date" readonly="readonly" style="width: 190px" /></td>
                        </tr>
                        <tr>
                            <td>TA Name:<div class="req-ico"></div></td>
                            <td colspan="3" style="padding-right: 4px!important">
                                <select class="reqd" id="e_ta_name"></select></td>
                        </tr>
                        <tr><td colspan="4">TA Comments:</td></tr>
                        <tr>   
                            <td colspan="4" style="padding-right: 10px!important;">
                                <textarea cols="1" rows="6" id="e_TAComments"></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                        <tr>
                            <td colspan="2">&nbsp;</td>
                        </tr>
                    </table>
                </div>
                <div id="e_rsk_tab" class="tab-page" style="overflow: hidden!important">
                    <div id="e_tabs_rsk" style="overflow: hidden">
                        <ul class="tab-header" style="line-height: 9px; font-size: 10px">
                            <li><a href="#e_rsk_a">Asset</a></li>
                            <li><a href="#e_rsk_e">Environment</a></li>
                            <li><a href="#e_rsk_p">Public Effect</a></li>
                            <li><a href="#e_rsk_h">Health and Safety</a></li>
                            <li><a href="#e_rsk_comments">Comments</a></li>
                        </ul>
                        <div id="e_rsk_a" class="tab-page" style="overflow: auto">
                            <input id="e_a_severity" type="hidden" value="" />
                            <input id="e_a_likelihood" type="hidden" value="" />
                            <table cellpadding="0" cellspacing="1" class="edit center">
                                <tr>
                                    <td style="width: 350px" class="no-padding shade bold">Consequence / Probability</td>
                                    <td class="shade no-padding small">(A)
                                        <br />
                                        Occured once in 10 years or<br />
                                        longer in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(B)
                                        <br />
                                        Occured once in 5 to
                                        <br />
                                        10 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(C)
                                        <br />
                                        Occured once in 3 to
                                        <br />
                                        5 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(D)
                                        <br />
                                        Occured once in 1 to
                                        <br />
                                        3 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(E)
                                        <br />
                                        Occured several times
                                        <br />
                                        per year in E&amp;P industry
                                    </td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(0)
                                        <br />
                                        Negligible loss of product
                                        <br />
                                        No equipment damage
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AA5">
                                        <div class="select1"></div>
                                        &nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AB5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AC5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AD5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AE5">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(1)
                                        <br />
                                        Short duration down time equipment damage requiring
                                        <br />
                                        minor repair (could cost up to 1000,000 (USD)
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AA4">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AB4">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AC4">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_AD4">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_AE4">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(2)
                                        <br />
                                        Moderate down time, equipment damage requiring
                                        <br />
                                        extensive repair (could cost 100,000-500,000 USD)
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AA3">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_AB3">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_AC3">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_AD3">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_AE3">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(3)
                                        <br />
                                        Significant down time, gas release, fire, major
                                        <br />
                                        damage to equipment (cost could exceed 500,000 USD)
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AA2">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_AB2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_AC2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_AD2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_AE2">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(4)
                                        <br />
                                        Long term down time, explosion, equipment
                                        <br />
                                        permanently damaged (cost could exceed 1,000,000 USD)
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_AA1">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_AB1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_AC1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_AD1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_AE1">&nbsp;</td>
                                </tr>
                            </table>
                        </div>
                        <div id="e_rsk_e" class="tab-page">
                            <input id="e_e_severity" type="hidden" value="" />
                            <input id="e_e_likelihood" type="hidden" value="" />
                            <table cellpadding="0" cellspacing="1" class="edit center">
                                <tr>
                                    <td style="width: 350px" class="no-padding shade bold">Consequence / Probability</td>
                                    <td class="shade no-padding small">(A)
                                        <br />
                                        Occured once in 10 years or<br />
                                        longer in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(B)
                                        <br />
                                        Occured once in 5 to
                                        <br />
                                        10 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(C)
                                        <br />
                                        Occured once in 3 to
                                        <br />
                                        5 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(D)
                                        <br />
                                        Occured once in 1 to
                                        <br />
                                        3 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(E)
                                        <br />
                                        Occured several times
                                        <br />
                                        per year in E&amp;P industry
                                    </td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(0)
                                        <br />
                                        Negligible loss of containment. Pollution is background
                                        <br />
                                        environment condition requiring No Reponse
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EA5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EB5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EC5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_ED5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EE5">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(1)
                                        <br />
                                        Slight loss of containment Trace oilspill less than 1bbL,
                                        <br />
                                        Localised pollution requiring Minor response
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EA4">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EB4">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EC4">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_ED4">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_EE4">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(2)
                                        <br />
                                        Minor oil spill less than 150 bbls, Pollution effect surrounding area,
                                        <br />
                                        requiring limited short duration response, within company capability
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EA3">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_EB3">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_EC3">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_ED3">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_EE3">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(3)
                                        <br />
                                        Intermediate oil spill 150>7,500 bbls, Pollution effect surrounding area,
                                        <br />
                                        requiring significant response required and assistant from external
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EA2">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_EB2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_EC2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_ED2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_EE2">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(4)
                                        <br />
                                        Major oil spill greater than 7,500 bbls, Pollution effect regional are, requiring
                                        <br />
                                        extended duration, full scale response and National scale assistant
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_EA1">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_EB1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_EC1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_ED1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_EE1">&nbsp;</td>
                                </tr>
                            </table>
                        </div>
                        <div id="e_rsk_p" class="tab-page">
                            <input id="e_p_severity" type="hidden" value="" />
                            <input id="e_p_likelihood" type="hidden" value="" />
                            <table cellpadding="0" cellspacing="1" class="edit center">
                                <tr>
                                    <td style="width: 350px" class="no-padding shade bold">Consequence / Probability</td>
                                    <td class="shade no-padding small">(A)
                                        <br />
                                        Occured once in 10 years or<br />
                                        longer in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(B)
                                        <br />
                                        Occured once in 5 to
                                        <br />
                                        10 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(C)
                                        <br />
                                        Occured once in 3 to
                                        <br />
                                        5 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(D)
                                        <br />
                                        Occured once in 1 to
                                        <br />
                                        3 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(E)
                                        <br />
                                        Occured several times
                                        <br />
                                        per year in E&amp;P industry
                                    </td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(0)<br />
                                        No public
                                        <br />
                                        disruption
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PA5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PB5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PC5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PD5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PE5">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(1)<br />
                                        Minimal public disruption
                                        <br />
                                        (on location)
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PA4">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PB4">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PC4">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_PD4">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_PE4">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(2)
                                        <br />
                                        Disruption to local community
                                        <br />
                                        (up to Province)
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PA3">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_PB3">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_PC3">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_PD3">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_PE3">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(3)
                                        <br />
                                        Disruption to large community
                                        <br />
                                        (Regional or National interest)
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PA2">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_PB2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_PC2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_PD2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_PE2">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(4)
                                        <br />
                                        Disruption to extended community
                                        <br />
                                        (International interest)
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_PA1">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_PB1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_PC1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_PD1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_PE1">&nbsp;</td>
                                </tr>
                            </table>
                        </div>
                        <div id="e_rsk_h" class="tab-page">
                            <input id="e_h_severity" type="hidden" value="" />
                            <input id="e_h_likelihood" type="hidden" value="" />
                            <table cellpadding="0" cellspacing="1" class="edit center">
                                <tr>
                                    <td style="width: 350px" class="no-padding shade bold">Consequence / Probability</td>
                                    <td class="shade no-padding small">(A)
                                        <br />
                                        Occured once in 10 years or<br />
                                        longer in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(B)
                                        <br />
                                        Occured once in 5 to
                                        <br />
                                        10 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(C)
                                        <br />
                                        Occured once in 3 to
                                        <br />
                                        5 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(D)
                                        <br />
                                        Occured once in 1 to
                                        <br />
                                        3 years in E&amp;P industry
                                    </td>
                                    <td class="shade no-padding small">(E)
                                        <br />
                                        Occured several times
                                        <br />
                                        per year in E&amp;P industry
                                    </td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(0)<br />
                                        Negligible injury or
                                        <br />
                                        health implications
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HA5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HB5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HC5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HD5">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HE5">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(1)<br />
                                        Minor injury / First Aid /
                                        <br />
                                        MTC/ RWC
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HA4">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HB4">&nbsp;</td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HC4">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_HD4">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_HE4">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(2)
                                        <br />
                                        Serious injury or ill health /
                                        <br />
                                        DAFWC
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HA3">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_HB3">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_HC3">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_HD3">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_HE3">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(3)
                                        <br />
                                        Single fatality / multiple DAFWC or
                                        <br />
                                        dangerous infectious diseases
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HA2">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_HB2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_HC2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_HD2">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_HE2">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="no-padding shade small">(4)
                                        <br />
                                        Multiple fatalities or long term
                                        <br />
                                        chronic/terminal illness
                                    </td>
                                    <td class="green pointer rsk-val" onclick="SelectRsk($(this))" id="e_HA1">&nbsp;</td>
                                    <td class="orange pointer rsk-val" onclick="SelectRsk($(this))" id="e_HB1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_HC1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_HD1">&nbsp;</td>
                                    <td class="red pointer rsk-val" onclick="SelectRsk($(this))" id="e_HE1">&nbsp;</td>
                                </tr>
                            </table>
                        </div>
                        <div id="e_rsk_comments" class="tab-page">
                            <textarea cols="3" rows="12" id="e_ram_comment" style="width: 800px; font-weight: bold; background-color: #eeeff4; border: 1px solid #cbcdcc"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <div class="req-ico"></div>
            <span style="display: inline; font-size: 9px">Required Fields</span>
        </div>
    </div>
    <div id="ref" title="Update Reference Files" class="ui-widget-content dlg" style="overflow: hidden">
        <form id="fileUploadForm" action="RequestProcessor.ashx?id=upl_file" method="post" enctype="multipart/form-data">
            <div class="ui-widget-content" style="padding: 5px">
                <table id="ref_hdr" cellpadding="0" cellspacing="1" class="edit">
                    <tr>
                        <td style="width: 80px">Filename:<div class="req-ico"></div>
                        </td>
                        <td id="e_ref_filename_container">
                            <input type="file" id="e_ref_filename" name="e_ref_filename" />
                        </td>
                        <td style="width: 120px">Type:<div class="req-ico"></div>
                        </td>
                        <td style="width: 180px; padding-right: 10px!important">
                            <select id="e_ref_type" class="reqd"></select></td>
                    </tr>
                    <tr>
                        <td>Asset:<div class="req-ico"></div>
                            <input id="e_ref_asset_id" type="hidden" /></td>
                        <td class="value" id="e_ref_asset_id_desc">&nbsp;</td>
                        <td>Reference No:</td>
                        <td>
                            <input type="text" id="e_ref_ref_no" /></td>
                    </tr>
                    <tr>
                        <td rowspan="2">Description:<div class="req-ico"></div>
                        </td>
                        <td rowspan="2" style="padding-right: 10px!important">
                            <textarea cols="2" rows="2" id="e_ref_desc" class="reqd"></textarea>
                        </td>
                        <td>Path:<div class="req-ico"></div>
                            <input type="hidden" id="e_ref_path_desc" /></td>
                        <td style="padding-right: 10px!important">
                            <select class="reqd" id="e_ref_path"></select></td>
                    </tr>
                    <tr>
                        <td>Upload By<input id="e_ref_upload_by" type="hidden" />:</td>
                        <td class="value" id="e_ref_upload_by_name">&nbsp;</td>
                    </tr>
                    <tr>
                        <td rowspan="4">Notes:</td>
                        <td rowspan="4" style="padding-right: 10px!important">
                            <textarea cols="2" rows="4" id="e_ref_notes"></textarea>
                        </td>
                        <td>Upload Date:</td>
                        <td class="value" id="e_ref_upload_date">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>Updated By:<input id="e_ref_upd_by" type="hidden" /></td>
                        <td class="value" id="e_ref_upd_by_name">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>Update Date:</td>
                        <td class="value" id="e_ref_upd_date">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>Group;</td>
                        <td style="padding-right: 10px!important">
                            <select id="e_ref_group"></select></td>
                    </tr>
                </table>
            </div>
            <div class="req-ico"></div>
            <span style="display: inline; font-size: 9px">Required Fields</span>
        </form>
    </div>
    <div id="an_ft" title="Update Failure Threats" class="ui-widget-content dlg">
        <div class="ui-widget-content" style="padding: 5px">
            <table id="an_ft_hdr" cellpadding="0" cellspacing="1" class="edit">
                <tr>
                    <td style="width: 80px">Failure Threat:<div class="req-ico"></div>
                    </td>
                    <td class="padding-r-select">
                        <select class="reqd" id="e_an_ft"></select></td>
                </tr>
                <tr>
                    <td>Type:<div class="req-ico"></div>
                    </td>
                    <td rowspan="2" class="value" id="e_an_ft_type">&nbsp;</td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                </tr>
            </table>
        </div>
        <div class="req-ico"></div>
        <span style="display: inline; font-size: 9px">Required Fields</span>
    </div>
    <div id="an_act" title="Update Anomaly Action Items" class="ui-widget-content dlg">
        <div class="ui-widget-content" style="padding: 5px">
            <table id="an_act_hdr" cellpadding="0" cellspacing="1" class="edit">
                <tr>
                    <td style="width: 80px">Description:<div class="req-ico"></div>
                    </td>
                    <td rowspan="3" style="padding-right: 10px">
                        <textarea class="reqd" cols="2" rows="3" id="e_act_desc" style="height: 60px"></textarea>
                    </td>
                    <td style="width: 85px">Action Party:<div class="req-ico"></div>
                    </td>
                    <td class="padding-r-select" style="width: 200px">
                        <select class="reqd" id="e_act_party"></select></td>
                </tr>
                <tr>
                    <td colspan="2">&nbsp;</td>
                    <td>Due Date:<div class="req-ico"></div>
                    </td>
                    <td>
                        <input type="text" class="reqd" id="e_act_due_date" /></td>
                </tr>
                <tr>
                    <td colspan="2">&nbsp;</td>
                    <td>Action Status:<div class="req-ico"></div>
                    </td>
                    <td class="padding-r-select">
                        <select class="reqd" id="e_act_status"></select></td>
                </tr>
            </table>
        </div>
        <div class="req-ico"></div>
        <span style="display: inline; font-size: 9px">Required Fields</span>
    </div>
    <div id="ref_an" title="Link Reference To Anomaly" class="ui-widget-content dlg">
        <div class="ui-widget-content" style="padding: 5px">
            <table id="ref_an_hdr" cellpadding="0" cellspacing="1" class="edit">
                <tr>
                    <td colspan="2">Reference File To Link</td>
                </tr>
                <tr>
                    <td style="width: 140px">Filename:</td>
                    <td id="ref_an_filename" class="value">&nbsp;</td>
                </tr>
                <tr>
                    <td>Description:</td>
                    <td class="value" rowspan="2">
                        <div id="ref_an_desc" style="overflow: auto">&nbsp;</div>
                    </td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="2">Anomaly File to Link:</td>
                </tr>
                <tr>
                    <td>Anomaly Reference No:<div class="req-ico"></div>
                    </td>
                    <td class="padding-r-select">
                        <select class="reqd" id="ref_an_ref_no"></select></td>
                </tr>
                <tr>
                    <td>Title</td>
                    <td id="ref_an_title" class="value" rowspan="2">&nbsp;</td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                </tr>
            </table>
        </div>
        <br />
        <div class="req-ico"></div>
        <span style="display: inline; font-size: 9px">Required Fields</span>
    </div>
    <div id="lkp" title="New/Update Lookup Group" class="ui-widget-content dlg" style="display: none">
        <div class="ui-widget-content" style="padding: 5px">
            <table id="ref_an_hdr_old" cellpadding="0" cellspacing="1" class="edit">
                <tr>
                    <td style="width: 100px">Code:</td>
                    <td>
                        <input type="text" id="e_lkp_desc_a" /></td>
                </tr>
                <tr>
                    <td style="width: 100px">Description:</td>
                    <td>
                        <input type="text" id="e_lkp_desc_b" /></td>
                </tr>
            </table>
        </div>
    </div>
    <div id="filter_dlg" title="Filter List" class="ui-widget-content dlg">
        <table cellpadding="0" cellspacing="1" class="edit">
            <tr>
                <td style="width: 75px">Filter by:</td>
                <td rowspan="2">
                    <textarea id="filter_text" rows="10" cols="10" style="width: 100%; height: 100%"></textarea>
                    <div id="buttonPlaceholder" style="float: left; display: inline-block; position: absolute">
                    </div>
                </td>
            </tr>
            <tr>
                <td></td>
            </tr>
        </table>
    </div>
    <div id="rpt" title="Print Anomaly Record" class="ui-widget-content dlg">
        <div style="border: 0; padding: 0; margin: 0">
            <iframe id="i_reports_dlg"></iframe>
        </div>
    </div>
    <div id="tree_select_dlg" title="Asset Select" class="ui-widget-content dlg">
        <input type="hidden" id="i_sel_asset_id" />
        <input type="hidden" id="i_sel_asset_desc" />
        <div id="tree_sel" class="ui-widget-content" style="overflow: auto; padding: 5px"></div>
    </div>
    <script type="text/javascript" src="scripts/jquery.js"></script>
    <script type="text/javascript" src="scripts/main.js"></script>
    <script type="text/javascript" charset="utf-8">$(document).ready(function () { InitPageTitle(); DispCurrUser(true) });</script>
</body>
</html>
