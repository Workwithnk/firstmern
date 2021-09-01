const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    minlength: 3,
  },
  userEmail: {
    type: String,
    unique: true,
    required: true,
  },
  userPass: {
    type: String,
    minlength: 6,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// tokens middleware

userSchema.methods.generateToken = async function () {
  try {
    const token = await jwt.sign({ _id: this._id }, process.env.token_key);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (e) {
    res.send(e);
  }
};

// hash the pass

userSchema.pre("save", async function (next) {
  if (this.isModified("userPass")) {
    this.userPass = await bcrypt.hash(this.userPass, 10);
  }
  next();
});

const userCollection = new mongoose.model("userDetail", userSchema);

module.exports = userCollection;
