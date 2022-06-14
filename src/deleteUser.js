'use strict'
const elasticClient = require("./config/elastic");


module.exports.deleteUser = async (event) => {
  const id = event.pathParameters.id 
  console.log(id) 

  try{
    await elasticClient.update({
      index: `${process.env.stage}-users`,
      id: id,
      doc: {
        status: 'inactive'
      } 
    })

    return {
      statusCode: 202,
      message: 'Usuário deletado com sucesso'
    }
  }catch(err){
    return new Error(err.message)
  }
  
}