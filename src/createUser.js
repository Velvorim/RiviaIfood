'use strict'
const elasticClient = require("./config/elastic");


module.exports.createUser = async (event) => {

  const body = JSON.parse((event.body));
  console.log(body)
  
  try{
    await elasticClient.update({
      index: 'usuarios',
      id: body.Driver_id,
      doc: {
       doc: body
      },
      doc_as_upsert: true
    })

    return {
      statusCode: 201,
      message: 'Usuário criado com sucesso'
    }
  }catch(err){
    return new Error(err.message)
  }
  
}