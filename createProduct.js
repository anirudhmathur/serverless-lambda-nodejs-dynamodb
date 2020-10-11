'use strict';
const uuid =  require('uuid');
const AWS = require('aws-sdk');
const { request } = require('http');
const { randomInt } = require('crypto');
AWS.config.setPromisesDependency(require('bluebird'))

var creds = new AWS.Credentials('', '');
AWS.config.update({
    region: "ap-south-1",
    endpoint: "http://localhost:8000",

});

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const productInfo =(name,price)=>{
    return{

        id: Math.random() ,
        name: name,
        price: price,
    };
};

const submitProduct = product=>{
    console.log('Submitting product'+process.env.PRODUCT_TABLE);
    const productInfo = {
            TableName: process.env.PRODUCT_TABLE,
            Item: product,
    };
    return dynamoDb.put(productInfo).promise()
    .then(res=>product);
};

module.exports.createProduct = (event, context, callback) => {
  const  requestBody = JSON.parse(event.body);
  const name = requestBody.name;
  const price = requestBody.price;

  if(typeof name !== 'string')
  {
      console.error('Validation Error');
      callback(new Error("Could not submit because of validation error"));
      return;
  }
 
  submitProduct(productInfo(name,price))
  .then(res=>{
      callback(null,{
          statusCode: 200,
          body: JSON.stringify({
            message: 'Sucessfully submitted candidate with email'
            //productId: res.id
          })
      })
  }
  )
  .catch(err => {
    console.log(err);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Unable to submit candidate with email'
      })
    })
  });  
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
