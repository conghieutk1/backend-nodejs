import db from "../models/index";
require("dotenv").config();
import _ from "lodash";
import emailService from "./emailService";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: "R2" },
                order: [["createdAt", "DESC"]],
                attributes: {
                    exclude: ["password"],
                },
                include: [
                    {
                        model: db.Allcode,
                        as: "positionData",
                        attributes: ["valueEn", "valueVi"],
                    },
                    {
                        model: db.Allcode,
                        as: "genderData",
                        attributes: ["valueEn", "valueVi"],
                    },
                ],
                raw: true,
                nest: true,
            });
            resolve({
                errCode: 0,
                data: users,
            });
        } catch (e) {
            reject(e);
        }
    });
};
let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: "R2" },
                attributes: {
                    exclude: ["password", "image"],
                },
            });
            resolve({
                errCode: 0,
                data: doctors,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let saveDetailInforDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !inputData.doctorId ||
                !inputData.contentHTML ||
                !inputData.contentMarkdown ||
                !inputData.action ||
                !inputData.selectedPrice ||
                !inputData.selectedPayment ||
                !inputData.selectedProvince ||
                !inputData.nameClinic ||
                !inputData.addressClinic ||
                !inputData.note
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                // console.log("asfasf ", inputData.contentHTML);
                // upsert to Markdown
                if (inputData.action === "CREATE") {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    });
                } else if (inputData.action === "EDIT") {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false,
                    });
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown =
                            inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        doctorMarkdown.updateAt = new Date();
                        await doctorMarkdown.save();
                    }
                }

                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false,
                });
                if (doctorInfor) {
                    //update
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.paymentId = inputData.selectedPayment;
                    doctorInfor.provinceId = inputData.selectedProvince;
                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.note = inputData.note;
                    await doctorInfor.save();
                } else {
                    //create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        paymentId: inputData.selectedPayment,
                        provinceId: inputData.selectedProvince,
                        nameClinic: inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        note: inputData.note,
                    });
                }
                resolve({
                    errCode: 0,
                    errMessage: "Save infor doctor succeed",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getDetailDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId,
                    },
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: [
                                "contentHTML",
                                "contentMarkdown",
                                "description",
                            ],
                        },
                        {
                            model: db.Allcode,
                            as: "positionData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ["id", "createdAt", "updatedAt"],
                            },
                            include: [
                                {
                                    model: db.Allcode,
                                    as: "priceTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                                {
                                    model: db.Allcode,
                                    as: "paymentTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                                {
                                    model: db.Allcode,
                                    as: "provinceTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });
                if (data && data.image) {
                    data.image = new Buffer(data.image, "base64").toString(
                        "binary"
                    );
                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.currenDate) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter",
                });
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map((item) => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    });
                }
                //format theo chuan
                //let formattedDate = data.currenDate + " 07:00:00+07";
                let bigIntValue = BigInt(data.currenDate);
                //let formattedDate = new Date(data.currenDate);
                let formattedDate = bigIntValue.toString();

                // console.log("check data.currenDate: ", data.currenDate);
                // console.log("check formattedDate: ", formattedDate);
                //lay lcih kham duoi database
                // console.log("check schedule: ", schedule);
                // console.log("check data: ", data);
                let existing = await db.Schedule.findAll({
                    where: {
                        doctorId: data.doctorId,
                        date: formattedDate,
                    },
                    attributes: ["doctorId", "date", "timeType", "maxNumber"],
                });
                //format date
                // if (existing && existing.length > 0) {
                //     existing = existing.map((item) => {
                //         //item.date = moment(item.date).format("YYYY-MM-DD");
                //         item.date = new Date(item.date).getTime();
                //         console.log("date: ", item.date);
                //         return item;
                //     });
                // }
                //Tim su khac nhau giua lich da ton tai va lich vua duoc dat
                // console.log("check existing: ", existing);
                let toCreate = _.differenceWith(
                    schedule,
                    existing,
                    (scheduleItem, existingItem) => {
                        return (
                            scheduleItem.timeType === existingItem.timeType &&
                            scheduleItem.date.toString() === existingItem.date
                        );
                    }
                );
                //neu co su khac nhau thi se tao du lieu moi
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }
                // console.log("toCreate: ", toCreate);

                resolve({
                    errCode: 0,
                    errMessage: "OK",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getScheduleDoctorByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log("date = ", date);
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter",
                });
            } else {
                //moment(date).format("YYYY-MM-DD");
                //console.log("date = ", moment(date).format("YYYY-MM-DD"));
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: "timeTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.User,
                            as: "doctorData",
                            attributes: ["firstName", "lastName"],
                        },
                    ],
                    raw: false,
                    nest: true,
                });
                if (!dataSchedule) dataSchedule = [];
                resolve({
                    errCode: 0,
                    data: dataSchedule,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const getExtraInforDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter",
                });
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: doctorId,
                    },
                    attributes: {
                        exclude: ["id", "createdAt", "updatedAt"],
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: "priceTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Allcode,
                            as: "paymentTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Allcode,
                            as: "provinceTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                    ],
                    raw: false,
                    nest: true,
                });

                if (!data) data = {};

                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
const getProfileDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter",
                });
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: doctorId,
                    },
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: [
                                "contentHTML",
                                "contentMarkdown",
                                "description",
                            ],
                        },
                        {
                            model: db.Allcode,
                            as: "positionData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ["id", "createdAt", "updatedAt"],
                            },
                            include: [
                                {
                                    model: db.Allcode,
                                    as: "priceTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                                {
                                    model: db.Allcode,
                                    as: "paymentTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                                {
                                    model: db.Allcode,
                                    as: "provinceTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });
                if (data && data.image) {
                    data.image = new Buffer(data.image, "base64").toString(
                        "binary"
                    );
                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
const getListBookingAppointment = (date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter",
                });
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        //statusId: "S2",
                        //doctorId: doctorId,
                        date: date,
                    },
                    order: [["createdAt", "ASC"]],
                    attributes: {
                        exclude: ["token"],
                    },

                    include: [
                        {
                            model: db.User,
                            as: "patientData",
                            attributes: [
                                "email",
                                "firstName",
                                "address",
                                "gender",
                                "phonenumber",
                            ],
                            include: [
                                {
                                    model: db.Allcode,
                                    as: "genderData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                            ],
                        },
                        {
                            model: db.Allcode,
                            as: "timeTypeDataBooking",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.User,
                            as: "doctorDataBooking",
                            attributes: ["firstName", "lastName"],
                        },
                        {
                            model: db.Allcode,
                            as: "statusDataBooking",
                            attributes: ["valueEn", "valueVi"],
                        },
                    ],
                    raw: false,
                    nest: true,
                });

                // console.log("data from getListBookingAppointment = ", data);

                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const sendDoneAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        console.log("data = ", data);
        try {
            if (
                !data.doctorId ||
                !data.patientId ||
                !data.timeType ||
                !data.date ||
                !data.statusId ||
                !data.button
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter",
                });
            } else {
                if (data.button === "CONFIRM") {
                    let appointment = await db.Booking.findOne({
                        where: {
                            doctorId: data.doctorId,
                            patientID: data.patientId,
                            timeType: data.timeType,
                            date: data.date,
                            statusId: "S2",
                        },
                        raw: false, //save = false để trả ra object sequelize => dùng được hàm save()
                    });

                    if (appointment) {
                        appointment.statusId = "S3";
                        await appointment.save();
                    } else if (data.statusId === "S1") {
                        resolve({
                            errCode: 2,
                            errMessage:
                                "Cuộc hẹn chưa được xác nhận bởi người dùng!",
                        });
                        return;
                    } else if (data.statusId === "S3") {
                        resolve({
                            errCode: 3,
                            errMessage:
                                "Điều này không thể thực hiện được vì cuộc hẹn đã được cập nhật thành Xong!",
                        });
                        return;
                    } else if (data.statusId === "S4") {
                        resolve({
                            errCode: 4,
                            errMessage:
                                "Điều này không thể thực hiện được vì cuộc hẹn đã được cập nhật thành Hủy!",
                        });
                        return;
                    }

                    resolve({
                        errCode: 0,
                        errMessage: "Cuộc hẹn đã được cập nhật thành Xong!",
                    });
                } else if (data.button === "CANCEL") {
                    if (data.statusId === "S4") {
                        resolve({
                            errCode: 2,
                            errMessage:
                                "Điều này không thể thực hiện được vì cuộc hẹn đã được cập nhật thành Hủy!",
                        });
                        return;
                    }
                    if (data.statusId === "S3") {
                        resolve({
                            errCode: 3,
                            errMessage:
                                "Điều này không thể thực hiện được vì cuộc hẹn đã được cập nhật thành Đã khám xong!",
                        });
                        return;
                    }
                    let appointment = await db.Booking.findOne({
                        where: {
                            doctorId: data.doctorId,
                            patientID: data.patientId,
                            timeType: data.timeType,
                            date: data.date,
                        },
                        raw: false, //save = false để trả ra object sequelize => dùng được hàm save()
                    });

                    if (appointment) {
                        appointment.statusId = "S4";
                        await appointment.save();
                    }

                    await emailService.sendEmailCancelAppointment({
                        receiverMail: data.emailPatient,
                        emailContact: "hieu37.nghiadung@gmail.com",
                        patientName: data.fullName,
                        time: data.dateForEmail,
                        nameClinic: "Phòng khám Quốc tế EXSON",
                        addressClinic: "250 Bạch Mai",
                        phoneNumberContact: "0845568586",
                        language: data.language,
                    });
                    resolve({
                        errCode: 0,
                        errMessage: "Cuộc hẹn đã được cập nhật thành Hủy!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDetailInforDoctor: saveDetailInforDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleDoctorByDate: getScheduleDoctorByDate,
    getExtraInforDoctorById: getExtraInforDoctorById,
    getProfileDoctorById: getProfileDoctorById,
    getListBookingAppointment: getListBookingAppointment,
    sendDoneAppointment: sendDoneAppointment,
};
