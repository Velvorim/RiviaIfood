'use strict'
const elasticClient = require("./config/elastic");


module.exports.createUser = async (event) => {

  const body = JSON.parse((event.body));
  
  try{
    await elasticClient.update({
      index: `${process.env.stage}-users`,
      id: body.Driver_id,
      doc: {
       doc: body,
       status: 'active'
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