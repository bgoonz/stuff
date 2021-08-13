namespace NewRelicDotNetKata.Migrations
{
    using Models;
    using System;
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<Models.ProductContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(Models.ProductContext context)
        {


            var DCs = new List<DistributionCenter>();
            DCs.Add(new DistributionCenter { Address = "123 Main", Quantity = 20 });
            DCs.Add(new DistributionCenter { Address = "456 Main", Quantity = 40 });
            DCs.Add(new DistributionCenter { Address = "789 Main", Quantity = 60 });
            DCs.Add(new DistributionCenter { Address = "100 Main", Quantity = 80 });
            

            context.Products.AddOrUpdate(
              p => p.Name,
                 new Product
                 {
                     Name = "The Shoes",
                     Desctiption = "best shoes ever!",
                     CreateDate = DateTime.Now.AddYears(1),
                     ProductInformation = new ProductInformation { Color = "Red", Price = "10.00", Size = "XL", Weight = "20" },
                     DistributionCenters = DCs
                 },
                 new Product
                 {
                     Name = "The Socks",
                     Desctiption = "best socks ever!",
                     CreateDate = DateTime.Now.AddYears(1),
                     ProductInformation = new ProductInformation { Color = "Red", Price = "9.00", Size = "XL", Weight = "20" },
                     DistributionCenters = DCs
                 },
                 new Product
                 {
                     Name = "The Pants",
                     Desctiption = "best pants ever!",
                     CreateDate = DateTime.Now.AddYears(1),
                     ProductInformation = new ProductInformation { Color = "Red", Price = "8.00", Size = "XL", Weight = "20" },
                     DistributionCenters = DCs
                 },
                 new Product
                 {
                     Name = "The Shirt",
                     Desctiption = "best shirt ever!",
                     CreateDate = DateTime.Now.AddYears(1),
                     ProductInformation = new ProductInformation { Color = "Red", Price = "7.00", Size = "XL", Weight = "20" },
                     DistributionCenters = DCs
                 },
                new Product
                {
                    Name = "The Hat",
                    Desctiption = "best hat ever!",
                    CreateDate = DateTime.Now.AddYears(1),
                    ProductInformation = new ProductInformation { Color = "Red", Price = "6.00", Size = "XL", Weight = "20" },
                    DistributionCenters = DCs
                },
                new Product
                {
                    Name = "The Jacket",
                    Desctiption = "Best Jacket ever",
                    CreateDate = DateTime.Now.AddYears(1),
                    ProductInformation = new ProductInformation { Color = "Red", Price = "5.00", Size = "XL", Weight = "20" },
                    DistributionCenters = DCs
                }

            );

        }
    }
}
