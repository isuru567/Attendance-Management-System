// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
const bcrypt = require('bcryptjs');
const connectDB = require('./dbconnect'); 
const connectDBqr =require('./dbconnect');
const connectadd =require('./dbconnect');
const User = require('./models/User'); // Import the User model
const QRuser = require('./models/qruser');
const  Student =require('./models/student');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const PDFDocument = require('pdfkit');

// Load environment variables
dotenv.config();

// Create an instance of Express
const app = express();
const port =3001;

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB();
connectDBqr();
connectadd();

// Salt rounds for bcrypt
const saltRounds = 10;

// Root route handling different HTML files
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index2.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index3.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index4.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'qr.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'addnew.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'student.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'attendance.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'studentform.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'deletestudent.html')); });

// Registration route
app.post('/register', async (req, res) => {
  try {
    // Validate input fields
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).send('Missing username, email, or password');
    }
  
    const hash = await bcrypt.hash(req.body.password, 10);
  
    // Create a new user object
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
    });
  
    // Save the user to the database
    await newUser.save();
      
    // Send success response
    res.status(201).send('Successfully registered');
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).send('Email already registered');
    } else if (err.keyPattern && err.keyPattern.password) {
      return res.status(400).send('Password already taken');
    }

    console.error('Error occurred while registering:', err);
    res.status(500).send('Error occurred while registering');
  }
});

// Alternative registration route
app.post('/register', async (req, res) => {
  try {
    const db = client.db('register'); // Replace with your actual database name
    const collection = db.collection('register'); // Collection to store registrations
    const result = await collection.insertOne(req.body); // Insert form data into MongoDB
    res.status(201).send('Registration successful');
  } catch (err) {
    console.error(err);
    res.status(500).send('Registration failed');
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Missing username or password');
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid username or password');
    }
  
    res.redirect('/html/home/index4.html'); // Redirect to index4.html on successful login
  } catch (err) {
    console.error('Error occurred during login:', err);
    res.status(500).send('Error occurred during login');
  }
});

// Student registration route
app.post('/student', async (req, res) => {
  const { Name, Index, Reg, batch } = req.body;

  if (!Name || !Index || !Reg || !batch) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (batch !== '2019/2020') {
    return res.status(400).json({ message: 'Not Implemented for this batch' });
  }

  try {
    const existingStudent = await Student.findOne({ Index });
    const existingStudentReg = await Student.findOne({ Reg });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this index already exists' });
    }
    if (existingStudentReg) {
      return res.status(400).json({ message: 'Student with this registration number already exists' });
    }

    const newStudent = new Student({ Name, Index, Reg, batch });
    await newStudent.save();
  
    res.status(201).json({ message :'Student added successfully' });
  } catch (error) {
    res.status(500).json({ message:'Failed to add student', error });
  }
});

// Fetch all students
app.get('/student', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error });
  }
});

// Student list HTML page
app.get('/student-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'student', 'student.html'));
});

// Delete student route
app.post('/delete', async (req, res) => {
  const { Index, Reg } = req.body;

  try {
    const student = await Student.findOne({ Index, Reg });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.deleteOne({ Index, Reg });
    
    res.status(200).json('Student successfully deleted' );
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student', error });
  }
});

// Attendance marking route
app.post('/attend/:Index', async (req, res) => {
  const studentIndex = req.params.Index;
  try {
    const student = await Student.findOne({ Index: studentIndex });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.attended && student.Date) {
      const today = new Date().toISOString().split('T')[0];
      const attendanceDate = new Date(student.Date).toISOString().split('T')[0];
      if (attendanceDate === today) {
        return res.status(400).json({ message: 'Attendance already marked' });
      }
    }

    student.attended = true;
    student.attendanceDate = new Date();
    await student.save();

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark attendance', error });
  }
});

// Attendance report fetching
app.get('/student', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance report', error });
  }
});

// Student form submission
app.post('/studentform', async (req, res) => {
  const { Name, Reg, Index } = req.body;

  try {
      // Find the student by Reg and Index
      const student = await Student.findOne({ Reg, Index });

      if (student) {
          // Check if the student has already attended
          if (student.attended) {
              res.send('Attendance already recorded');
              return;
          }

          // Update the student's attendance status and date
          student.attended = true;
          student.Date = new Date();
          await student.save();

          res.send('Attendance successful');
      } else {
          // No matching student found
          res.send('Invalid registration number or index');
      }
  } catch (error) {
      // Handle any errors
      console.error(error);
      res.status(500).send('Internal server error');
  }
});

// Attendance report route
app.get('/attendance-report', async (req, res) => {
  try {
      const attendedStudents = await Student.find({ attended: true });
      res.json(attendedStudents);
  } catch (error) {
      console.error('Error fetching attendance report:', error);
      res.status(500).send('Internal server error');
  }
});

// Attendance report HTML page
app.get('/attendance-report', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'attendancereport', 'attendance.html'));
});

// Reset attendance route
app.post('/reset-attendance', async (req, res) => {
  try {
      await Student.updateMany({ attended: true }, { $set: { attended: false, Date: null } });
      res.send('Attendance reset successfully');
  } catch (error) {
      console.error('Error resetting attendance:', error);
      res.status(500).send('Internal server error');
  }
});

// Generate PDF report route
app.get('/report-pdf', async (req, res) => {
  try {
      const doc = new PDFDocument();
      res.setHeader('Content-disposition', 'attachment; filename=attendance-report.pdf');
      res.setHeader('Content-type', 'application/pdf');
      
      doc.pipe(res);
      
      doc.fontSize(16).text('Attendance Report 2019/2020 Batch ', { align: 'center' });
      doc.moveDown();

      // Fetch all attended students
      const attendedStudents = await Student.find({ attended: true });

      attendedStudents.forEach(student => {
        const formattedDate = student.Date ? new Date(student.Date).toLocaleDateString() : 'Not Available';
          doc.fontSize(12).text(`Name: ${student.Name}`);
          doc.text(`Index: ${student.Index}`);
          doc.text(`Reg Number: ${student.Reg}`);
          doc.text(`Batch: ${student.batch}`);
          doc.text(`Date: ${formattedDate}`);
          doc.moveDown();
      });

      doc.end();
  } catch (error) {
      console.error('Error generating Pdf:', error);
      res.status(500).send('Internal server error');
  }
});

// Send Email Route with QR Code
app.post('/send-email', async (req, res) => {
  const { email, qrUrl, message } = req.body;

  try {
    // Configure transporter for sending email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your QR Code',
      text: message,
      html: `<h3>Your QR Code</h3><p>${message}</p><img src="${qrUrl}" alt="QR Code"/>`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully with QR code' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


