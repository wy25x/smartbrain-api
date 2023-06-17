const express = require('express')
const bcrypt = require('bcrypt-nodejs')
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'password',
    database : 'smartbrain'
  }
});

const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	knex.select("*").from('users').where({id: id}).then(user => {
		if (user.length) {
			res.json(user[0])
		}
		else {
			throw Error;
		}
	})
	.catch(err => res.status(400).json('Wrong credentials'))
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	knex('users')
	  .where('id', '=', id)
	  .increment('entries', 1)
	  .returning('entries')
	  .then(entries => {
	  	res.json(entries[0].entries);
	  })
	  .catch(err => res.status(400).json('unable to get entries'))
})

app.post('/signin', (req, res) => {
	knex.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
		console.log(isValid)
		if (isValid) {
			return knex.select('*').from('users').where('email', '=', req.body.email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.status(400).json('error bad request'))
		}
		else {
			res.status(400).json('Wrong credentials')
		}
	})
	.catch(err => res.status(400).json('Cannot find user'))
})

app.post('/register', (req, res) => {
	const { name, email, password } = req.body
	const hash = bcrypt.hashSync(password);
	
	knex.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			trx.insert({
				email: loginEmail[0].email,
				name: name,
				joined: new Date()
			})
			.into('users')
			.returning('*')
			.then(user => {
				res.json(user[0])
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json(err))
})


// Load hash from your password DB.


// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3001, () => {
	console.log('server is running on port: 3001')
})
