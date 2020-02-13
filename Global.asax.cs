using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Caching;
using AnomDB.Domain;
using System.Data;
using System.IO;

namespace AnomDB
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            Application["app_users"] = new Dictionary<int, string>();
            Application["locked_records"] = new Dictionary<int, DataAccess.LockedRecords>();

            DataAccess.InitDataSet(); // Initialize dataset.
            DataAccess.InitTablesLastId(); // Get last ids from each tables.
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            Session["user_id"] = -1;
            Session["user_name"] = "Guest";
            Session["user_rights"] = "guest";
            Session["login_validity"] = "valid";

            DataAccess.InitUserSession();
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {
            // Code that runs when an unhandled error occurs

            // Get the exception object.
            Exception exc = Server.GetLastError();

            // Handle HTTP errors
            if (exc.GetType() == typeof(HttpException))
            {
                // The Complete Error Handling Example generates
                // some errors using URLs with "NoCatch" in them;
                // ignore these here to simulate what would happen
                // if a global.asax handler were not implemented.
                if (exc.Message.Contains("NoCatch") || exc.Message.Contains("maxUrlLength"))
                    return;

                //Redirect HTTP errors to HttpError page
                Server.Transfer("HttpErrorPage.aspx");
            }

            // For other kinds of errors give the user some information
            // but stay on the default page
            Response.Write("<h2>Global Page Error</h2>\n");
            Response.Write(
                "<p>" + exc.Message + "</p>\n");
            Response.Write("Return to the <a href='Default.aspx'>" +
                "Default Page</a>\n");

            // Log the exception and notify system operators
            AnomDB.DataAccess.CatchException(exc, "ApplicationError()");
            

            // Clear the error from the server
            Server.ClearError();
        }

        protected void Session_End(object sender, EventArgs e)
        {
        }

        protected void Application_End(object sender, EventArgs e)
        {
            string cache_path = DataAccess.CachePath(HttpContext.Current);
            DataSet ds = DataAccess.DataSetCache();
            if (!File.Exists(cache_path))
            {
                DataAccess.InitTreeView(HttpContext.Current);
                ds.Tables["tree_view"].WriteXml(cache_path);
            }
        }


      
    }
}