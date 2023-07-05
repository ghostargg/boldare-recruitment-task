import { useEffect, useMemo, useState } from 'react';
import peopleFromServer from './utils/data.json';
import moment from 'moment';
import './App.css';
import { Person } from './types/Person';
import { Pagination } from './components/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const normalizeDate = (date: string) => {
  const splitDate = date.split(' ');
  const datePart = splitDate[0];
  const timePart = splitDate[1];
  const [day, month, year] = datePart.split('.');
  const [hour, minute] = timePart.split(':');

  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
};

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [selectedFunction, setSelectedFunction] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    setPeople(peopleFromServer);

    const peopleDates = peopleFromServer
      .map((person) => normalizeDate(person.dateOfBirth))
      .sort((a, b) => a.toISOString().localeCompare(b.toISOString()));

    setStartDate(peopleDates[0]);
    setEndDate(peopleDates[peopleDates.length - 1]);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (sortType: string) => {
    if (sortType === sortBy && sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection('asc');
    }

    setSortBy(sortType)
  }

  const peopleFunctions = Array.from(new Set(people.map((person) => person.function)));

  const visiblePeople = useMemo(() => {
    setCurrentPage(1)
    let filteredPeople = people;

    if (query) {
      filteredPeople = filteredPeople.filter((person) => {
        const filterBy = `
          ${person.firstName}
          ${person.lastName}
          `.toLowerCase();

        return filterBy.includes(query.toLowerCase());
      });
    }

    switch (sortBy) {
      case 'id':
        filteredPeople = filteredPeople.sort(
          (firstPerson, secondPerson) => firstPerson.id - secondPerson.id,
        );
        break;
      case 'firstName':
        filteredPeople = filteredPeople.sort((firstPerson, secondPerson) =>
          firstPerson.firstName.localeCompare(secondPerson.firstName),
        );
        break;
      case 'lastName':
        filteredPeople = filteredPeople.sort((firstPerson, secondPerson) =>
          firstPerson.lastName.localeCompare(secondPerson.lastName),
        );
        break;
      case 'dateOfBirth':
        filteredPeople = filteredPeople.sort((firstPerson, secondPerson) => {
          const firstPersonDate = moment(firstPerson.dateOfBirth, 'D.M.YYYY H:mm');
          const secondPersonDate = moment(secondPerson.dateOfBirth, 'D.M.YYYY H:mm');

          return firstPersonDate.diff(secondPersonDate);
        });
        break;
      case 'function':
        filteredPeople = filteredPeople.sort((firstPerson, secondPerson) =>
          firstPerson.function.localeCompare(secondPerson.function),
        );
        break;
      case 'experience':
        filteredPeople = filteredPeople.sort(
          (firstPerson, secondPerson) => firstPerson.experience - secondPerson.experience,
        );
        break;
      case 'all':
      default:
        break;
    }

    switch (selectedFunction) {
      case 'kamerdyner':
      case 'kucharka':
      case 'pokojówka':
      case 'lokaj':
        filteredPeople = filteredPeople.filter((person) => person.function === selectedFunction);
        break;
      case 'all':
      default:
        break;
    }

    filteredPeople = filteredPeople.filter(person => {
      const personDate = normalizeDate(person.dateOfBirth);
      if (startDate && endDate) {
        return personDate >= startDate && personDate <= endDate;
      }
    })

    if (sortDirection === 'desc') {
      return filteredPeople.reverse();
    }

    return filteredPeople;
  }, [query, people, sortBy, selectedFunction, endDate, startDate, sortDirection]);

  const paginatedPeople = useMemo(() => {
    const firstIndex = (currentPage - 1) * 5;
    const lastIndex = firstIndex + 5;

    return visiblePeople.slice(firstIndex, lastIndex);
  }, [visiblePeople, currentPage]);

  return (
    <div className='App'>
      <section className='is-flex is-justify-content-space-between'>
        <div className='block'>
          <p className='control has-icons-left has-icons-right'>
            <input
              type='text'
              className='input'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search'
            />

            <span className='icon is-left'>
              <i className='fas fa-search' aria-hidden='true' />
            </span>

            {query && (
              <span className='icon is-right'>
                <button
                  onClick={() => setQuery('')}
                  data-cy='ClearButton'
                  type='button'
                  className='delete'
                />
              </span>
            )}
          </p>
        </div>
        <div className='date'>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
        </div>
        <div className='select'>
          <select
            value={selectedFunction}
            onChange={(event) => setSelectedFunction(event.target.value)}
          >
            <option value='all' className='function-option'>
              All
            </option>
            {peopleFunctions.map((func) => (
              <option key={func} value={func} className='function-option'>
                {func}
              </option>
            ))}
          </select>
        </div>
      </section>
      {visiblePeople.length > 5 && (
        <section className='pagination is-centered'>
          <Pagination
            total={visiblePeople.length}
            onPageChange={handlePageChange}
            currentPage={currentPage}
          />
        </section>
      )}
      <section className='box table-container'>
        <table className='table is-striped is-narrow is-fullwidth is-hoverable'>
          <thead>
            <tr>
              <th>
                <span className='is-flex is-flex-wrap-nowrap'>
                  ID
                  <a href='#/' onClick={() => handleSort('id')}>
                    <span className='icon'>
                      <i className='fas fa-sort' />
                    </span>
                  </a>
                </span>
              </th>

              <th>
                <span className='is-flex is-flex-wrap-nowrap'>
                  Name
                  <a href='#/' onClick={() => handleSort('firstName')}>
                    <span className='icon'>
                      <i className='fas fa-sort' />
                    </span>
                  </a>
                </span>
              </th>

              <th>
                <span className='is-flex is-flex-wrap-nowrap'>
                  Surname
                  <a href='#/' onClick={() => handleSort('lastName')}>
                    <span className='icon'>
                      <i className='fas fa-sort' />
                    </span>
                  </a>
                </span>
              </th>

              <th>
                <span className='is-flex is-flex-wrap-nowrap'>
                  Birth date
                  <a href='#/' onClick={() => handleSort('dateOfBirth')}>
                    <span className='icon'>
                      <i className='fas fa-sort' />
                    </span>
                  </a>
                </span>
              </th>

              <th>
                <span className='is-flex is-flex-wrap-nowrap'>
                  Function
                  <a href='#/' onClick={() => handleSort('function')}>
                    <span className='icon'>
                      <i className='fas fa-sort' />
                    </span>
                  </a>
                </span>
              </th>

              <th>
                <span className='is-flex is-flex-wrap-nowrap'>
                  Experience
                  <a href='#/' onClick={() => handleSort('experience')}>
                    <span className='icon'>
                      <i className='fas fa-sort' />
                    </span>
                  </a>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedPeople.map((person) => {
              const {
                id,
                dateOfBirth,
                experience,
                firstName,
                function: personFunction,
                lastName,
              } = person;
              return (
                <tr key={id}>
                  <td className='has-text-weight-bold'>{id}</td>
                  <td>{firstName}</td>
                  <td>{lastName}</td>
                  <td>{dateOfBirth}</td>
                  <td className='capitalize'>{personFunction}</td>
                  <td>{experience}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
