const express = require("express");
const app = express();
const port = 3000;
const authRouter = require("./src/routes/Auth");
const customerRouter = require("./src/routes/Customer");
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/customer", customerRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
