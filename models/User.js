  import mongoose from "mongoose";
  import bcrypt from "bcrypt";
  const UserSchema = new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: [true, "First name required"],
        minlength: 2,
        maxlength: 100,
      },
      lastName: {
        type: String,
        required: [true, "Last name required"],
        minlength: 2,
        maxlength: 100,
      },
      email: {
        type: String,
        required: [true, "email required"],
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: [true, "password required"],
        minlength: [6, "Too short password"],
      },
      role: {
        type: String,
        default: "user",
        enum: ["user", "admin"],
      },
      profileImage: String,
      birthDay: String,
      phone: String,
      vehicle_details: [
        {
          plate_Char: { type: String, required: true },
          Plate_Num: { type: String, required: true, unique: true },
        },
      ],
    },
    { timestamps: true }
  );

  UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
      this.password = await bcrypt.hash(this.password, 12);
      next();
    } catch (err) {
      next(err);
    }
  });

  const User = mongoose.model("User", UserSchema);
  export default User;
