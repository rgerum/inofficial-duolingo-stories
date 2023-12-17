//import { sql } from "@vercel/postgres";

if (!process.env.NEXTAUTH_URL) {
  const sqlite3 = require("sqlite3").verbose();

  // Create a new in-memory database
  //const db = new sqlite3.Database(':memory:');
  async function sqlite_query(row, params) {
    // to make the query compatible with mysql and sqlite
    row = row.replace(
      "CURRENT_DATE() - INTERVAL 1 MONTH",
      "date('now', '-1 month')",
    );
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database("test.sqlite");
      db.all(row, params, (err, rows) => {
        db.close();
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async function sqlite_insert(table_name, data, mapping) {
    let values = [];
    let columns = [];
    let value_placeholders = [];
    for (let key in data) {
      if (
        mapping === undefined ||
        (mapping.includes && mapping.includes(key))
      ) {
        values.push(data[key]);
        columns.push(`${key}`);
        value_placeholders.push(`?`);
      } else if (mapping[key]) {
        values.push(data[key]);
        columns.push(`${mapping[key]}`);
        value_placeholders.push(`?`);
      }
    }
    let columns_string = columns.join(", ");
    let value_placeholders_string = value_placeholders.join(", ");

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database("test.sqlite");
      db.run(
        `INSERT INTO ${table_name}
                            (${columns_string})
                            VALUES (${value_placeholders_string});`,
        values,
        function (err) {
          db.close();
          if (err) reject(err);
          else {
            resolve(this.lastID);
          }
        },
      );
    });
  }

  async function sqlite_update(table_name, data) {
    let values = [];
    let updates = [];
    for (let key in data) {
      values.push(data[key]);
      updates.push(`${key} = ?`);
    }
    values.push(data.id);
    let update_string = updates.join(", ");
    return await sqlite_query(
      `UPDATE ${table_name}
                            SET ${update_string}
                            WHERE id = ?
                            ;`,
      values,
    );
  }

  async function sqlite_query_one_obj(q, params) {
    const res = await sqlite_query(q, params);

    if (res.length === 0) return undefined;
    return Object.assign({}, res[0]);
  }

  async function sqlite_query_objs(q, params, key) {
    const res = await sqlite_query(q, params);

    if (key) {
      let result = {};
      for (let q of res) result[q[key]] = Object.assign({}, q);
      return result;
    }
    let result = [];
    for (let q of res) result.push(Object.assign({}, q));
    return result;
  }

  module.exports = sqlite_query;
  module.exports.insert = sqlite_insert;
  module.exports.update = sqlite_update;
  module.exports.query_one_obj = sqlite_query_one_obj;
  module.exports.query_objs = sqlite_query_objs;
} else {
  const mysql = require("mysql2");

  //const { sql } = require("@vercel/postgres");
  const postgres = require("postgres");

  const sql = postgres(
    "postgres://duostori_db:VtyX.sXIYeiHR_:vI.aa@localhost:5432/duostori_post",
    {
      /* options */
    },
  ); // will use psql environment variables

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 1, // Adjust this as needed
  });

  async function query(query, args) {
    if (!Array.isArray(args) && args !== undefined) args = [args];

    console.log("query:", query, args);

    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting database connection:", err);
          reject(err);
          return;
        }

        // Use the connection for your queries
        connection.query(query, args, (queryError, results) => {
          // Handle your query results here
          connection.release(); // Release the connection when done
          if (queryError) {
            console.error("Error in query:", queryError);
            reject(queryError);
            return;
          }
          resolve(results);
        });
      });
    });
  }

  function queryXXX(sqlQuery, args) {
    if (!Array.isArray(args) && args !== undefined) args = [args];

    console.log("query:", sqlQuery, args);
    // Split the SQL query on '?'
    const parts = sqlQuery.split("?");

    if (parts.length - 1 !== args.length) {
      throw new Error(
        "Number of placeholders does not match number of arguments",
      );
    }

    // Dynamically construct the tagged template string
    let query = parts[0];
    for (let i = 0; i < args.length; i++) {
      query += "${" + i + "}" + parts[i + 1];
    }

    // Evaluate the constructed string as a tagged template
    return eval("sql`" + query + "`");
  }

  async function update_old(table_name, data, mapping) {
    let values = [];
    let updates = [];
    for (let key in data) {
      if (mapping.includes && mapping.includes(key)) {
        values.push(data[key]);
        updates.push(`${key} = ?`);
      } else if (mapping[key]) {
        values.push(data[key]);
        updates.push(`${mapping[key]} = ?`);
      }
    }
    let update_string = updates.join(", ");
    values.push(data["id"]);
    return await query(
      `UPDATE ${table_name} SET ${update_string} WHERE id = ?;`,
      values,
    );
  }

  async function update(table_name, data, mapping) {
    let values = {};
    for (let key in data) {
      if (mapping.includes && mapping.includes(key)) {
        values[key] = data[key];
      } else if (mapping[key]) {
        values[mapping[key]] = data[key];
      }
    }
    return sql`
  update ${table_name} set ${sql(values)}
  where id = ${data.id}
`;
  }

  async function insert_old(table_name, data, mapping) {
    let values = [];
    let columns = [];
    let value_placeholders = [];
    for (let key in data) {
      if (
        mapping === undefined ||
        (mapping.includes && mapping.includes(key))
      ) {
        values.push(data[key]);
        columns.push(`${key}`);
        value_placeholders.push(`?`);
      } else if (mapping[key]) {
        values.push(data[key]);
        columns.push(`${mapping[key]}`);
        value_placeholders.push(`?`);
      }
    }
    let columns_string = columns.join(", ");
    let value_placeholders_string = value_placeholders.join(", ");
    let new_entry = await query(
      `INSERT INTO ${table_name}
                            (${columns_string})
                            VALUES (${value_placeholders_string})
                            LIMIT 1;`,
      values,
    );
    return new_entry.insertId;
  }
  async function insert(table_name, data, mapping) {
    let values = {};
    for (let key in data) {
      if (
        mapping === undefined ||
        (mapping.includes && mapping.includes(key))
      ) {
        values[key] = data[key];
      } else if (mapping[key]) {
        values[mapping[key]] = data[key];
      }
    }
    console.log(table_name, values);
    console.log(sql(values));
    let new_entry = await sql`
  insert into ${table_name} ${sql(values)} returning id`;
    return new_entry[0].id;
  }

  async function query_one_obj(q, params) {
    const res = await query(q, params);

    if (res.length === 0) return undefined;
    return Object.assign({}, res[0]);
  }

  async function query_objs(q, params, key) {
    const res = await query(q, params);

    if (key) {
      let result = {};
      for (let q of res) result[q[key]] = Object.assign({}, q);
      return result;
    }
    let result = [];
    for (let q of res) result.push(Object.assign({}, q));
    return result;
  }

  module.exports = query;
  module.exports.insert = insert;
  module.exports.update = update;
  module.exports.query_one_obj = query_one_obj;
  module.exports.query_objs = query_objs;

  module.exports.sql = sql;
}
