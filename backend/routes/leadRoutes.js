const router = require("express").Router();
const { body, param } = require("express-validator");

const validate = require("../middleware/validate");
const c = require("../controllers/leadController");

const leadValidators = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name required"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name required"),

  body("email")
    .isEmail()
    .withMessage("Valid email required")
];

router.get("/stats/summary", c.stats);

router.get("/", c.list);

router.post(
  "/",
  leadValidators,
  validate,
  c.create
);

router.get(
  "/:id",
  [param("id").isMongoId()],
  validate,
  c.getOne
);

router.put(
  "/:id",
  [param("id").isMongoId(), ...leadValidators],
  validate,
  c.update
);

router.delete(
  "/:id",
  [param("id").isMongoId()],
  validate,
  c.remove
);

module.exports = router;