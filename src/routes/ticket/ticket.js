const Controller = require("../../controllers/ticket/ticket");
const authenticationToken = require("../../middleware/authenticateToken");

module.exports = (app) => {

  app
    .route("/api/buy-ticket/:userId/:eventId")
    .post(authenticationToken, Controller.buyTickets);

    app
    .route("/api/user-ticket/:id")
    .get(authenticationToken, Controller.getUserTickets);
    app
    .route("/api/generate-Qr-code/:eventId/:ticketId")
    .get(Controller.generateCode);
    app
    .route("/api/add-attend/:eventId/:ticketId")
    .post(Controller.addAttendence);

};
