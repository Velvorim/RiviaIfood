'use strict'
const es = require("./config/elastic");


module.exports.createUser = async (event) => {

  const body = JSON.parse((event.body))
  body.status = 'active' 

  try{
    await es.upsert(
      `${process.env.stage}-users`,
      body.Driver_id,
      { 
        body
      }
    )

    return {
      statusCode: 201,
      message: 'Usuário criado com sucesso'
    }
  }catch(err){
    return new Error(err.message)
  }
  
}