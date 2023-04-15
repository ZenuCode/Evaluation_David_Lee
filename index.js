// Completed JS Code
const APIs = (() => {
    const getTodos = () => {
        return fetch("http://localhost:3000/todos/").then((res) => res.json());
    };

    const createTodo = (newTodo) => {
        return fetch("http://localhost:3000/todos/", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const moveTodo = (data, id) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        })
        .then(() => { window.location.reload(); })
        .then((res) => res.json());
    }

    const editTodo = (data, id) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        })
        .then(() => { window.location.reload(); })
        .then((res) => res.json());
    };

    return { getTodos, createTodo, deleteTodo, moveTodo, editTodo, };
})();

const Model = (() => {
    class State {
        #todos;
        #onChange;
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // console.log("setter function"); //Comment Out Given Console Logs
            this.#todos = newTodos;
            this.#onChange?.();
        }

        subscribe(callback) {
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo, moveTodo, editTodo } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        moveTodo,
        editTodo,
    };
})();

const View = (() => {
    const todolistEl = document.querySelector(".todo-list-one");
    const todolistE2 = document.querySelector(".todo-list-two");
    const submitBtnEl = document.querySelector(".submit-btn");
    const inputEl = document.querySelector(".input");

    const renderTodos = (todos) => {
        let todoOneList = "";
        let todoTwoList = "";
        todos.forEach((todo) => {
            if (todo.list == 1) {
                todoOneList += `<li id="${todo.id}" placeholder="${todo.list}">
                <span id="span">${todo.content}</span>
                <button class="edit-btn" type="button"></button>
                <button class="delete-btn" id="${todo.id}" type="button"></button>
                <button class="move-btn-right" type="button"></button></li>`;
            }
            else if (todo.list == 2) {
                todoTwoList += `<li id="${todo.id}" placeholder="${todo.list}">
                <button class="move-btn-left" type="button"></button>
                <span id="span">${todo.content}</span>
                <button class="edit-btn" type="button"></button>
                <button class="delete-btn" id="${todo.id}" type="button"></button></li>`;
            }
        });
        if (todoOneList.length === 0) {
            todoOneList = "<h4>no task to display!</h4>";
        }
        if (todoTwoList.length === 0) {
            todoTwoList = "<h4>no task to display!</h4>";
        }
        todolistEl.innerHTML = todoOneList;
        todolistE2.innerHTML = todoTwoList;
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, inputEl, clearInput, todolistEl, todolistE2 };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            const inputValue = view.inputEl.value;
            if (inputValue != "") {
                model.createTodo({ content: inputValue, list: 1 }).then((data) => {
                    state.todos = [data, ...state.todos];
                    view.clearInput();
                });
            }
        });
    };

    const handleDelete = () => {
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                //console.log("id", typeof id); //Comment Out Given Console Logs
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
        view.todolistE2.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                //console.log("id", typeof id); //Comment Out Given Console Logs
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const handleMove = () => {
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "move-btn-right") {
                event.target.list = 2;
                const span = event.target.parentNode.querySelector("#span");
                const listNum = event.target.list;
                const idNum = event.target.parentNode.id;
                const data = { content: span.innerHTML, list: listNum, id: idNum }
                model.moveTodo(data, event.target.parentNode.id);
            }
        });
        view.todolistE2.addEventListener("click", (event) => {
            if (event.target.className === "move-btn-left") {
                event.target.list = 1;
                const span = event.target.parentNode.querySelector("#span");
                const listNum = event.target.list;
                const idNum = event.target.parentNode.id;
                const data = { content: span.innerHTML, list: listNum, id: idNum }
                model.moveTodo(data, event.target.parentNode.id);
            }
        });
    }

    const handleEdit = () => {
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "edit-btn") {
                const target = event.target;
                const span = target.parentNode.querySelector("#span");
                span.contentEditable = true;
                span.focus();
                span.style.textAlign = "left";
                span.style.backgroundColor = "white";
                span.addEventListener("blur", function () {
                    span.style.textAlign = "center";
                    span.blur();
                    span.contentEditable = false;
                    span.style.backgroundColor = "none";
                    const listNum = event.target.parentNode.getAttribute("placeholder");
                    const idNum = event.target.parentNode.id;
                    const data = { content: span.innerHTML, list: listNum, id: idNum };
                    model.editTodo(data, event.target.parentNode.id);
                });
            }
        });
        view.todolistE2.addEventListener("click", (event) => {
            if (event.target.className === "edit-btn") {
                const target = event.target;
                const span = target.parentNode.querySelector("#span");
                span.contentEditable = true;
                span.focus();
                span.style.textAlign = "left";
                span.style.backgroundColor = "white";
                span.addEventListener("blur", function () {
                    span.style.textAlign = "center";
                    span.blur();
                    span.contentEditable = false;
                    span.style.backgroundColor = "none";
                    const listNum = event.target.parentNode.getAttribute("placeholder");
                    const idNum = event.target.parentNode.id;
                    const data = { content: span.innerHTML, list: listNum, id: idNum };
                    model.editTodo(data, event.target.parentNode.id);
                });
            }
        });
    }

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        handleMove();
        handleEdit();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return { 
        bootstrap, 
    };
})(View, Model); //ViewModel

Controller.bootstrap();
