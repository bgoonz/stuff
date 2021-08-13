using HtmlAgilityPack;
using Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace BootstrapMvcSample.Controllers
{
    public class KataController : Controller
    {

        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        ///Kata : One of the most popular things to do these days is call an external service and pull down some sort of social flair to make the app more "hip."  
    
        ///1. Make it look pretty and see if there is a better "preforming" way to get this info
        ///2. Try to meet the controller SLA of keeping the processing under 250 milliseconds (use the unit test to determine success)
    
        ///Hint: Use the New Relic Real User Monitoring (RUM) to find out if the problem is on the client stream or in the controller code
        /// </summary>
        /// <param name="userName"></param>
        /// <returns></returns>
        public ActionResult TheTweets(string userName = "newrelic")
        {
            try
            {
                ViewBag.Title = userName + "'s tweets";

                HtmlWeb web = new HtmlWeb();
                HtmlDocument doc = web.Load("http://twitter.com/" + userName);
                HtmlNodeCollection tweetNodes = doc.DocumentNode.SelectNodes("//p[@class='js-tweet-text']");

                if (tweetNodes != null)
                {
                    foreach (HtmlNode node in tweetNodes)
                    {
                        ViewBag.Message += node.InnerHtml + "<br/>";
                    }
                }
            }
            catch { 
            
            }

            return View();
        }

        /// <summary>
        ///Kata : N + 1 or some other unintended looping mishap can really hurt your site by stealing away cycles and speed. 
        ///We are not exactly dealing with n+1 here but what's happening is not really any better.
    
        ///1. There is something fundamentally wrong with how data is being processed on this page - 
        ///There is a way to reduce the time it takes to process this page while working within the constraints of the 1 second sleep found in FormatValue.  Find it and fix it.

        ///Hint: Go to New Relic and create a custom dashboard for the Metric : Custom/FormatValueResponseTime - see if anything sticks out as odd to you.
        ///Run the unit test to verify the win
        /// </summary>
        /// <returns></returns>
        public ActionResult TheLoop()
        {

            string[] nameList = new string[]{"Guy","Baxter","Gage","Isaiah","Hyatt","Kenyon","James"};
            
            foreach (var item in nameList)
            {
                ViewBag.Message += this.FormatValue(item);
            }


            //Extra: solve with using values provide from another data source
            //string line;
            //using (var file = new System.IO.StreamReader(Server.MapPath("~/Content/files/Content_2.txt"))) {
            //    while ((line = file.ReadLine()) != null)
            //    {
            //        ViewBag.Message += this.FormatValue(line);
            //    }
            //}
           

            return View();
        }
        private string FormatValue(string val) {
            Stopwatch sw = new Stopwatch();
            sw.Start();

            var result = string.Empty;
            //Assume that something causes one second of overhead here. 
            //Keep the spleep for the Kata
            Thread.Sleep(2000);
            result = string.Format("The Name is: {0}<br/>", val);

            sw.Stop();

            //Example of calling the New Relic API to record custom response time metrics
            //NewRelic.Api.Agent.NewRelic.RecordResponseTimeMetric("Custom/FormatValueResponseTime", sw.ElapsedMilliseconds);
          
            return result;


            

        }

        /// <summary>
        ///     Kata : Resources are precious, especially when you're dealing with cloud based ones.  
        ///If you have code that doesn't do a good job of cleaning stuff up you'll end up paying for it in performance and usage fees. 

        ///1. Find the leak - stop it!

        ///Hint: Go to New Relic and look at the scalability analysis of this site to determine if you have connection leaking (look for hockey sticks!).  
        ///Then see if you can find out why by looking at the transaction.
        /// </summary>
        /// <returns></returns>
        public ActionResult TheLeak()
        {

            string line;

            System.IO.StreamReader file = new System.IO.StreamReader(Server.MapPath("~/Content/files/Content_1.txt"));
            while((line = file.ReadLine()) != null)
            {
              ViewBag.Message += line;
            }

            return View();
        }

        /// <summary>
        ///Kata : Getting prime numbers is hard work, but the dev who last touched this made it a lot more difficult 

        ///1. Retun the primes of the val provided only <br>
        ///2. Attempt to return the primes of 1000 in less than 1 second
        
        ///Hint: Go to New Relic and look at the transaction trace or make a custom dashboard for this page - see if you can find where the heat is.  
        ///Also there is a one line replacement for all of this code that makes the page render super snappy.
        /// </summary>
        /// <param name="val"></param>
        /// <returns></returns>
        public ActionResult ThePrime(int val = 500) {
            //Calling the New Relic Api to set the Transaction name to something else
            //NewRelic.Api.Agent.NewRelic.SetTransactionName("OtherTransaction", "ThePrime");

            int current = 0;
            List<long> primes = new List<long>();
            for (long i = 0; ; i++)
            {
                if (current == 501)
                    break;
                if (IsValidPrime(i))
                {
                    current++;
                    primes.Add(i);
                }
            }

            ViewBag.Primes = primes;

            return View();
        }
        private bool IsValidPrime(long val)
        {
            var result = false;
            for (long i = val - 1; i > 0; i--)
            {
                if (i == 1)
                    result =  true;
                if (val % i == 0)
                    result = false;
            }
            return result;
        }

        /// <summary>
        /// Kata : Performance problems with databases and queries are legendary - much like this one, overlooked details can make your site crawl

        ///1. Find the issue with leaking connections
        ///2. Find the error that this page is generating
        ///3. Come up with a better way to get and display the information below
    
        ///Hint: Use New Relic to look at the query plan of all of the queries on this page
        ///to see if any suggestions about what to do with the query or schema can be made.
        /// </summary>
        /// <returns></returns>
        public ActionResult TheQuery()
        {

            List<ProductView> products = new List<ProductView>();
            using (var db = new ProductContext())
            {
                var query = (from p in db.Products
                             join info in db.ProductInformation on p.ProductInformation.Id equals info.Id
                             join dc in db.DistributionCenter on p.Id equals dc.Id into dcp
                             from x in dcp.DefaultIfEmpty()
                             orderby info.Price, p.Name, x.Quantity
                             select new ProductView
                             {
                                 ProductId = p.Id,
                                 Name = p.Name,
                                 Desctiption = p.Desctiption,
                                 CreateDate = p.CreateDate,
                                 Color = info.Color,
                                 Price = info.Price,
                                 Quantity = x.Quantity,
                             });

                //products = query.ToList<ProductView>();

                foreach (Product p in db.Products.Include("ProductInformation")) {
                    ProductView pv = query.Where(x => x.ProductId == p.Id).FirstOrDefault() as ProductView;

                    if(!string.IsNullOrEmpty(p.ProductInformation.Color)){

                        switch (p.ProductInformation.Color) {
                        
                            case "Red":
                                pv.ColorHex = "#FF0000";
                                break;
                            case "Black":
                                pv.ColorHex = "#000000";
                                break;
                            default:
                                pv.ColorHex = "#FFFFFF";
                                break;
                        
                        }
                    }

                    products.Add(pv);
                
                }

            }
            return View(products);

            
        }

        /// <summary>
        ///     Kata : Dealing with streams can be dangerous (especially if you cross them).
        ///     1. This code is flawed and is missing some critical things to let the framework finish it's job.  Find the issue and fix it!
        ///     2. Render the daily cartoon to the page
        ///     Hint: Use New Relic and drill into the transaction trace of this page.
        /// </summary>
        /// <returns></returns>
        public ActionResult TheRequest()
        {

            var req = WebRequest.Create("http://xkcd.com/info.0.json") as HttpWebRequest;

            if (req != null)
            {

                req.Method = "GET";
                req.ContentLength = 0;


                var response = req.GetResponse();
                var dataStream = response.GetResponseStream();
                if (dataStream == null)
                {
                    ViewBag.Message = "nothing";
                }

                var reader = new StreamReader(dataStream);
                var result = reader.ReadToEnd();

                ViewBag.Message = result;
            }

            return View();
        }

        /// <summary>
        /// Kata : Connection leaking and port exhaustion will destroy your apps when you least expect it.
        /// 1. Find the connection leak
        /// Hint: Go to New Relic and look at the scalability analysis of this site to determine if you have connection leaking (look for hockey sticks!).  Then see if you can find out why.
        /// </summary>
        /// <returns></returns>
        public ActionResult TheConnection()
        {

            ViewBag.Message = "Not implemented";
            return View();
        }

    }
}
