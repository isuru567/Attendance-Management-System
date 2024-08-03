const mongoose = require('mongoose');

const qr1Schema = new mongoose.Schema({
   
    subject: String,
    teacher: String,
    password: String,
    qrData: String,
    enabled: Boolean,
    image:Buffer
});




const QRuser = mongoose.model('QRuser', qr1Schema);

module.exports = QRuser;
