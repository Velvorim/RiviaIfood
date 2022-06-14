'use strict';
const elasticClient = require("./config/elastic");
 
module.exports.getUser = async (event) => {
 
  //const searchText = event.queryStringParameters.text

 const result = await elasticClient.search({
          index: `${process.env.stage}-users`,
          body: {
              query: {
                match: { 
                  status: 'active'
                }
              }
          }
      })

    
      try{
        return {
          statusCode: 200,
          body: JSON.stringify({
            items: await result.hits.hits.map((users) => {
              return {
               dados: users._source
              };
            }),
          }),
        };

      }catch(err){
   
        return new Error(err)
      }
       
  
}

	