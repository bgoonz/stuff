using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
namespace Models
{
    public class Product
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }

        [DataType(DataType.Text)]
        public string Desctiption { get; set; }

        [DataType(DataType.Date)]
        public DateTime CreateDate { get; set; }

        public ProductInformation ProductInformation { get; set; }

        public virtual List<DistributionCenter> DistributionCenters { get; set; }
    }

    public class ProductInformation
    {
        public int Id { get; set; }

        [DataType(DataType.Text)]
        public string Color { get; set; }

        [DataType(DataType.Text)]
        public string Size { get; set; }

        [DataType(DataType.Text)]
        public string Weight { get; set; }

        [DataType(DataType.Currency)]
        public string Price { get; set; }

    }

    public class DistributionCenter
    {
        public int Id { get; set; }

        [DataType(DataType.Text)]
        public string Address { get; set; }

        [DataType(DataType.Text)]
        public int Quantity { get; set; }

    }

    public class ProductView
    {
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string Desctiption { get; set; }
        public DateTime CreateDate { get; set; }
        public string Price { get; set; }
        public string Color { get; set; }
        public string ColorHex { get; set; }
        public int? Quantity { get; set; }
    }



    public class ProductContext : DbContext
    {

        public DbSet<Product> Products { get; set; }
        public DbSet<ProductInformation> ProductInformation { get; set; }
        public DbSet<DistributionCenter> DistributionCenter { get; set; }


    }



}