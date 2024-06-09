import errorCodes from "../config/errorCodes.js";
import "dotenv/config";
import bcrypt from "bcrypt";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/;

const userController = {
  async getUserInfo(req, res, next) {
    try {
      const { password, ...userWithoutPassword } = req.user.toObject();

      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  },
  async updateUserProfile(req, res, next) {
    try {
      const { name = "", phoneNumber = "", address = "" } = req.body;
      const user = req.user;

      if (name) user.name = name;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (address) user.address = address;

      await user.save();

      return res
        .status(200)
        .json({ message: "User profile updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  async changePassword(req, res, next) {
    try {
      const { currentPassword = "", newPassword = "" } = req.body;
      const user = req.user;

      if (!currentPassword || !newPassword) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Current password, and new password are required" });
      }
      if (!passwordRegex.test(currentPassword)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid current password format" });
      }
      if (!passwordRegex.test(newPassword)) {
        return res
          .status(errorCodes.BAD_REQUEST)
          .json({ message: "Invalid new password format" });
      }

      if (currentPassword === newPassword) {
        return res.status(errorCodes.BAD_REQUEST).json({
          message: "New password cannot be the same as current password",
        });
      }

      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordMatch) {
        return res
          .status(errorCodes.UNAUTHORIZED)
          .json({ message: "Incorrect current password" });
      }

      user.password = newPassword;
      await user.save();

      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
