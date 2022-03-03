# mexit-backend

### Usage

- Clone the repository on your local machine

```
git clone mexit-backend repo : https://github.com/workduck-io/mexit-backend.git
```

- Install the npm packages using yarn and start the server

```
cd mexit-backend/
yarn
yarn start
```

- By default the server will be listening in port 3000

```
yarn run v1.22.17
$ tsc && node dist/app.js
Express is listening at http://localhost:3000
```

### For Developers

- Once you develop a feature or fix bug. please create corresponding unit tests if needed.

- By default when you raise a PR or merge the PR to the main branch the unit tests will run through github actions.

- To manually run the unit tests

```
yarn test:unit
```

- To manually run the integration tests

```
yarn test:integration
```

- To run all the tests.

```
yarn test
```
