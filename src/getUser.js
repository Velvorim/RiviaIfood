'use strict';
const es = require("./config/elastic");
 
module.exports.getUser = async (event) => {
 
 
 const result = await es.query(
        `${process.env.stage}-users`,
         {
          query: {
            match: { 
              "body.status": "active"
              }
            }
          }
      )
console.log(result)
    
      try{
        return {
          statusCode: 200,
          body: JSON.stringify({
            items: await result.items.map((users) => {
              return {
               dados: users
              };
            }),
          }),
        };

      }catch(err){
   
        return new Error(err)
      }
       
  
}

	