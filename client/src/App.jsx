
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [age, setAge] = useState("");
  const [editingId, setEditingId] = useState(null);

  const getStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      console.log("Failed to load students:", error);
    }
  };

  useEffect(() => {
    getStudents();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !course.trim() || age === "") {
      alert("Please fill in all fields");
      return;
    }

    const data = {
      name: name.trim(),
      course: course.trim(),
      age: Number(age)
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/students/${editingId}`, data);
      } else {
        await axios.post(`${API_URL}/students`, data);
      }

      setName("");
      setCourse("");
      setAge("");
      setEditingId(null);

      await getStudents();
    } catch (error) {
      console.error("Failed to save student:", error);
      alert("Failed to save student");
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`${API_URL}/students/${id}`);
      await getStudents();
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Failed to delete student");
    }
  };

  const editStudent = (student) => {
    setName(student.name);
    setCourse(student.course);
    setAge(String(student.age));
    setEditingId(student._id);
  };

  return (
    <div>
      <h1>Student Management System</h1>

      <h2>{editingId ? "Edit Student" : "Add Student"}</h2>

      <p>Enter Name:</p>
      <input
        className="input"
        placeholder="Enter Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <p>Enter Course:</p>
      <input
        className="input"
        placeholder="Enter Student Course"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />

      <p>Enter Age:</p>
      <input
        className="input"
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <br />
      <br />

      <button className="submitButton" onClick={handleSubmit}>
        {editingId ? "Update Student" : "Add Student"}
      </button>

      <h2>Students</h2>

      {students.map((student) => (
        <div className="studentsInfo" key={student._id}>
          <p className="studentDisplay">Name: {student.name}</p>
          <p className="studentDisplay">Course: {student.course}</p>
          <p className="studentDisplay">Age: {student.age}</p>

          <button
            className="editButton"
            onClick={() => editStudent(student)}
          >
            Edit
          </button>

          <br />

          <button
            className="deleteButton"
            onClick={() => deleteStudent(student._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;

// JOHN MICHAEL J. LABADOR INF_237
