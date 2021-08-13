using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace BootstrapMvcSample.Controllers
{
    public class AboutController : Controller
    {
        public ActionResult Index() {
            return View();
        }

        public ActionResult NewRelic()
        {
            return View();
        }

        public ActionResult Kata()
        {
            return View();
        }

        public ActionResult WindowsAzure()
        {
            return View();
        }

    }
}
