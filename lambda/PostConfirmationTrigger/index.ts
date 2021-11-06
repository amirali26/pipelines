import * as mysql from 'mysql';

const connection = mysql.createConnection({
  host: 'dashboard-proxy.proxy-ceqnxwq4gaxl.eu-west-1.rds.amazonaws.com',
  user: 'syscdk',
  password: 'AO.whdlhF8FBiZ=.bWL05BhDlhhDmo',
  database: 'main',
});

connection.connect();

exports.handler = async function (event: any) {
  try {
    const id = event.userName;
    const { name, phone_number, email, birthdate } =
      event.request.userAttributes;
    await addUser(id, name, phone_number, email, birthdate);
    return event;
  } catch (e: any) {
    throw Error(e.message);
  }
};

const addUser = async (id: string, name: string, phone_number: string, email: string, birthdate: string): Promise<void> => {
  connection.query(`INSERT into Users (ExternalId, Name, 
    DateOfBirth, PhoneNumber, Email) values (
      ${id}, ${name}, ${birthdate}, ${phone_number}, ${phone_number},
      ${email}
    )`, (error) => {
    if (error) {
      console.log(error.code, error.message);
    }
  })
}
  
