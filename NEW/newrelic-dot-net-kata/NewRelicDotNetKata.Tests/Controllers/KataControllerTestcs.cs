using System;
using System.Text;
using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using BootstrapMvcSample.Controllers;
using System.Diagnostics;
using System.Linq;

namespace NewRelicDotNetKata.Tests.Controllers
{
    /// <summary>
    /// Summary description for CoreControllerTestcs
    /// </summary>
    [TestClass]
    public class KataControllerTestcs
    {
        public KataControllerTestcs()
        {

        }

        [TestMethod]
        public void verify_kata_controller_thetweets_meets_250ms_sla()
        {

            KataController controller = new KataController();
            Stopwatch sw = new Stopwatch();
            sw.Start();

            controller.TheTweets("nickfloyd");

            sw.Stop();

            Assert.IsTrue(sw.ElapsedMilliseconds < 250);
        }

        [TestMethod]
        public void verify_kata_controller_theprime_returns_primes_of_500()
        {
            var num = 500;

            KataController controller = new KataController();

            controller.ThePrime(num);

            List<int> expected = Enumerable.Range(2, num).Aggregate(
                Enumerable.Range(2, num).ToList(),
                    (result, index) =>
                    {
                        result.RemoveAll(i => i > index && i % index == 0);
                        return result;
                    }
            );
            
            Assert.AreEqual(expected,controller.ViewBag.Primes);
        }

        [TestMethod]
        public void verify_kata_controller_theprime_returns_primes_of_1000_in_less_than_1000ms()
        {

            KataController controller = new KataController();
            Stopwatch sw = new Stopwatch();
            sw.Start();

            controller.ThePrime(1000);

            sw.Stop();

            Assert.IsTrue(sw.ElapsedMilliseconds < 1000);

        }

        [TestMethod]
        public void verify_kata_controller_theloop_meets_2000ms_sla()
        {

            KataController controller = new KataController();
            Stopwatch sw = new Stopwatch();
            sw.Start();

            controller.TheLoop();

            sw.Stop();

            Assert.IsTrue(sw.ElapsedMilliseconds < 2500);
        }

    }
}
