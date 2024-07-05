import React, { useState } from 'react';

const Home = () => {
  const [newTask, setNewTask] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [newUserName, setNewUserName] = useState("");
  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (newTask.trim() === "") return;
    setTaskList([...taskList, newTask]);
    setNewTask("");
  };
  const handleDeleteTask = (index) => {
    setTaskList(taskList.filter((_, i) => i !== index));
  };
  const createUser = async (event) => {
    event.preventDefault();
    try {
      const userResp = await fetch('https://playground.4geeks.com/todo/users/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: newUserName })
      });
      if (!userResp.ok) throw new Error('Error creating user');
      console.log(userResp.status);
      const userData = await userResp.json();
      console.log(userData);
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <main className="container">
      <h1>To Do List</h1>
      <div className="row">
        <div className="col-md-5">
          <div className="card shadow-sm card-small">
            <div className="card-body create-new-user-container">
              <h2 className="create-new-user">Create New User</h2>
              <form onSubmit={createUser}>
                <input
                  value={newUserName}
                  onChange={(event) => setNewUserName(event.target.value)}
                  className="form-control form-control-sm"
                  placeholder="Enter new user name"
                />
                <button type="submit" className="btn btn-primary btn-sm mt-2">Create User</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card shadow-sm card-large">
            <div className="card-body">
              <form onSubmit={handleFormSubmit} className="mb-4">
                <input
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  className="form-control form-control-lg"
                  placeholder="What needs to be done?"
                />
              </form>
              
            </div>
            <div className="card-footer">
              {taskList.length} item{taskList.length !== 1 ? 's' : ''} left
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default Home;