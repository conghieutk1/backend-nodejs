import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import moment from "moment/moment";

let buildURLEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
    // let id = uuidv4();
    // result
    return result;
};

let postBookingAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let url = buildURLEmail(data.doctorId);
            // console.log("url = ", url);
            console.log("data = ", data);

            if (
                !data.email ||
                !data.doctorId ||
                !data.timeType ||
                !data.date ||
                !data.fullName ||
                !data.gender ||
                !data.reason ||
                !data.doctorName ||
                !data.phoneNumber ||
                !data.address ||
                !data.dob ||
                !data.timeString
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let token = uuidv4();
                let user = await db.User.findOrCreate({
                    where: {
                        email: data.email,
                    },
                    defaults: {
                        email: data.email,
                        roleId: "R3",
                        firstName: data.fullName,
                        phonenumber: data.phoneNumber,
                        address: data.address,
                        gender: data.gender,
                    },
                });

                //create record booking
                if (user && user[0]) {
                    //console.log("data", data);
                    let appointment = await db.Booking.findOrCreate({
                        where: {
                            patientID: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                        },
                        defaults: {
                            statusId: "S1",
                            doctorId: data.doctorId,
                            patientID: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token,
                            fullName: data.fullName,
                            phoneNumber: data.phoneNumber,
                            address: data.address,
                            gender: data.gender,
                            dob: data.dob,
                            reason: data.reason,
                        },
                    });
                    if (appointment && appointment[1] === false) {
                        resolve({
                            errCode: 4,
                            errMessage: "This appointment already exists!",
                        });
                        return;
                    }
                    // console.log("appointment = ", appointment[1]);
                }
                let dob = moment.unix(+data.dob / 1000).format("DD/MM/YYYY");
                await emailService.sendEmail({
                    receiverMail: data.email,
                    emailContact: "hieu37.nghiadung@gmail.com",
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    redirectLink: buildURLEmail(data.doctorId, token),
                    addressClinic: "250 Bạch Mai",
                    phoneNumberContact: "0845568586",
                    language: data.language,
                    fullName: data.fullName,
                    phoneNumber: data.phoneNumber,
                    address: data.address,
                    gender: data.gender,
                    dob: dob,
                    reason: data.reason,
                });

                resolve({
                    errCode: 0,
                    errMessage: "Save infor patient succeed",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
let postVerifyBookingAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: "S1",
                    },
                    raw: false,
                });
                if (appointment) {
                    appointment.statusId = "S2";
                    appointment.save();
                    // await appointment.save({
                    //     statusId: "S2",
                    // });
                    resolve({
                        errCode: 0,
                        errMessage: "Update the appointment succeed!",
                    });
                }
                resolve({
                    errCode: 2,
                    errMessage:
                        "Appointment has been actived or does not exist!",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    postBookingAppointment: postBookingAppointment,
    postVerifyBookingAppointment: postVerifyBookingAppointment,
};
