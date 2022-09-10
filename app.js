const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const addDay = require("date-fns/addDays");

const isValid = require("date-fns/isValid");
const isMatch = require("date-fns/isMatch");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeServerAndDatabase = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localpost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeServerAndDatabase();

const convertTodoObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategoryProperties = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasSearchProperties = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

app.get("/todos", async (request, response) => {
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
            SELECT *
            FROM  todo
            WHERE
                status = '${status}';`;
        const statusData = await db.all(getTodosQuery);
        response.send(
          statusData.map((eachArray) =>
            convertTodoObjectToResponseObject(eachArray)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
            SELECT *
            FROM Todo
            WHERE
                priority = '${priority}';`;
        const priorityData = await db.all(getTodosQuery);
        response.send(
          priorityData.map((eachArray) =>
            convertTodoObjectToResponseObject(eachArray)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                SELECT
                    *
                FROM
                    Todo 
                WHERE
                    status = '${status}'
                    And priority = '${priority}';`;
          const priorityStatusData = await db.all(getTodosQuery);
          response.send(
            priorityStatusData.map((eachArray) =>
              convertTodoObjectToResponseObject(eachArray)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCategoryAndStatusProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                SELECT *
                FROM todo
                WHERE
                    category = '${category}'
                    AND status = '${status}';`;
          const categoryStatusData = await db.all(getTodosQuery);
          response.send(
            categoryStatusData.map((eachArray) =>
              convertTodoObjectToResponseObject(eachArray)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
            SELECT *
            FROM todo
            WHERE
                category = '${category}';`;
        const categoryData = await db.all(getTodosQuery);
        response.send(
          categoryData.map((eachArray) =>
            convertTodoObjectToResponseObject(eachArray)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryAndPriorityProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
                SELECT *
                FROM todo
                WHERE
                     category = '${category}'
                    AND priority = '${priority}';`;
          const categoryPriorityData = await db.all(getTodosQuery);
          response.send(
            categoryPriorityData.map((eachArray) =>
              convertTodoObjectToResponseObject(eachArray)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasSearchProperties(request.query):
      getTodosQuery = `
        SELECT *
        FROM Todo
        WHERE
            todo LIKE '%${search_q}%';`;
      const todoData = await db.all(getTodosQuery);
      response.send(
        todoData.map((eachArray) =>
          convertTodoObjectToResponseObject(eachArray)
        )
      );
      break;

    default:
      getTodosQuery = `
        SELECT *
        FROM Todo;`;
      defaultData = await db.all(getTodosQuery);
      response.send(
        defaultData.map((eachArray) =>
          convertTodoObjectToResponseObject(eachArray)
        )
      );
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE
        id = ${todoId};`;
  const todoInfo = await db.get(getTodoQuery);
  response.send(convertTodoObjectToResponseObject(todoInfo));
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);

    getAgendaQuery = `
        SELECT *
        FROM todo
        WHERE
            due_date = '${newDate}';`;
    const agendaResult = await db.all(getAgendaQuery);
    response.send(
      agendaResult.map((eachAgenda) =>
        convertTodoObjectToResponseObject(eachAgenda)
      )
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "Learning"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const getPostQuery = `
                    INSERT INTO
                        todo(id,todo,category,priority,status,due_date)
                    VALUES (${todoId},'${todo}','${category}','${priority}','${status}','${postDueDate}');`;
          await db.run(getPostQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  const getPreviousTodoQuery = `
    SELECT *
    FROM todo
    WHERE
        id = ${todoId};`;
  const previousTodo = await db.get(getPreviousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  let updateTodoQuery;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
              UPDATE todo
              SET
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                due_date = '${dueDate}'
              WHERE
                id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodoQuery = `
            UPDATE todo
            SET
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                due_date = '${dueDate}'
            WHERE
                id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case requestBody.todo !== undefined:
      updateTodoQuery = `
        UPDATE todo
        SET
            todo = '${todo}',
            priority = '${priority}',
            status = '${status}',
            category = '${category}',
            due_date = '${dueDate}'
        WHERE
            id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;

    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `
            UPDATE todo
            SET
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                due_date = '${dueDate}'
            WHERE
                id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `
            UPDATE todo
            SET
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                due_date = '${newDueDate}'
            WHERE
                id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;

    default:
      updateTodosQuery = `
        SELECT *
        FROM Todo;`;
      const updatedData = await db.all(getTodosQuery);
      response.send(
        defaultData.map((eachArray) =>
          convertTodoObjectToResponseObject(eachArray)
        )
      );
  }
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getDeleteQuery = `
    DELETE FROM
        todo
    WHERE
        id = ${todoId};`;
  await db.run(getDeleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
