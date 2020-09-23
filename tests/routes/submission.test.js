var axios = require('axios');
var fetch = require('../fetch')

const headers = {
  'Authorization': {}
}

const levelIdStars = '5eff6377e7da90022d03c265';
const levelIdStarsB = '5f2a846a37285b0f83c20640';

const stages = ["5f2a9644f0509742540fc66c", "5f2a96849289ce3828bce791"];
const levels = ["5f3681e6303b936a83eb5015", "5f33f42c6528ab164f55be5f"];

describe('collect stars', () => {

	test('login', async () => {
    	let response =  await fetch.login("qwerty99.js@gmail.com", "Zhoma1999");
	    headers.Authorization = response.data;
	    expect(response.status).toEqual(200);
	});

	describe('invalid data test', () => {
		test('not enough arguments', async () => {
				let commands = [
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		    		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"}
			    ]

			    let functions = [{
			    	"name": "main",
			    	"commands": commands
			    }]

			  const response = await fetch.sendSolution(levels[0], functions, headers);
			  expect(response.response.status).toEqual(400);
		});

		test('invalid level id', async () => {
				let commands = [
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		    		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"}
			    ]

			    let functions = [{
			    	"name": "main",
			    	"commands": commands
			    }]

			  const response = await fetch.sendSolution("levelIdStars", functions, headers);
			  expect(response.response.status).toEqual(400);
		});

		test('invalid level id', async () => {
				let commands = [
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		    		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"}
			    ]

			    let functions = [{
			    	"name": "main",
			    	"commands": commands
			    }]

			  const response = await fetch.sendSolution("levelIdStars", functions, headers);
			  expect(response.response.status).toEqual(400);
		});
	});


	describe('test via regular commands', () => {
		for(let i = 0; i < 10; ++i)
		{
			test('test via regular commands', async () => {
				let commands = [
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		      		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"},
		    		{"name":"step"},
					{"name":"step"},
					{"name":"step"},
					{"name":"left"}
			    ]
			    let functions = [{
			    	"name": "main",
			    	"commands": commands
			    }]

			  const response = await fetch.sendSolution(levels[i%2], functions, headers,1);
			  expect(response.data).toEqual('OK');
			});
		}
	});

	
	describe('test via loop command', () => {

		for(let i = 0; i < 10; ++i)
		{
			test('test via loop command', async () => {
				let loopCommands = [

			      		{"name":"step"},
						{"name":"step"},
						{"name":"step"},
						{"name":"left"},
					]

				let commands = [
					{"name" : "loop", "iterations": 4, "commands": loopCommands}
				]
 				
 				let functions = [{
			    	"name": "main",
			    	"commands": commands
			    }]

				const response = await fetch.sendSolution(levels[i%2], functions, headers,1);
				expect(response.data).toEqual('OK');
			});
		}
	});

	describe('test via nested loop command', () => {

		for(let i = 0; i < 10; ++i)
		{
			test('test via nested loop command', async () => {
				let innerLoopCommands = [
			      		{"name":"step"},
					]

				let loopCommands = [
					{"name" : "loop", "iterations" : 3, "commands" : innerLoopCommands},
					{"name" : "left"}
				]

				let commands = [
					{"name" : "loop", "iterations": 4, "commands": loopCommands}
				]

				let functions = [{
			    	"name": "main",
			    	"commands": commands
			    }]

				const response = await fetch.sendSolution(levels[i%2], functions, headers,1);
				expect(response.data).toEqual('OK');
			});
		}

	});

	describe('test via two nested loop command', () => {

		for(let i = 0; i < 10; ++i)
		{
			test('test via two nested loop command', async () => {
				
				let innerLoopCommandssecond = [
			      	{"name" : "left"}
			      ]

				let innerLoopCommandsfirst = [
			      		{"name":"step"},
					]
				
				let loopCommands = [
					{"name" : "loop", "iterations" : 3, "commands" : innerLoopCommandsfirst},
					{"name" : "loop", "iterations" : 1, "commands" : innerLoopCommandssecond}
				]

				let commands = [
					{"name" : "loop", "iterations": 4, "commands": loopCommands}
				]
				let functions = [{
			    	"name": "main",
			    	"commands": commands
			    }]


				const response = await fetch.sendSolution(levels[i%2], functions, headers,1);
				expect(response.data).toEqual('OK');
			});
		}

	});

	describe('test recursion', () => {

		for(let i = 0; i < 10; ++i)
		{
			test('test recursion', async () => {
				
				let commands = [
			      		{"name":"step"},
						{"name":"step"},
						{"name":"step"},
						{"name":"left"},
						{"name":"recursion"}
				]
				
				let functions = [{
			    	"name": "main",
			    	"commands": commands
			    }]


				const response = await fetch.sendSolution(levels[i%2], functions, headers,1);
				expect(response.data).toEqual('OK');
			});
		}

	});

	describe('test function calls', () => {

		for(let i = 0; i < 10; ++i)
		{
			test('test function calls', async () => {
				
				let F2commands = [
			      		{"name":"step"},
						{"name":"step"},
						{"name":"step"},
						{"name":"left"},
				]
				let commands = [
					{"name":"call function", "functionName":"F2"},
					{"name":"call function", "functionName":"F2"},
					{"name":"call function", "functionName":"F2"},
					{"name":"call function", "functionName":"F2"},
				]

				let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	},
			    	{
			    		"name": "F2",
			    		"commands": F2commands
			    	}
			    ]


				const response = await fetch.sendSolution(levels[i%2], functions, headers,1);
				expect(response.data).toEqual('OK');
			});
		}

	});

	describe('test function calls inside of loop', () => {

		for(let i = 0; i < 10; ++i)
		{
			test('test function calls inside of loop', async () => {
				
				let F2commands = [
			      {"name":"step"},
						{"name":"step"},
						{"name":"step"},
						{"name":"left"},
				]

				let commands = [
					{"name":"loop", "iterations":4, "commands":[{"name":"call function", "functionName":"F2"}]}			
				]

				let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	},
			    	{
			    		"name": "F2",
			    		"commands": F2commands
			    	}
			    ]
				
				const response = await fetch.sendSolution(levels[i%2], functions, headers,1);
				expect(response.data).toEqual('OK');
			});
		}

  });
  
  describe('test maximum number of commands inside of function', () => {

		for(let i = 0; i < 10; ++i)
		{
			test('test error', async () => {
				
				let F2commands = [
			      {"name":"step"},
						{"name":"step"},
						{"name":"step"},
						{"name":"left"},
				]

				let commands = [
					{"name":"loop", "iterations":4, "commands":[{"name":"call function", "functionName":"F2"}]}			
				]

				let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	},
			    	{
			    		"name": "F2",
			    		"commands": F2commands
			    	}
          ]
          
        const error = await fetch.sendSolution(levelIdStarsB, functions,headers,1);
        expect(error.response.status).toEqual(400);
			});
		}

	});
})

