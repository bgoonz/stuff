namespace NewRelicDotNetKata.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Init : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Products",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false),
                        Desctiption = c.String(),
                        CreateDate = c.DateTime(nullable: false),
                        ProductInformation_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.ProductInformations", t => t.ProductInformation_Id);
                //.Index(t => t.ProductInformation_Id);
            
            CreateTable(
                "dbo.ProductInformations",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Color = c.String(),
                        Size = c.String(),
                        Weight = c.String(),
                        Price = c.String(),
                    })
                .PrimaryKey(t => t.Id);

            CreateTable(
                "dbo.DistributionCenters",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Address = c.String(),
                        Quantity = c.Int(nullable: false),
                        Product_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Products", t => t.Product_Id);
                //.Index(t => t.Product_Id);
            
            
        }
        
        public override void Down()
        {
            
            DropIndex("dbo.DistributionCenters", new[] { "Product_Id" });
            DropIndex("dbo.Products", new[] { "ProductInformation_Id" });
            DropForeignKey("dbo.DistributionCenters", "Product_Id", "dbo.Products");
            DropForeignKey("dbo.Products", "ProductInformation_Id", "dbo.ProductInformations");
            DropTable("dbo.DistributionCenters");
            DropTable("dbo.ProductInformations");
            DropTable("dbo.Products");
        }
    }
}
