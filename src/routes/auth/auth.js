const authController =require("../../controllers/Auth/auth")
const authenticationToken = require("../../middleware/authenticateToken");

module.exports=(app)=>{
    app.route("/auth/signup").post(authController.signup)
    app.route("/auth/verify/:token").get(authController.verifySignup)
    app.route("/auth/forgot").post(authController.forgetPassword)
    app.route("/auth/reset/:token").get(authController.resetPasswordForm)
    app.route("/auth/reset/:token").post(authController.resetPassword)
    app.route("/auth/login").post(authController.login)
    app.route("/auth/change-password").post(authController.changePassword)
    app.route("/api/personalDetails/:id").post(authController.getPersonalDetails)
    app.route("/api/creatEventMove/:id").get(authenticationToken,authController.move)
    app.route("/api/getAllUsers").get(authController.getUsers)
    app.route("/api/getUsersDetails/:id").get(authenticationToken,authController.getUserDeatails)




    



}