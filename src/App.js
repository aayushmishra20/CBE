import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [subjects, setSubjects] = useState([{ subject: '', marks: 0 }]);
  const [report, setReport] = useState(null);

  // Fetch all students
  useEffect(() => {
    axios.get('http://localhost:5001/api/students')
      .then(response => setStudents(response.data))
      .catch(err => console.log(err));
  }, []);

  // Add a new student
  const addStudent = () => {
    const studentData = { name, subjects };
    console.log('Sending data:', studentData); // Log the payload
    axios.post('http://localhost:5000/api/students', studentData)
      .then(response => {
        toast.success('Student added successfully!');
        setStudents([...students, response.data.student]);
        setName('');
        setSubjects([{ subject: '', marks: 0 }]);
      })
      .catch(err => {
        console.error('Error adding student:', err);
        toast.error('Failed to add student. Please try again.');
      });
  };

  // Add a new subject field
  const addSubjectField = () => {
    setSubjects([...subjects, { subject: '', marks: 0 }]);
  };

  // Handle subject input change
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  // Get student report
  const getStudentReport = (id) => {
    axios.get(`http://localhost:5001/api/students/${id}`)
      .then(response => setReport(response.data))
      .catch(err => console.log(err));
  };

  // Bar chart data for student report
  const barChartData = report ? {
    labels: report.subjects.map(subject => subject.subject),
    datasets: [
      {
        label: 'Marks',
        data: report.subjects.map(subject => subject.marks),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  } : null;

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Competency-Based Education Workforce Preparedness
      </Typography>

      {/* Add Student Form */}
      <Typography variant="h5" gutterBottom>
        Add Student
      </Typography>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      {subjects.map((subject, index) => (
        <div key={index}>
          <TextField
            label="Subject"
            value={subject.subject}
            onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
            margin="normal"
          />
          <TextField
            label="Marks"
            type="number"
            value={subject.marks}
            onChange={(e) => handleSubjectChange(index, 'marks', parseInt(e.target.value))}
            margin="normal"
          />
        </div>
      ))}
      <Button onClick={addSubjectField} variant="contained" color="primary">
        Add Subject
      </Button>
      <Button onClick={addStudent} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
        Save Student
      </Button>

      {/* Students Table */}
      <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
        Students List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Average Score</TableCell>
              <TableCell>Skillset Prediction</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map(student => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.averageScore}</TableCell>
                <TableCell>{student.skillsetPrediction}</TableCell>
                <TableCell>
                  <Button onClick={() => getStudentReport(student.id)} variant="contained" color="primary">
                    View Report
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Student Report */}
      {report && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="h5" gutterBottom>
            Student Report: {report.name}
          </Typography>
          <Typography variant="h6">
            Average Score: {report.averageScore}
          </Typography>
          <Typography variant="h6">
            Skillset Prediction: {report.skillsetPrediction}
          </Typography>
          <Bar data={barChartData} />
        </div>
      )}

      <ToastContainer />
    </Container>
  );
}

export default App;