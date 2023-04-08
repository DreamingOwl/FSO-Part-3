import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import Filter from './components/Filter'
import personService from './services/person'
import { useState, useEffect } from 'react'

const Notification = ({ message, type }) => {
  
  if (message === null) {
    return null
  }

  if (type === 'E'){
    return (
      <div className='error'>
        {message}
      </div>
    )
  }
  else{

    return (
      <div className='success'>
        {message}
      </div>
    )
  
  }

}

const App = () => {

  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)

  const setMessageAndType = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
  }

  useEffect(() => {
    personService.getAll()
                 .then(initPerson => setPersons(initPerson))

  }, [])

  const findNameFunc = (person) => person.name.toUpperCase() === newName.toUpperCase()

  const deletePerson = id => {
    const person = persons.find(n => n.id === id)
    
    if( window.confirm(`Delete ${person.name} ?`) === true ){
      personService
                  .delete(id)
                  .then(setPersons(persons.filter(person => person.id !== id)))
                  .catch(error => {
                    setMessageAndType( `Information of ${person.name} has already removed from server`, 'E')
                    setTimeout(() => {
                      setMessageAndType(null,null)
                    }, 5000)
                    setPersons(persons.filter(p => p.id !== id))
                  }) 
    }
  }

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = persons.find(findNameFunc)

    if(typeof personObject === 'undefined'){
      personService.create({
                      name: newName,
                      number: newNumber,
                      id: persons.reduce((maxId, person) => Math.max(maxId, person.id) ,0) + 1
                    })
                   .then(returnedPerson => {
                        setMessageAndType( `Added ${returnedPerson.name}`, 'S')
                        setTimeout(() => {
                          setMessageAndType(null, null)
                        }, 5000)
                        setPersons(persons.concat(returnedPerson))
                        setNewName('')
                        setNewNumber('')
                    })
                  .catch(error => {
                        setMessageAndType( error.response.data.error, 'E')
                        setTimeout(() => {
                          setMessageAndType(null,null)
                        }, 5000)
                    }) 
      
    }
    else{
      if( window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)){

        const changedObject = { ...personObject, number: newNumber}

        personService.update(changedObject.id, changedObject)
                      .then(returnedPerson => {
                            setMessageAndType( `Updated ${returnedPerson.name}`, 'S')
                            setTimeout(() => {
                              setMessageAndType(null, null)
                            }, 5000)

                            setPersons(persons.map(person => person.id !== changedObject.id ? person : returnedPerson ))
                            setNewName('')
                            setNewNumber('')
                      })
                      .catch(error => {
                        setMessageAndType( error.response.data.error, 'E')
                        setTimeout(() => {
                          setMessageAndType(null,null)
                        }, 5000)
                      }) 
                      
      }
    }
    
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType} />
      <Filter newFilter={newFilter} handleFilterChange={handleFilterChange} />
       
      <h3>add a new</h3>
      <PersonForm addPerson={addPerson} newName={newName} newNumber={newNumber} handleNameChange={handleNameChange} handleNumberChange={handleNumberChange} />
      
      <h3>Numbers</h3>
      <Persons persons={persons.filter(person =>  person.name.toUpperCase().search(newFilter.toUpperCase()) === -1 ? false : true )} deleteFunc={deletePerson} />
    </div>
  )
}

export default App