'use strict'
const es = require("./config/elastic");


module.exports.deleteUser = async (event) => {
  const id = event.pathParameters.id 

  try{
    await es.update(
      `${process.env.stage}-users`,
      id,
      {status: 'inactive'}
    )

    return {
      statusCode: 202,
      message: 'Usuário deletado com sucesso'
    }
  }catch(err){
    return new Error(err.message)
  }
  
}