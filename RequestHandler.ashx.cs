using AnomDB.Domain;
using Microsoft.Reporting.WebForms;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Web;
using System.Web.SessionState;
using System.Net.Mail;


namespace AnomDB
{
    /// <summary>
    /// Summary description for RequestHandler
    /// </summary>
    public class RequestHandler : IHttpHandler, IReadOnlySessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "application/json";

            //
            // Apply GZIP compression (or DEFLATE)
            //
            context.Response.Filter = new GZipStream(context.Response.Filter, CompressionMode.Compress);
            context.Response.AddHeader("Content-Encoding", "gzip");

            context.Response.Cache.SetCacheability(HttpCacheability.ServerAndNoCache);
            context.Response.Cache.SetMaxAge(new TimeSpan(0, 60, 0));
            context.Response.Cache.VaryByParams.IgnoreParams = true;
            context.Response.Cache.SetSlidingExpiration(true);

            var q = context.Request.QueryString;
            if (q["id"] != null)
            {
                string ret = "{\"success\":true}";
                string data_id = q["id"].ToLower();
                string s_key_1, s_key_2, s_key_3, s_key_4 = null;
                string[] cols = null;
                int i_key_1, i_key_2 = -1;

                DataRow[] drs;
                DataSet ds = null;
                DataTable dt = null;
                DataRow dr = null;

                string filter = string.Empty;

                bool pass_single_login_tmp;
                bool pass_single_login = bool.TryParse(q["pass"], out pass_single_login_tmp);
                if (!pass_single_login)
                {
                    bool single_login = DataAccess.AuthenticateSingleLogin(context);
                    if (!single_login)
                    {
                        context.Response.Write("{\"single_login\":\"" + single_login + "\"}");
                        //_completed = true;
                        //  _callback(this);
                        return;
                    }
                }


                switch (data_id)//Construct appropraite LINQ statement based from caller
                {
                    case "del_an_act": { 
                        i_key_1 = int.Parse(q["an_id"]);
                        i_key_2 = int.Parse(q["act_id"]);

                        ret = "{\"r\":" + DataAccess.DelAnLink("an_id", "id", i_key_1, i_key_2, "anomaly_action_items", "anomaly_action_items_view").ToString() + "}";
                        break;
                        }
                    case "file_exists":
                        {
                            s_key_1 = q["fname"];
                            if (!File.Exists(context.Server.MapPath(s_key_1))) ret = "{\"r\":" + "-1" + "}";
                            //if (!File.Exists(context.Request.ApplicationPath + s_key_1)) ret = "-1";
                            else ret = "{\"r\":" + "1" + "}";

                            break;
                        }
                    case "upl_file":
                        {
                        s_key_1 = HttpUtility.UrlDecode(q["path"]);
                        ret = "{\"r\":" + AnomDB.Domain.FileUpload.Uploadfile(context, s_key_1) + "}";
                        break;
                        }
                    case "asset_i_cnt":
                        {
                            s_key_1 = q["loc"];

                            ret = "{";
                            ret += "\"red\":" + DataAccess.FilterCount("SELECT COUNT(1) FROM anomalies_view WHERE curr_act=10651 " +
                                "AND [location] LIKE '" + s_key_1 + "%'").ToString() + ",";
                            ret += "\"ora\":" + DataAccess.FilterCount("SELECT COUNT(1) FROM anomalies_view WHERE curr_act=10652 " +
                                "AND [location] LIKE '" + s_key_1 + "%'").ToString() + ",";
                            ret += "\"grn\":" + DataAccess.FilterCount("SELECT COUNT(1) FROM anomalies_view WHERE curr_act=10653 " +
                                "AND [location] LIKE '" + s_key_1 + "%'").ToString();
                            ret += "}";
                            break;
                        }
                    case "by_ref_cnt":
                        {
                            s_key_1 = q["loc"];
                            ret = "{\"r\":" + DataAccess.FilterCount("SELECT COUNT(1) FROM reference_files_view WHERE [location] LIKE '" + s_key_1 + "%'").ToString() + "}";
                            break;
                        }
                    case "an_i_cnt":
                        {
                            s_key_1 = q["an_id"];

                            ret = "{";
                            ret += "\"ref\":" + DataAccess.FilterCount("SELECT COUNT(1) FROM [anomaly_reference_view] WHERE [an_id]=" +
                                s_key_1 + "").ToString() + ",";
                            ret += "\"ft\":" + DataAccess.FilterCount("SELECT COUNT(1) FROM [anomaly_failure_threats_view] WHERE [an_id]=" +
                                s_key_1 + "").ToString() + ",";
                            ret += "\"act\":" + DataAccess.FilterCount("SELECT COUNT(1) FROM [anomaly_action_items_view] WHERE [an_id]=" +
                                s_key_1 + "").ToString();
                            ret += "}";
                            break;
                        }
                    case "lkp_2":
                       {
                            s_key_1 = q["tbl"];
                            s_key_2 = q["ret_1"];
                            s_key_3 = q["ret_2"];
                            s_key_4 = q["filter"];
                            if (string.IsNullOrEmpty(s_key_3)) s_key_3 = s_key_2;
                            dt = DataAccess.TableLookup(s_key_1, s_key_2, s_key_3, s_key_4);
                            ret = DataAccess.GetJSON(dt, new string[] { s_key_2, s_key_3 });

                            break;               
                       }
                    case "ta_lkp":
                       {
                          
                           dt = DataAccess.TableLookup("qry_ta", "user_id", "user_name","");
                           ret = DataAccess.GetJSON(dt, new string[] { "user_id", "user_name" });

                           break;
                       }
                    case "deviation_lkp":
                       {

                           dt = DataAccess.TableLookup("QRY_VALID_DEV_DETAILS", "DevId", "DevTitle", "");
                           ret = DataAccess.GetJSON(dt, new string[] { "DevId", "DevTitle" });

                           break;
                       }

                    case "deviation_valdate":
                       {

                           s_key_1 = q["dev_id"];


                           i_key_1 = int.Parse(q["dev_id"]);

                           ret = "{\"r\":\"" + DataAccess.TableValue("QRY_VALID_DEV_DETAILS", "DevTo",
                               "DevId=" + i_key_1.ToString()).ToString() + "\"}";
                           break;


                       }
                    case "curr_user":
                       {
                           ret = "{\"u_id\":" + context.Session["user_id"].ToString() +
                               ",\"u_name\":\"" + context.Session["user_name"].ToString() + "\"" + 
                               ",\"u_rights\":\"" + context.Session["user_rights"].ToString() + "\"}";
                           break;
                       }
                    case "page_title":
                       {
                           ret = "{\"r\":\"" +
                               ConfigurationManager.AppSettings["CompanyInitial"] + "-" + ConfigurationManager.AppSettings["ApplicationName"]
                                + "\"}";
                           break;
                       }
                    case "del_ref":
                       {
                       i_key_1 = int.Parse(q["ref_id"]);

                       ret = "{\"r\":" + DataAccess.DeleteRecord("id", i_key_1, "reference_files",
                           "reference_files_view").ToString() + "}";
                       break;
                       }
                    case "add_an_ref":
                       {
                       i_key_1 = int.Parse(q["an_id"]);
                       i_key_2 = int.Parse(q["ref_id"]);

                       ret = "{\"r\":" + DataAccess.AddAnLink("an_id", "ref_id", i_key_1,
                           i_key_2, "lnk_anomaly_reference", "anomaly_reference_view").ToString() + "}";
                       break;
                       }
                    case "del_an_ref":
                       {
                       i_key_1 = int.Parse(q["an_id"]);
                       i_key_2 = int.Parse(q["ref_id"]);

                       ret = "{\"r\":" + DataAccess.DelAnLink("an_id", "ref_id", i_key_1, i_key_2,
                           "lnk_anomaly_reference", "reference_files_view").ToString() + "}";
                       break;
                       }
                    case "add_an_ft":
                        {
                      i_key_1 = int.Parse(q["an_id"]);
                       i_key_2 = int.Parse(q["ft_id"]);

                       ret = "{\"r\":" + DataAccess.AddAnLink("an_id", "ft_id", i_key_1, i_key_2,
                           "lnk_anomaly_failure_threats", "anomaly_failure_threats_view").ToString() + "}";
                       break;
                       }
                    case "del_an_ft":
                       {
                       i_key_1 = int.Parse(q["an_id"]);
                       i_key_2 = int.Parse(q["ft_id"]);

                       ret = "{\"r\":" + DataAccess.DelAnLink("an_id", "ft_id", i_key_1, i_key_2,
                           "lnk_anomaly_failure_threats", "anomaly_failure_threats_view").ToString() + "}";
                       break;
                       }
                    case "an_act":
                        {
                      s_key_1 = q["act_id"];
                       cols = new string[] { "desc", "act_party", 
                                                "due_date", "act_status" };


                       dr = DataAccess.GetDataRow("anomaly_action_items_view", string.Join(",", cols),
                           DataAccess.DataSetCache().Tables["anomaly_action_items_view"].PrimaryKey[0].ColumnName + "=" + s_key_1);

                       ret = DataAccess.GetJSON(dr, cols, null);
                       break;
                       }
                    case "upd_an_act":
                       {
                       i_key_1 = int.Parse(q["act_id"]);
                       Dictionary<string, string> act_data = new Dictionary<string, string>();
                       act_data["an_id"] = q["an_id"];
                       act_data["desc"] = q["desc"];
                       act_data["act_party"] = q["act_party"];
                       act_data["due_date"] = q["due_date"];
                       act_data["act_status"] = q["act_status"];

                       if (i_key_1 == -1) ret = "{\"r\":" + DataAccess.AddActionItems(act_data).ToString() + "}";
                       else ret = "{\"r\":" + DataAccess.UpdateActionItems(i_key_1, act_data).ToString() + "}";

                       break;
                       }
                    case "row_val":
                       {
                       s_key_1 = q["tbl"];
                       s_key_2 = q["ret_col"];
                       s_key_3 = q["filter"];

                       ret = "{\"r\":\"" + DataAccess.TableValue(s_key_1, s_key_2, s_key_3).ToString() + "\"}";
                       break;
                       }
                    case "rel_path":
                       {
                       ret = "{\"path\":\"" + context.Request.ApplicationPath + "\"}";
                       break;
                       }
                    case "svr_date":
                       {
                       ret = "{\"curr_date\":\"" + DateTime.Now.ToString() + "\"}";
                       break;
                       }
                    case "an_list_param":
                       {
                       s_key_1 = q["an_id"];
                       filter = "[id] IN (" + s_key_1 + ")";

                       ret = DataAccess.GetJSON("anomalies_view", "id", context,
                           new string[] { 
                                                "id", "asset_desc",  "ref_no", "equip_no", "rev_no", "raised_date", 
                                                "ident_date", "type_desc", "status_desc", "orig_act_code", "curr_act_code" }, filter);

                       break;
                       }
                    case "an_list":
                       {
                       s_key_1 = HttpUtility.UrlDecode(q["asset_loc"]);
                       i_key_1 = int.Parse(q["open_anom"]);
                       filter = "location LIKE '" + s_key_1 + "%'";

                       //Get OPEN anomalies on default.
                       if (i_key_1 == 0) filter += " AND [status] = 9100";

                       ret = DataAccess.GetJSON("anomalies_view", "id", context,
                           new string[] { 
                                                "id", "asset_desc",  "ref_no", "equip_no", "rev_no", "raised_date", 
                                                "ident_date", "type_desc", "status_desc", "orig_act_code", "curr_act_code" }, filter);

                       break;
                       }

                    case "lkp_grp_list":
                       {
                           filter = "lkp_grp_id=1";

                           ret = DataAccess.GetJSON("sys_lookups", "lkp_id", context, new string[] { 
                                                "lkp_id", "lkp_grp_id", "lkp_desc_a", "lkp_desc_b" }, filter);

                           break;
                       }
                    case "lkp_list":
                       {
                           s_key_1 = HttpUtility.UrlDecode(q["lkp_grp_id"]);
                           filter = "lkp_grp_id=" + s_key_1;

                           ret = DataAccess.GetJSON("sys_lookups", "lkp_id", context, new string[] { "lkp_id", 
                                                "lkp_desc_a", "lkp_desc_b" }, filter);

                           break;
                       }
                    case "ref_list":
                       {
                           s_key_1 = HttpUtility.UrlDecode(q["asset_loc"]);
                           filter = "location LIKE '" + s_key_1 + "%'";

                           ret = DataAccess.GetJSON("reference_files_view", "ref_id", context,
                               new string[] { 
                                                "ref_id", "asset_desc", "filename", "type_desc", "upload_date", 
                                                "path_desc", "path_full", "group_desc" }, filter);
                          
                           break;
                       }

                    case "an_ref_list":
                       {
                           s_key_1 = q["an_id"];
                           filter = "an_id = " + s_key_1 + "";

                           ret = DataAccess.GetJSON("anomaly_reference_view", "ref_id", context,
                               new string[] { "ref_id", "type_desc", "desc", "filename", "path_full" }, filter);

                           break;
                       }
                    case "an_ft_list":
                       {
                           s_key_1 = q["an_id"];
                           filter = "an_id = " + s_key_1 + "";

                           ret = DataAccess.GetJSON("anomaly_failure_threats_view", "ft_id", context,
                               new string[] { "ft_id", "ft_code", "desc", "ft_type" }, filter);

                           break;
                       }
                    case "an_act_list":
                       {
                           s_key_1 = q["an_id"];
                           filter = "an_id = " + s_key_1 + "";

                           ret = DataAccess.GetJSON("anomaly_action_items_view", "act_id", context,
                               new string[] { "act_id", "desc", "act_party_name", "due_date", "act_status_desc" },
                               filter);

                           break;
                       }
                    case "row_locked":
                       {
                           s_key_1 = q["tbl"];
                           i_key_1 = int.Parse(q["row_id"]);

                           ret = "{\"r\":\"-1\"}";

                           foreach (KeyValuePair<int, DataAccess.LockedRecords> item in
                               (Dictionary<int, DataAccess.LockedRecords>)context.Application["locked_records"])
                           {
                               if ((item.Value.table == s_key_1) && (item.Key == i_key_1))
                                   ret = "{\"r\":\"0\"}";
                           }

                           break;
                       }
                    case "lock_row":
                       {
                           s_key_1 = q["tbl"];
                           i_key_1 = int.Parse(q["row_id"]);

                           DataAccess.LockedRecords locked_records = new DataAccess.LockedRecords();
                           locked_records.table = s_key_1;
                           locked_records.row_id = i_key_1;
                           break;
                       }
                    case "init_session":
                       {
                           ret = "{\"r\":" + context.Session.Timeout.ToString() + "}";
                           break;
                       }

                    case "an_dtl":
                       {
                           s_key_1 = q["an_id"];
                           //20190624 Neo Comment replace by the code below
                           //cols = new string[] {
                           //                     "title", "maint_reqd", "desc", "wo_ref", "wo_status", "equip_failure", "action_date", 
                           //                     "action_party_name", "equip_no", "ident_date", "asset_id"};
                           cols = new string[] {
                                                "title", "maint_reqd", "desc", "wo_ref", "wo_status", "equip_failure", "action_date", 
                                                "action_party_name", "equip_no", "ident_date", "asset_id", "status", "curr_act"};

                           dr = DataAccess.GetDataRow("anomalies_view", string.Join(",", cols),
                               DataAccess.DataSetCache().Tables["anomalies_view"].PrimaryKey[0].ColumnName + "=" + s_key_1);

                           ret = DataAccess.GetJSON(dr, cols, null);

                           break;
                       }
                    case "an_ass":
                       {
                           s_key_1 = q["an_id"];
                           cols = new string[] { 
                                                "ass", "raised_by_name", "raised_date", "ass_by_name", "ass_date", "asset_id"};


                           dr = DataAccess.GetDataRow("anomalies_view", string.Join(",", cols),
                               DataAccess.DataSetCache().Tables["anomalies_view"].PrimaryKey[0].ColumnName + "=" + s_key_1);

                           ret = DataAccess.GetJSON(dr, cols, null);
                           break;
                       }
                    case "an_avail":
                       {
                           s_key_1 = q["an_id"];
                           cols = new string[] { "avail_comment", "upd_by_name", "upd_date", "asset_id" };


                           dr = DataAccess.GetDataRow("anomalies_view", string.Join(",", cols),
                               DataAccess.DataSetCache().Tables["anomalies_view"].PrimaryKey[0].ColumnName + "=" + s_key_1);

                           ret = DataAccess.GetJSON(dr, cols, null);

                           break;
                       }
                    case "an_rsk":
                       {
                           s_key_1 = q["an_id"];
                           cols = new string[] { 
                                                "ram_comment", "a_severity", "a_likelihood", "e_severity", "e_likelihood", "p_severity", "p_likelihood", 
                                            "h_severity", "h_likelihood", "asset_id"};


                           dr = DataAccess.GetDataRow("anomalies_view", string.Join(",", cols),
                               DataAccess.DataSetCache().Tables["anomalies_view"].PrimaryKey[0].ColumnName + "=" + s_key_1);

                           ret = DataAccess.GetJSON(dr, cols, null);

                           break;
                       }
                    case "an_rec":
                       {
                           s_key_1 = q["an_id"];
                           cols = new string[] { 
                                                "rcmd", "ta_approved", "ta_name_name", "ta_approved_date", "ta_comments", "asset_id"};

                           ds = (AnomalyDS)DataAccess.DataSetCache();
                           dr = DataAccess.GetDataRow("anomalies_view", string.Join(",", cols),
                               DataAccess.DataSetCache().Tables["anomalies_view"].PrimaryKey[0].ColumnName + "=" + s_key_1);

                           ret = DataAccess.GetJSON(dr, cols, null);

                           break;
                       }
                    case "ref_hdr":
                       {
                           s_key_1 = q["ref_id"];
                           cols = new string[] { "desc", "type", "type_desc", "upload_date", 
                                                "upload_by", "upload_by_name", "ref_no", "filename", "path", 
                                                "path_desc", "upd_date", "upd_by", "upd_by_name", "notes", 
                                                "asset_id", "asset_desc", "group", "group_desc", "path_full" };

                           ds = (AnomalyDS)DataAccess.DataSetCache();
                           dr = DataAccess.GetDataRow("reference_files_view", string.Join(",", cols),
                               DataAccess.DataSetCache().Tables["reference_files_view"].PrimaryKey[0].ColumnName + "=" + s_key_1);

                           ret = DataAccess.GetJSON(dr, cols, null);

                           break;
                       }
                    case "ref":
                       {
                           s_key_1 = q["ref_id"];
                           filter = "ref_id = " + s_key_1 + "";

                           ret = DataAccess.GetJSON("reference_files_view", "id", context,

                             new string[] { "ref_id", "desc", "type", "upload_date", "upload_by_name", 
                                                    "ref_no", "filename", "path", "asset_id", 
                                                    "upd_by_name", "upd_date", "notes" }, filter);
                           break;
                       }
                    case "tree":
                       {
                           i_key_1 = int.Parse(q["par_id"]);

                           drs = DataAccess.TreeView(i_key_1);
                           ret =
                               DataAccess.GetJSON(drs, new string[] { "id", "location", "code", "desc", 
                                                    "color", "child_cnt" }, new string[] { "location" });

                           break;
                       }
                    case "refresh_tree":
                       {
                           i_key_1 = Int32.Parse(q["asset_id"]);
                           i_key_2 = Int32.Parse(q["color"]);

                           //ds = (AnomalyDS)DataAccess.DataSetCache();
                           //DataAccess.ReInitTreeView(i_key_1, i_key_2, context);
                           DataAccess.InitTreeView(context);

                           drs = DataAccess.TreeView();
                           ret =
                               DataAccess.GetJSON(drs, new string[] { "id", "color" }, null);
                           break;
                       }
                    case "lkp":
                       {
                           s_key_1 = q["grp_id"];

                           ret = DataAccess.GetJSON(DataAccess.DataSetCache().Tables["sys_lookups"].Select("lkp_grp_id=" + s_key_1 + " AND lkp_id<>10654"), new string[] { "lkp_id", "lkp_desc_b" });

                           break;
                       }
                    case "user_list": //Users list
                       {
                           ret = DataAccess.GetJSON(DataAccess.DataSetCache().Tables["users"], new string[] { "user_id", "user_name" });

                           break;
                       }

                    case "nEmailTA": //Neo Mail for TA
                       {
                           MailMessage msg = new MailMessage();
                           HttpContext ctx = HttpContext.Current;
                           msg.To.Add(new MailAddress("neopuavin@sogatech.net"));
                           msg.From = new MailAddress("do.not.reply.trisco.auto.email@gmail.com");
                           msg.Subject = "For TA review and Approval";
                           msg.Priority = MailPriority.High;
                           msg.Body = "Hey dude";

                           //CONFIGURE SMTP OBJECT
                           SmtpClient smtp = new SmtpClient("smtp.gmail.com");

                           //SEND EMAIL
                           smtp.Send(msg);

                           break;
                       }
                    case "upd_an":
                       {
                           i_key_1 = int.Parse(context.Request.Params["an_id"]);
                           Dictionary<string, string> an_data = new Dictionary<string, string>();
                           an_data["asset_id"] = context.Request.Params["asset_id"];
                           an_data["type"] = context.Request.Params["type"];
                           an_data["orig_act"] = context.Request.Params["orig_act"];
                           an_data["curr_act"] = context.Request.Params["curr_act"];
                           an_data["status"] = context.Request.Params["status"];
                           an_data["rev_no"] = context.Request.Params["rev_no"];
                           an_data["title"] = context.Request.Params["title"];
                           an_data["ident_date"] = context.Request.Params["ident_date"];
                           an_data["desc"] = context.Request.Params["desc"];
                           an_data["equip_failure"] = (context.Request.Params["equip_failure"]);
                           an_data["action_date"] = context.Request.Params["action_date"];
                           an_data["action_party"] = context.Request.Params["action_party"];
                           an_data["equip_no"] = context.Request.Params["equip_no"];
                           an_data["maint_reqd"] = (context.Request.Params["maint_reqd"]);
                           an_data["wo_ref"] = context.Request.Params["wo_ref"];
                           an_data["wo_status"] = context.Request.Params["wo_status"];
                           an_data["ass"] = context.Request.Params["ass"];
                           an_data["raised_by"] = context.Request.Params["raised_by"];
                           an_data["raised_date"] = context.Request.Params["raised_date"];
                           an_data["ass_by"] =
                               (context.Request.Params["assessed"] == "-1" ? context.Request.Params["ass_by"] : context.Session["user_id"].ToString());
                           an_data["ass_date"] =
                               (context.Request.Params["assessed"] == "-1" ? context.Request.Params["ass_date"] : DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss"));
                           an_data["upd_by"] = (i_key_1 == -1 ? "NULL" : context.Session["user_id"].ToString());
                           an_data["upd_date"] = (i_key_1 == -1 ? "NULL" : DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss"));
                           an_data["rcmd"] = context.Request.Params["rcmd"];
                           an_data["ta_approved"] = (context.Request.Params["ta_approved"]);
                           an_data["ta_name"] = context.Request.Params["ta_name"];
                           an_data["ta_approved_date"] = context.Request.Params["ta_approved_date"];
                           an_data["ta_comments"] = context.Request.Params["ta_comments"];
                           an_data["a_severity"] = context.Request.Params["a_severity"];
                           an_data["a_likelihood"] = context.Request.Params["a_likelihood"];
                           an_data["e_severity"] = context.Request.Params["e_severity"];
                           an_data["e_likelihood"] = context.Request.Params["e_likelihood"];
                           an_data["p_severity"] = context.Request.Params["p_severity"];
                           an_data["p_likelihood"] = context.Request.Params["p_likelihood"];
                           an_data["h_severity"] = context.Request.Params["h_severity"];
                           an_data["h_likelihood"] = context.Request.Params["h_likelihood"];
                           an_data["ram_comment"] = context.Request.Params["ram_comment"];
                           an_data["avail_comment"] = context.Request.Params["avail_comment"];
                           an_data["anom_dev_id"] = context.Request.Params["anom_dev_id"];

                           //Neo Email TA if assigned

                           //dt = DataAccess.GetDataTable("user_params","WHERE USER_ID=1 AND PARAM_ID=8003", "");

                           //DataTable dt = new DataView(fromDataTable).ToTable(false, selectedColumns);

                           //////string fromClientTA = context.Request.Params["ta_name"];

                           //////if (fromClientTA != "")
                           //////{
                           //////    try
                           //////    {
                           //////        string TAemail;
                           //////        string nSQL="WHERE USER_ID=" + fromClientTA + " AND PARAM_ID=8003";

                           //////        dt = new DataView(DataAccess.GetDataTable("user_params", nSQL, "")).ToTable(false, "PARAM_TEXT");

                           //////        DataRow[] GetTAemail = dt.Select("PARAM_TEXT <> ''");
                           //////        foreach (DataRow row in GetTAemail)
                           //////        {
                           //////            TAemail = (string)row["PARAM_TEXT"];// get email from tbl_users_params
                           //////        }

                           //////        string strSMTP = "smtp.gmail.com";
                           //////        string strPwd = "tqbfjotld01";
                           //////        string strFrom = "do.not.reply.trisco.auto.email@gmail.com";
                           //////        //string authFrom = strFrom.Split("<")[0].Trim;
                           //////        MailMessage msg = new MailMessage();
                           //////        HttpContext ctx = HttpContext.Current;
                           //////        msg.To.Add(new MailAddress("neopuavin@sogatech.net"));
                           //////        msg.From = new MailAddress(strFrom);
                           //////        msg.Subject = "For TA review and Approval";
                           //////        msg.Priority = MailPriority.High;
                           //////        msg.Body = "Hey dude";

                           //////        //CONFIGURE SMTP OBJECT
                           //////        SmtpClient smtp = new SmtpClient(strSMTP);

                           //////        //SEND EMAIL
                           //////        smtp.Host = strSMTP;
                           //////        smtp.Port = 587;
                           //////        smtp.EnableSsl = true;
                           //////        smtp.UseDefaultCredentials = true;
                           //////        smtp.Credentials = new System.Net.NetworkCredential(strFrom, strPwd);

                           //////        smtp.Send(msg);
                           //////    }

                           //////    catch (Exception e)
                           //////    {
                           //////        Console.WriteLine("{0} Exception caught.", e);
                           //////    }


                           //////}



                           ///


                           //
                           
                           //Neo Codes Ends Here.

                           if (i_key_1 == -1) ret = "{\"r\":" + DataAccess.AddAnomaly(an_data).ToString() + "}";
                           else ret = "{\"r\":" + DataAccess.UpdateAnomaly(i_key_1, an_data).ToString() + "}";

                           break;
                       }
                    case "upd_ref":
                       {
                           //ret = "1";

                           i_key_1 = int.Parse(context.Request.Params["ref_id"]);
                           Dictionary<string, string> ref_data = new Dictionary<string, string>();
                           ref_data["desc"] = context.Request.Params["desc"];
                           ref_data["type"] = context.Request.Params["type"];
                           ref_data["group"] = context.Request.Params["group"];
                           ref_data["upload_date"] = context.Request.Params["upload_date"];
                           ref_data["upload_by"] = context.Request.Params["upload_by"];
                           ref_data["ref_no"] = context.Request.Params["ref_no"];
                           ref_data["filename"] = context.Request.Params["filename"];
                           ref_data["path"] = context.Request.Params["path"];
                           ref_data["asset_id"] = context.Request.Params["asset_id"];
                           ref_data["upd_by"] = (i_key_1 == -1 ? "NULL" : context.Session["user_id"].ToString());
                           ref_data["upd_date"] = (i_key_1 == -1 ? "NULL" : DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss"));
                           ref_data["notes"] = context.Request.Params["notes"];

                           if (i_key_1 == -1) ret = "{\"r\":" + DataAccess.AddReference(ref_data).ToString() + "}";
                           else ret = "{\"r\":" + DataAccess.UpdateReference(i_key_1, ref_data).ToString() + "}";

                           break;
                       }
                    case "ref_chk":
                       {
                           s_key_1 = q["f"];

                           ret = "{\"r\":" + DataAccess.ReferenceFilenameExists(s_key_1).ToString() + "}";
                           break;
                       }
                    case "tbl_val":
                       {
                           s_key_1 = q["tbl"];
                           s_key_2 = q["ret"];
                           s_key_3 = q["filter_col"];
                           s_key_4 = q["filter_val"];

                           string fil = s_key_3 + "=" + s_key_4;

                           ret = "{\"r\":\"" + DataAccess.TableValue(s_key_1, s_key_2, fil).ToString() + "\"}";
                           break;
                       }
                    case "ft_type":
                       {
                           i_key_1 = int.Parse(q["ft_id"]);

                           ret = "{\"r\":\"" + DataAccess.TableValue("sys_lookups", "lkp_text_50_1",
                               "lkp_id=" + i_key_1.ToString()).ToString() + "\"}";
                           break;
                       }
                    case "an_ft_chk":
                       {
                           i_key_1 = int.Parse(q["an_id"]);
                           i_key_2 = int.Parse(q["ft_id"]);

                           ret = "{\"r\":" + DataAccess.AnomalyLinkExists("anomaly_failure_threats_view",
                               "ft_id", i_key_1, i_key_2).ToString() + "}";
                           break;
                       }
                    case "an_ref_chk":
                       {
                           i_key_1 = int.Parse(q["an_id"]);
                           i_key_2 = int.Parse(q["ref_id"]);

                           ret = "{\"r\":" + DataAccess.AnomalyLinkExists("anomaly_reference_view", "ref_id",
                               i_key_1, i_key_2).ToString() + "}";
                           break;
                       }
                    case "del_an":
                       {
                           i_key_1 = int.Parse(q["an_id"]);

                           ret = "{\"r\":" + DataAccess.DeleteRecord("id", i_key_1, "anomalies",
                               "anomalies_view").ToString() + "}";
                           break;
                       }
                    case "an_edit":
                       {
                           s_key_1 = q["an_id"];

                           cols = new string[] { 
                                                //upperbound: 7
                                                "asset_id", "asset_desc", "rev_no", "orig_act", "curr_act", "type", "status", "ref_no", 
                                                //upperbound: 17
                                                "title", "maint_reqd", "desc", "wo_ref", "wo_status", "equip_failure", "action_date", "action_party", 
                                                "equip_no", "ident_date",
                                                //upperbound: 24
                                                "ass", "raised_by", "raised_by_name", "raised_date", "ass_by", "ass_by_name", "ass_date",
                                                //upperbound: 28
                                                "avail_comment", "upd_by", "upd_by_name", "upd_date",
                                                //upperbound: 37
                                                "ram_comment", "a_severity", "a_likelihood", "e_severity", "e_likelihood", "p_severity", "p_likelihood", 
                                                "h_severity", "h_likelihood",
                                                //upperbound: 43
                                                "rcmd", "ta_approved", "ta_name", "ta_approved_date", "ta_comments", "anom_dev_id" };

                           dr = DataAccess.GetDataRow("anomalies_view", string.Join(",", cols),
                           DataAccess.DataSetCache().Tables["anomalies_view"].PrimaryKey[0].ColumnName + "=" + s_key_1);

                           ret = DataAccess.GetJSON(dr, cols, null);
                           break;
                       }
                    case "del_rec":
                       {
                           s_key_1 = q["key"];
                           i_key_1 = int.Parse(q["val"]);
                           s_key_2 = q["tbl"];
                           s_key_3 = q["view"];

                           ret = "{\"r\":" + DataAccess.DeleteRecord(s_key_1, i_key_1, s_key_2,
                               s_key_3).ToString() + "}";
                           break;
                       }
                    case "img_src":
                       {
                           s_key_1 = (q["fname"]); //filename
                           string filename = context.Server.MapPath(s_key_1);

                           Image img_orig = null;
                           byte[] buffer = null;
                           if (!File.Exists(filename))
                           {
                               filename = context.Server.MapPath("images\\no_file.png");
                               img_orig = Image.FromFile(filename);
                               buffer = FileUpload.ImageToByteArray(img_orig);
                           }
                           else
                           {
                               img_orig = Image.FromFile(filename);
                               Size size = new Size(200, 200);
                               Image img_small = FileUpload.ResizeImage(img_orig, size, false);

                               buffer = FileUpload.ImageToByteArray(img_small);
                               img_small.Dispose();
                           }
                           img_orig.Dispose();

                           context.Response.ContentType = "image/" + Path.GetExtension(filename);
                           context.Response.BinaryWrite(buffer);
                           context.Response.Flush();

                           //                            return;
                           break;

                       }
                    case "logout_user":
                       {
                           DataAccess.LogoutUser(context);
                           break;
                       }
                    case "log_user":
                       {
                           DataAccess.LogUser(context);
                           break;
                       }
                    case "rpt":
                       {
                           string rpt_name = q["rpt"];
                           string f = HttpUtility.UrlDecode(q["f"]);
                           string f_an = HttpUtility.UrlDecode(q["f_an"]); // For report dialog filter;
                           string ext = q["ext"];
                            //string ext ="EXCEL";
                            //string asset = HttpUtility.UrlDecode(this.Request.QueryString["asset"]);

                            //string rpt_name = "anomaly_list";
                            //string filter = "%24%26";
                            //string asset = "MUBADALA THAILAND";

                            if (!string.IsNullOrEmpty(f)) f = "[location] LIKE '" + f + "%'";
                           if (!string.IsNullOrEmpty(f_an)) f = "[id]=" + f_an;

                           string fname = rpt_name + "." + ext;
                           //ReportViewer viewer = DataAccess.LoadReportViewerData(rpt_name, filter);

                           LocalReport rpt = DataAccess.LoadReportViewerData(rpt_name, f);
                           

                           Warning[] warnings;
                           string[] streamids;
                           string mimeType;
                           string encoding;
                           string extension;

                           ext = ext.ToUpper();
                           byte[] bytes = rpt.Render((ext == "EXCEL" ? "Excel" : "PDF"), null, out mimeType, 
                               out encoding, out extension, out streamids, out warnings);

                           context.Response.Buffer = true;
                           context.Response.Clear();
                           context.Response.ContentType = mimeType;
                           //context.Response.ContentType = "application/pdf";
                           if (ext == "PDF")
                               context.Response.AppendHeader("content-length", bytes.Length.ToString());
                           else
                                context.Response.AppendHeader("content-disposition", "attachment; filename=Anomaly_Register_" + DateTime.Today.ToShortDateString()  + "." + extension);
                           
                           context.Response.BinaryWrite(bytes);
                           context.Response.End();
                           context.ApplicationInstance.CompleteRequest();
                           return;

                       }
                    //case "print_an":
//                       {
//                           s_key_1 = (qry_str["an_id"]);

//                           ReportViewer viewer;
//                           if (s_key_1 == null) viewer = DataAccess.LoadReportViewerData("anomaly_all", string.Empty);
//                           else viewer = DataAccess.LoadReportViewerData("anomaly_all", "id=" + s_key_1);

//                           string device_info =
//                             @"<DeviceInfo>
//                                                <OutputFormat>EMF</OutputFormat>
//                                                <PageWidth>11.5in</PageWidth>
//                                                <PageHeight>8in</PageHeight>
//                                                <MarginTop>0.25in</MarginTop>
//                                                <MarginLeft>0.2in</MarginLeft>
//                                                <MarginRight>0.2in</MarginRight>
//                                                <MarginBottom>0.25in</MarginBottom>
//                                            </DeviceInfo>";

//                           PrintWithoutPreview p = new PrintWithoutPreview();
//                           p.Export(viewer.LocalReport, device_info);
//                           p.Print();
//                           break;
//                       }
                    case "unlock_row":
                       {
                           ((Dictionary<int, DataAccess.LockedRecords>)context.Application["locked_records"]).Remove((int)context.Session["user_id"]);
                           break;
                       }
  
                }
                context.Response.Write(ret);
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}