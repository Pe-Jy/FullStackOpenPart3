import { useState, useEffect } from 'react'
import personService from './services/persons'

const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={type}>
      {message}
    </div>
  )
}

const Filter = ({ filterName, handleFilterChange }) => {
  return (
    <div>
      filter shown with <input
        value={filterName}
        onChange={handleFilterChange}
      />
    </div>
  )
}

const PersonForm = ({ addPerson, handleNameChange, handleNumberChange, newName, newNumber }) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input
          value={newName}
          onChange={handleNameChange}
        />
      </div>
      <div>
        number: <input
          value={newNumber}
          onChange={handleNumberChange}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ filterPersons, erasePerson }) => {
  return (
    <div>
      {filterPersons.map(person =>
        <p key={person.name}>{person.name} {person.number}
          <button onClick={() => erasePerson(person.id)}>delete</button>
        </p>
      )}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterName, setFilterName] = useState('')
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()

    const personAlreadyAdded = persons.find(person => person.name === newName)

    if (personAlreadyAdded) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedNumber = { ...personAlreadyAdded, number: newNumber }

        personService
          .update(personAlreadyAdded.id, updatedNumber)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== personAlreadyAdded.id ? person : returnedPerson))
            setNewName('')
            setNewNumber('')
            setNotification(`Updated the number of ${newName}`)
            setNotificationType('updated')
            setTimeout(() => {
              setNotification(null)
            }, 5000)
          })
          .catch(error => {
            setNotification(error.response.data.error)
            setNotificationType('error')
            setTimeout(() => {
              setNotification(null)
            }, 5000)
            // setPersons(persons.filter(person => person.id !== personAlreadyAdded.id))
          })
      }

    } else {
      const personObject = {
        name: newName,
        number: newNumber
      }

      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setNotification(`Added ${newName}`)
          setNotificationType('added')
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
        .catch(error => {
          console.log(error.response.data)
          setNotification(error.response.data.error)
          setNotificationType('error')
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
    }
  }

  const erasePerson = (id) => {
    const person = persons.find(person => person.id === id)
    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .erase(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          setNotification(`Deleted ${person.name}`)
          setNotificationType('deleted')
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
    }
  }

  const filterPersons = persons.filter(person =>
    person.name.toLowerCase().includes(filterName.toLowerCase())
  )

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilterName(event.target.value)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} type={notificationType} />
      <Filter value={filterName} handleFilterChange={handleFilterChange} />
      <h3>add a new</h3>
      <PersonForm
        addPerson={addPerson}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        newName={newName}
        newNumber={newNumber}
      />
      <h3>Numbers</h3>
      <Persons filterPersons={filterPersons} erasePerson={erasePerson} />
    </div>
  )
}

export default App