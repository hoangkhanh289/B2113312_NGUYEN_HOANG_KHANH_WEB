const app = require("./app");
const config = require("./app/config");

const PORT = config.app.port;
app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}.`); // Dùng dấu backtick (`) thay vì dấu nháy đơn (')
});
