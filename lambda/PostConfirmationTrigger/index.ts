import AWS = require('aws-sdk');
import * as mysql from 'mysql2/promise';

let connection: mysql.Connection;
exports.handler = async function (event: any) {
  try {
    const id = event.userName;

    const { name, phone_number, email, birthdate } =
      event.request.userAttributes;
    
      connection = await mysql.createConnection({
      host: process.env.HOST!,
      user: 'syscdk',
      password: process.env.PASSWORD!,
      database: 'main',
    });
    await addUser(id, name, phone_number, email, birthdate);
    return event;
  } catch (e: any) {
    throw Error(e.message);
  }
};

const addUser = async (id: string, name: string, phone_number: string, email: string, birthdate: string): Promise<void> => {
  const query = `INSERT into Users (ExternalId, Name, 
    DateOfBirth, PhoneNumber, Email, CreatedAt) values ('${id}', '${name}', '${birthdate}', '${phone_number}', '${email}', NOW())`;
  
  console.log(query);

  await connection.query(query);
}
  
