const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const { login, me, register } = require("../controllers/authController");

router.post(
  "/login",
  [body("email").isEmail().withMessage("Valid email required"), body("password").isLength({ min: 1 })],
  validate,
  login
);

router.post(
  "/register",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  register
);

router.get("/me", protect, me);

module.exports = router;
