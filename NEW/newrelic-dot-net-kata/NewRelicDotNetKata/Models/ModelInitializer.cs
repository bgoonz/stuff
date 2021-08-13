using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
namespace Models
{

    public static class ModelIntializer
    {

        public static List<Product> CreateProductModels()
        {
            return new List<Product>
                       {
                           new Product
                               {
                                   Id = 1,
                                   Name = "asdf",
                                   Desctiption = "asdfsd",
                                   CreateDate = DateTime.Now.AddYears(1),
                                   ProductInformation = new ProductInformation{Id = 1, Color = "Red", Price = "10.00", Size = "XL", Weight = "20"},
                                   DistributionCenters = new List<DistributionCenter>()
                               },
                           new Product
                               {
                                   Id = 1,
                                   Name = "asdf",
                                   Desctiption = "asdfsd",
                                   CreateDate = DateTime.Now.AddYears(1),
                                   ProductInformation = new ProductInformation{Id = 2, Color = "Red", Price = "10.00", Size = "XL", Weight = "20"},
                                   DistributionCenters = new List<DistributionCenter>()
                               },
                       };
        }
    }
}