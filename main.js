"use strict";

(() => {
  const todoForm = document.querySelector(".todo__form");
  const todoList = document.querySelector(".todo__list");
  const todoSearchText = document.querySelector(".todo__input--search-text");
  const todoSearchDate = document.querySelector(".todo__input--search-date");
  const todoAlert = document.querySelector(".todo__alert");

  let tasks = [];
  let isEventListenersAdded = false;

  const API_URL = "http://127.0.0.1:9000/v1/tasks";

  const displayAlert = (action) => {
    if (action === "delete") {
      todoAlert.textContent = "Todo Removed";
      todoAlert.style.backgroundColor = "red";
    } else if (action === "create") {
      todoAlert.textContent = "Todo Added To The List";
      todoAlert.style.backgroundColor = "green";
    } else if (action === "modify") {
      todoAlert.textContent = "Todo Changed";
      todoAlert.style.backgroundColor = "skyblue";
    }

    setTimeout(() => {
      todoAlert.textContent = "";
      todoAlert.style.backgroundColor = "transparent";
    }, 700);
  };

  const formatToIsoString = (date = new Date()) => {
    const formatedDate = new Date(date).toISOString().split("T")[0];
    return formatedDate;
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.status === 204) {
        return [];
      } else if (!response.ok) {
        throw new Error(response.status);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(error);
    }
  };

  const closeModal = (modal) => {
    modal.classList.add("display-non");
  };

  const updateTaskDate = async (taskItem, newDate) => {
    const taskLabel = taskItem.id;
    const newEndDate = new Date(newDate).toISOString();

    try {
      await fetch(`${API_URL}/${taskLabel}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          end_date: newEndDate,
        }),
      });
      displayAlert("modify");
    } catch (error) {
      throw new Error(error);
    }

    tasks = tasks.map((task) => {
      if (task.label === taskLabel) {
        return {
          ...task,
          end_date: newEndDate,
        };
      }
      return task;
    });

    tasks = sortTasks(tasks);

    todoList.innerHTML = "";
    tasks.forEach(displayTasks);
  };

  const modifyTask = async (e) => {
    const taskItem = e.target.closest("li");
    const modal = document.querySelector(".modal");
    modal.classList.remove("display-non");
    const modalDescription = document.querySelector(".modal__description");
    modalDescription.textContent = taskItem.children[1].textContent;
    const modalInputDate = document.querySelector(".modal__input--date");
    const modalXIcon = document.querySelector(".fa-xmark");

    if (!isEventListenersAdded) {
      modalInputDate.addEventListener("change", () => {
        updateTaskDate(taskItem, modalInputDate.value);
        closeModal(modal);
      });
    }

    modalXIcon.addEventListener("click", () => closeModal(modal));

    isEventListenersAdded = true;
  };

  const deleteTask = async (e) => {
    const taskItem = e.target.closest("li");
    const taskLabel = taskItem.id;

    try {
      await fetch(`${API_URL}/${taskLabel}`, {
        method: "DELETE",
      });

      taskItem.remove();
      tasks = tasks.filter((task) => task.label !== taskLabel);
      displayAlert("delete");
    } catch (error) {
      throw new Error(error);
    }
  };

  const displayTasks = (task) => {
    const { label, description, end_date } = task;
    const endDate = formatToIsoString(end_date);

    const taskItem = document.createElement("li");
    taskItem.id = label;
    taskItem.classList.add("todo__item");

    const today = formatToIsoString();
    const isExpired = formatToIsoString(end_date) < today;

    if (isExpired) {
      taskItem.classList.add("todo__item--expired");
    }

    const taskDescription = document.createElement("p");
    taskDescription.classList.add("todo__description");
    taskDescription.textContent = description;
    const taskDate = document.createElement("span");
    taskDate.classList.add("todo__date");
    taskDate.textContent = endDate;
    const taskIcons = document.createElement("div");
    taskIcons.classList.add("todo__icons");
    const taskModifyIcon = document.createElement("i");
    taskModifyIcon.classList.add("fa-solid", "fa-pen-to-square");
    const taskTrashIcon = document.createElement("i");
    taskTrashIcon.classList.add("fa-solid", "fa-trash");

    taskModifyIcon.addEventListener("click", modifyTask);
    taskTrashIcon.addEventListener("click", deleteTask);

    taskIcons.appendChild(taskModifyIcon);
    taskIcons.appendChild(taskTrashIcon);
    taskItem.appendChild(taskDate);
    taskItem.appendChild(taskDescription);
    taskItem.appendChild(taskIcons);

    todoList.appendChild(taskItem);
  };

  const handleFilterByDescription = (e) => {
    const value = e.target.value.toLowerCase();
    const filteredTasks = tasks.filter((task) =>
      task.description.toLowerCase().includes(value)
    );

    todoList.innerHTML = "";

    filteredTasks.length === 0
      ? (todoList.textContent = "Sorry, no todo matched your search")
      : filteredTasks.forEach(displayTasks);
  };

  const handleFilterByDate = (e) => {
    todoList.innerHTML = "";

    if (e.target.value === "") {
      tasks.forEach(displayTasks);
      return;
    }

    const value = formatToIsoString(e.target.value);
    const filteredTasks = tasks.filter(
      (task) => formatToIsoString(task.end_date) === value
    );
    filteredTasks.length === 0
      ? (todoList.textContent = "Sorry, no todo matched your search")
      : filteredTasks.forEach(displayTasks);
  };

  const createTask = async (taskData, endDate) => {
    const taskLabel = taskData.label;

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      await fetch(`${API_URL}/${taskLabel}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          end_date: endDate,
        }),
      });
      displayAlert("create");
    } catch (error) {
      throw new Error(error);
    }
  };

  const sortTasks = (tasks) => {
    const sortedTasks = tasks.sort(
      (a, b) => new Date(b.end_date) - new Date(a.end_date)
    );
    return sortedTasks;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const inputTask = document.querySelector(".todo__input--task");
    const inputDate = document.querySelector(".todo__input--date");
    const endDate = new Date(inputDate.value).toISOString();

    const taskData = {
      label: String(Date.now()),
      description: inputTask.value,
      start_date: new Date().toISOString(),
    };

    inputTask.value = "";
    inputDate.value = "";

    createTask(taskData, endDate);

    tasks.push({ ...taskData, end_date: endDate });
    tasks = sortTasks(tasks);

    todoList.innerHTML = "";
    tasks.forEach(displayTasks);
  };

  fetchTasks()
    .then((newTasks) => {
      tasks = newTasks;
      tasks = sortTasks(tasks);
      tasks.forEach(displayTasks);
    })
    .catch((error) => console.log(error));

  // addEventListeners
  todoForm.addEventListener("submit", handleFormSubmit);
  todoSearchText.addEventListener("input", handleFilterByDescription);
  todoSearchDate.addEventListener("change", handleFilterByDate);
})();
