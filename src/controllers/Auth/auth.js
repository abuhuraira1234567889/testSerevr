const User = require("../../modals/auth");
const bcrypt = require("bcrypt");
const { generateVerificationToken } = require("../../utils/verificationToken");
const { sendVerificationEmail } = require("../../utils/sendmail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { response } = require("express");

module.exports = {
  signup: async (req, res, next) => {
    try {
      const verificationToken = generateVerificationToken();

      const { Email, Password } = req.body;

      if ([Email, Password].includes("")) {
        return res
          .status(400)
          .json({ error: "Please fill in all existing fields" });
      } else {
        const user = await User.findOne({ email: Email });
        if (user) {
          return res.status(400).json({
            error: "Account already exists. Please log-in with your account",
          });
        }

        if (!user) {
          const hashedPassword = await bcrypt.hash(Password, 10);
          const newUser = new User({
            email: Email,
            password: hashedPassword,
            verificationToken: verificationToken,
          });
          await newUser.save();
          const verificationLink = `${process.env.BACKEND_LINK}/auth/verify/${verificationToken}`;

          const subject = "Verify your Piqsol Account";
          const text = `Verify your Piqsol Account ${verificationLink}`;

          const msg = {
            from: {
              email: "hurairaabu098@gmail.com",
              name: "Piqsol",
            },
            to: newUser.email,
            subject: subject,
            text: text,
          };

          const mailVerification = await sendVerificationEmail(msg);

          return res.status(200).json({
            message: "User Created Successfully",
            data: newUser,
            mail: mailVerification,
          });
        }
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  verifySignup: async (req, res, next) => {
    try {
      if (req.params.token) {
        const token = req.params.token;
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
          return res.redirect(`${process.env.FRONTEND_URL}/alreadyverified`); // Redirect to a failure page
        }
        user.verified = true;
        user.verificationToken = null; // You might want to remove the token after verification
        await user.save();

        res.redirect(`${process.env.FRONTEND_URL}/verificationsuccessful`); // Redirect to a success page
      } else {
        return res
          .status(401)
          .json({ error: "There is no token Please add token in this" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  forgetPassword: async (req, res, next) => {
    try {
      const email = req.body.email;
      const resetToken = crypto.randomBytes(20).toString("hex");
      const user = await User.findOne({ email });
      if (user && user.verified === true) {
        user.resetToken = resetToken;
        await user.save();
        const verificationLink = `${process.env.BACKEND_LINK}/auth/reset/${resetToken}`;
        const subject = "Reset your password";
        const text = `Verify your Piqsol Account ${verificationLink}`;

        const msg = {
          from: {
            email: "hurairaabu098@gmail.com",
            name: "Piqsol",
          },
          to: user.email,
          subject: subject,
          text: text,
        };

        await sendVerificationEmail(msg);

        // sendVerificationEmail(email, resetLink, subject);
        return res.status(200).json({
          message: "Password reset link sent to your email",
        });
      } else {
        return res.status(400).json({ error: "Invalid email and/or password" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  resetPasswordForm: async (req, res, next) => {
    try {
      const resetToken = req.params.token;
      // Find user by reset token
      const user = await User.findOne({ resetToken });
      if (!user) {
        return res.render("passwordResetError", {
          error: "Invalid or expired reset token.",
        });
      }
      // res.status(200).json({ message: "this is a valid reset token" });
      res.redirect(`${process.env.FRONTEND_URL}/forgetPassword/${resetToken}`);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },
  resetPassword: async (req, res, next) => {
    const resetToken = req.params.token;
    const newPassword = req.body.newPassword;
    const user = await User.findOne({ resetToken });
    if (!user) {
      return res.status(400).json({ error: "Invalid email and/or password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined; // Clear the reset token
    await user.save();
    return res.json({ success: true, message: "Password Changed", data: user });
    // res.render("passwordResetSuccess");
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid email and/or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(email, password, user, passwordMatch);

      if (!passwordMatch) {
        return res.status(400).json({ error: "Invalid password" });
      }
      if (!user.verified) {
        return res.status(400).json({
          error:
            "Your account is not verified. Please Check your Email to verify Your account",
        });
      }
      const accessToken = jwt.sign(
        { user: user._id },
        process.env.SECERATE_key,
        { expiresIn: "3d" }
      );

      return res.status(200).json({ data: user, token: accessToken });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid email and/or password" });
      }
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid current password" });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
      user.password = hashedNewPassword;
      await user.save();
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  getPersonalDetails: async (req, res) => {
    try {
      const { name, companyName, companyAddress, phoneNo } = req.body;
      const { id } = req.params;
      const userData = await User.findOne({ _id: id });
      console.log(userData);
      if (userData.verified) {
        if (!userData.personalDetail) {
          userData.name = name;
          userData.companyName = companyName;
          userData.companyAddress = companyAddress;
          userData.phoneNo = phoneNo;
          userData.personalDetail = true;
          await userData.save();
          return res.status(200).json({ data: userData });
        } else {
          return res
            .status(400)
            .json({ error: "You already add personal detail" });
        }
      } else {
        return res.status(400).json({
          error:
            "Your account is nor verified. Please check your mail for verification",
        });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  move: async (req, res) => {
    try {
      const id = req.params.id;
      const userData = await User.findOne({ _id: id });
      console.log(userData);
      if (userData.personalDetail === true) {
        return res.status(200).json({ message: "/createevent" });
      } else if (userData.personalDetail === false) {
        // return res.redirect(`${process.env.FRONTEND_URL}/createeventsignup`);
        return res.status(200).json({ message: "/createeventsignup" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  getUsers: async (req, res) => {
    try {
      const page = req.query.page || 1; // Current page number, default is 1
      const pageSize = 4; // Fixed page size

      const skip = (page - 1) * pageSize;

      const users = await User.find({}).skip(skip).limit(pageSize);

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }

      const totalRecords = await User.countDocuments();
      const totalPages = Math.ceil(totalRecords / pageSize);

      res.status(200).json({
        users,
        currentPage: parseInt(page, 10),
        totalPages,
        totalRecords,
        rows: users.length,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  getUserDeatails: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findOne({ _id: id });
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};
