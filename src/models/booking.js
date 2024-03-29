"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Booking.belongsTo(models.User, {
                foreignKey: "patientID",
                targetKey: "id",
                as: "patientData",
            });
            Booking.belongsTo(models.Allcode, {
                foreignKey: "timeType",
                targetKey: "keyMap",
                as: "timeTypeDataBooking",
            });
            Booking.belongsTo(models.User, {
                foreignKey: "doctorId",
                targetKey: "id",
                as: "doctorDataBooking",
            });
            Booking.belongsTo(models.Allcode, {
                foreignKey: "statusId",
                targetKey: "keyMap",
                as: "statusDataBooking",
            });
        }
    }
    Booking.init(
        {
            statusId: DataTypes.STRING,
            doctorId: DataTypes.INTEGER,
            patientID: DataTypes.INTEGER,
            date: DataTypes.STRING,
            timeType: DataTypes.STRING,
            token: DataTypes.STRING,
            fullName: DataTypes.STRING,
            phoneNumber: DataTypes.STRING,
            address: DataTypes.STRING,
            gender: DataTypes.STRING,
            dob: DataTypes.STRING,
            reason: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Booking",
        }
    );
    return Booking;
};
