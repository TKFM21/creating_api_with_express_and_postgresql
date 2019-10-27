const app = require('./server');
const chalk = require('chalk');
const PORT = 3001;

app.listen(PORT, () => {
    console.log(chalk.green.bold('Server Listening on PORT:') + chalk.cyan.bold(`${PORT}`));
});