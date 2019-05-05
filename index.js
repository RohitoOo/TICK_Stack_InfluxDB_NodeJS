const Influx = require("influx")
const express = require("express")
const http = require("http")
const os = require("os")

const app = express()

const influx = new Influx.InfluxDB({
  host: "68.183.198.16",
  database: "telegraf"
  // schema: [
  //   {
  //     measurement: "response_times",
  //     fields: {
  //       path: Influx.FieldType.STRING,
  //       duration: Influx.FieldType.INTEGER
  //     },
  //     tags: ["host"]
  //   }
  // ]
})

influx
  .getDatabaseNames()
  .then(names => {
    console.log("Existing Databases", names)
    if (!names.includes("telegraf")) {
      return influx.createDatabase("telegraf")
    }
  })
  .then(() => {
    http.createServer(app).listen(3000, function() {
      console.log("Listening on port 3000")
    })
  })
  .catch(err => {
    console.error(`Error creating Influx database!`)
  })

app.use((req, res, next) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    console.log(`Request to ${req.path} took ${duration}ms`)

    // influx
    //   .writePoints([
    //     {
    //       measurement: "b",
    //       tags: { host: os.hostname() },
    //       fields: { duration, path: req.path }
    //     }
    //   ])
    //   .catch(err => {
    //     console.error(`Error saving data to InfluxDB! ${err.stack}`)
    //   })
  })
  return next()
})

app.get("/", function(req, res) {
  setTimeout(() => res.end("Hello world!"), Math.random() * 500)
})

app.get("/times", async (req, res) => {
  const result = await influx.query(
    `   
    select * from disk
    limit 10
    `
  )
  res.send(result)
  //   res.send(JSON.stringify(result[0].used_percent))
})
