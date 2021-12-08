import * as mysql from 'mysql2/promise';

let connection: mysql.Connection;

exports.handler = async function (event: any) {
  try {
    const id = event.userName;

    console.log(JSON.stringify(event));

    const { name, phone_number, email, birthdate } =
      event.request.userAttributes;

    connection = await mysql.createConnection({
      host: 'dashboard-proxy.proxy-ceqnxwq4gaxl.eu-west-1.rds.amazonaws.com',
      user: 'syscdk',
      password: 'ON9sNtP^NhcGRD2=Tpz_OgO0dFg,9B',
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
  
