using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
namespace Models
{

    public static class ModelExtention
    {
        public static Product Get(this List<Product> models, int id)
        {
            return models.First(x => x.Id == id);
        }
    }
}