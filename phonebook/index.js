require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('bodyText', function (req) { 
    const bodyText = JSON.stringify(req.body)
    return bodyText 
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodyText', {
    skip: function (req) { 
        return req.method !== 'POST'
    }
}))
/*
let persons = 
    [
        { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
        },
        { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
        },
        { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
        },
        { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
        }
    ]
*/
app.get('/api/persons', (request, response, next) => {
    Person.find({}).then( person => {
                        response.json(person)
                    })
                    .catch(error => next(error))   
})

app.get('/api/info', (request, response) => {
    const phoneBookMessage = `<p>Phonebook has info for ${Person.length} people(s)</p>`
    const receivedTime = new Date()
    const timeMessage =`<p>${receivedTime.toDateString()} ${receivedTime.toTimeString()} </p>`
    const responseMsg = phoneBookMessage + timeMessage

    response.send(responseMsg)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
                                                response.json(person)
                                            })
                                      .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {

    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'name / number missing' 
      })
    }
    
    const newName = '^' + body.name + '$'

    Person.find({name: {'$regex': newName,$options:'i'} })
          .then(person => {
   
            if(person.length === 0 ){

                const person = new Person({
                    name: body.name,
                    number: body.number
                })
                person.save().then(result => { 
                                return response.json(result)
                            })
                            .catch(error => next(error))
            }
            else{
                return response.status(400).json({ 
                    error: 'name must be unique' 
                })
            }
            
         })
         .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then( () => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(
            request.params.id, 
            person, 
            { new: true, runValidators: true, context: 'query'})
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } 
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
  
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})