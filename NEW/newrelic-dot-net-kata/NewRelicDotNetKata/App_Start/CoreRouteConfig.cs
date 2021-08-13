using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using BootstrapMvcSample.Controllers;
using NavigationRoutes;

namespace BootstrapMvcSample
{
    public class CoreRouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.MapNavigationRoute<KataController>("Kata Pages", c => c.Index())
                  .AddChildRoute<KataController>("The Tweets", c => c.TheTweets("newrelic"))
                  .AddChildRoute<KataController>("The Loop", c => c.TheLoop())
                  .AddChildRoute<KataController>("The Leak", c => c.TheLeak())
                  .AddChildRoute<KataController>("The Prime", c => c.ThePrime(500))
                  .AddChildRoute<KataController>("The Query", c => c.TheQuery())
                  .AddChildRoute<KataController>("The Request", c => c.TheRequest())
                  .AddChildRoute<KataController>("The Connection", c => c.TheConnection())
                ;

            routes.MapNavigationRoute<AboutController>("About", c => c.Index())
              .AddChildRoute<AboutController>("This Kata", c => c.Kata())
              .AddChildRoute<AboutController>("New Relic", c => c.NewRelic())
              .AddChildRoute<AboutController>("Windows Azure", c => c.WindowsAzure())
            ;

        }
    }
}
