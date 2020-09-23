var axios = require('axios');
var fetch = require('../fetch')


const headers = {
  'Content-Type': 'application/json',
}

let randomPasswords = [];
let randomFirstNames = [];
let randomLasnNames = [];
let JWT;

test.skip('signup', async () => {
	let response = await fetch.signup(randomPhoneNumber, randomPassword, randomFirstName, randomLasnName, headers);
	expect(response.data).toEqual('OK');
})


test.skip('edit', async () => {
	let jwt = await fetch.login(randomPhoneNumber, randomPassword);
	headers.Authorization = jwt.data

	let response = await fetch.editUser(randomPhoneNumber, randomPassword, headers, 'Kyrgyzstan', 'Bishkek', '67', '11b');
	expect(response.data).toEqual('OK');
})

test.skip('delete', async () => {
	let response = await fetch.deleteUser(randomPhoneNumber, randomPassword, headers);
	expect(response.data).toEqual('OK');
})