describe('check errors', () => {
	test('not allowed function', async() => {
		let F2commands = [
      		{"name":"step"},
			{"name":"step"},
			{"name":"step"},
			{"name":"left"},
		]

		let commands = [
			{"name":"loop", iterations:4, "commands":[{"name":"call function", "commands":F2commands}]}			
		]
		
		let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	}
			    ]

		const error = await fetch.sendSolution("5e9b63dbdb134b096b3212cf", functions, headers);
		expect(error.response.status).toEqual(400);
	});
	
	test('not allowed number of functions', async() => {
		let F2commands = [
      		{"name":"step"},
			{"name":"step"},
			{"name":"step"},
			{"name":"left"},
		]

		let commands = [
			{"name":"loop", iterations:4, "commands":[{"name":"call function", "functionName":"F2"}]}			
		]
		
		let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	},
			    	{
			    		"name":"F2",
			    		"commands":F2commands
			    	}
			    ]

		const error = await fetch.sendSolution("5e9b64929c0bb60b9d69c349", functions, headers);
		expect(error.response.status).toEqual(400);
	});


	test('incorrect syntax of solution', async() => {
		let F2commands = [
      		{"name":"step"},
			{"name":"step"},
			{"name":"step"},
			{"name":"left"},
		]

		let commands = [
			{"name":"loop", iterations:4, "commands":{"name":"call function", "commands":F2commands}}			
		]
		

		let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	}
			    ]

		const error = await fetch.sendSolution(levelIdStars, functions, headers);
		expect(error.response.status).toEqual(400);
	});

	test('wrong solution', async() => {
		let F2commands = [
      		{"name":"step"},
			{"name":"step"},
			{"name":"step"},
			{"name":"right"},
		]

		let commands = [
			{"name":"loop", iterations:4, "commands":[{"name":"call function", "functionName":"F2"}]}			
		]
		
		let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	},
					{
			    		"name": "F2",
			    		"commands": F2commands
			    	},
			    	
			    ]

		const error = await fetch.sendSolution(levels[0], functions, headers);
		// console.log(response)
		expect(error.response.status).toEqual(400);
	});

	test('no or incorrect JWT', async() => {
		let commands = [
      		{"name":"step"},
			{"name":"step"},
			{"name":"step"},
			{"name":"right"},
		]


		let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	}
			    ]
		const error = await fetch.sendSolution(levelIdStars, functions);
		expect(error.response.status).toEqual(403);
	});

	test('incorrect JWT', async() => {
		let commands = [
      		{"name":"step"},
			{"name":"step"},
			{"name":"step"},
			{"name":"right"},
		]


		let functions = [
					{
			    		"name": "main",
			    		"commands": commands
			    	}
			    ]
		
		const fakeHeader = {
		  'Content-Type': 'application/json',
		  'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImF2YXRhciI6InBhdGgvdG8vZGVmYXVsdC9hdmF0YXIucG5nIiwiaXNBZG1pbiI6dHJ1ZSwiaXNBY3RpdmUiOnRydWUsIl9pZCI6IjVlOTYwMTgwN2NlNmEyMTZlYzEwYTkwMCIsInBhc3N3b3JkIjoiJDJiJDEwJHdldmhqYlhJa0o4Um1hZzdPY2RVc3V5M1ZjLmVWOWF4UnF4dUc0THhqVk9jRlBIZjZobVBHIiwicGhvbmVOdW1iZXIiOiIrOTk2Nzc3MjEyNjIyIiwiZmlyc3ROYW1lIjoiYWRtaW4iLCJsYXN0TmFtZSI6ImFkbWluIHV1bHUiLCJfX3YiOjAsImNvdW50cnkiOiJSdXNzaWEiLCJncmFkZSI6IjEwIiwibG9jYWxpdHkiOiJNb3Njb3ciLCJzY2hvb2wiOiI2OCJ9LCJpYXQiOjE1ODY5ODIxMzMsImV4cCI6MTU4NzA2ODUzM30.l8D_zk1Enyhmz4iexClmhTh4lCGkUG_WHnDj8tFdMG0'
		}

		const error = await fetch.sendSolution(levelIdStars, functions,fakeHeader);
		expect(error.response.status).toEqual(403);
	});
})

