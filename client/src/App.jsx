import { useEffect, useState } from "react";
import axios from "axios"



function App() {

  const [students, setStudents] = useState([])
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [age, setAge] = useState("");
  const [editingId, setEditingId] = useState(null);

  const getStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/students");
      setStudents(response.data);
    } catch (error) {
      console.log("Failed to load students:", error);
    }
  };

  useEffect(() => {getStudents();}, []);
  const handleSubmit = async () => {
    if (!name.trim() || !course.trim() || age === "") {
      alert("Please fill in all fields");
      return;
    }
    const data = { name, course, age: Number(age) };
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/students/${editingId}`, data
        );
      } else {
        await axios.post("http://localhost:5000/students", data);
      }
      setName("");
      setCourse("");
      setAge("");
      setEditingId(null);
      await getStudents();
    } catch (error) {
      console.log(error);
      alert("Failed to save student");
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/students/${id}`);
      await getStudents();
    } catch (error) {
      console.log(error);
      alert("Failed to delete student");
    }
  };

  const editStudent = (student) => {
    setName(student.name);
    setCourse(student.course);
    setAge(String(student.age));
    setEditingId(student._id);
  };



  useEffect(() => {
    axios
      .get("http://localhost:5000/students")
      .then((response) => {
        setStudents(response.data)
      })
  }, []);


  return (
    <div>
      <h1 >Student Management System</h1>
      <h2 >{editingId ? "Edit Student" : "Add Student"}</h2>

      <p>Enter Name: </p>
      <input placeholder="Enter Student Name" value={name} onChange={(e) => setName(e.target.value)} />

      <p>Enter Course: </p>
      <input placeholder="Enter Student Course" value={course} onChange={(e) => setCourse(e.target.value)} />

      <p>Enter Age</p>
      <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
      <br/>
      
      <br/>
      <button onClick={handleSubmit}>

        {editingId ? "Update Student" : "Add Student"}
      </button>

      <h2>Students</h2>

      {students.map((student) => (
        <div key={student._id}>
          <p>Name: {student.name}</p>
          <p>Course: {student.course}</p>
          <p>Age: {student.age}</p>

          <button onClick={() => editStudent(student)}>Edit</button>
          <button onClick={() => deleteStudent(student._id)}>

            Delete
          </button>

        </div>

      ))}
    </div>
  );
}

export default App;