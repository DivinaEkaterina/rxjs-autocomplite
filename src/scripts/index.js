import { fromEvent, of, from, combineLatest, Observable } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { debounceTime, distinctUntilChanged, map, switchMap, tap, catchError, combineAll } from 'rxjs/operators';

import { getUsersSearchUrl, getReposSearchUrl } from './helpers/getSearchUrl';
import { HALF_SECOND_DELAY } from './constants';
import '../styles/materialize.min.css';
import '../styles/style.css';

const searchBox = document.querySelector('input');
const resultsList = document.querySelector('ul');

const renderUsers = name => {
    const make = name => {
        const node = document.createElement('li');
        const textnode = document.createTextNode(name);
        node.appendChild(textnode);
        resultsList.appendChild(node);
    };

    if (Array.isArray(name)) {
        name.forEach(userName => make(userName));
    } else {
        make(name);
    }
};

const fetchUsers = query =>
    fromFetch(getUsersSearchUrl(query)).pipe(
        switchMap(response => {
            if (response.ok) {
                return response.json();
            } else {
                return of({ error: true, message: `Error ${response.status}` });
            }
        }),
        catchError(err => of({ error: true, message: err.message }))
    );

const fetchRepos = user =>
    fromFetch(getReposSearchUrl(user)).pipe(
        switchMap(response => {
            if (response.ok) {
                return response.json();
            } else {
                return of({ error: true, message: `Error ${response.status}` });
            }
        }),
        catchError(err => of({ error: true, message: err.message }))
    );

const inputObservable = fromEvent(searchBox, 'input').pipe(
    debounceTime(HALF_SECOND_DELAY),
    map(event => event.target.value),
    distinctUntilChanged(),
    tap(() => (resultsList.innerHTML = '')),
    switchMap(query => fetchUsers(query.trim())),
    map(data => {
        console.log(data.items);
        return data.items;
    }),
    switchMap(users => combineLatest(users.map(user => fetchRepos(user.login))))
);

inputObservable.subscribe(data => {
    console.log(data);
    let searchValue = '';

    // if (data.total_count === 0) {
    //     searchValue = 'There are no such users';
    // } else if (!data.error) {
    //     searchValue = data.items.map(item => item.login);
    // } else {
    //     searchValue = 'You must enter something to search';
    // }

    // renderUsers(searchValue);
});
