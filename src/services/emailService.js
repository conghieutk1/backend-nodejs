import db from "../models/index";
require("dotenv").config();
const nodemailer = require("nodemailer");

let sendEmail = async (dataSend) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        secureConnection: false,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: true,
        },
    });
    //let html = this.getBodyHTMLEmail(dataSend.language);
    let info = await transporter.sendMail({
        from: '"Hiếu Đặng" <hieu37.nghiadung@gmail.com>', // sender address
        to: dataSend.receiverMail, // list of receivers
        subject: "Xác nhận Lịch hẹn khám bệnh thành công", // Subject line
        html: getBodyHTMLEmail(dataSend),
    });
};
let sendEmailCancelAppointment = async (dataSend) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        secureConnection: false,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: true,
        },
    });
    //let html = this.getBodyHTMLEmail(dataSend.language);
    let info = await transporter.sendMail({
        from: '"Hiếu Đặng" <hieu37.nghiadung@gmail.com>', // sender address
        to: dataSend.receiverMail, // list of receivers
        subject: "Hủy Lịch hẹn khám bệnh", // Subject line
        html: getBodyHTMLEmailCancelAppointment(dataSend),
    });
};

let getBodyHTMLEmail = (dataSend) => {
    let result = "";
    //console.log("check dataSend", dataSend);
    if (dataSend.language === "vi") {
        result = `
        <p>Kính gửi ${dataSend.patientName},</p>

            <p>Chúng tôi xin chân thành cảm ơn Quý khách đã đặt lịch hẹn khám bệnh tại cơ sở khám bệnh của chúng tôi. Chúng tôi xin xác nhận rằng lịch hẹn của Quý khách đã được đặt thành công. Dưới đây là thông tin chi tiết về lịch hẹn.</p>
            <p>Thông tin Bệnh nhân:</p>
            <ul>
                <li><strong>Tên bệnh nhân: </strong> ${dataSend.patientName}</li>
                <li><strong>Số điện thoại: </strong> ${dataSend.phoneNumber}</li>
                <li><strong>Địa chỉ: </strong> ${dataSend.address}</li>
                <li><strong>Ngày sinh:</strong> ${dataSend.dob}</li>
                <li><strong>Lý do khám: </strong> ${dataSend.reason}</li>
            </ul>

            <p>Thông tin Thời gian và Địa điểm khám:</p>
            <ul>
                <li><strong>Tên bác sĩ: </strong> ${dataSend.doctorName}</li>
                <li><strong>Thời gian: </strong> ${dataSend.time}</li>
                <li><strong>Địa điểm: </strong> ${dataSend.addressClinic}</li>
            </ul>

            <p>Nếu bạn đã xác nhận đúng thông tin trên, vui lòng bấm vào đường liên kết dưới đây để hoàn tất việc xác nhận lịch hẹn:</p>
            <div>
                <a href=${dataSend.redirectLink} target="_blank" >Xác nhận lịch hẹn</a>
            </div>

            <p>Chúng tôi rất mong đợi được đón tiếp Quý khách tại cơ sở khám bệnh của chúng tôi. Để đảm bảo tiến trình khám bệnh được suôn sẻ, xin Quý khách vui lòng có mặt tại cơ sở khám bệnh ít nhất 15 phút trước giờ hẹn.</p>

            <p>Nếu có bất kỳ câu hỏi hoặc thắc mắc nào trước hoặc sau lịch hẹn, xin Quý khách hãy liên hệ với chúng tôi qua số điện thoại ${dataSend.phoneNumberContact} hoặc gửi email về địa chỉ ${dataSend.emailContact}. Đội ngũ y tế chuyên nghiệp của chúng tôi luôn sẵn lòng hỗ trợ Quý khách một cách tận tâm và chu đáo.</p>

            <p>Chúng tôi rất mong được phục vụ Quý khách và hy vọng rằng cuộc hẹn sẽ mang đến sự thoải mái và sự chăm sóc tốt nhất cho sức khỏe của Quý khách.</p>
        
        `;
    }

    if (dataSend.language === "en") {
        result = `
        <p>Dear ${dataSend.patientName},</p>

            <p>We would like to express our sincere gratitude to you for scheduling a medical appointment at our clinic. We hereby confirm that your appointment has been successfully booked. Below are the details of your appointment:</p>

            <ul>
                <li><strong>Patient Name:</strong> ${dataSend.patientName}</li>
                <li><strong>Doctor's Name:</strong> ${dataSend.doctorName}</li>
                <li><strong>Date and Time:</strong> ${dataSend.time}</li>
                <li><strong>Location:</strong> ${dataSend.addressClinic}</li>
            </ul>

            <p>If you have confirmed the above information, please click the link below to complete the appointment confirmation:</p>
            <div>
                <a href=${dataSend.redirectLink} target="_blank" >Confirm Appointment</a>
            </div>

            <p>We are eagerly looking forward to welcoming you to our clinic. To ensure a smooth medical examination process, we kindly request you to arrive at the clinic at least 15 minutes before your scheduled time.</p>

            <p>If you have any questions or inquiries before or after the appointment, please feel free to contact us at ${dataSend.phoneNumberContact} or email us at ${dataSend.emailContact}. Our dedicated healthcare team is always ready to provide you with the best care and assistance.</p>

            <p>We sincerely hope to serve you and ensure that your appointment brings you comfort and the best healthcare possible.</p>
        `;
    }
    return result;
};
let getBodyHTMLEmailCancelAppointment = (dataSend) => {
    let result = "";
    //console.log("check dataSend", dataSend);
    if (dataSend.language === "vi") {
        result = `
        <p>Kính gửi ${dataSend.patientName},</p>
        

        <p>Chúng tôi là ${dataSend.nameClinic}, và chúng tôi hy vọng bạn đang cảm thấy tốt lành.</p>
    
        <p>Chúng tôi viết thư này để thông báo rằng, vì những lý do bất khả kháng, chúng tôi đã phải hủy lịch hẹn của bạn, dự định diễn ra vào ${dataSend.time}. Điều này là cần thiết để đảm bảo an toàn và chất lượng cho tất cả bệnh nhân của chúng tôi.</p>
    
        <p>Chúng tôi thành thật xin lỗi vì bất tiện mà việc hủy cuộc hẹn có thể gây ra cho bạn. Vui lòng hiểu rằng quyết định này được đưa ra sau khi cân nhắc kỹ lưỡng, và chúng tôi luôn đặt lợi ích và sức khỏe của bệnh nhân lên hàng đầu.</p>
    
        <p>Nếu bạn muốn đặt lại cuộc hẹn hoặc có bất kỳ câu hỏi hoặc thắc mắc nào, vui lòng liên hệ với chúng tôi qua số điện thoại ${dataSend.phoneNumberContact} hoặc qua email ${dataSend.emailContact}. Bộ phận lịch hẹn của chúng tôi sẽ sẵn lòng hỗ trợ bạn và tìm giải pháp tốt nhất cho tình huống này.</p>
    
        <p>Một lần nữa, xin lỗi vì sự bất tiện này, và chúng tôi mong nhận được sự thông cảm và hiểu biết từ phía bạn. Cảm ơn bạn vì sự hỗ trợ và sự tin tưởng vào dịch vụ của chúng tôi.</p>
           
        `;
    }

    if (dataSend.language === "en") {
        result = `
        <p>Dear ${dataSend.patientName},</p>
            <p>We are ${dataSend.nameClinic}, and we hope you are doing well.</p>
            <p>We are writing this email to inform you that, due to unforeseen circumstances, we have had to cancel your appointment scheduled for ${dataSend.time}. This is necessary to ensure the safety and quality of care for all our patients.</p>
            <p>We sincerely apologize for any inconvenience this cancellation may cause you. Please understand that this decision was made after careful consideration, and we always prioritize the interests and health of our patients.</p>
            <p>If you wish to reschedule the appointment or have any questions or concerns, please contact us at ${dataSend.phoneNumberContact} or via email at ${dataSend.emailContact}. Our appointment scheduling department will be more than willing to assist you and find the best solution for this situation.</p>
            <p>Once again, we apologize for the inconvenience, and we hope to receive your understanding and empathy. Thank you for your support and trust in our services.</p>
        `;
    }
    return result;
};
module.exports = {
    sendEmail: sendEmail,
    sendEmailCancelAppointment: sendEmailCancelAppointment,
};
