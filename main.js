"use strict";

(() => {
  const todoForm = document.querySelector(".todo__form");
  const todoList = document.querySelector(".todo__list");

  let tasks = [];

  const API_URL = "http://127.0.0.1:9000/v1/tasks";

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
  };

  // addEventListeners
  todoForm.addEventListener("submit", handleFormSubmit);
})();
