import AWS = require('aws-sdk');
import * as mysql from 'mysql2/promise';

let connection: mysql.Connection;

const client = new AWS.SecretsManager({
  region: 'eu-west-1',
});

exports.handler = async function (event: any) {
  try {
    const id = event.userName;

    const { name, phone_number, email, birthdate } =
      event.request.userAttributes;
    
    const connectionInformation = await client.getSecretValue({ SecretId: process.env.NODE_ENV === 'dev' ? 'devHandleMyCaseDashboardDat-YcDXj7J0CAlm' : 'prodHandleMyCaseDashboardDa-VOnQoDBOvG7m'}).promise();
    console.log(JSON.stringify(connectionInformation));
    const connectionInformationParsed = JSON.parse(connectionInformation.SecretString!);
    connection = await mysql.createConnection({
      host: connectionInformationParsed.host!,
      user: 'syscdk',
      password: connectionInformationParsed.password!,
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
  
