const Persons = ({persons, deleteFunc}) => {
    return (
      <table>
        <tbody>
          {persons.map(person => <Person person={person} key={person.name} deleteFunc={() => deleteFunc(person.id)} />)}
        </tbody> 
      </table> 
    )
  }
  
  const Person = ({person, deleteFunc}) => <tr>
                                    <td>{person.name}</td>
                                    <td>{person.number}</td>
                                    <td><button onClick={deleteFunc}>Delete</button></td>
                               </tr>

export default Persons