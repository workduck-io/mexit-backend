import { application } from './app';

application._app.listen(application._port, () => {
  return console.log(
    `Express is listening at http://localhost:${application._port}`
  );
});
