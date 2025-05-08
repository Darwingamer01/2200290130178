import React, { useState, useEffect } from 'react';

function App() {
  const [name, setName] = useState('');
  const [namesList, setNamesList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/names')
      .then((response) => response.json())
      .then((data) => setNamesList(data));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(() => {
      setNamesList([...namesList, name]);
      setName('');
    });
  };

  return (
    <div className="App">
      <h1>Submit Name</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button type="submit">Submit</button>
      </form>
      <h2>Submitted Names</h2>
      <ul>
        {namesList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
